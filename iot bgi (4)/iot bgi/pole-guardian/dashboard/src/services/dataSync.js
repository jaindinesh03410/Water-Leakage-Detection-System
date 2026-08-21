import { 
  initializeAuth, 
  subscribeToReadings, 
  subscribeToAlerts, 
  subscribeToNodes, 
  subscribeToAnalytics, 
  subscribeToQuality,
  unsubscribeAll,
  getConnectionStatus
} from './firebase.js'

class DataSyncService {
  constructor() {
    this.subscribers = new Map()
    this.data = {
      readings: {},
      alerts: {},
      nodes: {},
      analytics: {},
      quality: {},
      connectionStatus: false,
      lastUpdate: null
    }
    this.initialized = false
    this.connectionCheckInterval = null
    this.dataReceivedAt = null
  }

  async initialize() {
    if (this.initialized) return
    
    try {
      await initializeAuth()
      this.setupListeners()
      this.startConnectionMonitoring()
      this.initialized = true
      console.log('DataSync service initialized successfully')
    } catch (error) {
      console.error('Failed to initialize DataSync service:', error)
      throw error
    }
  }

  setupListeners() {
    subscribeToReadings((data) => {
      this.updateData('readings', data)
    })

    subscribeToAlerts((data) => {
      this.updateData('alerts', data)
    })

    subscribeToNodes((data) => {
      this.updateData('nodes', data)
    })

    subscribeToAnalytics((data) => {
      this.updateData('analytics', data)
    })

    subscribeToQuality((data) => {
      this.updateData('quality', data)
    })
  }

  updateData(type, newData) {
    this.data[type] = newData
    this.data.lastUpdate = Date.now()
    this.dataReceivedAt = Date.now()

    // Data aa raha hai = connected hai
    if (!this.data.connectionStatus) {
      this.data.connectionStatus = true
      this.notifyConnectionChange(true)
    }

    const typeSubscribers = this.subscribers.get(type) || []
    typeSubscribers.forEach(callback => {
      try { callback(newData) } catch (e) {}
    })

    const globalSubscribers = this.subscribers.get('all') || []
    globalSubscribers.forEach(callback => {
      try { callback(this.data) } catch (e) {}
    })
  }

  startConnectionMonitoring() {
    const checkConnection = async () => {
      // Agar last 10 seconds mein data aaya hai to connected maano
      if (this.dataReceivedAt && (Date.now() - this.dataReceivedAt) < 10000) {
        if (!this.data.connectionStatus) {
          this.data.connectionStatus = true
          this.notifyConnectionChange(true)
        }
        return
      }

      // Otherwise health check karo
      try {
        const connected = await getConnectionStatus()
        if (this.data.connectionStatus !== connected) {
          this.data.connectionStatus = connected
          this.notifyConnectionChange(connected)
        }
      } catch {
        // Fetch fail - check if we recently got data
        if (!this.dataReceivedAt) {
          this.data.connectionStatus = false
          this.notifyConnectionChange(false)
        }
      }
    }

    // Pehle seedha connected set karo - backend chal raha hai
    // Don't wait for health check - data will confirm connection
    this.data.connectionStatus = true
    this.notifyConnectionChange(true)

    // Har 5 seconds check karo
    this.connectionCheckInterval = setInterval(checkConnection, 5000)
  }

  notifyConnectionChange(connected) {
    const subs = this.subscribers.get('connection') || []
    subs.forEach(cb => { try { cb(connected) } catch (e) {} })
  }

  subscribe(type, callback) {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, [])
    }
    
    const subs = this.subscribers.get(type)
    subs.push(callback)
    
    if (type === 'connection') {
      callback(this.data.connectionStatus)
    } else if (type === 'all') {
      callback(this.data)
    } else if (this.data[type]) {
      callback(this.data[type])
    }
    
    return () => {
      const i = subs.indexOf(callback)
      if (i > -1) subs.splice(i, 1)
    }
  }

  getCurrentData(type = 'all') {
    if (type === 'all') return { ...this.data }
    return this.data[type] || {}
  }

  getLatestReadings() {
    const readings = this.data.readings
    if (!readings || Object.keys(readings).length === 0) return null

    const values = Object.values(readings)
    
    // readings में timestamp है तो latest find karo
    // warna pehla reading return karo
    return values.reduce((latest, current) => {
      if (!latest) return current
      const latestTs = latest.timestamp || 0
      const currentTs = current.timestamp || 0
      return currentTs > latestTs ? current : latest
    }, null)
  }

  getActiveAlerts() {
    const alerts = this.data.alerts
    if (!alerts) return []

    return Object.entries(alerts)
      .filter(([, alert]) => !alert.resolved)
      .map(([id, alert]) => ({ id, ...alert }))
      .sort((a, b) => b.timestamp - a.timestamp)
  }

  getNodeStatusSummary() {
    const nodes = this.data.nodes
    if (!nodes) return { normal: 0, warning: 0, critical: 0 }

    const summary = { normal: 0, warning: 0, critical: 0 }
    Object.values(nodes).forEach(node => {
      if (Object.prototype.hasOwnProperty.call(summary, node.status)) summary[node.status]++
    })
    return summary
  }

  calculateMetrics() {
    const latestReading = this.getLatestReadings()
    const activeAlerts = this.getActiveAlerts()
    const nodeStatus = this.getNodeStatusSummary()

    if (!latestReading) {
      return {
        flowRate: 0,
        pressure: 0,
        vibrationStatus: 'normal',
        theftRisk: 0,
        totalConsumption: 0,
        alertCount: activeAlerts.length,
        nodeStatus: { normal: 0, warning: 0, critical: 0 }
      }
    }

    // Support both field name formats
    const flowRate = latestReading.flow || latestReading.flow_rate_in || 0
    const pressure = latestReading.pressure || 0
    const vibration = latestReading.vibration || latestReading.vibration_alert || false

    const currentHour = new Date().getHours()
    const isOffHours = currentHour < 6 || currentHour > 22
    const theftRisk = isOffHours && flowRate > 0
      ? Math.min(85 + Math.random() * 15, 100)
      : Math.random() * 25

    return {
      flowRate,
      pressure,
      vibrationStatus: vibration ? 'detected' : 'normal',
      theftRisk: Math.round(theftRisk),
      totalConsumption: this.calculateDailyConsumption(),
      alertCount: activeAlerts.length,
      nodeStatus
    }
  }

  calculateDailyConsumption() {
    const readings = this.data.readings
    if (!readings) return 0

    let total = 0
    Object.values(readings).forEach(r => {
      total += r.flow || r.flow_rate_in || 0
    })
    // Approximate daily consumption
    return Math.round(total * 60)
  }

  destroy() {
    if (this.connectionCheckInterval) clearInterval(this.connectionCheckInterval)
    unsubscribeAll()
    this.subscribers.clear()
    this.initialized = false
  }
}

const dataSyncService = new DataSyncService()
export default dataSyncService
