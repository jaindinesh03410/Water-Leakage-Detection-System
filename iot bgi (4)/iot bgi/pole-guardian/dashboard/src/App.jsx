import { useState, lazy, Suspense } from 'react'
import { Card, Button, Alert, MetricCard } from './components/ui'
import { Grid, Section, TopNavigation } from './components/layout'
import { FlowChart, PressureChart, UsageChart } from './components/charts'

// Lazy-loaded tab panels — each becomes a separate JS chunk
const AlertManager = lazy(() => import('./components/alerts'))
const ReportsPage  = lazy(() => import('./components/reports/ReportsPage.jsx'))
const SettingsPage = lazy(() => import('./components/settings/SettingsPage.jsx'))
import {
  Droplets, Activity, Gauge, Shield, TrendingUp,
  BarChart3, LayoutDashboard, Bell, GitBranch,
  FileText, Settings, ArrowRight
} from 'lucide-react'
import {
  useRealTimeMetrics,
  useConnectionStatus,
  useLatestReadings,
  useAlertEngine
} from './hooks/useFirebaseData.js'
import { SYSTEM_NODES } from './services/alertEngine.js'

// ── Sidebar Navigation Items (Clean 6-item workflow) ─────────────────────────
const NAV_ITEMS = [
  { id: 'overview',   label: 'Overview',   icon: LayoutDashboard },
  { id: 'analytics',  label: 'Analytics',  icon: BarChart3 },
  { id: 'alerts',     label: 'Alerts',     icon: Bell, showBadge: true },
  { id: 'nodes',      label: 'Nodes',      icon: GitBranch },
  { id: 'reports',    label: 'Reports',    icon: FileText },
  { id: 'settings',   label: 'Settings',   icon: Settings },
]

// ── Node Status Visual Configuration ─────────────────────────────────────────
const NODE_STATUS_CONFIG = {
  normal:   { dot: '#2E9E6C', bg: '#E8F5EE', label: 'text-[#2E9E6C]', text: 'Normal', border: '#2E9E6C' },
  warning:  { dot: '#C97A1F', bg: '#FEF4E6', label: 'text-[#C97A1F]', text: 'Warning', border: '#C97A1F' },
  critical: { dot: '#D14343', bg: '#FDEAEA', label: 'text-[#D14343]', text: 'Critical', border: '#D14343' },
  offline:  { dot: '#5B6E6D', bg: '#F7F9F8', label: 'text-[#5B6E6D]', text: 'Offline', border: '#5B6E6D' },
}

// ── Sidebar Component ────────────────────────────────────────────────────────
function Sidebar({ activeTab, onTabChange, systemOnline, activeAlertCount = 0 }) {
  return (
    <aside className="hs-sidebar flex flex-col w-60 bg-hs-ink text-white flex-shrink-0 z-20">
      {/* Brand Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5 mb-0.5">
          <div className="w-8 h-8 rounded-lg bg-hs-teal flex items-center justify-center">
            <Droplets className="w-4 h-4 text-white" />
          </div>
          <div>
            <span
              className="text-white font-bold text-sm tracking-wide uppercase block"
              style={{ fontFamily: 'Space Grotesk, Inter, sans-serif', letterSpacing: '0.08em' }}
            >
              HydroSense
            </span>
            <span className="text-white/50 text-[10px]" style={{ fontFamily: 'Inter, sans-serif' }}>
              IoT Water Intelligence
            </span>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4 space-y-1 px-3">
        {NAV_ITEMS.map(({ id, label, icon: Icon, showBadge }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`hs-sidebar-link w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-hs-teal text-white font-semibold shadow-xs'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-white/60'}`} />
                <span>{label}</span>
              </div>
              {showBadge && activeAlertCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-hs-red text-white">
                  {activeAlertCount}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom Node Health Status */}
      <div className="px-5 py-4 border-t border-white/10 bg-white/5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-white/60 font-medium">Pipeline Nodes</span>
          <span className="text-[11px] text-hs-green font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            3 Active
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full inline-block animate-pulse"
            style={{ backgroundColor: systemOnline ? '#2E9E6C' : '#D14343' }}
          />
          <span className="text-white/80 text-xs font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
            {systemOnline ? 'System Online (ESP32)' : 'System Offline'}
          </span>
        </div>
      </div>
    </aside>
  )
}

