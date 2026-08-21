/**
 * SettingsPage Unit Tests
 *
 * Covers:
 *   - Page renders without crashing
 *   - Threshold section heading visible
 *   - Threshold metric labels visible
 *   - All 3 node names and IDs visible
 *   - Save and Reset buttons present and clickable
 *   - Notification section labels render
 *   - Range sliders present for numeric thresholds
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SettingsPage from './SettingsPage.jsx'

// ── Framer-motion mock — preserves semantic HTML tags ─────────────────────────
// motion.button must render as <button>, motion.div as <div>, etc.
vi.mock('framer-motion', () => {
  const motionProxy = new Proxy({}, {
    get: (_, tag) => {
      const Tag = String(tag)
      const Comp = ({
        children,
        initial, animate, exit, transition,
        whileHover, whileTap, variants,
        ...rest
      }) => {
        // Render with the actual HTML tag so getByRole('button') works
        return <Tag {...rest}>{children}</Tag>
      }
      Comp.displayName = `motion.${Tag}`
      return Comp
    }
  })
  return {
    motion: motionProxy,
    AnimatePresence: ({ children }) => children,
  }
})

// ── Mock useAlertEngine to avoid Firebase subscriptions ───────────────────────
vi.mock('../../hooks/useFirebaseData.js', async () => {
  const { DEFAULT_THRESHOLDS } = await import('../../services/alertEngine.js')
  return {
    useAlertEngine: () => ({
      thresholds: { ...DEFAULT_THRESHOLDS },
      updateThresholds: vi.fn(),
      activeAlerts: [],
      acknowledgedAlerts: [],
      resolvedAlerts: [],
      acknowledgeAlert: vi.fn(),
      resolveAlert: vi.fn(),
      clearResolved: vi.fn(),
    }),
    useRealTimeMetrics: () => ({ metrics: {} }),
    useConnectionStatus: () => ({ connected: true }),
    useLatestReadings: () => ({ readings: null }),
  }
})

// ── localStorage stub ─────────────────────────────────────────────────────────
beforeEach(() => {
  const store = new Map()
  vi.stubGlobal('localStorage', {
    getItem:    key       => store.get(key) ?? null,
    setItem:    (key, val) => store.set(key, val),
    removeItem: key       => store.delete(key),
  })
})

// ── Render ────────────────────────────────────────────────────────────────────

describe('SettingsPage — rendering', () => {
  it('renders without crashing', () => {
    expect(() => render(<SettingsPage />)).not.toThrow()
  })

  it('renders a heading that includes "Settings" or "Thresholds"', () => {
    render(<SettingsPage />)
    const hits = screen.getAllByText(/settings|thresholds/i)
    expect(hits.length).toBeGreaterThan(0)
  })
})

// ── Threshold section ─────────────────────────────────────────────────────────

describe('SettingsPage — threshold labels', () => {
  it('renders the Alert Trigger Thresholds section heading', () => {
    render(<SettingsPage />)
    const hits = screen.getAllByText(/Alert Trigger Thresholds/i)
    expect(hits.length).toBeGreaterThan(0)
  })

  it('renders Flow Differential label (maxLeakageDelta)', () => {
    render(<SettingsPage />)
    expect(screen.getAllByText(/Flow Differential/i).length).toBeGreaterThan(0)
  })

  it('renders Line Pressure labels (min + max)', () => {
    render(<SettingsPage />)
    expect(screen.getAllByText(/Line Pressure|Pressure/i).length).toBeGreaterThanOrEqual(2)
  })

  it('renders Fluid Temperature label', () => {
    render(<SettingsPage />)
    expect(screen.getAllByText(/Temperature/i).length).toBeGreaterThan(0)
  })

  it('renders Intake Flow label', () => {
    render(<SettingsPage />)
    expect(screen.getAllByText(/Flow|Intake/i).length).toBeGreaterThan(0)
  })

  it('renders Conveyance Efficiency label', () => {
    render(<SettingsPage />)
    expect(screen.getAllByText(/Efficiency/i).length).toBeGreaterThan(0)
  })

  it('renders Telemetry Freshness timeout label', () => {
    render(<SettingsPage />)
    expect(screen.getAllByText(/Telemetry|Timeout|Comm/i).length).toBeGreaterThan(0)
  })

  it('renders at least 7 range slider inputs (one per numeric threshold)', () => {
    render(<SettingsPage />)
    const sliders = document.querySelectorAll('input[type="range"]')
    expect(sliders.length).toBeGreaterThanOrEqual(7)
  })
})

// ── Node monitoring section ───────────────────────────────────────────────────

describe('SettingsPage — node configuration', () => {
  it('renders "Configured Pipeline Nodes" section heading', () => {
    render(<SettingsPage />)
    expect(screen.getAllByText(/Pipeline Nodes/i).length).toBeGreaterThan(0)
  })

  it('renders all 3 node names', () => {
    render(<SettingsPage />)
    expect(screen.getAllByText(/Inlet Monitoring Station/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Pipeline.*Tamper/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Outlet.*Delivery/i).length).toBeGreaterThan(0)
  })

  it('renders all 3 node IDs', () => {
    render(<SettingsPage />)
    expect(screen.getAllByText(/NODE-01/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/NODE-02/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/NODE-03/i).length).toBeGreaterThan(0)
  })
})

// ── Notification section ──────────────────────────────────────────────────────

describe('SettingsPage — notification preferences', () => {
  it('renders Notification Preferences heading', () => {
    render(<SettingsPage />)
    expect(screen.getAllByText(/Notification Preferences/i).length).toBeGreaterThan(0)
  })

  it('renders Email Notifications label', () => {
    render(<SettingsPage />)
    expect(screen.getAllByText(/Email Notifications/i).length).toBeGreaterThan(0)
  })

  it('renders SMS Text Alerts label', () => {
    render(<SettingsPage />)
    expect(screen.getAllByText(/SMS/i).length).toBeGreaterThan(0)
  })
})

// ── Save / Reset buttons ──────────────────────────────────────────────────────

describe('SettingsPage — action buttons', () => {
  it('renders "Save Active Thresholds" button', () => {
    render(<SettingsPage />)
    // Uses accessible name matching (works with icon + text inside the button)
    const btn = screen.getByRole('button', { name: /Save Active Thresholds/i })
    expect(btn).toBeDefined()
  })

  it('renders "Reset Defaults" button', () => {
    render(<SettingsPage />)
    const btn = screen.getByRole('button', { name: /Reset Defaults/i })
    expect(btn).toBeDefined()
  })

  it('clicking "Save Active Thresholds" does not crash', () => {
    render(<SettingsPage />)
    const btn = screen.getByRole('button', { name: /Save Active Thresholds/i })
    expect(() => fireEvent.click(btn)).not.toThrow()
  })

  it('clicking "Reset Defaults" does not crash', () => {
    render(<SettingsPage />)
    const btn = screen.getByRole('button', { name: /Reset Defaults/i })
    expect(() => fireEvent.click(btn)).not.toThrow()
  })
})
