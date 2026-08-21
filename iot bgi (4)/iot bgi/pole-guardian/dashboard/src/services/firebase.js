const API_BASE = 'http://localhost:8000'

const api = {
  get: async (endpoint) => {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch (error) {
      console.error(`API error ${endpoint}:`, error)
      return {}
    }
  }
}

export const initializeAuth = () => Promise.resolve({ uid: 'api-user' })

const listeners = new Map()
const intervals = new Map()

const createPoller = (endpoint, callback, interval = 1000) => {
  const poll = async () => {
    const data = await api.get(endpoint)
    callback(data)
  }

  poll()
  const id = setInterval(poll, interval)
  intervals.set(endpoint, id)

  return () => {
    clearInterval(id)
    intervals.delete(endpoint)
  }
}

// ESP32 Compatible Endpoints
export const subscribeToSensorData = (callback) => {
  const unsubscribe = createPoller('/api/sensor_data', callback)
  listeners.set('sensor_data', unsubscribe)
  return unsubscribe
}

export const subscribeToFlowData = (callback) => {
  const unsubscribe = createPoller('/api/flow_data', callback)
  listeners.set('flow_data', unsubscribe)
  return unsubscribe
}

export const subscribeToLiveAlerts = (callback) => {
  const unsubscribe = createPoller('/api/alerts_live', callback)
  listeners.set('alerts_live', unsubscribe)
  return unsubscribe
}

export const subscribeToDashboardSummary = (callback) => {
  const unsubscribe = createPoller('/api/dashboard_summary', callback)
  listeners.set('dashboard_summary', unsubscribe)
  return unsubscribe
}

// Legacy endpoints (for backward compatibility)
export const subscribeToReadings = (callback) => {
  // Map to new flow data endpoint
  const unsubscribe = createPoller('/api/flow_data', (data) => {
    // Transform API data to expected readings format
    const readings = {
      flow_reading_1: {
        flow: data.flow_rate_in || 0,
        pressure: data.pressure || 0,
        temperature: data.temperature || 0,
        timestamp: Date.now(),
        vibration: data.vibration_alert || false
      }
    }
    callback(readings)
  })
  listeners.set('readings', unsubscribe)
  return unsubscribe
}

export const subscribeToAlerts = (callback) => {
  // Map to new live alerts endpoint  
  const unsubscribe = createPoller('/api/alerts_live', (data) => {
    // Transform API alerts to expected format
    const alerts = {}
    if (data.alerts && Array.isArray(data.alerts)) {
      data.alerts.forEach((alert, index) => {
        alerts[`alert_${index}`] = {
          type: alert.type,
          message: alert.message,
          severity: alert.severity,
          timestamp: Date.now(),
          resolved: false
        }
      })
    }
    callback(alerts)
  })
  listeners.set('alerts', unsubscribe)
  return unsubscribe
}

export const subscribeToNodes = (callback) => {
  // Map to sensor data for node status
  const unsubscribe = createPoller('/api/sensor_data', (data) => {
    // Transform sensor data to node format
    const nodeData = {
      node_1: {
        status: data.flow_in > 0 ? 'normal' : 'critical',
        last_seen: data.last_updated,
        flow_rate: data.flow_in,
        pressure: data.pressure
      }
    }
    callback(nodeData)
  })
  listeners.set('nodes', unsubscribe)
  return unsubscribe
}

export const subscribeToAnalytics = (callback) => {
  // Map to dashboard summary for analytics
  const unsubscribe = createPoller('/api/dashboard_summary', (data) => {
    // Transform to analytics format
    const analytics = {
      daily_usage: data.flow_metrics?.flow_rate_in * 60 || 0,
      efficiency: data.flow_metrics?.efficiency || 0,
      alerts_count: data.alerts_summary?.active_alerts || 0
    }
    callback(analytics)
  })
  listeners.set('analytics', unsubscribe)
  return unsubscribe
}

export const subscribeToQuality = (callback) => {
  // Map to flow data for quality metrics
  const unsubscribe = createPoller('/api/flow_data', (data) => {
    // Transform to quality format
    const qualityData = {
      efficiency: (data.flow_rate_out / data.flow_rate_in * 100) || 0,
      leakage_rate: data.calculated_leakage || 0,
      pressure_status: data.pressure > 1000 && data.pressure < 1200 ? 'normal' : 'abnormal',
      last_updated: data.last_updated
    }
    callback(qualityData)
  })
  listeners.set('quality', unsubscribe)
  return unsubscribe
}

export const unsubscribeAll = () => {
  listeners.forEach((unsubscribe) => {
    if (typeof unsubscribe === 'function') {
      unsubscribe()
    }
  })
  listeners.clear()
}

export const writeAlert = async (alertData) => {
  console.log('Alert write not implemented for REST API')
  return 'mock-id'
}

export const updateNodeStatus = async (nodeId, status, location) => {
  console.log('Node update not implemented for REST API')
}

export const getConnectionStatus = async () => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)
    
    const res = await fetch(`${API_BASE}/health`, {
      signal: controller.signal,
      mode: 'cors',
      cache: 'no-cache'
    })
    
    clearTimeout(timeoutId)
    return res.ok
  } catch {
    return false
  }
}

export default { api }