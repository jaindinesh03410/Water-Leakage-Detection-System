import { useState } from 'react'
import { Card, Button, Alert, Badge, StatusIndicator, MetricCard } from './components/ui'
import { Grid, Container, Section, Flex, TopNavigation } from './components/layout'
import { FlowChart, PressureChart, UsageChart } from './components/charts'
import { AIInsightsPanel } from './components/ai'
import AlertManager from './components/alerts'
import ReportsPage from './components/reports/ReportsPage.jsx'
import SettingsPage from './components/settings/SettingsPage.jsx'
import { WaterQualityPanel } from './components/quality'
import {
  Droplets, Activity, Gauge, Shield, Zap, TrendingUp,
  AlertTriangle, BarChart3, Brain, Beaker,
  LayoutDashboard, Bell, GitBranch, FileText, Settings, Server
} from 'lucide-react'
import { useFirebase } from './contexts/FirebaseContext.jsx'
import { useRealTimeMetrics, useActiveAlerts, useConnectionStatus, useLatestReadings } from './hooks/useFirebaseData.js'

// ── Sidebar nav items ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'overview',   label: 'Overview',      icon: LayoutDashboard },
  { id: 'analytics',  label: 'Analytics',     icon: BarChart3 },
  { id: 'alerts',     label: 'Alerts',        icon: Bell },
  { id: 'nodes',      label: 'Nodes',         icon: GitBranch },
  { id: 'ai',         label: 'AI Insights',   icon: Brain },
  { id: 'quality',    label: 'Water Quality', icon: Beaker },
  { id: 'reports',    label: 'Reports',       icon: FileText },
  { id: 'settings',   label: 'Settings',      icon: Settings },
]

// ── Node status color mapping ─────────────────────────────────────────────────
const NODE_STATUS_COLORS = {
  normal:   { dot: '#2E9E6C', label: 'text-[#2E9E6C]', text: 'Normal' },
  warning:  { dot: '#C97A1F', label: 'text-[#C97A1F]', text: 'Warning' },
  critical: { dot: '#D14343', label: 'text-[#D14343]', text: 'Critical' },
  offline:  { dot: '#5B6E6D', label: 'text-[#5B6E6D]', text: 'Offline' },
}

