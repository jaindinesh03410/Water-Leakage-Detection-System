/**
 * AlertEngine Unit Tests
 *
 * Covers:
 *   - All 8 alert rules (leakage, vibration, low/high pressure, temp, flow, efficiency, comm)
 *   - Alert deduplication — no duplicate ACTIVE alerts for the same rule
 *   - Alert lifecycle: ACTIVE → ACKNOWLEDGED → RESOLVED
 *   - Auto-resolution when telemetry returns within thresholds
 *   - User actions: acknowledgeAlert, resolveAlert, clearResolvedAlerts
 *   - Threshold persistence helpers: getStoredThresholds, saveStoredThresholds
 *   - SYSTEM_NODES and DEFAULT_THRESHOLDS exports
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  AlertEngine,
  DEFAULT_THRESHOLDS,
  SYSTEM_NODES,
  getStoredThresholds,
  saveStoredThresholds,
  getStoredAlerts,
} from './alertEngine.js'

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Build a safe baseline telemetry packet — no alerts should fire */
const safeTelemetry = (overrides = {}) => ({
  flow_in: 20,
  flow_out: 19.5,
  pressure: 2.0,
  temperature: 25,
  vibration_alert: false,
  leakage_detected: false,
  low_pressure_alert: false,
  flow_difference: 0.5,
  system_efficiency: 97.5,
  last_updated: new Date().toISOString(),
  ...overrides,
})

/**
 * Create a clean AlertEngine for tests:
 * - Uses default thresholds (not from localStorage)
 * - Starts with an empty alerts array (no cross-test bleed)
 */
const freshEngine = () => new AlertEngine({ ...DEFAULT_THRESHOLDS }, [])

// Fresh localStorage store per test to prevent bleed between persistence tests
beforeEach(() => {
  const store = new Map()
  vi.stubGlobal('localStorage', {
    getItem:    key       => store.get(key) ?? null,
    setItem:    (key, val) => store.set(key, val),
    removeItem: key       => store.delete(key),
  })
})

// ── Exports sanity ────────────────────────────────────────────────────────────

describe('Module exports', () => {
  it('exports exactly 3 SYSTEM_NODES', () => {
    expect(SYSTEM_NODES).toHaveLength(3)
    expect(SYSTEM_NODES.map(n => n.id)).toEqual(['NODE-01', 'NODE-02', 'NODE-03'])
  })

  it('exports 8 DEFAULT_THRESHOLDS', () => {
    const keys = Object.keys(DEFAULT_THRESHOLDS)
    expect(keys).toHaveLength(8)
    expect(keys).toContain('maxLeakageDelta')
    expect(keys).toContain('commTimeout')
  })

  it('all DEFAULT_THRESHOLDS have required fields', () => {
    Object.values(DEFAULT_THRESHOLDS).forEach(t => {
      expect(t).toHaveProperty('id')
      expect(t).toHaveProperty('severity')
      expect(t).toHaveProperty('enabled')
    })
  })
})

// ── Safe telemetry — no alerts ────────────────────────────────────────────────

describe('AlertEngine — no alerts on safe telemetry', () => {
  it('produces zero ACTIVE alerts when all metrics are within thresholds', () => {
    const engine = freshEngine()
    engine.evaluate(safeTelemetry(), true)
    const active = engine.alerts.filter(a => a.status === 'ACTIVE')
    expect(active).toHaveLength(0)
  })
})

// ── Rule 1: Leakage ───────────────────────────────────────────────────────────

