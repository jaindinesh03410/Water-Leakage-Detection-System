import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, Badge, Button } from '../ui'
import { Flex } from '../layout'
import { AlertTriangle, Droplets, Shield, Zap, X, Bell, BellOff, CheckCircle } from 'lucide-react'

// ── Design tokens (styling only — no data logic changed) ──────────────────────
const DS = {
  teal:    '#0F5C5B',
  ink:     '#132A2A',
  muted:   '#5B6E6D',
  border:  '#E1E7E6',
  bg:      '#F7F9F8',
  red:     '#D14343',
  amber:   '#C97A1F',
  green:   '#2E9E6C',
  blue:    '#3E8E8C',
}

// Priority → left border color (replaces full-bg approach)
const PRIORITY_BORDER = {
  critical: DS.red,
  high:     DS.red,
  medium:   DS.amber,
  low:      DS.blue,
}

// Priority → icon color (HydroSense tokens)
const PRIORITY_ICON_COLOR = {
  critical: DS.red,
  high:     DS.red,
  medium:   DS.amber,
  low:      DS.blue,
}

const AlertManager = ({
  alerts = [],
  onDismiss = () => {},
  onMute = () => {},
  className = '',
  maxVisible = 5
}) => {
  // ── Data state — untouched ────────────────────────────────────────────────
  const [visibleAlerts, setVisibleAlerts] = useState([])
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    // Sort alerts by priority and timestamp
    const sortedAlerts = [...alerts].sort((a, b) => {
      const priorityOrder = { critical: 3, high: 2, medium: 1, low: 0 }
      const aPriority = priorityOrder[a.priority] || 0
      const bPriority = priorityOrder[b.priority] || 0

      if (aPriority !== bPriority) {
        return bPriority - aPriority
      }

      return (b.timestamp || 0) - (a.timestamp || 0)
    })

    setVisibleAlerts(sortedAlerts.slice(0, maxVisible))
  }, [alerts, maxVisible])

  // ── Logic helpers — untouched ─────────────────────────────────────────────
  const getAlertIcon = (type) => {
    switch (type) {
      case 'leakage':   return Droplets
      case 'theft':     return Shield
      case 'tampering': return AlertTriangle
      case 'pressure':  return Zap
      default:          return AlertTriangle
    }
  }

  // getAlertColor now returns an inline style object (left border only, white bg)
  // The switch logic (priority → color level) is unchanged — only the visual output changed
  const getAlertBorderColor = (priority) => {
    return PRIORITY_BORDER[priority] ?? DS.muted
  }

  const getBadgeVariant = (priority) => {
    switch (priority) {
      case 'critical': return 'error'
      case 'high':     return 'error'
      case 'medium':   return 'warning'
      case 'low':      return 'info'
      default:         return 'default'
    }
  }

  // ── Event handlers — untouched ────────────────────────────────────────────
  const handleDismiss = (alertId) => {
    setVisibleAlerts(prev => prev.filter(alert => alert.id !== alertId))
    onDismiss(alertId)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    onMute(!isMuted)
  }

  // ── All Clear branch — same condition (visibleAlerts.length === 0) ─────────
  if (visibleAlerts.length === 0) {
    return (
      <div className={`hs-card p-8 ${className}`}>
        {/* Green shield icon in a tinted circle */}
        <div className="flex flex-col items-center text-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: '#E8F5EE' }}
          >
            <Shield className="w-7 h-7" style={{ color: DS.green }} />
          </div>

          <h3
            className="text-base font-semibold text-hs-ink mb-1"
            style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}
          >
            All Clear
          </h3>
          <p
            className="text-sm text-hs-muted max-w-xs"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            No active alerts. System operating normally.
          </p>

          {/* Calm status row */}
          <div
            className="mt-6 flex items-center gap-2 px-4 py-2.5 rounded-md"
            style={{ backgroundColor: DS.bg, border: `1px solid ${DS.border}` }}
          >
            <span
              className="w-2 h-2 rounded-full inline-block animate-pulse"
              style={{ backgroundColor: DS.green }}
            />
            <span
              className="text-xs font-medium"
              style={{ fontFamily: 'Inter, sans-serif', color: DS.green }}
            >
              All sensors reporting normal
            </span>
          </div>
        </div>
      </div>
    )
  }

  // ── Active alerts branch — same render condition ───────────────────────────
  return (
    <div className={className}>

      {/* Alert header bar */}
      <div
        className="hs-card p-4 mb-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: DS.red }} />
          <h3
            className="text-sm font-semibold text-hs-ink"
            style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}
          >
            Active Alerts
          </h3>
          {/* Badge — same variant, same data (visibleAlerts.length) */}
          <Badge variant="error" size="sm" animate={false}>
            {visibleAlerts.length}
          </Badge>
        </div>

        {/* Mute toggle — same isMuted logic + onClick handler */}
        <Button
          variant={isMuted ? 'secondary' : 'primary'}
          size="sm"
          onClick={toggleMute}
        >
          {isMuted
            ? <BellOff className="w-3.5 h-3.5" />
            : <Bell    className="w-3.5 h-3.5" />
          }
          {isMuted ? 'Unmute' : 'Mute'}
        </Button>
      </div>

      {/* Alert list */}
      <div className="space-y-3">
        <AnimatePresence>
          {visibleAlerts.map((alert, index) => {
            const IconComponent  = getAlertIcon(alert.type)
            const borderColor    = getAlertBorderColor(alert.priority)
            const iconColor      = PRIORITY_ICON_COLOR[alert.priority] ?? DS.muted

            return (
              <motion.div
                key={alert.id || index}
                initial={{ opacity: 0, x: -50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.95 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ scale: 1.02 }}
              >
                {/* Alert row — white card, colored left border only */}
                <div
                  className={`bg-white rounded-lg p-4 flex items-start gap-3 ${!isMuted ? 'animate-pulse' : ''}`}
                  style={{
                    border:     `1px solid ${DS.border}`,
                    borderLeft: `3px solid ${borderColor}`,
                  }}
                >
                  {/* Animated icon — same motion logic untouched */}
                  <motion.div
                    animate={!isMuted ? {
                      rotate: [0, -10, 10, -10, 0],
                      scale:  [1, 1.1, 1, 1.1, 1]
                    } : {}}
                    transition={{
                      duration:    2,
                      repeat:      Infinity,
                      repeatDelay: 3
                    }}
                    className="flex-shrink-0 mt-0.5"
                  >
                    <IconComponent
                      className="w-4 h-4"
                      style={{ color: iconColor }}
                    />
                  </motion.div>

                  {/* Alert content */}
                  <div className="flex-1 min-w-0">
                    {/* Title + priority badge */}
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <h4
                        className="text-sm font-semibold text-hs-ink"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {alert.title || `${alert.type?.charAt(0).toUpperCase() + alert.type?.slice(1)} Alert`}
                      </h4>
                      {/* getBadgeVariant untouched */}
                      <Badge
                        variant={getBadgeVariant(alert.priority)}
                        size="sm"
                        animate={false}
                      >
                        {alert.priority?.toUpperCase() || 'ALERT'}
                      </Badge>
                    </div>

                    {/* Message */}
                    <p
                      className="text-sm text-hs-muted mb-2 leading-snug"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {alert.message || 'System anomaly detected requiring attention'}
                    </p>

                    {/* Timestamp + dismiss row */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      {/* Timestamp — same data ref, JetBrains Mono */}
                      <span
                        className="text-xs text-hs-muted"
                        style={{ fontFamily: 'JetBrains Mono, monospace' }}
                      >
                        {alert.timestamp
                          ? new Date(alert.timestamp).toLocaleString()
                          : 'Just now'
                        }
                      </span>

                      {/* Dismiss button — same handleDismiss handler */}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDismiss(alert.id || index)}
                      >
                        <X className="w-3 h-3" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Overflow summary — same conditional (alerts.length > maxVisible) */}
      {alerts.length > maxVisible && (
        <div
          className="hs-card p-3 mt-4 text-center"
        >
          <p
            className="text-sm text-hs-muted"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Showing{' '}
            <span style={{ fontFamily: 'JetBrains Mono, monospace', color: DS.ink }}>
              {visibleAlerts.length}
            </span>
            {' '}of{' '}
            <span style={{ fontFamily: 'JetBrains Mono, monospace', color: DS.ink }}>
              {alerts.length}
            </span>
            {' '}alerts
          </p>
        </div>
      )}
    </div>
  )
}

export default AlertManager