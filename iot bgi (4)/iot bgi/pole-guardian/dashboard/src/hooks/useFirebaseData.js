import { useState, useEffect, useCallback } from 'react'
import globalAlertEngine from '../services/alertEngine.js'

const API = 'http://localhost:8000'

// Shared fetch with no-store to always get fresh data from backend
const apiFetch = async (endpoint) => {
  const res = await fetch(`${API}${endpoint}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return await res.json()
}

// ─── useRealTimeMetrics ───────────────────────────────────────────────────────
export const useRealTimeMetrics = () => {
  const [metrics, setMetrics] = useState({
    flowRate: 0,
    flowRateOut: 0,
    pressure: 0,
    temperature: 0,
    vibrationStatus: 'normal',
    theftRisk: 0,
    totalConsumption: 0,
    alertCount: 0,
    leakageDetected: false,
    valve1: false,
    valve2: false,
    efficiency: 0,
    nodeStatus: { normal: 3, warning: 0, critical: 0 },
    nodesData: {
      'NODE-01': { flow_in: 0, temperature: 0, valve1_status: false, total_litres_1: 0, status: 'normal' },
      'NODE-02': { pressure: 0, vibration_alert: false, flow_difference: 0, leakage_detected: false, status: 'normal' },
      'NODE-03': { flow_out: 0, total_litres_2: 0, valve2_status: false, system_efficiency: 0, status: 'normal' }
    }
  })
  const [loading] = useState(false)
  const [error, setError] = useState(null)

  const fetchMetrics = useCallback(async () => {
    try {
      const flow = await apiFetch('/api/flow_data')

      // Support real telemetry fields
      const flowIn = Number(flow.flow_in ?? flow.flow_rate_in ?? 0)
      const flowOut = Number(flow.flow_out ?? flow.flow_rate_out ?? 0)
      const pressure = Number(flow.pressure ?? 0)
      const temperature = Number(flow.temperature ?? 0)
      const vibration = Boolean(flow.vibration_alert ?? false)
      const leakage = Boolean(flow.leakage_detected ?? false)
      const flowDiff = Number(flow.flow_difference ?? Math.abs(flowIn - flowOut))
      const efficiency = Number(flow.system_efficiency ?? (flowIn > 0 ? (flowOut / flowIn * 100) : 0))
      const valve1 = Boolean(flow.valve1_status ?? false)
      const valve2 = Boolean(flow.valve2_status ?? false)
      const total1 = Number(flow.total_litres_1 ?? 0)
      const total2 = Number(flow.total_litres_2 ?? 0)

      // Feed real telemetry to the AlertEngine
      globalAlertEngine.evaluate(flow, true)

      // Compute active alerts per node
      const currentAlerts = globalAlertEngine.alerts.filter(a => a.status === 'ACTIVE')

      const node1Alerts = currentAlerts.filter(a => a.nodeId === 'NODE-01')
      const node2Alerts = currentAlerts.filter(a => a.nodeId === 'NODE-02')
      const node3Alerts = currentAlerts.filter(a => a.nodeId === 'NODE-03')

      const getNodeHealth = (nodeAlerts) => {
        if (nodeAlerts.some(a => a.severity === 'critical')) return 'critical'
        if (nodeAlerts.some(a => a.severity === 'warning')) return 'warning'
        return 'normal'
      }

      const node1Status = getNodeHealth(node1Alerts)
      const node2Status = getNodeHealth(node2Alerts)
      const node3Status = getNodeHealth(node3Alerts)

      const statusCounts = { normal: 0, warning: 0, critical: 0 }
      ;[node1Status, node2Status, node3Status].forEach(s => {
        statusCounts[s] = (statusCounts[s] || 0) + 1
      })

      // Off-hours theft risk heuristic
      const h = new Date().getHours()
      const offHours = h < 6 || h > 22
      const theftRisk = (vibration || (offHours && flowIn > 0))
        ? Math.min(85 + Math.random() * 15, 100)
        : Math.min(Math.round(flowDiff * 5), 30)

      setMetrics({
        flowRate:         flowIn,
        flowRateOut:      flowOut,
        pressure:         pressure,
        temperature:      temperature,
        vibrationStatus:  vibration ? 'detected' : 'normal',
        theftRisk:        Math.round(theftRisk),
        totalConsumption: Math.round(total1),
        alertCount:       currentAlerts.length,
        leakageDetected:  leakage || flowDiff >= 2.0,
        valve1:           valve1,
        valve2:           valve2,
        efficiency:       Math.round(efficiency * 10) / 10,
        nodeStatus:       statusCounts,
        nodesData: {
          'NODE-01': {
            flow_in: flowIn,
            temperature: temperature,
            valve1_status: valve1,
            total_litres_1: total1,
            status: node1Status,
            alertCount: node1Alerts.length
          },
          'NODE-02': {
            pressure: pressure,
            vibration_alert: vibration,
            flow_difference: flowDiff,
            leakage_detected: leakage,
            status: node2Status,
            alertCount: node2Alerts.length
          },
          'NODE-03': {
            flow_out: flowOut,
            total_litres_2: total2,
            valve2_status: valve2,
            system_efficiency: efficiency,
            status: node3Status,
            alertCount: node3Alerts.length
          }
        }
      })
      setError(null)
    } catch (err) {
      // If backend unreachable, inform alert engine
      globalAlertEngine.evaluate({ last_updated: null }, false)
      setError(err.message)
    }
  }, [])

  useEffect(() => {
    fetchMetrics()
    const id = setInterval(fetchMetrics, 1000)
    return () => clearInterval(id)
  }, [fetchMetrics])

  return { metrics, loading, error, refresh: fetchMetrics }
}

// ─── useLatestReadings ────────────────────────────────────────────────────────
export const useLatestReadings = () => {
  const [readings, setReadings] = useState(null)

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const data = await apiFetch('/api/flow_data')
        const flowIn = Number(data.flow_in ?? data.flow_rate_in ?? 0)
        const flowOut = Number(data.flow_out ?? data.flow_rate_out ?? 0)
        const pressure = Number(data.pressure ?? 0)
        const temperature = Number(data.temperature ?? 0)
        const vibration = Boolean(data.vibration_alert ?? false)

        setReadings({
          flow:        flowIn,
          flowIn:      flowIn,
          flowOut:     flowOut,
          pressure:    pressure,
          temperature: temperature,
          vibration:   vibration,
          timestamp:   Date.now()
        })
      } catch {}
    }
    fetch_()
    const id = setInterval(fetch_, 1000)
    return () => clearInterval(id)
  }, [])

  return { readings, loading: false, error: null }
}

// ─── useAlertEngine (Real event-driven alert hook) ───────────────────────────
export const useAlertEngine = () => {
  const [state, setState] = useState({
    alerts: globalAlertEngine.alerts,
    thresholds: globalAlertEngine.thresholds
  })

  useEffect(() => {
    const unsubscribe = globalAlertEngine.subscribe((updated) => {
      setState({
        alerts: updated.alerts,
        thresholds: updated.thresholds
      })
    })
    return unsubscribe
  }, [])

  return {
    alerts: state.alerts,
    thresholds: state.thresholds,
    activeAlerts: state.alerts.filter(a => a.status === 'ACTIVE'),
    acknowledgedAlerts: state.alerts.filter(a => a.status === 'ACKNOWLEDGED'),
    resolvedAlerts: state.alerts.filter(a => a.status === 'RESOLVED'),
    acknowledgeAlert: (id) => globalAlertEngine.acknowledgeAlert(id),
    resolveAlert: (id) => globalAlertEngine.resolveAlert(id),
    dismissAlert: (id) => globalAlertEngine.dismissAlert(id),
    clearResolvedAlerts: () => globalAlertEngine.clearResolvedAlerts(),
    updateThresholds: (newT) => globalAlertEngine.setThresholds(newT)
  }
}

// ─── useActiveAlerts (Compatibility Hook) ───────────────────────────────────
export const useActiveAlerts = () => {
  const { alerts, activeAlerts } = useAlertEngine()
  return { alerts: activeAlerts.length > 0 ? activeAlerts : alerts.filter(a => a.status !== 'RESOLVED'), allAlerts: alerts, loading: false, error: null }
}

// ─── useConnectionStatus ─────────────────────────────────────────────────────
export const useConnectionStatus = () => {
  const [connected, setConnected] = useState(true)

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${API}/health`, { cache: 'no-store' })
        setConnected(res.ok)
      } catch {
        setConnected(false)
      }
    }
    check()
    const id = setInterval(check, 3000)
    return () => clearInterval(id)
  }, [])

  return { connected, loading: false }
}

// ─── useFirebaseData (legacy fallback) ────────────────────────────────────────
export const useFirebaseData = () => {
  return { data: null, loading: false, error: null, connected: true }
}