describe('AlertEngine — leakage rule', () => {
  it('fires when flow_difference exceeds maxLeakageDelta threshold', () => {
    const engine = freshEngine()
    engine.evaluate(safeTelemetry({ flow_in: 20, flow_out: 15, flow_difference: 5 }), true)
    const leakAlert = engine.alerts.find(a => a.ruleKey === 'leakage_NODE-02')
    expect(leakAlert).toBeDefined()
    expect(leakAlert.status).toBe('ACTIVE')
    expect(leakAlert.nodeId).toBe('NODE-02')
    expect(leakAlert.severity).toBe('critical')
  })

  it('fires when leakage_detected flag is true even if diff is small', () => {
    const engine = freshEngine()
    engine.evaluate(safeTelemetry({ leakage_detected: true, flow_difference: 0.1 }), true)
    const leakAlert = engine.alerts.find(a => a.ruleKey === 'leakage_NODE-02')
    expect(leakAlert).toBeDefined()
    expect(leakAlert.status).toBe('ACTIVE')
  })

  it('does NOT fire when flow_in is below 0.5 (pipe dry / no flow) and leakage_detected is false', () => {
    const engine = freshEngine()
    // flow_in 0.3 < 0.5, leakage_detected: false — guard should suppress
    engine.evaluate(safeTelemetry({
      flow_in: 0.3,
      flow_out: 0,
      flow_difference: 5,
      leakage_detected: false,
    }), true)
    const leakAlert = engine.alerts.find(a => a.ruleKey === 'leakage_NODE-02')
    expect(leakAlert).toBeUndefined()
  })

  it('does NOT fire when maxLeakageDelta is disabled', () => {
    const engine = freshEngine()
    engine.thresholds.maxLeakageDelta = { ...engine.thresholds.maxLeakageDelta, enabled: false }
    engine.evaluate(safeTelemetry({
      flow_in: 20,
      flow_out: 10,
      flow_difference: 10,
      leakage_detected: false,
    }), true)
    const leakAlert = engine.alerts.find(a => a.ruleKey === 'leakage_NODE-02')
    expect(leakAlert).toBeUndefined()
  })
})

// ── Rule 2: Vibration / Tampering ─────────────────────────────────────────────

describe('AlertEngine — vibration / tamper rule', () => {
  it('fires when vibration_alert is true', () => {
    const engine = freshEngine()
    engine.evaluate(safeTelemetry({ vibration_alert: true }), true)
    const vibAlert = engine.alerts.find(a => a.ruleKey === 'vibration_NODE-02')
    expect(vibAlert).toBeDefined()
    expect(vibAlert.severity).toBe('critical')
    expect(vibAlert.type).toBe('tampering')
  })

  it('does NOT fire when vibration_alert is false', () => {
    const engine = freshEngine()
    engine.evaluate(safeTelemetry({ vibration_alert: false }), true)
    const vibAlert = engine.alerts.find(a => a.ruleKey === 'vibration_NODE-02')
    expect(vibAlert).toBeUndefined()
  })
})

// ── Rule 3: Low Pressure ──────────────────────────────────────────────────────

describe('AlertEngine — low pressure rule', () => {
  it('fires when pressure drops below minPressure threshold', () => {
    const engine = freshEngine()
    engine.evaluate(safeTelemetry({ pressure: 0.5 }), true)
    const pressAlert = engine.alerts.find(a => a.ruleKey === 'low_pressure_NODE-02')
    expect(pressAlert).toBeDefined()
    expect(pressAlert.severity).toBe('critical')
  })

  it('fires when low_pressure_alert flag is true', () => {
    const engine = freshEngine()
    // pressure=2.0 is above min, but flag forces trigger
    engine.evaluate(safeTelemetry({ low_pressure_alert: true, pressure: 2.0 }), true)
    const pressAlert = engine.alerts.find(a => a.ruleKey === 'low_pressure_NODE-02')
    expect(pressAlert).toBeDefined()
  })

  it('does NOT fire when pressure equals threshold (condition is strict <, not <=)', () => {
    const engine = freshEngine()
    const threshold = engine.thresholds.minPressure.value // 1.0
    // pressure === threshold, rule is: pressure > 0 && pressure < threshold
    // So at exactly threshold it should NOT fire
    engine.evaluate(safeTelemetry({ pressure: threshold, low_pressure_alert: false }), true)
    const pressAlert = engine.alerts.find(a => a.ruleKey === 'low_pressure_NODE-02')
    expect(pressAlert).toBeUndefined()
  })
})

