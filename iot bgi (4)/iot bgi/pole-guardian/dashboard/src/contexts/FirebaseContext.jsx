import React, { createContext, useContext, useState } from 'react'

const FirebaseContext = createContext({
  user: { uid: 'api-user' },
  loading: false,
  error: null,
  connected: true,
  initialized: true
})

export const useFirebase = () => {
  return useContext(FirebaseContext)
}

export const FirebaseProvider = ({ children }) => {
  return (
    <FirebaseContext.Provider value={{
      user: { uid: 'api-user' },
      loading: false,
      error: null,
      connected: true,
      initialized: true
    }}>
      {children}
    </FirebaseContext.Provider>
  )
}
