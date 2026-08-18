import React, { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import Card from '../ui/Card.jsx'

// ── Design tokens (styling only — no data logic changed) ──────────────────────
const DS = {
  teal:       '#0F5C5B',
  tealLight:  '#3E8E8C',
  tealFill:   'rgba(15, 92, 91, 0.08)',
  amber:      '#C97A1F',
  red:        '#D14343',
  green:      '#2E9E6C',
  border:     '#E1E7E6',
  muted:      '#5B6E6D',
  ink:        '#132A2A',
  grid:       '#E1E7E6',
}

const PressureChart = ({
  data = [],
  title = "Pressure Fluctuation",
  className = '',
  height = 300,
  animate = true
}) => {
  // ── Data state — untouched ────────────────────────────────────────────────
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    // Process incoming data for chart display
    const processedData = data.slice(-15).map((reading, index) => {
      const pressure = reading.pressure || (reading.flow ? reading.flow * 0.1 + 1.5 : 2.0)
      return {
        time: new Date(reading.timestamp || Date.now() - (14 - index) * 10000).toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit'
        }),
        pressure: pressure,
        threshold: 2.5, // Normal operating threshold
        timestamp: reading.timestamp || Date.now() - (14 - index) * 10000
      }
    })

    setChartData(processedData)
  }, [data])

  // Generate demo data if no real data available
  useEffect(() => {
    if (data.length === 0) {
      const demoData = Array.from({ length: 15 }, (_, i) => {
        const timestamp = Date.now() - (14 - i) * 10000
        const basePressure = 2.2 + Math.sin(i * 0.2) * 0.3
        const noise = (Math.random() - 0.5) * 0.2
        return {
          time: new Date(timestamp).toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
          }),
          pressure: Math.max(0.5, basePressure + noise),
          threshold: 2.5,
          timestamp
        }
      })
      setChartData(demoData)
    }
  }, [data.length])

  // ── Status derivations — untouched ────────────────────────────────────────
  const currentPressure = chartData.length > 0 ? chartData[chartData.length - 1]?.pressure : 0
  const pressureStatus = currentPressure > 3 ? 'Critical' : currentPressure < 1 ? 'Low' : 'Normal'

  // Status color mapped to HydroSense tokens
  const statusColor =
    currentPressure > 3 ? DS.red :
    currentPressure < 1 ? DS.amber :
    DS.green

  // ── Restyled tooltip — same data variables ────────────────────────────────
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const pressure = payload[0].value
      const status = pressure > 3 ? 'Critical' : pressure < 1 ? 'Low' : 'Normal'
      const sColor = pressure > 3 ? DS.red : pressure < 1 ? DS.amber : DS.green

      return (
        <div style={{
          background: '#FFFFFF',
          border: `1px solid ${DS.border}`,
          borderRadius: 6,
          padding: '8px 12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 11,
            color: DS.muted,
            marginBottom: 4,
          }}>
            {label}
          </p>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 13,
            fontWeight: 600,
            color: DS.teal,
            marginBottom: 2,
          }}>
            {`${pressure.toFixed(2)} Bar`}
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 11,
            color: sColor,
            fontWeight: 500,
          }}>
            {`Status: ${status}`}
          </p>
        </div>
      )
    }
    return null
  }

  const content = (
    <Card variant="default" className={className} animate={false}>
      {/* Card header */}
      <div className="mb-5">
        <h3
          className="text-sm font-semibold text-hs-ink mb-0.5"
          style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}
        >
          {title}
        </h3>
        <p
          className="text-xs text-hs-muted"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          System pressure monitoring with thresholds
        </p>
      </div>

      {/* Chart — data props entirely untouched */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
            <defs>
              {/* Teal area fill instead of purple gradient */}
              <linearGradient id="pressureGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={DS.teal} stopOpacity={0.15} />
                <stop offset="95%" stopColor={DS.teal} stopOpacity={0.02} />
              </linearGradient>
            </defs>

            {/* Horizontal-only light gridlines */}
            <CartesianGrid
              horizontal={true}
              vertical={false}
              stroke={DS.grid}
              strokeDasharray="0"
            />
            <XAxis
              dataKey="time"
              stroke={DS.muted}
              tick={{ fill: DS.muted, fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={DS.muted}
              tick={{ fill: DS.muted, fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              domain={[0, 4]}
              label={{
                value: 'Bar',
                angle: -90,
                position: 'insideLeft',
                style: {
                  textAnchor: 'middle',
                  fill: DS.muted,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 10,
                }
              }}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Teal primary area — same dataKey */}
            <Area
              type="monotone"
              dataKey="pressure"
              stroke={DS.teal}
              strokeWidth={2}
              fill="url(#pressureGradient)"
              dot={{ fill: DS.teal, strokeWidth: 0, r: 2.5 }}
            />

            {/* Amber dashed threshold line (anomaly highlight color) */}
            <Area
              type="monotone"
              dataKey="threshold"
              stroke={DS.amber}
              strokeWidth={1.5}
              strokeDasharray="5 4"
              fill="none"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer — same data variables, JetBrains Mono for numbers */}
      <div className="mt-4 flex justify-between items-center">
        {/* Legend */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block w-5 border-t-2"
              style={{ borderColor: DS.teal }}
            />
            <span className="text-xs text-hs-muted" style={{ fontFamily: 'Inter, sans-serif' }}>
              Pressure
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block w-5 border-t border-dashed"
              style={{ borderColor: DS.amber }}
            />
            <span className="text-xs text-hs-muted" style={{ fontFamily: 'Inter, sans-serif' }}>
              Threshold (2.5 Bar)
            </span>
          </div>
        </div>

        {/* Live readings */}
        <div className="flex items-center gap-3">
          <span
            className="text-sm font-semibold text-hs-teal"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            {currentPressure.toFixed(2)} Bar
          </span>
          <span
            className="text-xs font-semibold"
            style={{ fontFamily: 'Inter, sans-serif', color: statusColor }}
          >
            {pressureStatus}
          </span>
        </div>
      </div>
    </Card>
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

export default PressureChart