// ── Rule 4: High Pressure ─────────────────────────────────────────────────────

describe('AlertEngine — high pressure rule', () => {
  it('fires when pressure exceeds maxPressure threshold', () => {
    const engine = freshEngine()
    engine.evaluate(safeTelemetry({ pressure: 4.0 }), true)
    const pressAlert = engine.alerts.find(a => a.ruleKey === 'high_pressure_NODE-02')
    expect(pressAlert).toBeDefined()
    expect(pressAlert.severity).toBe('warning')
  })

  it('does NOT fire when pressure is at or below threshold', () => {
    const engine = freshEngine()
    // maxPressure default = 3.5; 3.0 is safely below
    engine.evaluate(safeTelemetry({ pressure: 3.0 }), true)
    const pressAlert = engine.alerts.find(a => a.ruleKey === 'high_pressure_NODE-02')
    expect(pressAlert).toBeUndefined()
  })
})

// ── Rule 5: High Temperature ──────────────────────────────────────────────────

describe('AlertEngine — high temperature rule', () => {
  it('fires when temperature exceeds highTemp threshold', () => {
    const engine = freshEngine()
    engine.evaluate(safeTelemetry({ temperature: 50 }), true)
    const tempAlert = engine.alerts.find(a => a.ruleKey === 'high_temp_NODE-01')
    expect(tempAlert).toBeDefined()
    expect(tempAlert.nodeId).toBe('NODE-01')
    expect(tempAlert.severity).toBe('warning')
  })

  it('does NOT fire when temperature is below threshold', () => {
    const engine = freshEngine()
    // highTemp default = 45; safeTelemetry already sets temperature: 25
    engine.evaluate(safeTelemetry({ temperature: 30 }), true)
    const tempAlert = engine.alerts.find(a => a.ruleKey === 'high_temp_NODE-01')
    expect(tempAlert).toBeUndefined()
  })
})

// ── Rule 6: Excessive Flow Rate ───────────────────────────────────────────────

describe('AlertEngine — excessive flow rate rule', () => {
  it('fires when flow_in exceeds maxFlowIn threshold', () => {
    const engine = freshEngine()
    // maxFlowIn default = 50; use 60 to trigger; keep flow_out close to avoid leakage alert
    engine.evaluate(safeTelemetry({ flow_in: 60, flow_out: 59, flow_difference: 1 }), true)
    const flowAlert = engine.alerts.find(a => a.ruleKey === 'high_flow_NODE-01')
    expect(flowAlert).toBeDefined()
    expect(flowAlert.nodeId).toBe('NODE-01')
  })

  it('does NOT fire when flow_in is at or below threshold (50 L/min)', () => {
    const engine = freshEngine()
    engine.evaluate(safeTelemetry({ flow_in: 50, flow_out: 49.5, flow_difference: 0.5 }), true)
    const flowAlert = engine.alerts.find(a => a.ruleKey === 'high_flow_NODE-01')
    expect(flowAlert).toBeUndefined()
  })
})

// ── Rule 7: Low Efficiency ────────────────────────────────────────────────────

