import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Save, AlertTriangle, Bell, Server, ToggleLeft, ToggleRight } from 'lucide-react'
import { Card, Button } from '../ui'

// ── Design tokens ─────────────────────────────────────────────────────────────
const DS = {
  teal:      '#0F5C5B',
  tealLight: '#3E8E8C',
  ink:       '#132A2A',
  muted:     '#5B6E6D',
  border:    '#E1E7E6',
  bg:        '#F7F9F8',
  red:       '#D14343',
  amber:     '#C97A1F',
  green:     '#2E9E6C',
}

/**
 * SettingsPage — Renders system preferences and thresholds.
 *
 * All settings are UI-only with local component state.
 * There is no write pattern/endpoint in dataSync.js or firebase.js for updating
 * thresholds, notification configs, or node active states in the backend.
 * Therefore, all save buttons are styled but disabled, clearly noted as "Awaiting backend wiring".
 */
const SettingsPage = ({ className = '' }) => {
  // --- Alert Thresholds Local State ---
  const [thresholds, setThresholds] = useState({
    leakRisk: 50,
    theftRisk: 30,
    pressure: 2.5, // Matches the 2.5 Bar default shown on Analytics/PressureChart
  })

  // --- Notifications Local State ---
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  })

  // --- Nodes Local State ---
  const [nodes, setNodes] = useState([
    { id: 'NODE-01', active: true, zone: 'Zone A - Main Pipe' },
    { id: 'NODE-02', active: true, zone: 'Zone A - Branch 1' },
    { id: 'NODE-03', active: true, zone: 'Zone B - Commercial' },
    { id: 'NODE-04', active: false, zone: 'Zone B - Residential' },
    { id: 'NODE-05', active: true, zone: 'Zone C - Supply In' },
    { id: 'NODE-06', active: true, zone: 'Zone C - Storage' },
  ])

  // Handlers
  const handleThresholdChange = (key, val) => {
    setThresholds(prev => ({ ...prev, [key]: val }))
  }

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleNodeActive = (id) => {
    setNodes(prev => prev.map(node => node.id === id ? { ...node, active: !node.active } : node))
  }

  // Switch Toggle Helper Component (styled cleanly per design system)
  const ToggleSwitch = ({ checked, onChange }) => (
    <button
      type="button"
      onClick={onChange}
      className="relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
      style={{
        backgroundColor: checked ? DS.teal : '#E1E7E6',
      }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
        style={{
          transform: checked ? 'translateX(20px)' : 'translateX(0px)',
        }}
      />
    </button>
  )

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2
            className="text-base font-semibold text-hs-ink mb-0.5"
            style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}
          >
            Settings
          </h2>
          <p
            className="text-xs text-hs-muted"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            System preferences &amp; thresholds
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* ── Section 1: Alert Thresholds ───────────────────────────────────── */}
        <Card variant="default" animate={false}>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4" style={{ color: DS.teal }} />
              <h3
                className="text-sm font-semibold text-hs-ink"
                style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}
              >
                Alert Thresholds
              </h3>
            </div>

            <div className="space-y-5 max-w-xl">
              {/* Leak Risk Trigger */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label
                    className="text-xs font-medium text-hs-ink"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Leak Risk Trigger (%)
                  </label>
                  <span
                    className="text-xs font-semibold text-hs-teal"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {thresholds.leakRisk}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={thresholds.leakRisk}
                  onChange={(e) => handleThresholdChange('leakRisk', parseInt(e.target.value))}
                  className="w-full accent-hs-teal h-1.5 bg-hs-border rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: DS.teal }}
                />
                <span className="text-[10px] text-hs-muted block mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Triggers leakage alerts when AI analysis risk exceeds this level.
                </span>
              </div>

              {/* Theft Risk Trigger */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label
                    className="text-xs font-medium text-hs-ink"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Theft Risk Trigger (%)
                  </label>
                  <span
                    className="text-xs font-semibold text-hs-teal"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {thresholds.theftRisk}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={thresholds.theftRisk}
                  onChange={(e) => handleThresholdChange('theftRisk', parseInt(e.target.value))}
                  className="w-full accent-hs-teal h-1.5 bg-hs-border rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: DS.teal }}
                />
                <span className="text-[10px] text-hs-muted block mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Triggers alert when nighttime usage anomaly probability exceeds this level.
                </span>
              </div>

              {/* Pressure Threshold */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label
                    className="text-xs font-medium text-hs-ink"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Critical Low Pressure Boundary (Bar)
                  </label>
                  <span
                    className="text-xs font-semibold text-hs-teal"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {thresholds.pressure.toFixed(1)} Bar
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.1"
                  value={thresholds.pressure}
                  onChange={(e) => handleThresholdChange('pressure', parseFloat(e.target.value))}
                  className="w-full accent-hs-teal h-1.5 bg-hs-border rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: DS.teal }}
                />
                <span className="text-[10px] text-hs-muted block mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Baseline alarm marker. Current threshold set to {thresholds.pressure.toFixed(1)} Bar.
                </span>
              </div>
            </div>

            {/* Section Footer: Disabled Save button with backend notice */}
            <div className="mt-6 pt-4 border-t border-hs-border flex items-center justify-between">
              <span className="text-[10px] text-hs-red font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                ⚠️ Awaiting backend wiring (UI-only state)
              </span>
              <Button variant="primary" size="sm" disabled={true} className="opacity-50 cursor-not-allowed">
                <Save className="w-3.5 h-3.5 mr-1" />
                Save Thresholds
              </Button>
            </div>
          </div>
        </Card>

        {/* ── Section 2: Notifications ───────────────────────────────────────── */}
        <Card variant="default" animate={false}>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4" style={{ color: DS.teal }} />
              <h3
                className="text-sm font-semibold text-hs-ink"
                style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}
              >
                Notifications
              </h3>
            </div>

            <div className="space-y-4 max-w-md">
              {/* Email Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-hs-ink block" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Email Notifications
                  </span>
                  <span className="text-[10px] text-hs-muted" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Send immediate reports to admin@hydrosense.net
                  </span>
                </div>
                <ToggleSwitch checked={notifications.email} onChange={() => toggleNotification('email')} />
              </div>

              {/* SMS Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-hs-ink block" style={{ fontFamily: 'Inter, sans-serif' }}>
                    SMS Alerts
                  </span>
                  <span className="text-[10px] text-hs-muted" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Text messages for critical alerts (e.g. pressure drops)
                  </span>
                </div>
                <ToggleSwitch checked={notifications.sms} onChange={() => toggleNotification('sms')} />
              </div>

              {/* Push Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-hs-ink block" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Browser Push Notifications
                  </span>
                  <span className="text-[10px] text-hs-muted" style={{ fontFamily: 'Inter, sans-serif' }}>
                    System dashboard toast notifications
                  </span>
                </div>
                <ToggleSwitch checked={notifications.push} onChange={() => toggleNotification('push')} />
              </div>
            </div>

            {/* Section Footer: Disabled Save button with backend notice */}
            <div className="mt-6 pt-4 border-t border-hs-border flex items-center justify-between">
              <span className="text-[10px] text-hs-red font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                ⚠️ Awaiting backend wiring (UI-only state)
              </span>
              <Button variant="primary" size="sm" disabled={true} className="opacity-50 cursor-not-allowed">
                <Save className="w-3.5 h-3.5 mr-1" />
                Save Preferences
              </Button>
            </div>
          </div>
        </Card>

        {/* ── Section 3: Nodes & Zones ───────────────────────────────────────── */}
        <Card variant="default" animate={false}>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Server className="w-4 h-4" style={{ color: DS.teal }} />
              <h3
                className="text-sm font-semibold text-hs-ink"
                style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}
              >
                Nodes &amp; Zones
              </h3>
            </div>

            <div className="divide-y divide-hs-border border border-hs-border rounded-lg overflow-hidden bg-white max-w-xl">
              {nodes.map(node => (
                <div key={node.id} className="flex items-center justify-between p-3">
                  <div>
                    <span
                      className="text-xs font-semibold text-hs-ink block"
                      style={{ fontFamily: 'JetBrains Mono, monospace' }}
                    >
                      {node.id}
                    </span>
                    <span className="text-[10px] text-hs-muted" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {node.zone}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: node.active ? '#E8F5EE' : '#FDEAEA',
                        color: node.active ? DS.green : DS.red,
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      {node.active ? 'Active' : 'Inactive'}
                    </span>
                    <ToggleSwitch checked={node.active} onChange={() => toggleNodeActive(node.id)} />
                  </div>
                </div>
              ))}
            </div>

            {/* Section Footer: Disabled Save button with backend notice */}
            <div className="mt-6 pt-4 border-t border-hs-border flex items-center justify-between">
              <span className="text-[10px] text-hs-red font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                ⚠️ Awaiting backend wiring (UI-only state)
              </span>
              <Button variant="primary" size="sm" disabled={true} className="opacity-50 cursor-not-allowed">
                <Save className="w-3.5 h-3.5 mr-1" />
                Save Node Configurations
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  )
}

export default SettingsPage
