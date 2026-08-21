/**
 * HydroSense Alert & Threshold Engine
 * 
 * Evaluates real-time telemetry against user-configured thresholds,
 * maps alerts to exact physical nodes (NODE-01, NODE-02, NODE-03),
 * manages alert lifecycle (ACTIVE -> ACKNOWLEDGED -> RESOLVED),
 * and prevents duplicate alert spamming.
 */

// ── Node Definitions ─────────────────────────────────────────────────────────
export const SYSTEM_NODES = [
  {
    id: 'NODE-01',
    name: 'Inlet Monitoring Station',
    zone: 'Zone A - Primary Intake',
    description: 'Primary inflow conduit & fluid temperature measurement point',
    metrics: ['flow_in', 'temperature', 'valve1_status', 'total_litres_1']
  },
  {
    id: 'NODE-02',
    name: 'Pipeline & Tamper Node',
    zone: 'Zone B - Main Conduit',
    description: 'Mid-stream hydraulic pressure, leak delta & vibration tamper monitoring',
    metrics: ['pressure', 'vibration_alert', 'flow_difference', 'leakage_detected']
  },
  {
    id: 'NODE-03',
    name: 'Outlet & Delivery Station',
    zone: 'Zone C - Downstream Terminal',
    description: 'Discharge measurement, net delivery volume & conveyance efficiency',
    metrics: ['flow_out', 'total_litres_2', 'valve2_status', 'system_efficiency']
  }
]

// ── Default Thresholds ───────────────────────────────────────────────────────
export const DEFAULT_THRESHOLDS = {
  maxLeakageDelta: {
    id: 'maxLeakageDelta',
    nodeId: 'NODE-02',
    nodeName: 'Pipeline & Tamper Node',
    metric: 'Flow Differential (Leakage)',
    unit: 'L/min',
    type: 'max',
    value: 2.0,
    min: 0.5,
    max: 10.0,
    step: 0.1,
    severity: 'critical',
    enabled: true,
    description: 'Triggered when inlet vs outlet flow difference exceeds leak tolerance'
  },
  minPressure: {
    id: 'minPressure',
    nodeId: 'NODE-02',
    nodeName: 'Pipeline & Tamper Node',
    metric: 'Minimum Line Pressure',
    unit: 'Bar',
    type: 'min',
    value: 1.0,
    min: 0.2,
    max: 3.0,
    step: 0.1,
    severity: 'critical',
    enabled: true,
    description: 'Triggered when pipeline pressure drops below minimum threshold'
  },
  maxPressure: {
    id: 'maxPressure',
    nodeId: 'NODE-02',
    nodeName: 'Pipeline & Tamper Node',
    metric: 'Maximum Line Pressure',
    unit: 'Bar',
    type: 'max',
    value: 3.5,
    min: 2.0,
    max: 6.0,
    step: 0.1,
    severity: 'warning',
    enabled: true,
    description: 'Triggered when line hydraulic pressure exceeds safety limits'
  },
  vibrationTamper: {
    id: 'vibrationTamper',
    nodeId: 'NODE-02',
    nodeName: 'Pipeline & Tamper Node',
    metric: 'Vibration & Tamper Sensor',
    unit: 'state',
    type: 'boolean',
    value: true,
    severity: 'critical',
    enabled: true,
    description: 'Triggered upon physical vibration / tampering disturbance'
  },
  maxFlowIn: {
    id: 'maxFlowIn',
    nodeId: 'NODE-01',
    nodeName: 'Inlet Monitoring Station',
    metric: 'Maximum Intake Flow',
    unit: 'L/min',
    type: 'max',
    value: 50.0,
    min: 10,
    max: 100,
    step: 1,
    severity: 'warning',
    enabled: true,
    description: 'Triggered when intake flow exceeds line normal capacity'
  },
  highTemp: {
    id: 'highTemp',
    nodeId: 'NODE-01',
    nodeName: 'Inlet Monitoring Station',
    metric: 'Intake Fluid Temperature',
    unit: '°C',
    type: 'max',
    value: 45.0,
    min: 25,
    max: 70,
    step: 1,
    severity: 'warning',
    enabled: true,
    description: 'Triggered when intake fluid temperature is abnormally elevated'
  },
  minEfficiency: {
    id: 'minEfficiency',
    nodeId: 'NODE-03',
    nodeName: 'Outlet & Delivery Station',
    metric: 'Minimum Conveyance Efficiency',
    unit: '%',
    type: 'min',
    value: 80.0,
    min: 50,
    max: 99,
    step: 1,
    severity: 'warning',
    enabled: true,
    description: 'Triggered when conveyance efficiency (outlet/inlet) drops below target'
  },
  commTimeout: {
    id: 'commTimeout',
    nodeId: 'NODE-01',
    nodeName: 'Telemetry Gateway',
    metric: 'Telemetry Freshness Timeout',
    unit: 'sec',
    type: 'max',
    value: 15,
    min: 5,
    max: 60,
    step: 1,
    severity: 'critical',
    enabled: true,
    description: 'Triggered when no fresh telemetry is received within the timeout window'
  }
}

