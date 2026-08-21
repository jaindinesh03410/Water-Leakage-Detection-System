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
      flowRateOut: 11.8,
      pressure: 2.2,
      temperature: 24.5,
      vibrationStatus: 'normal',
      theftRisk: 10,
      totalConsumption: 1200,
      alertCount: 0,
      leakageDetected: false,
      valve1: true,
      valve2: true,
      efficiency: 94.4,
      nodeStatus: { normal: 3, warning: 0, critical: 0 },
      nodesData: {
        'NODE-01': { flow_in: 12.5, temperature: 24.5, valve1_status: true, total_litres_1: 1200, status: 'normal', alertCount: 0 },
        'NODE-02': { pressure: 2.2, vibration_alert: false, flow_difference: 0.7, leakage_detected: false, status: 'normal', alertCount: 0 },
        'NODE-03': { flow_out: 11.8, total_litres_2: 1150, valve2_status: true, system_efficiency: 94.4, status: 'normal', alertCount: 0 }
      }
    },
    loading: false,
    error: null
  }),
  useActiveAlerts: () => ({
    alerts: [],
    loading: false,
    error: null
  }),
  useAlertEngine: () => ({
    alerts: [],
    activeAlerts: [],
    acknowledgedAlerts: [],
    resolvedAlerts: [],
    thresholds: {},
    acknowledgeAlert: vi.fn(),
    resolveAlert: vi.fn(),
    dismissAlert: vi.fn(),
    clearResolvedAlerts: vi.fn(),
    updateThresholds: vi.fn()
  }),
  useConnectionStatus: () => ({
    connected: true,
    loading: false
  }),
  useLatestReadings: () => ({
    readings: { flow: 12.5, flowIn: 12.5, flowOut: 11.8, pressure: 2.2, temperature: 24.5, timestamp: Date.now() },
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

  it('shows the active 6 navigation tabs and excludes removed tabs', () => {
    render(<App />)
    expect(screen.getAllByText('Overview').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Analytics').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Alerts/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Nodes/).length).toBeGreaterThan(0)
    expect(screen.getByText('Reports')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()

    // Verify removed tabs are NOT present in the DOM
    expect(screen.queryByText('Water Quality')).not.toBeInTheDocument()
    expect(screen.queryByText('AI Insights')).not.toBeInTheDocument()
  })

  it('displays exactly 3 pipeline monitoring nodes', () => {
    render(<App />)
    expect(screen.getByText('NODE-01')).toBeInTheDocument()
    expect(screen.getByText('NODE-02')).toBeInTheDocument()
    expect(screen.getByText('NODE-03')).toBeInTheDocument()
    expect(screen.queryByText('NODE-04')).not.toBeInTheDocument()
    expect(screen.queryByText('NODE-05')).not.toBeInTheDocument()
    expect(screen.queryByText('NODE-06')).not.toBeInTheDocument()
  })
})