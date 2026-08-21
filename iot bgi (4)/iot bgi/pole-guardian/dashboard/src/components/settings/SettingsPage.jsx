import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Save, Bell, Server, RotateCcw,
  Check, Sliders
} from 'lucide-react'
import { Card, Button } from '../ui'
import { useAlertEngine } from '../../hooks/useFirebaseData.js'
import { DEFAULT_THRESHOLDS, SYSTEM_NODES } from '../../services/alertEngine.js'

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

const SettingsPage = ({ className = '' }) => {
  const { thresholds, updateThresholds } = useAlertEngine()

  // Local working copy for editing
  const [localThresholds, setLocalThresholds] = useState({ ...thresholds })
  const [savedSuccess, setSavedSuccess] = useState(false)

  // Notifications State (persisted in localStorage)
  const [notifications, setNotifications] = useState(() => {
    try {
      const raw = localStorage.getItem('hydrosense_notifications_v2')
      return raw ? JSON.parse(raw) : { email: true, sms: false, push: true, emailAddress: 'admin@hydrosense.net' }
    } catch {
      return { email: true, sms: false, push: true, emailAddress: 'admin@hydrosense.net' }
    }
  })

  // Nodes Configuration State (exactly 3 nodes)
  const [nodes, setNodes] = useState(() => {
    try {
      const raw = localStorage.getItem('hydrosense_nodes_v2')
      if (raw) return JSON.parse(raw)
    } catch {}
    return SYSTEM_NODES.map(n => ({
      id: n.id,
      name: n.name,
      zone: n.zone,
      active: true
    }))
  })

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleThresholdValueChange = (key, val) => {
    setLocalThresholds(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        value: typeof val === 'number' ? val : parseFloat(val) || 0
      }
    }))
  }

  const toggleThresholdEnabled = (key) => {
    setLocalThresholds(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        enabled: !prev[key].enabled
      }
    }))
  }

  const handleSaveThresholds = () => {
    updateThresholds(localThresholds)
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const handleResetDefaults = () => {
    setLocalThresholds({ ...DEFAULT_THRESHOLDS })
    updateThresholds({ ...DEFAULT_THRESHOLDS })
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const toggleNotification = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] }
    setNotifications(updated)
    try {
      localStorage.setItem('hydrosense_notifications_v2', JSON.stringify(updated))
    } catch {}
  }

  const toggleNodeActive = (id) => {
    const updated = nodes.map(n => n.id === id ? { ...n, active: !n.active } : n)
    setNodes(updated)
    try {
      localStorage.setItem('hydrosense_nodes_v2', JSON.stringify(updated))
    } catch {}
  }

  // Toggle Switch Component
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
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2
            className="text-base font-semibold text-hs-ink mb-0.5"
            style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}
          >
            System Settings &amp; Thresholds
          </h2>
          <p className="text-xs text-hs-muted" style={{ fontFamily: 'Inter, sans-serif' }}>
            Configure real-time alert triggers for the 3 pipeline monitoring nodes
          </p>
        </div>

        {savedSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#E8F5EE] text-[#2E9E6C] text-xs font-semibold"
          >
            <Check className="w-3.5 h-3.5" />
            Settings Applied &amp; Live
          </motion.div>
        )}
      </div>

      <div className="space-y-6">

        {/* ── Section 1: Alert Thresholds Matrix ─────────────────────────────── */}
        <Card variant="default" animate={false}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-hs-teal" />
                <h3
                  className="text-sm font-semibold text-hs-ink"
                  style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}
                >
                  Alert Trigger Thresholds
                </h3>
              </div>
              <button
                onClick={handleResetDefaults}
                className="flex items-center gap-1 text-xs text-hs-muted hover:text-hs-ink font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Defaults
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* NODE-02: Flow Differential / Leakage Limit */}
              {localThresholds.maxLeakageDelta && (
                <div className="p-4 bg-hs-bg rounded-lg border border-hs-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white border border-hs-border text-hs-teal">
                        NODE-02
                      </span>
                      <label className="text-xs font-semibold text-hs-ink">
                        {localThresholds.maxLeakageDelta.metric}
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-hs-teal" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        {localThresholds.maxLeakageDelta.value.toFixed(1)} {localThresholds.maxLeakageDelta.unit}
                      </span>
                      <ToggleSwitch
                        checked={localThresholds.maxLeakageDelta.enabled}
                        onChange={() => toggleThresholdEnabled('maxLeakageDelta')}
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={localThresholds.maxLeakageDelta.min}
                    max={localThresholds.maxLeakageDelta.max}
                    step={localThresholds.maxLeakageDelta.step}
                    value={localThresholds.maxLeakageDelta.value}
                    disabled={!localThresholds.maxLeakageDelta.enabled}
                    onChange={(e) => handleThresholdValueChange('maxLeakageDelta', e.target.value)}
                    className="w-full accent-hs-teal h-1.5 bg-hs-border rounded-lg cursor-pointer disabled:opacity-40"
                  />
                  <p className="text-[10px] text-hs-muted mt-1.5">
                    {localThresholds.maxLeakageDelta.description}
                  </p>
                </div>
              )}

              {/* NODE-02: Minimum Line Pressure */}
              {localThresholds.minPressure && (
                <div className="p-4 bg-hs-bg rounded-lg border border-hs-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white border border-hs-border text-hs-teal">
                        NODE-02
                      </span>
                      <label className="text-xs font-semibold text-hs-ink">
                        {localThresholds.minPressure.metric}
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-hs-teal" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        {localThresholds.minPressure.value.toFixed(1)} {localThresholds.minPressure.unit}
                      </span>
                      <ToggleSwitch
                        checked={localThresholds.minPressure.enabled}
                        onChange={() => toggleThresholdEnabled('minPressure')}
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={localThresholds.minPressure.min}
                    max={localThresholds.minPressure.max}
                    step={localThresholds.minPressure.step}
                    value={localThresholds.minPressure.value}
                    disabled={!localThresholds.minPressure.enabled}
                    onChange={(e) => handleThresholdValueChange('minPressure', e.target.value)}
                    className="w-full accent-hs-teal h-1.5 bg-hs-border rounded-lg cursor-pointer disabled:opacity-40"
                  />
                  <p className="text-[10px] text-hs-muted mt-1.5">
                    {localThresholds.minPressure.description}
                  </p>
                </div>
              )}

              {/* NODE-02: Maximum Line Pressure */}
              {localThresholds.maxPressure && (
                <div className="p-4 bg-hs-bg rounded-lg border border-hs-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white border border-hs-border text-hs-teal">
                        NODE-02
                      </span>
                      <label className="text-xs font-semibold text-hs-ink">
                        {localThresholds.maxPressure.metric}
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-hs-teal" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        {localThresholds.maxPressure.value.toFixed(1)} {localThresholds.maxPressure.unit}
                      </span>
                      <ToggleSwitch
                        checked={localThresholds.maxPressure.enabled}
                        onChange={() => toggleThresholdEnabled('maxPressure')}
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={localThresholds.maxPressure.min}
                    max={localThresholds.maxPressure.max}
                    step={localThresholds.maxPressure.step}
                    value={localThresholds.maxPressure.value}
                    disabled={!localThresholds.maxPressure.enabled}
                    onChange={(e) => handleThresholdValueChange('maxPressure', e.target.value)}
                    className="w-full accent-hs-teal h-1.5 bg-hs-border rounded-lg cursor-pointer disabled:opacity-40"
                  />
                  <p className="text-[10px] text-hs-muted mt-1.5">
                    {localThresholds.maxPressure.description}
                  </p>
                </div>
              )}

              {/* NODE-01: Maximum Intake Flow */}
              {localThresholds.maxFlowIn && (
                <div className="p-4 bg-hs-bg rounded-lg border border-hs-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white border border-hs-border text-hs-teal">
                        NODE-01
                      </span>
                      <label className="text-xs font-semibold text-hs-ink">
                        {localThresholds.maxFlowIn.metric}
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-hs-teal" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        {localThresholds.maxFlowIn.value.toFixed(1)} {localThresholds.maxFlowIn.unit}
                      </span>
                      <ToggleSwitch
                        checked={localThresholds.maxFlowIn.enabled}
                        onChange={() => toggleThresholdEnabled('maxFlowIn')}
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={localThresholds.maxFlowIn.min}
                    max={localThresholds.maxFlowIn.max}
                    step={localThresholds.maxFlowIn.step}
                    value={localThresholds.maxFlowIn.value}
                    disabled={!localThresholds.maxFlowIn.enabled}
                    onChange={(e) => handleThresholdValueChange('maxFlowIn', e.target.value)}
                    className="w-full accent-hs-teal h-1.5 bg-hs-border rounded-lg cursor-pointer disabled:opacity-40"
                  />
                  <p className="text-[10px] text-hs-muted mt-1.5">
                    {localThresholds.maxFlowIn.description}
                  </p>
                </div>
              )}

              {/* NODE-01: High Temperature */}
              {localThresholds.highTemp && (
                <div className="p-4 bg-hs-bg rounded-lg border border-hs-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white border border-hs-border text-hs-teal">
                        NODE-01
                      </span>
                      <label className="text-xs font-semibold text-hs-ink">
                        {localThresholds.highTemp.metric}
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-hs-teal" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        {localThresholds.highTemp.value.toFixed(1)} {localThresholds.highTemp.unit}
                      </span>
                      <ToggleSwitch
                        checked={localThresholds.highTemp.enabled}
                        onChange={() => toggleThresholdEnabled('highTemp')}
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={localThresholds.highTemp.min}
                    max={localThresholds.highTemp.max}
                    step={localThresholds.highTemp.step}
                    value={localThresholds.highTemp.value}
                    disabled={!localThresholds.highTemp.enabled}
                    onChange={(e) => handleThresholdValueChange('highTemp', e.target.value)}
                    className="w-full accent-hs-teal h-1.5 bg-hs-border rounded-lg cursor-pointer disabled:opacity-40"
                  />
                  <p className="text-[10px] text-hs-muted mt-1.5">
                    {localThresholds.highTemp.description}
                  </p>
                </div>
              )}

              {/* NODE-03: Minimum Efficiency */}
              {localThresholds.minEfficiency && (
                <div className="p-4 bg-hs-bg rounded-lg border border-hs-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white border border-hs-border text-hs-teal">
                        NODE-03
                      </span>
                      <label className="text-xs font-semibold text-hs-ink">
                        {localThresholds.minEfficiency.metric}
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-hs-teal" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        {localThresholds.minEfficiency.value.toFixed(1)} {localThresholds.minEfficiency.unit}
                      </span>
                      <ToggleSwitch
                        checked={localThresholds.minEfficiency.enabled}
                        onChange={() => toggleThresholdEnabled('minEfficiency')}
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={localThresholds.minEfficiency.min}
                    max={localThresholds.minEfficiency.max}
                    step={localThresholds.minEfficiency.step}
                    value={localThresholds.minEfficiency.value}
                    disabled={!localThresholds.minEfficiency.enabled}
                    onChange={(e) => handleThresholdValueChange('minEfficiency', e.target.value)}
                    className="w-full accent-hs-teal h-1.5 bg-hs-border rounded-lg cursor-pointer disabled:opacity-40"
                  />
                  <p className="text-[10px] text-hs-muted mt-1.5">
                    {localThresholds.minEfficiency.description}
                  </p>
                </div>
              )}

              {/* NODE-02: Vibration / Tampering Trigger */}
              {localThresholds.vibrationTamper && (
                <div className="p-4 bg-hs-bg rounded-lg border border-hs-border flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white border border-hs-border text-hs-teal">
                        NODE-02
                      </span>
                      <span className="text-xs font-semibold text-hs-ink">
                        Vibration &amp; Physical Tamper Protection
                      </span>
                    </div>
                    <p className="text-[10px] text-hs-muted">
                      Trigger immediate critical alarm on unauthorized conduit physical disturbance.
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={localThresholds.vibrationTamper.enabled}
                    onChange={() => toggleThresholdEnabled('vibrationTamper')}
                  />
                </div>
              )}

              {/* Freshness Timeout */}
              {localThresholds.commTimeout && (
                <div className="p-4 bg-hs-bg rounded-lg border border-hs-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white border border-hs-border text-hs-teal">
                        SYSTEM
                      </span>
                      <label className="text-xs font-semibold text-hs-ink">
                        {localThresholds.commTimeout.metric}
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-hs-teal" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        {localThresholds.commTimeout.value}s
                      </span>
                      <ToggleSwitch
                        checked={localThresholds.commTimeout.enabled}
                        onChange={() => toggleThresholdEnabled('commTimeout')}
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={localThresholds.commTimeout.min}
                    max={localThresholds.commTimeout.max}
                    step={localThresholds.commTimeout.step}
                    value={localThresholds.commTimeout.value}
                    disabled={!localThresholds.commTimeout.enabled}
                    onChange={(e) => handleThresholdValueChange('commTimeout', parseInt(e.target.value))}
                    className="w-full accent-hs-teal h-1.5 bg-hs-border rounded-lg cursor-pointer disabled:opacity-40"
                  />
                  <p className="text-[10px] text-hs-muted mt-1.5">
                    {localThresholds.commTimeout.description}
                  </p>
                </div>
              )}

            </div>

            {/* Save Button */}
            <div className="mt-6 pt-4 border-t border-hs-border flex items-center justify-between">
              <span className="text-xs text-hs-green font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-hs-green inline-block animate-pulse" />
                Active live evaluation enabled
              </span>
              <Button variant="primary" size="sm" onClick={handleSaveThresholds}>
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Save Active Thresholds
              </Button>
            </div>

          </div>
        </Card>

        {/* ── Section 2: Exact 3 Nodes Management ─────────────────────────────── */}
        <Card variant="default" animate={false}>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Server className="w-4 h-4 text-hs-teal" />
              <h3
                className="text-sm font-semibold text-hs-ink"
                style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}
              >
                Configured Pipeline Nodes (Exactly 3)
              </h3>
            </div>

            <div className="divide-y divide-hs-border border border-hs-border rounded-lg overflow-hidden bg-white">
              {nodes.map(node => (
                <div key={node.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-8 h-8 rounded-md bg-hs-bg flex items-center justify-center font-bold text-xs text-hs-teal border border-hs-border"
                      style={{ fontFamily: 'JetBrains Mono, monospace' }}
                    >
                      {node.id.split('-')[1]}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-hs-ink" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {node.name}
                        </span>
                        <span className="text-[10px] font-semibold text-hs-teal" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          ({node.id})
                        </span>
                      </div>
                      <span className="text-[11px] text-hs-muted" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {node.zone}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: node.active ? '#E8F5EE' : '#FDEAEA',
                        color: node.active ? DS.green : DS.red,
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      {node.active ? 'Monitored' : 'Disabled'}
                    </span>
                    <ToggleSwitch checked={node.active} onChange={() => toggleNodeActive(node.id)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* ── Section 3: Notification Preferences ────────────────────────────── */}
        <Card variant="default" animate={false}>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-hs-teal" />
              <h3
                className="text-sm font-semibold text-hs-ink"
                style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}
              >
                Notification Preferences
              </h3>
            </div>

            <div className="space-y-4 max-w-xl">
              <div className="flex items-center justify-between p-3 rounded-lg bg-hs-bg border border-hs-border">
                <div>
                  <span className="text-xs font-semibold text-hs-ink block">Email Notifications</span>
                  <span className="text-[11px] text-hs-muted">Send immediate dispatch on critical leakage/theft</span>
                </div>
                <ToggleSwitch checked={notifications.email} onChange={() => toggleNotification('email')} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-hs-bg border border-hs-border">
                <div>
                  <span className="text-xs font-semibold text-hs-ink block">SMS Text Alerts</span>
                  <span className="text-[11px] text-hs-muted">Emergency SMS alerts for pipe rupture or tamper</span>
                </div>
                <ToggleSwitch checked={notifications.sms} onChange={() => toggleNotification('sms')} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-hs-bg border border-hs-border">
                <div>
                  <span className="text-xs font-semibold text-hs-ink block">Browser Toast Notifications</span>
                  <span className="text-[11px] text-hs-muted">In-app live notification alerts</span>
                </div>
                <ToggleSwitch checked={notifications.push} onChange={() => toggleNotification('push')} />
              </div>
            </div>
          </div>
        </Card>

      </div>
    </motion.div>
  )
}

export default SettingsPage
