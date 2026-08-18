import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, Badge, StatusIndicator } from '../ui'
import { Grid, Flex } from '../layout'
import { Droplets, Thermometer, Zap, AlertCircle, CheckCircle, XCircle, Activity } from 'lucide-react'

// ── Design tokens (styling only — no data logic changed) ──────────────────────
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

// Rating → HydroSense color (same rating values, only token changes)
const RATING_COLOR = {
  excellent: DS.green,
  good:      DS.teal,
  fair:      DS.amber,
  poor:      DS.red,
}

// Status → HydroSense color (EXCELLENT→green, FAIR→amber, POOR→red, GOOD→teal)
const STATUS_COLOR = {
  excellent: DS.green,
  good:      DS.teal,
  fair:      DS.amber,
  poor:      DS.red,
  unknown:   DS.muted,
}

// Status → pill background
const STATUS_BG = {
  excellent: '#E8F5EE',
  good:      '#EEF6F6',
  fair:      '#FEF4E6',
  poor:      '#FDEAEA',
  unknown:   DS.bg,
}

const WaterQualityPanel = ({
  qualityData = null,
  className = '',
  animate = true
}) => {
  // ── Data state — untouched ────────────────────────────────────────────────
  const [quality, setQuality] = useState({
    ph: 7.2,
    temperature: 22,
    chlorine: 0.5,
    turbidity: 1.2,
    overallRating: 'good',
    lastUpdate: Date.now()
  })

  useEffect(() => {
    // Use provided data or generate realistic demo data
    if (qualityData) {
      setQuality(qualityData)
    } else {
      // Generate realistic water quality data
      const generateQualityData = () => {
        const baseValues = {
          ph: 6.8 + Math.random() * 0.8,
          temperature: 18 + Math.random() * 8,
          chlorine: 0.2 + Math.random() * 0.6,
          turbidity: 0.5 + Math.random() * 2,
          lastUpdate: Date.now()
        }

        // Calculate overall rating
        let score = 100

        if (baseValues.ph < 6.0 || baseValues.ph > 9.0) score -= 25
        else if (baseValues.ph < 6.5 || baseValues.ph > 8.5) score -= 10

        if (baseValues.chlorine < 0.1 || baseValues.chlorine > 2.0) score -= 20
        else if (baseValues.chlorine > 1.0) score -= 5

        if (baseValues.turbidity > 4) score -= 25
        else if (baseValues.turbidity > 2) score -= 10

        const rating = score >= 85 ? 'excellent' :
                      score >= 70 ? 'good' :
                      score >= 50 ? 'fair' : 'poor'

        setQuality({
          ...baseValues,
          overallRating: rating,
          score: Math.max(score, 0)
        })
      }

      generateQualityData()

      // Update every 30 seconds
      const interval = setInterval(generateQualityData, 30000)
      return () => clearInterval(interval)
    }
  }, [qualityData])

  // ── Logic helpers — untouched ─────────────────────────────────────────────
  const getQualityStatus = (parameter, value) => {
    const thresholds = {
      ph:          { excellent: [6.5, 8.5], good: [6.0, 9.0], fair: [5.5, 9.5] },
      temperature: { excellent: [18, 25],   good: [15, 30],   fair: [10, 35] },
      chlorine:    { excellent: [0.2, 1.0], good: [0.1, 1.5], fair: [0.05, 2.0] },
      turbidity:   { excellent: [0, 1],     good: [0, 2],     fair: [0, 4] }
    }

    const ranges = thresholds[parameter]
    if (!ranges) return 'unknown'

    if (value >= ranges.excellent[0] && value <= ranges.excellent[1]) return 'excellent'
    if (value >= ranges.good[0]      && value <= ranges.good[1])      return 'good'
    if (value >= ranges.fair[0]      && value <= ranges.fair[1])      return 'fair'
    return 'poor'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-400'
      case 'good':      return 'text-blue-400'
      case 'fair':      return 'text-yellow-400'
      case 'poor':      return 'text-red-400'
      default:          return 'text-gray-400'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent': return CheckCircle
      case 'good':      return CheckCircle
      case 'fair':      return AlertCircle
      case 'poor':      return XCircle
      default:          return AlertCircle
    }
  }

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'excellent': return 'text-green-400'
      case 'good':      return 'text-blue-400'
      case 'fair':      return 'text-yellow-400'
      case 'poor':      return 'text-red-400'
      default:          return 'text-gray-400'
    }
  }

  // ── parameters array — untouched ──────────────────────────────────────────
  const parameters = [
    {
      name: 'pH Level',
      value: quality.ph,
      unit: '',
      icon: Zap,
      description: 'Acidity/Alkalinity',
      status: getQualityStatus('ph', quality.ph)
    },
    {
      name: 'Temperature',
      value: quality.temperature,
      unit: '°C',
      icon: Thermometer,
      description: 'Water Temperature',
      status: getQualityStatus('temperature', quality.temperature)
    },
    {
      name: 'Chlorine',
      value: quality.chlorine,
      unit: 'ppm',
      icon: Droplets,
      description: 'Disinfectant Level',
      status: getQualityStatus('chlorine', quality.chlorine)
    },
    {
      name: 'Turbidity',
      value: quality.turbidity,
      unit: 'NTU',
      icon: Droplets,
      description: 'Water Clarity',
      status: getQualityStatus('turbidity', quality.turbidity)
    }
  ]

  // Derived display values (styling helpers — data values unchanged)
  const ratingColor  = RATING_COLOR[quality.overallRating]  ?? DS.muted
  const scoreValue   = Math.round(quality.score || 0)

  const content = (
    <div className={className}>

      {/* ── Quality Assessment card ──────────────────────────────────────── */}
      <div className="hs-card p-6 mb-5">
        {/* Top row: icon + label */}
        <div className="flex items-center gap-2 mb-4">
          <Droplets className="w-4 h-4" style={{ color: DS.teal }} />
          <span
            className="text-xs font-medium text-hs-muted uppercase tracking-wide"
            style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.06em' }}
          >
            Water Quality Assessment
          </span>
        </div>

        {/* Score + rating side by side — asymmetric emphasis */}
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            {/* EXCELLENT / rating word — large, prominent */}
            <div
              className="text-3xl font-bold mb-0.5"
              style={{
                fontFamily: 'Space Grotesk, Inter, sans-serif',
                color: ratingColor,
              }}
            >
              {quality.overallRating?.toUpperCase() || 'UNKNOWN'}
            </div>

            {/* Score numeric — JetBrains Mono, same conditional as before */}
            {quality.score && (
              <div
                className="text-sm text-hs-muted"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                Score:{' '}
                <span style={{ color: ratingColor, fontWeight: 600 }}>
                  {scoreValue}
                </span>
                /100
              </div>
            )}
          </div>

          {/* Badge — same variant conditional untouched */}
          <Badge
            variant={
              quality.overallRating === 'excellent' ? 'success' :
              quality.overallRating === 'good'      ? 'info'    :
              quality.overallRating === 'fair'      ? 'warning' : 'error'
            }
            size="md"
            animate={false}
          >
            {quality.overallRating === 'excellent' ? 'Safe for Consumption' :
             quality.overallRating === 'good'      ? 'Good Quality'         :
             quality.overallRating === 'fair'      ? 'Acceptable Quality'   : 'Requires Treatment'}
          </Badge>
        </div>

        {/* Score progress bar — new visual element, renders same quality.score value */}
        {quality.score && (
          <div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: DS.border }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(scoreValue, 100)}%`,
                  backgroundColor: ratingColor,
                }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span
                className="text-xs text-hs-muted"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                0
              </span>
              <span
                className="text-xs text-hs-muted"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                100
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Parameter cards — 2×2 grid ────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        {parameters.map((param, index) => {
          const IconComponent = param.icon
          const StatusIcon    = getStatusIcon(param.status)
          const statusColor   = STATUS_COLOR[param.status]  ?? DS.muted
          const statusBg      = STATUS_BG[param.status]     ?? DS.bg

          return (
            <motion.div
              key={param.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="hs-card p-4 h-full">
                {/* Header row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <IconComponent
                      className="w-3.5 h-3.5 flex-shrink-0"
                      style={{ color: DS.teal }}
                    />
                    <span
                      className="text-xs font-medium text-hs-muted"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {param.name}
                    </span>
                  </div>
                  <StatusIcon
                    className="w-3.5 h-3.5 flex-shrink-0"
                    style={{ color: statusColor }}
                  />
                </div>

                {/* Value — JetBrains Mono, same toFixed logic */}
                <div className="mb-2">
                  <span
                    className="text-2xl font-semibold"
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      color: DS.ink,
                    }}
                  >
                    {param.value.toFixed(param.name === 'pH Level' ? 1 : 0)}
                  </span>
                  {param.unit && (
                    <span
                      className="text-sm text-hs-muted ml-1"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {param.unit}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p
                  className="text-xs text-hs-muted mb-3"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {param.description}
                </p>

                {/* Status pill — same Badge variant conditional, mapped to HS tokens */}
                <span
                  className="hs-status-pill"
                  style={{ backgroundColor: statusBg, color: statusColor }}
                >
                  {param.status.toUpperCase()}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ── Quality Monitoring Status — sensor health card ────────────────── */}
      <div className="hs-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4" style={{ color: DS.teal }} />
          <h3
            className="text-sm font-semibold text-hs-ink"
            style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}
          >
            Quality Monitoring Status
          </h3>
        </div>

        {/* Sensor health row — same StatusIndicator props, same "Calibrated"/"Active" text */}
        <div className="grid grid-cols-2 gap-4 mb-4">

          <div className="flex items-center gap-3 p-3 rounded-md" style={{ backgroundColor: DS.bg }}>
            <StatusIndicator status="normal" size="md" showLabel={false} animate={false} />
            <div>
              <div
                className="text-sm font-medium text-hs-ink"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                pH Sensor
              </div>
              <div
                className="text-xs text-hs-muted"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Calibrated
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-md" style={{ backgroundColor: DS.bg }}>
            <StatusIndicator status="normal" size="md" showLabel={false} animate={false} />
            <div>
              <div
                className="text-sm font-medium text-hs-ink"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Temp Probe
              </div>
              <div
                className="text-xs text-hs-muted"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Active
              </div>
            </div>
          </div>

        </div>

        {/* Last Updated timestamp — same data ref untouched */}
        <div
          className="pt-4"
          style={{ borderTop: `1px solid ${DS.border}` }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-xs text-hs-muted"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Last Updated
            </span>
            <span
              className="text-xs font-medium text-hs-ink"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              {new Date(quality.lastUpdate).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

    </div>
  )

  if (!animate) {
    return content
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {content}
    </motion.div>
  )
}

export default WaterQualityPanel