describe('AlertEngine — low efficiency rule', () => {
  it('fires when system_efficiency < minEfficiency and flow_in > 3', () => {
    const engine = freshEngine()
    engine.evaluate(safeTelemetry({ flow_in: 20, flow_out: 14, system_efficiency: 70, flow_difference: 1.5 }), true)
    const effAlert = engine.alerts.find(a => a.ruleKey === 'low_eff_NODE-03')
    expect(effAlert).toBeDefined()
    expect(effAlert.nodeId).toBe('NODE-03')
    expect(effAlert.severity).toBe('warning')
  })

  it('does NOT fire when flow_in is too low (avoids false-positive on dry pipe)', () => {
    const engine = freshEngine()
    // flow_in: 1 < guard of 3.0; should suppress even if efficiency is low
    engine.evaluate(safeTelemetry({ flow_in: 1, flow_out: 0, system_efficiency: 50, flow_difference: 1 }), true)
    const effAlert = engine.alerts.find(a => a.ruleKey === 'low_eff_NODE-03')
    expect(effAlert).toBeUndefined()
  })

  it('does NOT fire when efficiency is at or above threshold', () => {
    const engine = freshEngine()
    // minEfficiency default = 80; use 95 to stay safe
    engine.evaluate(safeTelemetry({ flow_in: 20, system_efficiency: 95 }), true)
    const effAlert = engine.alerts.find(a => a.ruleKey === 'low_eff_NODE-03')
    expect(effAlert).toBeUndefined()
  })
})

// ── Rule 8: Communication Failure ─────────────────────────────────────────────

describe('AlertEngine — communication failure rule', () => {
  it('fires when isConnected is false', () => {
    const engine = freshEngine()
    engine.evaluate(safeTelemetry(), false)
    const commAlert = engine.alerts.find(a => a.ruleKey === 'comm_failure_SYSTEM')
    expect(commAlert).toBeDefined()
    expect(commAlert.severity).toBe('critical')
    expect(commAlert.type).toBe('communication')
  })

  it('fires when last_updated timestamp exceeds commTimeout (120s stale)', () => {
    const engine = freshEngine()
    const staleTime = new Date(Date.now() - 120_000).toISOString()
    engine.evaluate(safeTelemetry({ last_updated: staleTime }), true)
    const commAlert = engine.alerts.find(a => a.ruleKey === 'comm_failure_SYSTEM')
    expect(commAlert).toBeDefined()
  })

  it('does NOT fire when last_updated is fresh and connected', () => {
    const engine = freshEngine()
    engine.evaluate(safeTelemetry({ last_updated: new Date().toISOString() }), true)
    const commAlert = engine.alerts.find(a => a.ruleKey === 'comm_failure_SYSTEM')
    expect(commAlert).toBeUndefined()
  })
})

// ── Deduplication ─────────────────────────────────────────────────────────────

describe('AlertEngine — deduplication', () => {
  it('does not create duplicate ACTIVE alerts for the same rule on repeated evaluations', () => {
    const engine = freshEngine()
    const t = safeTelemetry({ vibration_alert: true })
    engine.evaluate(t, true)
    engine.evaluate(t, true)
    engine.evaluate(t, true)
    const vibAlerts = engine.alerts.filter(a => a.ruleKey === 'vibration_NODE-02' && a.status === 'ACTIVE')
    expect(vibAlerts).toHaveLength(1)
  })

  it('updates currentValue on an existing ACTIVE alert instead of creating a new one', () => {
    const engine = freshEngine()
    engine.evaluate(safeTelemetry({ flow_in: 20, flow_out: 14, flow_difference: 6 }), true)
    const countBefore = engine.alerts.filter(a => a.ruleKey === 'leakage_NODE-02').length

    // Differential worsens
    engine.evaluate(safeTelemetry({ flow_in: 20, flow_out: 10, flow_difference: 10 }), true)
    const countAfter = engine.alerts.filter(a => a.ruleKey === 'leakage_NODE-02').length

    expect(countAfter).toBe(countBefore) // still 1 alert
    expect(engine.alerts.find(a => a.ruleKey === 'leakage_NODE-02').currentValue).toContain('10.0')
  })
})

// ── Alert Lifecycle ────────────────────────────────────────────────────────────

