import React, { createContext, useContext, useEffect, useState } from 'react'
import { initializeAuth } from '../services/firebase.js'
import dataSyncService from '../services/dataSync.js'

const FirebaseContext = createContext({
  user: null,
  loading: true,
  error: null,
  connected: false,
  initialized: false
})

export const useFirebase = () => {
  const context = useContext(FirebaseContext)
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider')
  }
  return context
}

export const FirebaseProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [connected, setConnected] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    let unsubscribeConnection = null

    const initializeService = async () => {
      try {
        setLoading(true)
        setError(null)

        const authenticatedUser = await initializeAuth()
        setUser(authenticatedUser)

        await dataSyncService.initialize()

        unsubscribeConnection = dataSyncService.subscribe('connection', (connectionStatus) => {
          setConnected(connectionStatus)
        })

        setInitialized(true)
        setLoading(false)

        console.log('Service context initialized successfully')
      } catch (err) {
        console.error('Service initialization error:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    initializeService()

    return () => {
      if (unsubscribeConnection) unsubscribeConnection()
    }
  }, [])

  useEffect(() => {
    return () => {
      if (initialized) {
        dataSyncService.destroy()
      }
    }
  }, [initialized])

  const value = {
    user,
    loading,
    error,
    connected,
    initialized
  }

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  )
}