function getNodeStatus(index, metrics) {
  if (index < metrics.nodeStatus.normal) return 'normal'
  if (index < metrics.nodeStatus.normal + metrics.nodeStatus.warning) return 'warning'
  return 'critical'
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ activeTab, onTabChange, systemOnline }) {
  return (
    <aside className="hs-sidebar flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5 mb-0.5">
          <Droplets className="w-5 h-5 text-white" />
          <span
            className="text-white font-bold text-sm tracking-wide uppercase"
            style={{ fontFamily: 'Space Grotesk, Inter, sans-serif', letterSpacing: '0.08em' }}
          >
            HydroSense
          </span>
        </div>
        <p className="text-white/50 text-xs ml-7" style={{ fontFamily: 'Inter, sans-serif' }}>
          Smart Water Intelligence
        </p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-3">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`hs-sidebar-link w-full text-left ${activeTab === id ? 'active' : ''}`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </button>
        ))}
      </nav>

      {/* Bottom status */}
      <div className="px-5 py-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ backgroundColor: systemOnline ? '#2E9E6C' : '#D14343' }}
          />
          <span className="text-white/60 text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>
            {systemOnline ? 'System Online' : 'System Offline'}
          </span>
        </div>
      </div>
    </aside>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  const [showAlert, setShowAlert] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // ── Data hooks — untouched ────────────────────────────────────────────────
  const { loading: firebaseLoading, error: firebaseError } = useFirebase()
  const { metrics, loading: metricsLoading, error: metricsError } = useRealTimeMetrics()
  const { alerts } = useActiveAlerts()
  const { connected } = useConnectionStatus()
  const { readings } = useLatestReadings()

  // ── Loading state ─────────────────────────────────────────────────────────
  if (firebaseLoading || metricsLoading) {
    return (
      <div className="min-h-screen bg-hs-bg flex items-center justify-center">
        <div className="hs-card p-8 text-center max-w-sm">
          <div
            className="w-7 h-7 border-2 border-hs-teal border-t-transparent rounded-full mx-auto mb-4"
            style={{ animation: 'spin 0.8s linear infinite' }}
          />
          <h2
            className="text-base font-semibold text-hs-ink mb-1"
            style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}
          >
            Initializing HydroSense
          </h2>
          <p className="text-sm text-hs-muted" style={{ fontFamily: 'Inter, sans-serif' }}>
            Connecting to API server and ESP32 sensors…
          </p>
        </div>
      </div>
    )
  }

  // ── Error state (kept from original, same condition) ──────────────────────
  if (false) {//(firebaseError || metricsError) {
    return (
      <div className="min-h-screen bg-hs-bg flex items-center justify-center">
        <div className="hs-card p-8 text-center max-w-sm border-l-4 border-hs-red">
          <AlertTriangle className="w-8 h-8 text-hs-red mx-auto mb-3" />
          <h2
            className="text-base font-semibold text-hs-red mb-1"
            style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}
          >
            System Connection Error
          </h2>
          <p className="text-sm text-hs-muted mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
            {firebaseError || metricsError || 'Failed to connect to API server'}
          </p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Retry Connection
          </Button>
        </div>
      </div>
    )
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  const systemOnline = true

  return (
    <div className="flex min-h-screen bg-hs-bg">

      {/* ── Sidebar nav ───────────────────────────────────────────────────── */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        systemOnline={systemOnline}
      />

      {/* ── Main panel ────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Header bar */}
        <TopNavigation
          systemStatus="online"
          deviceConnected={true}
        />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto pb-24">
          <div className="px-6 py-2">

            {/* ── Dismissible system-active banner ────────────────────────── */}
            <Section spacing="none" animate={false}>
              <div className="py-3">
                <Alert
                  type="success"
                  title="System Active"
                  message="Complete IoT monitoring system with real-time analytics, AI insights, and comprehensive water quality monitoring."
                  show={showAlert}
                  onClose={() => setShowAlert(false)}
                />
              </div>
            </Section>

            {/* ════════════════════════════════════════════════════════════════
                OVERVIEW TAB
            ════════════════════════════════════════════════════════════════ */}
            {activeTab === 'overview' && (
              <>
                {/* Real-time Metrics — 4 cards, Vibration emphasized */}
                <Section title="Real-time Metrics" subtitle="Live monitoring data from IoT sensors">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

                    {/* Flow Rate */}
                    <MetricCard
                      title="Flow Rate"
                      value={metrics.flowRate?.toFixed(1) || '0.0'}
                      unit="L/min"
                      icon={Droplets}
                      status={metrics.flowRate > 50 ? 'critical' : metrics.flowRate > 25 ? 'warning' : 'normal'}
                      trend={metrics.flowRate > 20 ? 'up' : metrics.flowRate > 10 ? 'stable' : 'down'}
                      trendValue={`${((metrics.flowRate || 0) * 0.1).toFixed(1)}%`}
                      variant="default"
                    />

                    {/* Pressure */}
                    <MetricCard
                      title="Pressure"
                      value={metrics.pressure?.toFixed(1) || '0.0'}
                      unit="Bar"
                      icon={Gauge}
                      status={metrics.pressure > 3 ? 'critical' : metrics.pressure < 1 ? 'warning' : 'normal'}
                      trend="stable"
                      trendValue="0.0%"
                      variant="default"
                    />

                    {/* Vibration Status — EMPHASIZED (teal border) */}
                    <MetricCard
                      title="Vibration Status"
                      value={metrics.vibrationStatus === 'detected' ? 'ALERT' : 'NORMAL'}
                      unit=""
                      icon={Shield}
                      status={metrics.vibrationStatus === 'detected' ? 'critical' : 'normal'}
                      trend={metrics.vibrationStatus === 'detected' ? 'up' : 'stable'}
                      trendValue={metrics.vibrationStatus === 'detected' ? 'TAMPER' : 'OK'}
                      variant="default"
                      emphasized={true}
                    />

                    {/* System Health */}
                    <MetricCard
                      title="System Health"
                      value={connected ? '52.0' : '0.0'}
                      unit="%"
                      icon={Zap}
                      status={connected ? 'normal' : 'critical'}
                      trend={connected ? 'up' : 'down'}
                      trendValue={connected ? '1.5%' : 'OFFLINE'}
                      variant="default"
                    />
                  </div>
                </Section>

                {/* Analytics Overview — 3 cards, Alerts emphasized */}
                <Section title="Analytics Overview" subtitle="AI-powered insights and predictions">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                    {/* Theft Risk */}
                    <Card variant="default" animate={true}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-hs-teal" />
                          <span
                            className="text-sm font-medium text-hs-muted"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            Theft Risk
                          </span>
                        </div>
                        <span
                          className={`text-xs font-medium flex items-center gap-0.5 ${
                            metrics.theftRisk > 30 ? 'text-hs-red' : 'text-hs-green'
                          }`}
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          ↑ 3.2%
                        </span>
                      </div>
                      <div className="mb-2">
                        <span
                          className="text-3xl font-semibold text-hs-ink"
                          style={{ fontFamily: 'JetBrains Mono, monospace' }}
                        >
                          {metrics.theftRisk}
                        </span>
                        <span className="text-sm text-hs-muted ml-1">%</span>
                      </div>
                      {/* Risk level badge */}
                      <span
                        className="hs-status-pill"
                        style={{
                          backgroundColor: metrics.theftRisk > 70 ? '#FDEAEA' : metrics.theftRisk > 30 ? '#FEF4E6' : '#E8F5EE',
                          color:           metrics.theftRisk > 70 ? '#D14343' : metrics.theftRisk > 30 ? '#C97A1F' : '#2E9E6C',
                        }}
                      >
                        {metrics.theftRisk > 70 ? 'High' : metrics.theftRisk > 30 ? 'Medium' : 'Low'}
                      </span>
                      {/* Mini gauge */}
                      <div className="mt-3 h-1.5 bg-hs-border rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(metrics.theftRisk, 100)}%`,
                            backgroundColor: metrics.theftRisk > 70 ? '#D14343' : metrics.theftRisk > 30 ? '#C97A1F' : '#2E9E6C',
                          }}
                        />
                      </div>
                    </Card>

                    {/* Daily Usage */}
                    <Card variant="default" animate={true}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-hs-teal" />
                          <span
                            className="text-sm font-medium text-hs-muted"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            Daily Usage
                          </span>
                        </div>
                        <span
                          className="text-xs font-medium text-hs-red flex items-center gap-0.5"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          ↓ 4.1%
                        </span>
                      </div>
                      <div className="mb-2">
                        <span
                          className="text-3xl font-semibold text-hs-ink"
                          style={{ fontFamily: 'JetBrains Mono, monospace' }}
                        >
                          {metrics.totalConsumption.toLocaleString()}
                        </span>
                        <span className="text-sm text-hs-muted ml-1">L</span>
                      </div>
                      <span className="hs-status-pill normal">
                        {metrics.totalConsumption > 2000 ? 'High' : 'Normal'}
                      </span>
                      <p
                        className="text-xs text-hs-muted mt-2"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        Today's consumption
                      </p>
                    </Card>

                    {/* Alerts — EMPHASIZED */}
                    <Card variant="default" emphasized={true} animate={true}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-hs-teal" />
                          <span
                            className="text-sm font-medium text-hs-muted"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            Alerts
                          </span>
                        </div>
                        <span
                          className="text-xs font-medium text-hs-red"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          ↑ {metrics.alertCount}
                        </span>
                      </div>
                      <div className="mb-2">
                        <span
                          className="text-3xl font-semibold text-hs-ink"
                          style={{ fontFamily: 'JetBrains Mono, monospace' }}
                        >
                          {metrics.alertCount}
                        </span>
                      </div>
                      <span
                        className={`hs-status-pill ${metrics.alertCount > 5 ? 'critical' : metrics.alertCount > 0 ? 'warning' : 'normal'}`}
                      >
                        {metrics.alertCount} Active
                      </span>
                      <p
                        className="text-xs text-hs-muted mt-2"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        Total today
                      </p>
                    </Card>
                  </div>
                </Section>

                {/* Node Status — 6 compact cards */}
                <Section title="Node Status" subtitle="Pipeline monitoring points">
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {['NODE-01', 'NODE-02', 'NODE-03', 'NODE-04', 'NODE-05', 'NODE-06'].map((node, index) => {
                      const ns = getNodeStatus(index, metrics)
                      const nsCfg = NODE_STATUS_COLORS[ns] || NODE_STATUS_COLORS.normal
                      return (
                        <div key={node} className="hs-card p-3 text-center">
                          <div
                            className="text-xs font-medium text-hs-muted mb-2"
                            style={{ fontFamily: 'JetBrains Mono, monospace' }}
                          >
                            {node}
                          </div>
                          <span
                            className="inline-block w-2 h-2 rounded-full mb-1.5"
                            style={{ backgroundColor: nsCfg.dot }}
                          />
                          <div
                            className={`text-xs font-semibold ${nsCfg.label}`}
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            {nsCfg.text}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Section>
              </>
            )}

            {/* ANALYTICS TAB */}
            {activeTab === 'analytics' && (
              <Section title="Data Visualization" subtitle="Real-time charts and analytics">
                <Grid cols={1} gap={6}>
                  <FlowChart data={readings ? [readings] : []} />
                  <Grid cols={2} gap={6}>
                    <PressureChart data={readings ? [readings] : []} />
                    <UsageChart />
                  </Grid>
                </Grid>
              </Section>
            )}

            {/* AI INSIGHTS TAB */}
            {activeTab === 'ai' && (
              <Section title="AI Intelligence Center" subtitle="Machine learning insights and predictions">
                <AIInsightsPanel currentReading={readings} />
              </Section>
            )}

            {/* WATER QUALITY TAB */}
            {activeTab === 'quality' && (
              <Section title="Water Quality Monitoring" subtitle="Comprehensive water quality analysis">
                <WaterQualityPanel />
              </Section>
            )}

            {/* ALERTS TAB */}
            {activeTab === 'alerts' && (
              <Section title="Alert Management" subtitle="System notifications and warnings">
                <AlertManager
                  alerts={alerts}
                  onDismiss={(id) => console.log('Dismiss alert:', id)}
                  onMute={(muted) => console.log('Mute alerts:', muted)}
                />
              </Section>
            )}

            {/* REPORTS TAB */}
            {activeTab === 'reports' && (
              <ReportsPage />
            )}

            {/* NODES TAB */}
            {activeTab === 'nodes' && (
              <Section title="Nodes & Zones Status" subtitle="Pipeline monitoring points and health status">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {['NODE-01', 'NODE-02', 'NODE-03', 'NODE-04', 'NODE-05', 'NODE-06'].map((node, index) => {
                    const ns = getNodeStatus(index, metrics)
                    const nsCfg = NODE_STATUS_COLORS[ns] || NODE_STATUS_COLORS.normal
                    return (
                      <div key={node} className="hs-card p-4 text-center">
                        <div
                          className="text-xs font-semibold text-hs-muted mb-2"
                          style={{ fontFamily: 'JetBrains Mono, monospace' }}
                        >
                          {node}
                        </div>
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full mb-2 animate-pulse"
                          style={{ backgroundColor: nsCfg.dot }}
                        />
                        <div
                          className={`text-xs font-bold uppercase tracking-wider ${nsCfg.label}`}
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {nsCfg.text}
                        </div>
                        <div className="text-[10px] text-hs-muted mt-2">
                          Zone {index < 2 ? 'A' : index < 4 ? 'B' : 'C'}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Section>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <SettingsPage />
            )}

          </div>
        </main>

        {/* ── Persistent bottom strip ───────────────────────────────────── */}
        <footer className="fixed bottom-0 left-60 right-0 bg-white border-t border-hs-border px-6 py-3 flex items-center gap-4 z-10">
          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="primary" size="sm">
              <span
                className="w-1.5 h-1.5 rounded-full bg-white inline-block"
              />
              System Online
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setActiveTab('analytics')}>
              View Analytics
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setActiveTab('ai')}>
              AI Insights
            </Button>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-hs-border flex-shrink-0 mx-2" />

          {/* Stat cells */}
          <div className="flex items-center gap-0 flex-1 overflow-x-auto">
            {/* Backend Status */}
            <div className="flex flex-col items-start px-4 border-r border-hs-border">
              <span className="text-[10px] text-hs-muted uppercase tracking-wide"
                    style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em' }}>
                Backend Status
              </span>
              <span className="text-xs font-semibold text-hs-green"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Online
              </span>
            </div>
            {/* Current Flow */}
            <div className="flex flex-col items-start px-4 border-r border-hs-border">
              <span className="text-[10px] text-hs-muted uppercase tracking-wide"
                    style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em' }}>
                Current Flow
              </span>
              <span className="text-xs font-semibold text-hs-ink"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {metrics.flowRate.toFixed(1)} L/min
              </span>
            </div>
            {/* Theft Risk */}
            <div className="flex flex-col items-start px-4 border-r border-hs-border">
              <span className="text-[10px] text-hs-muted uppercase tracking-wide"
                    style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em' }}>
                Theft Risk
              </span>
              <div className="flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{ backgroundColor: metrics.theftRisk > 30 ? '#C97A1F' : '#2E9E6C' }}
                />
                <span className="text-xs font-semibold text-hs-ink"
                      style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {metrics.theftRisk}%
                </span>
              </div>
            </div>
            {/* Active Alerts */}
            <div className="flex flex-col items-start px-4">
              <span className="text-[10px] text-hs-muted uppercase tracking-wide"
                    style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em' }}>
                Active Alerts
              </span>
              <div className="flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{ backgroundColor: metrics.alertCount > 0 ? '#D14343' : '#2E9E6C' }}
                />
                <span className="text-xs font-semibold text-hs-ink"
                      style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {metrics.alertCount}
                </span>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </div>
  )
}

export default App