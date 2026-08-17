import { useState, useEffect, useCallback } from 'react'
import dataSyncService from '../services/dataSync.js'

export const useFirebaseData = (dataType = 'all') => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    let unsubscribeData = null
    let unsubscribeConnection = null

    const initializeService = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Initialize the data sync service
        await dataSyncService.initialize()
        
        // Subscribe to connection status
        unsubscribeConnection = dataSyncService.subscribe('connection', (connectionStatus) => {
          setConnected(connectionStatus)
        })
        
        // Subscribe to data updates
        unsubscribeData = dataSyncService.subscribe(dataType, (newData) => {
          setData(newData)
          setLoading(false)
        })
        
        // Get initial data
        const initialData = dataSyncService.getCurrentData(dataType)
        if (initialData && Object.keys(initialData).length > 0) {
          setData(initialData)
          setLoading(false)
        }
        
      } catch (err) {
        console.error('Failed to initialize Firebase data:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    initializeService()

    // Cleanup function
    return () => {
      if (unsubscribeData) unsubscribeData()
      if (unsubscribeConnection) unsubscribeConnection()
    }
  }, [dataType])

  return { data, loading, error, connected }
}

export const useLatestReadings = () => {
  const [readings, setReadings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let unsubscribe = null

    const initializeReadings = async () => {
      try {
        setLoading(true)
        setError(null)
        
        await dataSyncService.initialize()
        
        unsubscribe = dataSyncService.subscribe('readings', (readingsData) => {
          const latest = dataSyncService.getLatestReadings()
          setReadings(latest)
          setLoading(false)
        })
        
        // Get initial data
        const initialReadings = dataSyncService.getLatestReadings()
        if (initialReadings) {
          setReadings(initialReadings)
          setLoading(false)
        }
        
      } catch (err) {
        console.error('Failed to get latest readings:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    initializeReadings()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  return { readings, loading, error }
}

export const useActiveAlerts = () => {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let unsubscribe = null

    const initializeAlerts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        await dataSyncService.initialize()
        
        unsubscribe = dataSyncService.subscribe('alerts', () => {
          const activeAlerts = dataSyncService.getActiveAlerts()
          setAlerts(activeAlerts)
          setLoading(false)
        })
        
        // Get initial data
        const initialAlerts = dataSyncService.getActiveAlerts()
        setAlerts(initialAlerts)
        setLoading(false)
        
      } catch (err) {
        console.error('Failed to get active alerts:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    initializeAlerts()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  return { alerts, loading, error }
}

export const useRealTimeMetrics = () => {
  const [metrics, setMetrics] = useState({
    flowRate: 0,
    pressure: 0,
    vibrationStatus: 'unknown',
    theftRisk: 0,
    totalConsumption: 0,
    alertCount: 0,
    nodeStatus: { normal: 0, warning: 0, critical: 0 }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const updateMetrics = useCallback(() => {
    try {
      const calculatedMetrics = dataSyncService.calculateMetrics()
      setMetrics(calculatedMetrics)
      setLoading(false)
    } catch (err) {
      console.error('Failed to calculate metrics:', err)
      setError(err.message)
    }
  }, [])

  useEffect(() => {
    let unsubscribe = null

    const initializeMetrics = async () => {
      try {
        setLoading(true)
        setError(null)
        
        await dataSyncService.initialize()
        
        // Subscribe to all data changes to recalculate metrics
        unsubscribe = dataSyncService.subscribe('all', updateMetrics)
        
        // Initial calculation
        updateMetrics()
        
      } catch (err) {
        console.error('Failed to initialize metrics:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    initializeMetrics()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [updateMetrics])

  return { metrics, loading, error, refresh: updateMetrics }
}

export const useConnectionStatus = () => {
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubscribe = null

    const initializeConnection = async () => {
      try {
        await dataSyncService.initialize()
        
        unsubscribe = dataSyncService.subscribe('connection', (connectionStatus) => {
          setConnected(connectionStatus)
          setLoading(false)
        })
        
      } catch (err) {
        console.error('Failed to monitor connection:', err)
        setConnected(false)
        setLoading(false)
      }
    }

    initializeConnection()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  return { connected, loading }
}