// ── Main App Component ───────────────────────────────────────────────────────
function App() {
  const [showAlert, setShowAlert] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // ── Data & Alert Hooks ────────────────────────────────────────────────────
  const { metrics } = useRealTimeMetrics()
  const { connected } = useConnectionStatus()
  const { readings } = useLatestReadings()
  const { activeAlerts } = useAlertEngine()

  const systemOnline = connected
  const activeAlertCount = activeAlerts.length

  return (
    <div className="flex min-h-screen bg-hs-bg text-hs-ink">

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        systemOnline={systemOnline}
        activeAlertCount={activeAlertCount}
      />

      {/* ── Main Content Area ─────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Top Header Navigation */}
        <TopNavigation
          systemStatus={systemOnline ? 'online' : 'offline'}
          deviceConnected={systemOnline}
        />

        {/* Scrollable Main Body — Suspense boundary for lazy tab panels */}
        <main className="flex-1 overflow-y-auto pb-24">
          <Suspense fallback={
            <div className="flex items-center justify-center h-48">
              <span className="w-6 h-6 rounded-full border-2 border-hs-teal border-t-transparent animate-spin" />
            </div>
          }>
          <div className="px-6 py-4 max-w-7xl mx-auto space-y-6">

            {/* Dismissible System Status Banner */}
            <Section spacing="none" animate={false}>
              <Alert
                type={activeAlertCount > 0 ? 'warning' : 'success'}
                title={activeAlertCount > 0 ? `${activeAlertCount} Active System Alert${activeAlertCount > 1 ? 's' : ''}` : 'All 3 Pipeline Nodes Operational'}
                message={activeAlertCount > 0
                  ? 'Real-time telemetry detected threshold variances. Inspect the Alerts center for detailed diagnostics.'
                  : 'ESP32 Dual-flow telemetry, pressure, and tamper protection actively streaming with zero threshold violations.'
                }
                show={showAlert}
                onClose={() => setShowAlert(false)}
              />
            </Section>

            {/* ════════════════════════════════════════════════════════════════
                1. OVERVIEW TAB
            ════════════════════════════════════════════════════════════════ */}
            {activeTab === 'overview' && (
              <div className="space-y-6">

                {/* 4 Balanced Primary Telemetry Cards */}
                <Section title="Real-Time Telemetry" subtitle="Live multi-point measurements from ESP32 pipeline sensors">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* Flow Sensor 1 — Inlet (NODE-01) */}
                    <MetricCard
                      title="Intake Flow (NODE-01)"
                      value={metrics.flowRate?.toFixed(1) || '0.0'}
                      unit="L/min"
                      icon={Droplets}
                      status={metrics.flowRate > 50 ? 'warning' : 'normal'}
                      trend={metrics.flowRate > 20 ? 'up' : metrics.flowRate > 0 ? 'stable' : 'down'}
                      trendValue={`Valve: ${metrics.valve1 ? 'OPEN' : 'CLOSED'}`}
                      variant="default"
                    />

                    {/* Flow Sensor 2 — Outlet (NODE-03) */}
                    <MetricCard
                      title="Discharge Flow (NODE-03)"
                      value={metrics.flowRateOut?.toFixed(1) || '0.0'}
                      unit="L/min"
                      icon={Droplets}
                      status={metrics.leakageDetected ? 'critical' : 'normal'}
                      trend={metrics.efficiency >= 80 ? 'up' : 'down'}
                      trendValue={`Eff: ${metrics.efficiency}%`}
                      variant="default"
                    />

                    {/* Pressure (NODE-02) */}
                    <MetricCard
                      title="Line Pressure (NODE-02)"
                      value={metrics.pressure?.toFixed(1) || '0.0'}
                      unit="Bar"
                      icon={Gauge}
                      status={metrics.pressure > 3.5 ? 'critical' : metrics.pressure < 1.0 && metrics.pressure > 0 ? 'warning' : 'normal'}
                      trend="stable"
                      trendValue={`${metrics.temperature.toFixed(1)}°C`}
                      variant="default"
                    />

                    {/* Vibration / Tamper Status (NODE-02) */}
                    <MetricCard
                      title="Tamper &amp; Theft Sensor"
                      value={metrics.vibrationStatus === 'detected' ? 'ALARM' : 'SECURE'}
                      unit=""
                      icon={Shield}
                      status={metrics.vibrationStatus === 'detected' ? 'critical' : 'normal'}
                      trend={metrics.vibrationStatus === 'detected' ? 'up' : 'stable'}
                      trendValue={metrics.vibrationStatus === 'detected' ? 'TAMPER=1' : 'NORMAL'}
                      variant="default"
                      emphasized={metrics.vibrationStatus === 'detected'}
                    />

                  </div>
                </Section>

                {/* Secondary Analytics Cards */}
                <Section title="Operational Summary" subtitle="Calculated differential, consumption and active alerts">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                    {/* Differential / Theft Risk */}
                    <Card variant="default" animate={true}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-hs-teal" />
                          <span className="text-sm font-medium text-hs-muted" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Theft &amp; Anomaly Index
                          </span>
                        </div>
                        <span
                          className={`text-xs font-semibold ${metrics.theftRisk > 30 ? 'text-hs-red' : 'text-hs-green'}`}
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {metrics.theftRisk > 30 ? 'Elevated' : 'Low'}
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="text-3xl font-bold text-hs-ink" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          {metrics.theftRisk}
                        </span>
                        <span className="text-sm text-hs-muted ml-1">%</span>
                      </div>
                      <div className="h-1.5 bg-hs-border rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(metrics.theftRisk, 100)}%`,
                            backgroundColor: metrics.theftRisk > 70 ? '#D14343' : metrics.theftRisk > 30 ? '#C97A1F' : '#2E9E6C',
                          }}
                        />
                      </div>
                    </Card>

                    {/* Daily Consumption */}
                    <Card variant="default" animate={true}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-hs-teal" />
                          <span className="text-sm font-medium text-hs-muted" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Net Cumulative Intake
                          </span>
                        </div>
                        <span className="text-xs font-medium text-hs-teal" style={{ fontFamily: 'Inter, sans-serif' }}>
                          Flow Meter 1
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="text-3xl font-bold text-hs-ink" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          {metrics.totalConsumption.toLocaleString()}
                        </span>
                        <span className="text-sm text-hs-muted ml-1">L</span>
                      </div>
                      <span className="hs-status-pill normal">
                        Cumulative Total
                      </span>
                    </Card>

                    {/* Real-time Alerts Summary */}
                    <Card variant="default" emphasized={activeAlertCount > 0} animate={true}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-hs-teal" />
                          <span className="text-sm font-medium text-hs-muted" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Live Active Alerts
                          </span>
                        </div>
                        {activeAlertCount > 0 && (
                          <span className="text-xs font-bold text-hs-red animate-pulse" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Action Required
                          </span>
                        )}
                      </div>
                      <div className="mb-2">
                        <span className="text-3xl font-bold text-hs-ink" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          {activeAlertCount}
                        </span>
                        <span className="text-xs text-hs-muted ml-1">Active</span>
                      </div>
                      <button
                        onClick={() => setActiveTab('alerts')}
                        className="text-xs font-semibold text-hs-teal hover:underline flex items-center gap-1 mt-1"
                      >
                        Inspect Alert Manager <ArrowRight className="w-3 h-3" />
                      </button>
                    </Card>

                  </div>
                </Section>

                {/* Exactly 3 Real Pipeline Monitoring Nodes Overview */}
                <Section title="Pipeline Node Topology (3 Nodes)" subtitle="Physical monitoring points across the conduit network">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {SYSTEM_NODES.map(node => {
                      const nodeData = metrics.nodesData[node.id] || {}
                      const cfg = NODE_STATUS_CONFIG[nodeData.status] || NODE_STATUS_CONFIG.normal

                      return (
                        <div
                          key={node.id}
                          className="hs-card p-5 border transition-all hover:shadow-sm"
                          style={{ borderLeft: `4px solid ${cfg.border}` }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className="text-xs font-bold text-hs-teal px-2 py-0.5 rounded bg-hs-bg border border-hs-border"
                              style={{ fontFamily: 'JetBrains Mono, monospace' }}
                            >
                              {node.id}
                            </span>
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                              style={{ backgroundColor: cfg.bg, color: cfg.dot }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: cfg.dot }} />
                              {cfg.text}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-hs-ink mb-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {node.name}
                          </h4>
                          <p className="text-[11px] text-hs-muted mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {node.zone}
                          </p>

                          <div className="pt-3 border-t border-hs-border flex items-center justify-between text-xs">
                            <span className="text-hs-muted">Active Alerts:</span>
                            <span
                              className={`font-bold ${nodeData.alertCount > 0 ? 'text-hs-red' : 'text-hs-green'}`}
                              style={{ fontFamily: 'JetBrains Mono, monospace' }}
                            >
                              {nodeData.alertCount || 0}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Section>

              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                2. ANALYTICS TAB
            ════════════════════════════════════════════════════════════════ */}
            {activeTab === 'analytics' && (
              <Section title="Telemetry Analytics" subtitle="Real-time flow and pressure trend visualization">
                <Grid cols={1} gap={6}>
                  <FlowChart data={readings ? [readings] : []} />
                  <Grid cols={2} gap={6}>
                    <PressureChart data={readings ? [readings] : []} />
                    <UsageChart />
                  </Grid>
                </Grid>
              </Section>
            )}

            {/* ════════════════════════════════════════════════════════════════
                3. ALERTS TAB (Overhauled Real Event-Driven Alert Manager)
            ════════════════════════════════════════════════════════════════ */}
            {activeTab === 'alerts' && (
              <Section title="Alert &amp; Incident Management" subtitle="Real event-driven alerts, threshold telemetry and lifecycle status">
                <AlertManager />
              </Section>
            )}

            {/* ════════════════════════════════════════════════════════════════
                4. NODES TAB (3 Real Nodes Deep-Dive)
            ════════════════════════════════════════════════════════════════ */}
            {activeTab === 'nodes' && (
              <Section title="3-Node Telemetry Network" subtitle="Comprehensive sensor telemetry mapped to physical pipeline stations">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  {/* NODE-01: Inlet Station */}
                  <div className="hs-card p-6 border-l-4 border-l-hs-teal">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded bg-hs-bg border border-hs-border text-xs font-bold text-hs-teal" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        NODE-01
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8F5EE] text-[#2E9E6C]">
                        INTAKE
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-hs-ink mb-1" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>
                      Inlet Monitoring Station
                    </h3>
                    <p className="text-xs text-hs-muted mb-5">
                      Zone A — Primary supply conduit &amp; intake valve
                    </p>

                    <div className="space-y-3 pt-3 border-t border-hs-border">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-hs-muted">Inlet Flow Rate:</span>
                        <span className="font-bold text-hs-ink" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          {metrics.flowRate.toFixed(1)} L/min
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-hs-muted">Intake Temperature:</span>
                        <span className="font-bold text-hs-ink" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          {metrics.temperature.toFixed(1)} °C
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-hs-muted">Solenoid Valve 1:</span>
                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${metrics.valve1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {metrics.valve1 ? 'OPEN (Relay 1)' : 'CLOSED'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-hs-muted">Cumulative Volume:</span>
                        <span className="font-bold text-hs-teal" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          {metrics.totalConsumption.toLocaleString()} L
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* NODE-02: Pipeline & Tamper Node */}
                  <div className="hs-card p-6 border-l-4 border-l-[#C97A1F]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded bg-hs-bg border border-hs-border text-xs font-bold text-hs-teal" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        NODE-02
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF4E6] text-[#C97A1F]">
                        CONDUIT
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-hs-ink mb-1" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>
                      Pipeline &amp; Tamper Node
                    </h3>
                    <p className="text-xs text-hs-muted mb-5">
                      Zone B — Main transmission line, pressure &amp; vibration sensor
                    </p>

                    <div className="space-y-3 pt-3 border-t border-hs-border">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-hs-muted">Hydraulic Pressure:</span>
                        <span className="font-bold text-hs-ink" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          {metrics.pressure.toFixed(1)} Bar
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-hs-muted">Vibration / Tamper:</span>
                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${metrics.vibrationStatus === 'detected' ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-green-100 text-green-700'}`}>
                          {metrics.vibrationStatus === 'detected' ? 'VIBRATION DETECTED' : 'NORMAL (0)'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-hs-muted">Flow Differential:</span>
                        <span className={`font-bold ${metrics.leakageDetected ? 'text-hs-red' : 'text-hs-ink'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          {Math.abs(metrics.flowRate - metrics.flowRateOut).toFixed(1)} L/min
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-hs-muted">Physical Leak Status:</span>
                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${metrics.leakageDetected ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {metrics.leakageDetected ? 'LEAK DETECTED' : 'INTEGRITY OK'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* NODE-03: Outlet Station */}
                  <div className="hs-card p-6 border-l-4 border-l-hs-green">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded bg-hs-bg border border-hs-border text-xs font-bold text-hs-teal" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        NODE-03
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8F5EE] text-[#2E9E6C]">
                        TERMINAL
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-hs-ink mb-1" style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}>
                      Outlet &amp; Delivery Station
                    </h3>
                    <p className="text-xs text-hs-muted mb-5">
                      Zone C — Downstream distribution &amp; terminal valve
                    </p>

                    <div className="space-y-3 pt-3 border-t border-hs-border">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-hs-muted">Discharge Flow Rate:</span>
                        <span className="font-bold text-hs-ink" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          {metrics.flowRateOut.toFixed(1)} L/min
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-hs-muted">Conveyance Efficiency:</span>
                        <span className="font-bold text-hs-green" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          {metrics.efficiency.toFixed(1)} %
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-hs-muted">Solenoid Valve 2:</span>
                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${metrics.valve2 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {metrics.valve2 ? 'OPEN (Relay 2)' : 'CLOSED'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-hs-muted">System State:</span>
                        <span className="font-bold text-hs-green" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          ONLINE
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </Section>
            )}

            {/* ════════════════════════════════════════════════════════════════
                5. REPORTS TAB
            ════════════════════════════════════════════════════════════════ */}
            {activeTab === 'reports' && (
              <ReportsPage />
            )}

            {/* ════════════════════════════════════════════════════════════════
                6. SETTINGS TAB
            ════════════════════════════════════════════════════════════════ */}
            {activeTab === 'settings' && (
              <SettingsPage />
            )}

          </div>
          </Suspense>
        </main>

        {/* ── Persistent Bottom Status Strip ─────────────────────────────── */}
        <footer className="fixed bottom-0 left-60 right-0 bg-white border-t border-hs-border px-6 py-3 flex items-center justify-between gap-4 z-10">
          
          {/* Quick Nav Shortcut Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setActiveTab('overview')}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white inline-block mr-1" />
              Overview
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setActiveTab('analytics')}>
              Analytics
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActiveTab('alerts')}
              className={activeAlertCount > 0 ? 'border-hs-red text-hs-red' : ''}
            >
              <Bell className="w-3.5 h-3.5 mr-1" />
              Alerts ({activeAlertCount})
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setActiveTab('nodes')}>
              Nodes (3)
            </Button>
          </div>

          {/* Dividing Bar */}
          <div className="h-6 w-px bg-hs-border hidden sm:block" />

          {/* Real Telemetry Strip Badges */}
          <div className="flex items-center gap-4 overflow-x-auto text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-hs-muted uppercase tracking-wide">Intake:</span>
              <span className="font-bold text-hs-ink" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {metrics.flowRate.toFixed(1)} L/min
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-hs-muted uppercase tracking-wide">Discharge:</span>
              <span className="font-bold text-hs-ink" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {metrics.flowRateOut.toFixed(1)} L/min
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-hs-muted uppercase tracking-wide">Pressure:</span>
              <span className="font-bold text-hs-ink" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {metrics.pressure.toFixed(1)} Bar
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-hs-muted uppercase tracking-wide">Alerts:</span>
              <span
                className={`font-bold ${activeAlertCount > 0 ? 'text-hs-red' : 'text-hs-green'}`}
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                {activeAlertCount}
              </span>
            </div>
          </div>

        </footer>

      </div>
    </div>
  )
}

export default App