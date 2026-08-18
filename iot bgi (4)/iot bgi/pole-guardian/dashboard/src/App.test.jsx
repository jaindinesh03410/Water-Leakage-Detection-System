import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

// Mock the Firebase hooks to return ready state immediately
vi.mock('./contexts/FirebaseContext.jsx', () => ({
  useFirebase: () => ({ loading: false, error: null })
}))

vi.mock('./hooks/useFirebaseData.js', () => ({
  useRealTimeMetrics: () => ({
    metrics: {
      flowRate: 12.5,
      pressure: 2.2,
      vibrationStatus: 'stable',
      theftRisk: 10,
      totalConsumption: 1200,
      alertCount: 0,
      nodeStatus: { normal: 6, warning: 0, critical: 0 }
    },
    loading: false,
    error: null
  }),
  useActiveAlerts: () => ({
    alerts: [],
    loading: false,
    error: null
  }),
  useConnectionStatus: () => ({
    connected: true,
    loading: false
  }),
  useLatestReadings: () => ({
    readings: { flow: 12.5, pressure: 2.2, timestamp: Date.now() },
    loading: false,
    error: null
  })
}))

describe('App Component', () => {
  it('renders the main title', () => {
    render(<App />)
    expect(screen.getByText('Smart Water Intelligence System')).toBeInTheDocument()
  })

  it('displays the subtitle', () => {
    render(<App />)
    expect(screen.getByText('HydroSense – Industrial IoT Water Monitoring')).toBeInTheDocument()
  })

  it('shows system status as online', () => {
    render(<App />)
    expect(screen.getAllByText('System Online').length).toBeGreaterThan(0)
  })

  it('shows navigation tabs', () => {
    render(<App />)
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getAllByText('Analytics').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Alerts').length).toBeGreaterThan(0)
    expect(screen.getAllByText('AI Insights').length).toBeGreaterThan(0)
    expect(screen.getByText('Water Quality')).toBeInTheDocument()
    expect(screen.getByText('Reports')).toBeInTheDocument()
    expect(screen.getByText('Nodes')).toBeInTheDocument()
    expect(screen.getAllByText('Settings').length).toBeGreaterThan(0)
  })
})