// ── Persistence Layer (localStorage adapter with clean backend abstraction) ──
const THRESHOLDS_STORAGE_KEY = 'hydrosense_thresholds_v2'
const ALERTS_STORAGE_KEY = 'hydrosense_alerts_history_v2'

export const getStoredThresholds = () => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(THRESHOLDS_STORAGE_KEY) : null
    if (!raw) return { ...DEFAULT_THRESHOLDS }
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_THRESHOLDS, ...parsed }
  } catch {
    return { ...DEFAULT_THRESHOLDS }
  }
}

export const saveStoredThresholds = (thresholds) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(THRESHOLDS_STORAGE_KEY, JSON.stringify(thresholds))
    }
  } catch (err) {
    console.error('Failed to save thresholds to storage:', err)
  }
}

export const getStoredAlerts = () => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(ALERTS_STORAGE_KEY) : null
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export const saveStoredAlerts = (alerts) => {
  try {
    if (typeof window !== 'undefined') {
      const trimmed = alerts.slice(0, 100)
      localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(trimmed))
    }
  } catch (err) {
    console.error('Failed to save alerts history to storage:', err)
  }
}

// ── Alert Evaluation Engine ──────────────────────────────────────────────────
export class AlertEngine {
  /**
   * @param {object|null} thresholds  - Initial thresholds (null = load from storage)
   * @param {Array|null}  initialAlerts - Seed alert list (null = load from storage).
   *   Pass an empty array [] to get a clean engine for tests without localStorage bleed.
   */
  constructor(thresholds = null, initialAlerts = null) {
    this.thresholds = thresholds || getStoredThresholds()
    this.alerts = initialAlerts !== null ? initialAlerts : getStoredAlerts()
    this.lastPacketTime = Date.now()
    this.listeners = new Set()
  }

  setThresholds(newThresholds) {
    this.thresholds = { ...this.thresholds, ...newThresholds }
    saveStoredThresholds(this.thresholds)
    this.notify()
  }

  subscribe(listener) {
    this.listeners.add(listener)
    listener({ alerts: this.alerts, thresholds: this.thresholds })
    return () => this.listeners.delete(listener)
  }

  notify() {
    const payload = { alerts: [...this.alerts], thresholds: { ...this.thresholds } }
    this.listeners.forEach(cb => {
      try { cb(payload) } catch (e) { console.error('AlertEngine listener error:', e) }
    })
  }

