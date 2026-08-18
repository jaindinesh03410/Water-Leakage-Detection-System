import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, Badge } from '../ui'
import { Grid, Flex } from '../layout'
import { Brain, TrendingUp, AlertTriangle, Droplets, Shield, Zap, CheckCircle } from 'lucide-react'
import aiAnalyticsEngine from '../../services/aiAnalytics.js'

// ── Design tokens (styling only — no data logic changed) ──────────────────────
const DS = {
  teal:    '#0F5C5B',
  tealLight: '#3E8E8C',
  ink:     '#132A2A',
  muted:   '#5B6E6D',
  border:  '#E1E7E6',
  red:     '#D14343',
  amber:   '#C97A1F',
  green:   '#2E9E6C',
}

// Priority → HydroSense color (styling only — same switch logic)
const PRIORITY_COLOR = {
  high:    DS.red,
  medium:  DS.amber,
  low:     DS.teal,
}

const AIInsightsPanel = ({
  currentReading = null,
  className = '',
  animate = true
}) => {
  // ── Data state — untouched ────────────────────────────────────────────────
  const [insights, setInsights] = useState({ insights: [], summary: {} })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentReading) {
      // Add reading to AI engine
      aiAnalyticsEngine.addReading(currentReading)

      // Generate insights
      const aiInsights = aiAnalyticsEngine.generateInsights(currentReading)
      setInsights(aiInsights)
      setLoading(false)
    }
  }, [currentReading])

  // ── Logic helpers — untouched ─────────────────────────────────────────────
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':   return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      case 'low':    return 'text-blue-400'
      default:       return 'text-gray-400'
    }
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':   return 'error'
      case 'medium': return 'warning'
      case 'low':    return 'info'
      default:       return 'default'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'alert':   return AlertTriangle
      case 'warning': return TrendingUp
      case 'info':    return Brain
      default:        return Zap
    }
  }

  // ── Inline priority color for HydroSense restyling ───────────────────────
  const getHsPriorityColor = (priority) =>
    PRIORITY_COLOR[priority] ?? DS.muted

  const content = (
    <div className={className}>

      {/* ── AI Summary Cards — 4 across, Leak Risk emphasized ─────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">

        {/* Theft Risk — plain card */}
        <div className="hs-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 flex-shrink-0" style={{ color: DS.muted }} />
            <span
              className="text-xs font-medium text-hs-muted"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Theft Risk
            </span>
          </div>
          <div
            className="text-2xl font-semibold text-hs-ink mb-0.5"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            {insights.summary.theftRisk || 0}%
          </div>
          <span
            className="hs-status-pill"
            style={{
              backgroundColor: (insights.summary.theftRisk || 0) > 70 ? '#FDEAEA' :
                               (insights.summary.theftRisk || 0) > 30 ? '#FEF4E6' : '#E8F5EE',
              color:           (insights.summary.theftRisk || 0) > 70 ? DS.red :
                               (insights.summary.theftRisk || 0) > 30 ? DS.amber : DS.green,
            }}
          >
            {(insights.summary.theftRisk || 0) > 70 ? 'High' :
             (insights.summary.theftRisk || 0) > 30 ? 'Medium' : 'Low'}
          </span>
        </div>

        {/* Leak Risk — EMPHASIZED (teal border) */}
        <div className="hs-card-emphasized p-4">
          <div className="flex items-center gap-2 mb-3">
            <Droplets className="w-4 h-4 flex-shrink-0" style={{ color: DS.teal }} />
            <span
              className="text-xs font-medium text-hs-muted"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Leak Risk
            </span>
          </div>
          <div
            className="text-2xl font-semibold mb-0.5"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              color: (Math.round(insights.summary.leakageRisk || 0)) > 50 ? DS.red : DS.teal,
            }}
          >
            {Math.round(insights.summary.leakageRisk || 0)}%
          </div>
          <span
            className="hs-status-pill"
            style={{
              backgroundColor: (insights.summary.leakageRisk || 0) > 50 ? '#FDEAEA' : '#E8F5EE',
              color:           (insights.summary.leakageRisk || 0) > 50 ? DS.red : DS.green,
            }}
          >
            {(insights.summary.leakageRisk || 0) > 50 ? 'Elevated' : 'Normal'}
          </span>
        </div>

        {/* Anomalies — plain card */}
        <div className="hs-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: DS.amber }} />
            <span
              className="text-xs font-medium text-hs-muted"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Anomalies
            </span>
          </div>
          <div
            className="text-2xl font-semibold mb-0.5"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              color: (insights.summary.anomalyCount || 0) > 0 ? DS.amber : DS.ink,
            }}
          >
            {insights.summary.anomalyCount || 0}
          </div>
          <span
            className="hs-status-pill"
            style={{
              backgroundColor: (insights.summary.anomalyCount || 0) > 0 ? '#FEF4E6' : '#E8F5EE',
              color:           (insights.summary.anomalyCount || 0) > 0 ? DS.amber : DS.green,
            }}
          >
            {(insights.summary.anomalyCount || 0) > 0 ? 'Detected' : 'None'}
          </span>
        </div>

        {/* AI Confidence — plain card */}
        <div className="hs-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 flex-shrink-0" style={{ color: DS.green }} />
            <span
              className="text-xs font-medium text-hs-muted"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              AI Confidence
            </span>
          </div>
          <div
            className="text-2xl font-semibold text-hs-ink mb-0.5"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            {insights.summary.confidence || 0}%
          </div>
          {/* Mini confidence bar */}
          <div className="mt-2 h-1.5 bg-hs-border rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(insights.summary.confidence || 0, 100)}%`,
                backgroundColor: DS.green,
              }}
            />
          </div>
        </div>
      </div>

      {/* ── AI Insights list panel ─────────────────────────────────────────── */}
      <Card variant="default" animate={false}>
        <div className="p-6">

          {/* Panel header — same conditional/badge logic, restyled wrapper */}
          <div className="flex items-center gap-3 mb-5">
            <Brain className="w-4 h-4 flex-shrink-0" style={{ color: DS.teal }} />
            <h3
              className="text-sm font-semibold text-hs-ink flex-1"
              style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}
            >
              AI Intelligence Center
            </h3>
            {/* "Live Analysis" badge — same conditional logic, just restyled */}
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium"
              style={{
                fontFamily: 'Inter, sans-serif',
                backgroundColor: '#E8F5EE',
                color: DS.green,
                border: `1px solid ${DS.green}30`,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full inline-block animate-pulse"
                style={{ backgroundColor: DS.green }}
              />
              Live Analysis
            </span>
          </div>

          {/* ── Loading state — same condition, restyled ─────────────────── */}
          {loading ? (
            <div className="text-center py-10">
              <div
                className="w-6 h-6 border-2 border-t-transparent rounded-full mx-auto mb-3"
                style={{
                  borderColor: `${DS.teal}40`,
                  borderTopColor: DS.teal,
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <p
                className="text-sm text-hs-muted"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Analyzing sensor data patterns…
              </p>
            </div>

          ) : insights.insights.length > 0 ? (

            /* ── Insight rows — same map, same data refs, restyled cards ── */
            <div className="space-y-3">
              {insights.insights.map((insight, index) => {
                const IconComponent = getTypeIcon(insight.type)
                const priorityColor = getHsPriorityColor(insight.priority)

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <div
                      className="bg-white rounded-lg p-4 flex items-start gap-3"
                      style={{
                        border: `1px solid ${DS.border}`,
                        borderLeft: `3px solid ${priorityColor}`,
                      }}
                    >
                      <IconComponent
                        className="w-4 h-4 mt-0.5 flex-shrink-0"
                        style={{ color: priorityColor }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4
                            className="text-sm font-semibold text-hs-ink"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            {insight.title}
                          </h4>
                          <Badge
                            variant={getPriorityBadge(insight.priority)}
                            size="sm"
                            animate={false}
                          >
                            {insight.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <p
                          className="text-sm text-hs-muted mb-1.5 leading-snug"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {insight.message}
                        </p>
                        <p
                          className="text-xs"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            color: DS.teal,
                          }}
                        >
                          <span className="font-semibold">Recommended Action:</span>{' '}
                          {insight.action}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

          ) : (

            /* ── "System Operating Normally" — same condition, calm styling ─ */
            <div className="py-10 flex flex-col items-center text-center">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                style={{ backgroundColor: '#E8F5EE' }}
              >
                <CheckCircle className="w-5 h-5" style={{ color: DS.green }} />
              </div>
              <h4
                className="text-sm font-semibold mb-1"
                style={{
                  fontFamily: 'Space Grotesk, Inter, sans-serif',
                  color: DS.ink,
                }}
              >
                System Operating Normally
              </h4>
              <p
                className="text-xs text-hs-muted max-w-xs"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                AI analysis shows no anomalies or risks detected in current water usage patterns.
              </p>
            </div>
          )}

          {/* ── 24-Hour Prediction — same condition + data refs, restyled ── */}
          {insights.summary.predictedLoss > 0 && (
            <div
              className="mt-5 pt-5"
              style={{ borderTop: `1px solid ${DS.border}` }}
            >
              <h4
                className="text-sm font-semibold text-hs-ink mb-4"
                style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}
              >
                24-Hour Prediction
              </h4>
              <div className="grid grid-cols-3 gap-4">

                <div className="text-center">
                  <div
                    className="text-xl font-semibold text-hs-teal mb-0.5"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {insights.summary.predictedLoss?.toLocaleString() || 0}L
                  </div>
                  <div
                    className="text-xs text-hs-muted"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Predicted Usage
                  </div>
                </div>

                <div className="text-center">
                  <div
                    className="text-xl font-semibold text-hs-ink mb-0.5"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {insights.summary.confidence || 0}%
                  </div>
                  <div
                    className="text-xs text-hs-muted"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Confidence Level
                  </div>
                </div>

                <div className="text-center">
                  <div
                    className="text-xl font-semibold mb-0.5"
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      color: (insights.summary.predictedLoss || 0) > 2000 ? DS.red : DS.green,
                    }}
                  >
                    {(insights.summary.predictedLoss || 0) > 2000 ? 'HIGH' : 'NORMAL'}
                  </div>
                  <div
                    className="text-xs text-hs-muted"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Usage Level
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </Card>
    </div>
  )

  if (!animate) {
    return content
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      {content}
    </motion.div>
  )
}

export default AIInsightsPanel