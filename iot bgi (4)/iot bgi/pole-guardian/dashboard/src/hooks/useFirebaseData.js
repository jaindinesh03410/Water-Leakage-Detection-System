import { useState, useEffect, useCallback } from 'react'

const API = 'http://localhost:8000'

// Shared fetch with no-store to always get fresh data from backend
const apiFetch = (endpoint) =>
  fetch(`${API}${endpoint}`, { cache: 'no-store' }).then(r => r.json())

// ─── useRealTimeMetrics ───────────────────────────────────────────────────────
export const useRealTimeMetrics = () => {
  const [metrics, setMetrics] = useState({
    flowRate: 0, flowRateOut: 0, pressure: 0, temperature: 0,
    vibrationStatus: 'normal', theftRisk: 0,
    totalConsumption: 0, alertCount: 0,
    leakageDetected: false, valve1: false, valve2: false,
    efficiency: 0, nodeStatus: { normal: 1, warning: 0, critical: 0 }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchMetrics = useCallback(async () => {
    try {
      const [flow, alert] = await Promise.all([
        apiFetch('/api/flow_data'),
        apiFetch('/api/alerts_live')
      ])

      const h = new Date().getHours()
      const offHours = h < 6 || h > 22
      const theftRisk = offHours && flow.flow_rate_in > 0
        ? Math.min(85 + Math.random() * 15, 100)
        : Math.random() * 25

      setMetrics({
        flowRate:         flow.flow_rate_in      || 0,
        flowRateOut:      flow.flow_rate_out     || 0,
        pressure:         flow.pressure          || 0,
        temperature:      flow.temperature       || 0,
        vibrationStatus:  flow.vibration_alert   ? 'detected' : 'normal',
        theftRisk:        Math.round(theftRisk),
        totalConsumption: Math.round(flow.total_litres_1 || 0),
        alertCount:       alert.count            || 0,
        leakageDetected:  flow.leakage_detected  || false,
        valve1:           flow.valve1_status     || false,
        valve2:           flow.valve2_status     || false,
        efficiency:       flow.system_efficiency || 0,
        nodeStatus: { normal: 1, warning: 0, critical: 0 }
      })
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }, [])

  useEffect(() => {
    fetchMetrics()
    const id = setInterval(fetchMetrics, 1000) // 1s — backend now has realtime listener
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
        setReadings({
          flow:        data.flow_rate_in    || 0,
          pressure:    data.pressure        || 0,
          temperature: data.temperature     || 0,
          vibration:   data.vibration_alert || false,
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

// ─── useActiveAlerts ──────────────────────────────────────────────────────────
export const useActiveAlerts = () => {
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const data = await apiFetch('/api/alerts_live')
        const list = (data.alerts || []).map((a, i) => ({
          id: `alert_${i}`, ...a, resolved: false
        }))
        setAlerts(list)
      } catch {}
    }
    fetch_()
    const id = setInterval(fetch_, 1000)
    return () => clearInterval(id)
  }, [])

  return { alerts, loading: false, error: null }
}

// ─── useConnectionStatus ─────────────────────────────────────────────────────
export const useConnectionStatus = () => {
  const [connected, setConnected] = useState(false)

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

// ─── useFirebaseData (legacy) ─────────────────────────────────────────────────
export const useFirebaseData = () => {
  return { data: null, loading: false, error: null, connected: true }
}