describe('AlertEngine — lifecycle: ACTIVE → ACKNOWLEDGED → RESOLVED', () => {
  it('acknowledgeAlert transitions status from ACTIVE to ACKNOWLEDGED', () => {
    const engine = freshEngine()
    engine.evaluate(safeTelemetry({ vibration_alert: true }), true)
    const alert = engine.alerts.find(a => a.ruleKey === 'vibration_NODE-02')
    expect(alert.status).toBe('ACTIVE')

    engine.acknowledgeAlert(alert.id)
    expect(alert.status).toBe('ACKNOWLEDGED')
    expect(alert.acknowledgedAt).toBeDefined()
  })

  it('resolveAlert transitions any non-resolved alert to RESOLVED', () => {
    const engine = freshEngine()
    engine.evaluate(safeTelemetry({ vibration_alert: true }), true)
    const alert = engine.alerts.find(a => a.ruleKey === 'vibration_NODE-02')
    engine.resolveAlert(alert.id)
    expect(alert.status).toBe('RESOLVED')
    expect(alert.resolvedAt).toBeDefined()
  })

  it('acknowledgeAlert has no effect if alert is already RESOLVED', () => {
    const engine = freshEngine()
    engine.evaluate(safeTelemetry({ vibration_alert: true }), true)
    const alert = engine.alerts.find(a => a.ruleKey === 'vibration_NODE-02')
    engine.resolveAlert(alert.id)
    engine.acknowledgeAlert(alert.id) // should be a no-op
    expect(alert.status).toBe('RESOLVED')
  })

  it('resolveAlert has no effect if alert id does not exist', () => {
    const engine = freshEngine()
    expect(() => engine.resolveAlert('nonexistent-id')).not.toThrow()
  })
})

// ── Auto-resolution ───────────────────────────────────────────────────────────

describe('AlertEngine — auto-resolution', () => {
  it('auto-resolves an ACTIVE alert when its condition clears', () => {
    const engine = freshEngine()
    engine.evaluate(safeTelemetry({ vibration_alert: true }), true)
    const alert = engine.alerts.find(a => a.ruleKey === 'vibration_NODE-02')
    expect(alert.status).toBe('ACTIVE')

    engine.evaluate(safeTelemetry({ vibration_alert: false }), true)
    expect(alert.status).toBe('RESOLVED')
    expect(alert.resolvedAt).toBeDefined()
  })

  it('auto-resolves an ACKNOWLEDGED alert when condition clears', () => {
    const engine = freshEngine()
    engine.evaluate(safeTelemetry({ vibration_alert: true }), true)
    const alert = engine.alerts.find(a => a.ruleKey === 'vibration_NODE-02')
    engine.acknowledgeAlert(alert.id)
    expect(alert.status).toBe('ACKNOWLEDGED')

    engine.evaluate(safeTelemetry({ vibration_alert: false }), true)
    expect(alert.status).toBe('RESOLVED')
  })

  it('a re-triggered condition after manual resolve creates a NEW alert', () => {
    const engine = freshEngine()
    // Trigger, then manually resolve
    engine.evaluate(safeTelemetry({ vibration_alert: true }), true)
    const first = engine.alerts.find(a => a.ruleKey === 'vibration_NODE-02')
    expect(first).toBeDefined()
    engine.resolveAlert(first.id)
    expect(first.status).toBe('RESOLVED')

    // Re-trigger
    engine.evaluate(safeTelemetry({ vibration_alert: true }), true)
    const allVib = engine.alerts.filter(a => a.ruleKey === 'vibration_NODE-02')
    expect(allVib).toHaveLength(2)
    const newActive = allVib.find(a => a.status === 'ACTIVE')
    expect(newActive).toBeDefined()
    expect(newActive.id).not.toBe(first.id)
  })
})

// ── clearResolvedAlerts ───────────────────────────────────────────────────────