  /**
   * Evaluates raw telemetry and updates alert states.
   * Telemetry fields: flow_in, flow_out, pressure, temperature, vibration_alert,
   * leakage_detected, low_pressure_alert, flow_difference, system_efficiency, last_updated
   */
  evaluate(telemetry, isConnected = true) {
    if (!telemetry) return

    const now = Date.now()
    
    // Extract real telemetry fields with backward-compatible fallbacks
    const flowIn = Number(telemetry.flow_in ?? telemetry.flow_rate_in ?? 0)
    const flowOut = Number(telemetry.flow_out ?? telemetry.flow_rate_out ?? 0)
    const pressure = Number(telemetry.pressure ?? 0)
    const temperature = Number(telemetry.temperature ?? 0)
    const vibrationAlert = Boolean(telemetry.vibration_alert ?? false)
    const leakageFlag = Boolean(telemetry.leakage_detected ?? false)
    const lowPressureFlag = Boolean(telemetry.low_pressure_alert ?? false)
    const flowDiff = Number(telemetry.flow_difference ?? Math.abs(flowIn - flowOut))
    const efficiency = Number(telemetry.system_efficiency ?? (flowIn > 0 ? (flowOut / flowIn * 100) : 0))

    // Track telemetry packet arrival freshness
    let packetAgeSec = 0
    if (telemetry.last_updated) {
      const parsed = new Date(telemetry.last_updated).getTime()
      if (!isNaN(parsed)) {
        packetAgeSec = Math.max(0, Math.round((now - parsed) / 1000))
      }
    }
    this.lastPacketTime = now

    // Evaluate all potential trigger rules
    const activeConditions = []

    // 1. Leakage Alert (NODE-02)
    const leakThreshold = this.thresholds.maxLeakageDelta
    if (leakThreshold?.enabled) {
      const isLeaking = (flowIn > 0.5 && flowDiff >= leakThreshold.value) || leakageFlag
      if (isLeaking) {
        activeConditions.push({
          ruleKey: 'leakage_NODE-02',
          nodeId: 'NODE-02',
          nodeName: 'Pipeline & Tamper Node',
          type: 'leakage',
          severity: leakThreshold.severity || 'critical',
          title: 'Pipeline Water Leakage Detected',
          description: `Flow differential between intake and outlet is ${flowDiff.toFixed(1)} L/min (threshold: ${leakThreshold.value.toFixed(1)} L/min).`,
          currentValue: `${flowDiff.toFixed(1)} L/min`,
          thresholdValue: `${leakThreshold.value.toFixed(1)} L/min`,
          metric: 'Flow Differential'
        })
      }
    }

    // 2. Vibration / Tampering Alert (NODE-02)
    const vibThreshold = this.thresholds.vibrationTamper
    if (vibThreshold?.enabled && vibrationAlert) {
      activeConditions.push({
        ruleKey: 'vibration_NODE-02',
        nodeId: 'NODE-02',
        nodeName: 'Pipeline & Tamper Node',
        type: 'tampering',
        severity: vibThreshold.severity || 'critical',
        title: 'Physical Vibration / Tampering Detected',
        description: 'Vibration sensor on the main conduit triggered an unauthorized physical disturbance alert.',
        currentValue: 'Triggered (VIB=1)',
        thresholdValue: 'Normal (VIB=0)',
        metric: 'Vibration Status'
      })
    }

    // 3. Low Pressure Alert (NODE-02)
    const minPressThreshold = this.thresholds.minPressure
    if (minPressThreshold?.enabled) {
      const isLowPressure = (pressure > 0 && pressure < minPressThreshold.value) || lowPressureFlag
      if (isLowPressure) {
        activeConditions.push({
          ruleKey: 'low_pressure_NODE-02',
          nodeId: 'NODE-02',
          nodeName: 'Pipeline & Tamper Node',
          type: 'pressure',
          severity: minPressThreshold.severity || 'critical',
          title: 'Critical Low Pipeline Pressure',
          description: `Pipeline pressure ${pressure.toFixed(1)} Bar is below the safe minimum ${minPressThreshold.value.toFixed(1)} Bar.`,
          currentValue: `${pressure.toFixed(1)} Bar`,
          thresholdValue: `${minPressThreshold.value.toFixed(1)} Bar`,
          metric: 'Line Pressure'
        })
      }
    }

    // 4. High Pressure Alert (NODE-02)
    const maxPressThreshold = this.thresholds.maxPressure
    if (maxPressThreshold?.enabled && pressure > maxPressThreshold.value) {
      activeConditions.push({
        ruleKey: 'high_pressure_NODE-02',
        nodeId: 'NODE-02',
        nodeName: 'Pipeline & Tamper Node',
        type: 'pressure',
        severity: maxPressThreshold.severity || 'warning',
        title: 'High Pipeline Pressure Warning',
        description: `Pipeline pressure ${pressure.toFixed(1)} Bar exceeds safe threshold ${maxPressThreshold.value.toFixed(1)} Bar.`,
        currentValue: `${pressure.toFixed(1)} Bar`,
        thresholdValue: `${maxPressThreshold.value.toFixed(1)} Bar`,
        metric: 'Line Pressure'
      })
    }

    // 5. High Temperature Alert (NODE-01)
    const tempThreshold = this.thresholds.highTemp
    if (tempThreshold?.enabled && temperature > tempThreshold.value) {
      activeConditions.push({
        ruleKey: 'high_temp_NODE-01',
        nodeId: 'NODE-01',
        nodeName: 'Inlet Monitoring Station',
        type: 'temperature',
        severity: tempThreshold.severity || 'warning',
        title: 'Elevated Intake Fluid Temperature',
        description: `Inlet temperature ${temperature.toFixed(1)}°C exceeds normal maximum ${tempThreshold.value.toFixed(1)}°C.`,
        currentValue: `${temperature.toFixed(1)} °C`,
        thresholdValue: `${tempThreshold.value.toFixed(1)} °C`,
        metric: 'Fluid Temperature'
      })
    }

    // 6. Excessive Flow Rate (NODE-01)
    const flowThreshold = this.thresholds.maxFlowIn
    if (flowThreshold?.enabled && flowIn > flowThreshold.value) {
      activeConditions.push({
        ruleKey: 'high_flow_NODE-01',
        nodeId: 'NODE-01',
        nodeName: 'Inlet Monitoring Station',
        type: 'flow',
        severity: flowThreshold.severity || 'warning',
        title: 'Excessive Inflow Rate Detected',
        description: `Intake flow ${flowIn.toFixed(1)} L/min exceeds designed line limit of ${flowThreshold.value.toFixed(1)} L/min.`,
        currentValue: `${flowIn.toFixed(1)} L/min`,
        thresholdValue: `${flowThreshold.value.toFixed(1)} L/min`,
        metric: 'Inlet Flow Rate'
      })
    }

    // 7. Low Conveyance Efficiency (NODE-03)
    const effThreshold = this.thresholds.minEfficiency
    if (effThreshold?.enabled && flowIn > 3.0 && efficiency < effThreshold.value) {
      activeConditions.push({
        ruleKey: 'low_eff_NODE-03',
        nodeId: 'NODE-03',
        nodeName: 'Outlet & Delivery Station',
        type: 'efficiency',
        severity: effThreshold.severity || 'warning',
        title: 'Sub-Optimal Conveyance Efficiency',
        description: `Delivery efficiency is ${efficiency.toFixed(1)}%, below the expected target of ${effThreshold.value.toFixed(1)}%.`,
        currentValue: `${efficiency.toFixed(1)} %`,
        thresholdValue: `${effThreshold.value.toFixed(1)} %`,
        metric: 'Conveyance Efficiency'
      })
    }

    // 8. Communication Failure / Telemetry Freshness Timeout
    const commThreshold = this.thresholds.commTimeout
    if (commThreshold?.enabled && (!isConnected || packetAgeSec > commThreshold.value)) {
      activeConditions.push({
        ruleKey: 'comm_failure_SYSTEM',
        nodeId: 'NODE-01',
        nodeName: 'Inlet Monitoring Station',
        type: 'communication',
        severity: commThreshold.severity || 'critical',
        title: 'Telemetry Communication Failure',
        description: isConnected
          ? `No fresh sensor packets received for ${packetAgeSec}s (timeout: ${commThreshold.value}s).`
          : 'Lost connection to backend API server.',
        currentValue: isConnected ? `${packetAgeSec}s stale` : 'Disconnected',
        thresholdValue: `${commThreshold.value}s max`,
        metric: 'Telemetry Freshness'
      })
    }

    // ── Reconcile Active Conditions with Existing Alerts ─────────────────────
    let stateChanged = false
    const currentActiveRuleKeys = new Set(activeConditions.map(c => c.ruleKey))

    // 1. Update existing alerts or create new ones
    activeConditions.forEach(cond => {
      const existing = this.alerts.find(
        a => a.ruleKey === cond.ruleKey && (a.status === 'ACTIVE' || a.status === 'ACKNOWLEDGED')
      )

      if (existing) {
        // Update live telemetry values without duplicating alert
        if (existing.currentValue !== cond.currentValue || existing.thresholdValue !== cond.thresholdValue) {
          existing.currentValue = cond.currentValue
          existing.thresholdValue = cond.thresholdValue
          existing.lastSeen = now
          stateChanged = true
        }
      } else {
        // Create new ACTIVE alert
        const newAlert = {
          id: `ALT-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
          ruleKey: cond.ruleKey,
          nodeId: cond.nodeId,
          nodeName: cond.nodeName,
          type: cond.type,
          severity: cond.severity,
          title: cond.title,
          description: cond.description,
          currentValue: cond.currentValue,
          thresholdValue: cond.thresholdValue,
          metric: cond.metric,
          timestamp: now,
          lastSeen: now,
          status: 'ACTIVE', // ACTIVE -> ACKNOWLEDGED -> RESOLVED
          resolvedAt: null,
          acknowledgedAt: null
        }
        this.alerts.unshift(newAlert)
        stateChanged = true
      }
    })

    // 2. Resolve alerts whose underlying conditions are no longer present
    this.alerts.forEach(alert => {
      if ((alert.status === 'ACTIVE' || alert.status === 'ACKNOWLEDGED') && !currentActiveRuleKeys.has(alert.ruleKey)) {
        alert.status = 'RESOLVED'
        alert.resolvedAt = now
        stateChanged = true
      }
    })

    if (stateChanged) {
      saveStoredAlerts(this.alerts)
      this.notify()
    }
  }

  // ── User Actions ───────────────────────────────────────────────────────────
  acknowledgeAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert && alert.status === 'ACTIVE') {
      alert.status = 'ACKNOWLEDGED'
      alert.acknowledgedAt = Date.now()
      saveStoredAlerts(this.alerts)
      this.notify()
    }
  }

  resolveAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert && alert.status !== 'RESOLVED') {
      alert.status = 'RESOLVED'
      alert.resolvedAt = Date.now()
      saveStoredAlerts(this.alerts)
      this.notify()
    }
  }

  dismissAlert(alertId) {
    // Soft dismiss / resolve
    this.resolveAlert(alertId)
  }

  clearResolvedAlerts() {
    this.alerts = this.alerts.filter(a => a.status !== 'RESOLVED')
    saveStoredAlerts(this.alerts)
    this.notify()
  }
}

// Global Singleton Instance
const globalAlertEngine = new AlertEngine()
export default globalAlertEngine
