import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle, Droplets, Shield, Zap, Bell, BellOff, CheckCircle2,
  Clock, Server, Check, AlertCircle, Thermometer,
  Activity, CheckCircle, Trash2
} from 'lucide-react'
import { Button } from '../ui'
import { useAlertEngine } from '../../hooks/useFirebaseData.js'

// ── Color Design Tokens ──────────────────────────────────────────────────────
const DS = {
  teal:      '#0F5C5B',
  tealLight: '#3E8E8C',
  ink:       '#132A2A',
  muted:     '#5B6E6D',
  border:    '#E1E7E6',
  bg:        '#F7F9F8',
  red:       '#D14343',
  redLight:  '#FDEAEA',
  amber:     '#C97A1F',
  amberLight:'#FEF4E6',
  green:     '#2E9E6C',
  greenLight:'#E8F5EE',
  blue:      '#2563EB',
  blueLight: '#EFF6FF',
}

const AlertManager = ({ className = '' }) => {
  const {
    alerts,
    activeAlerts,
    acknowledgedAlerts,
    resolvedAlerts,
    acknowledgeAlert,
    resolveAlert,
    clearResolvedAlerts
  } = useAlertEngine()

  const [statusFilter, setStatusFilter] = useState('ALL') // ALL, ACTIVE, ACKNOWLEDGED, RESOLVED
  const [severityFilter, setSeverityFilter] = useState('ALL') // ALL, critical, warning
  const [nodeFilter, setNodeFilter] = useState('ALL') // ALL, NODE-01, NODE-02, NODE-03
  const [isMuted, setIsMuted] = useState(false)

  // ── Filtered Alerts ─────────────────────────────────────────────────────────
  const filteredAlerts = alerts.filter(alert => {
    if (statusFilter !== 'ALL' && alert.status !== statusFilter) return false
    if (severityFilter !== 'ALL' && alert.severity !== severityFilter) return false
    if (nodeFilter !== 'ALL' && alert.nodeId !== nodeFilter) return false
    return true
  })

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const getAlertIcon = (type) => {
    switch (type) {
      case 'leakage':       return Droplets
      case 'tampering':     return Shield
      case 'pressure':      return Zap
      case 'temperature':   return Thermometer
      case 'flow':          return Activity
      case 'efficiency':    return Activity
      case 'communication': return Server
      default:              return AlertTriangle
    }
  }

  const getSeverityBadge = (severity, status) => {
    if (status === 'RESOLVED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#E8F5EE] text-[#2E9E6C]">
          <CheckCircle2 className="w-3 h-3" />
          RESOLVED
        </span>
      )
    }

    if (severity === 'critical') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FDEAEA] text-[#D14343] animate-pulse">
          <AlertCircle className="w-3 h-3" />
          CRITICAL
        </span>
      )
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FEF4E6] text-[#C97A1F]">
        <AlertTriangle className="w-3 h-3" />
        WARNING
      </span>
    )
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#FDEAEA] text-[#D14343]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D14343] animate-ping" />
            Active
          </span>
        )
      case 'ACKNOWLEDGED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#FEF4E6] text-[#C97A1F]">
            <Check className="w-3 h-3" />
            Acknowledged
          </span>
        )
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#E8F5EE] text-[#2E9E6C]">
            <CheckCircle className="w-3 h-3" />
            Resolved
          </span>
        )
      default:
        return null
    }
  }

  const formatTimestamp = (ts) => {
    if (!ts) return 'Just now'
    const d = new Date(ts)
    return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' · ' + d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
  }

  return (
    <div className={`space-y-5 ${className}`}>

      {/* ── Top Metric Summary Banner ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Critical Active */}
        <div className="hs-card p-4 border-l-4 border-l-hs-red flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-hs-muted block">Critical Active</span>
            <span className="text-2xl font-bold text-hs-red" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {activeAlerts.filter(a => a.severity === 'critical').length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-hs-red" />
          </div>
        </div>

        {/* Warnings Active */}
        <div className="hs-card p-4 border-l-4 border-l-[#C97A1F] flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-hs-muted block">Active Warnings</span>
            <span className="text-2xl font-bold text-[#C97A1F]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {activeAlerts.filter(a => a.severity === 'warning').length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-[#C97A1F]" />
          </div>
        </div>

        {/* Acknowledged */}
        <div className="hs-card p-4 border-l-4 border-l-hs-teal flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-hs-muted block">Acknowledged</span>
            <span className="text-2xl font-bold text-hs-teal" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {acknowledgedAlerts.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center">
            <Check className="w-5 h-5 text-hs-teal" />
          </div>
        </div>

        {/* Resolved History */}
        <div className="hs-card p-4 border-l-4 border-l-hs-green flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-hs-muted block">Resolved Events</span>
            <span className="text-2xl font-bold text-hs-green" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {resolvedAlerts.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-hs-green" />
          </div>
        </div>
      </div>

      {/* ── Filter & Control Bar ────────────────────────────────────────────── */}
      <div className="hs-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Status Filter */}
          <div className="flex items-center bg-hs-bg border border-hs-border rounded-md p-1">
            {['ALL', 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-all ${
                  statusFilter === st
                    ? 'bg-white text-hs-teal shadow-xs font-semibold'
                    : 'text-hs-muted hover:text-hs-ink'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {st === 'ALL' ? 'All Status' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Node Filter */}
          <select
            value={nodeFilter}
            onChange={(e) => setNodeFilter(e.target.value)}
            className="bg-white border border-hs-border rounded-md px-3 py-1.5 text-xs text-hs-ink font-medium focus:outline-none focus:border-hs-teal"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <option value="ALL">All Nodes (3)</option>
            <option value="NODE-01">NODE-01 (Inlet - Zone A)</option>
            <option value="NODE-02">NODE-02 (Pipeline - Zone B)</option>
            <option value="NODE-03">NODE-03 (Outlet - Zone C)</option>
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-white border border-hs-border rounded-md px-3 py-1.5 text-xs text-hs-ink font-medium focus:outline-none focus:border-hs-teal"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <option value="ALL">All Severities</option>
            <option value="critical">Critical Only</option>
            <option value="warning">Warnings Only</option>
          </select>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {resolvedAlerts.length > 0 && (
            <button
              onClick={clearResolvedAlerts}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-hs-muted hover:text-hs-red transition-colors"
              title="Clear resolved alerts from list"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Resolved
            </button>
          )}

          <Button
            variant={isMuted ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <BellOff className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
            {isMuted ? 'Muted' : 'Audible'}
          </Button>
        </div>
      </div>

      {/* ── Alert Cards List ─────────────────────────────────────────────────── */}
      {filteredAlerts.length === 0 ? (
        <div className="hs-card p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-[#E8F5EE] flex items-center justify-center mx-auto mb-3">
            <Shield className="w-7 h-7 text-[#2E9E6C]" />
          </div>
          <h3
            className="text-base font-semibold text-hs-ink mb-1"
            style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}
          >
            {statusFilter === 'ACTIVE' ? 'No Active Alerts' : 'No Alerts Found'}
          </h3>
          <p className="text-xs text-hs-muted max-w-sm mx-auto mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
            {statusFilter === 'ACTIVE'
              ? 'All 3 pipeline nodes are operating within normal configured safety thresholds.'
              : 'There are no alert records matching the selected filters.'}
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-hs-bg border border-hs-border rounded-full text-xs font-medium text-[#2E9E6C]">
            <span className="w-2 h-2 rounded-full bg-[#2E9E6C] animate-pulse" />
            NODE-01 · NODE-02 · NODE-03 Operational
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredAlerts.map((alert, index) => {
              const Icon = getAlertIcon(alert.type)
              const isResolved = alert.status === 'RESOLVED'
              const isCritical = alert.severity === 'critical' && !isResolved

              const borderColor = isResolved
                ? DS.green
                : isCritical
                ? DS.red
                : DS.amber

              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25, delay: index * 0.03 }}
                  className={`bg-white rounded-lg p-4 transition-all ${
                    isCritical && !isMuted ? 'shadow-sm border-l-4' : 'border-l-4'
                  }`}
                  style={{
                    border: `1px solid ${DS.border}`,
                    borderLeft: `4px solid ${borderColor}`
                  }}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    
                    {/* Main Content Area */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      
                      {/* Icon */}
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          backgroundColor: isResolved
                            ? DS.greenLight
                            : isCritical
                            ? DS.redLight
                            : DS.amberLight
                        }}
                      >
                        <Icon
                          className="w-5 h-5"
                          style={{
                            color: isResolved
                              ? DS.green
                              : isCritical
                              ? DS.red
                              : DS.amber
                          }}
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h4
                            className="text-sm font-semibold text-hs-ink"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            {alert.title}
                          </h4>

                          {/* Severity & Status Badges */}
                          {getSeverityBadge(alert.severity, alert.status)}
                          {getStatusBadge(alert.status)}

                          {/* Node Badge */}
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-hs-bg border border-hs-border text-hs-teal"
                            style={{ fontFamily: 'JetBrains Mono, monospace' }}
                          >
                            {alert.nodeId}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-hs-muted mb-2 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {alert.description}
                        </p>

                        {/* Telemetry Comparison & Timing Meta */}
                        <div className="flex items-center gap-4 flex-wrap text-xs text-hs-muted">
                          {alert.currentValue && (
                            <div className="flex items-center gap-1 bg-hs-bg px-2 py-0.5 rounded border border-hs-border">
                              <span className="text-[10px] uppercase font-bold text-hs-muted">Current:</span>
                              <span className="font-semibold text-hs-ink" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                {alert.currentValue}
                              </span>
                            </div>
                          )}

                          {alert.thresholdValue && (
                            <div className="flex items-center gap-1 bg-hs-bg px-2 py-0.5 rounded border border-hs-border">
                              <span className="text-[10px] uppercase font-bold text-hs-muted">Threshold:</span>
                              <span className="font-semibold text-hs-teal" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                                {alert.thresholdValue}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-1 text-[11px]">
                            <Clock className="w-3 h-3 text-hs-muted" />
                            <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                              {formatTimestamp(alert.timestamp)}
                            </span>
                          </div>

                          {alert.resolvedAt && (
                            <span className="text-[11px] text-hs-green font-medium">
                              Resolved at {new Date(alert.resolvedAt).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons for Alert Lifecycle */}
                    <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                      {alert.status === 'ACTIVE' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="text-xs"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          Acknowledge
                        </Button>
                      )}

                      {alert.status !== 'RESOLVED' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => resolveAlert(alert.id)}
                          className="text-xs text-hs-green hover:bg-green-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-hs-green" />
                          Resolve
                        </Button>
                      )}
                    </div>

                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

    </div>
  )
}

export default AlertManager