describe('AlertEngine — clearResolvedAlerts', () => {
  it('removes all RESOLVED alerts but keeps ACTIVE and ACKNOWLEDGED', () => {
    const engine = freshEngine()
    // Create two alerts — vibration (ACTIVE) and high pressure (ACTIVE)
    engine.evaluate(safeTelemetry({ vibration_alert: true, pressure: 4.5 }), true)
    const vibAlert  = engine.alerts.find(a => a.ruleKey === 'vibration_NODE-02')
    const pressAlert = engine.alerts.find(a => a.ruleKey === 'high_pressure_NODE-02')

    // Resolve only vibration
    engine.resolveAlert(vibAlert.id)
    engine.clearResolvedAlerts()

    expect(engine.alerts.find(a => a.id === vibAlert.id)).toBeUndefined()
    expect(engine.alerts.find(a => a.id === pressAlert.id)).toBeDefined()
  })
})

// ── setThresholds ─────────────────────────────────────────────────────────────

describe('AlertEngine — setThresholds', () => {
  it('updates a threshold value and notifies subscribers', () => {
    const engine = freshEngine()
    const listener = vi.fn()
    engine.subscribe(listener)
    listener.mockClear()

    engine.setThresholds({ maxFlowIn: { ...engine.thresholds.maxFlowIn, value: 30 } })
    expect(engine.thresholds.maxFlowIn.value).toBe(30)
    expect(listener).toHaveBeenCalledOnce()
  })

  it('alert fires at newly lowered threshold value', () => {
    const engine = freshEngine()
    // Lower maxFlowIn to 15 L/min
    engine.setThresholds({ maxFlowIn: { ...engine.thresholds.maxFlowIn, value: 15 } })
    // flow_in: 20 now exceeds the new threshold of 15
    engine.evaluate(safeTelemetry({ flow_in: 20, flow_out: 19.5, flow_difference: 0.5 }), true)
    const flowAlert = engine.alerts.find(a => a.ruleKey === 'high_flow_NODE-01')
    expect(flowAlert).toBeDefined()
  })
})

// ── subscribe / notify ────────────────────────────────────────────────────────

describe('AlertEngine — subscribe / notify', () => {
  it('calls listener immediately with current state on subscribe', () => {
    const engine = freshEngine()
    const listener = vi.fn()
    engine.subscribe(listener)
    expect(listener).toHaveBeenCalledOnce()
    const payload = listener.mock.calls[0][0]
    expect(payload).toHaveProperty('alerts')
    expect(payload).toHaveProperty('thresholds')
  })

  it('unsubscribe stops future notifications', () => {
    const engine = freshEngine()
    const listener = vi.fn()
    const unsubscribe = engine.subscribe(listener)
    listener.mockClear()
    unsubscribe()
    engine.evaluate(safeTelemetry({ vibration_alert: true }), true)
    expect(listener).not.toHaveBeenCalled()
  })
})

// ── Persistence helpers ────────────────────────────────────────────────────────

describe('Persistence helpers', () => {
  it('getStoredThresholds returns DEFAULT_THRESHOLDS when nothing is stored', () => {
    const result = getStoredThresholds()
    expect(result.maxLeakageDelta.value).toBe(DEFAULT_THRESHOLDS.maxLeakageDelta.value)
  })

  it('saveStoredThresholds persists values readable by getStoredThresholds', () => {
    const modified = {
      ...DEFAULT_THRESHOLDS,
      maxFlowIn: { ...DEFAULT_THRESHOLDS.maxFlowIn, value: 99 },
    }
    saveStoredThresholds(modified)
    const loaded = getStoredThresholds()
    expect(loaded.maxFlowIn.value).toBe(99)
  })

  it('getStoredThresholds merges stored values with defaults (adds missing keys)', () => {
    const partial = { maxLeakageDelta: { ...DEFAULT_THRESHOLDS.maxLeakageDelta, value: 5 } }
    localStorage.setItem('hydrosense_thresholds_v2', JSON.stringify(partial))
    const loaded = getStoredThresholds()
    expect(loaded.maxLeakageDelta.value).toBe(5)
    expect(loaded.commTimeout).toBeDefined()
  })

  it('getStoredAlerts returns empty array when nothing is stored', () => {
    expect(getStoredAlerts()).toEqual([])
  })
})
