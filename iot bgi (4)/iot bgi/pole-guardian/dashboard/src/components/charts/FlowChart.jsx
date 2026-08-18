import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import Card from '../ui/Card.jsx'

// ── Design tokens (styling only — no data logic changed) ──────────────────────
const DS = {
  teal:    '#0F5C5B',
  border:  '#E1E7E6',
  muted:   '#5B6E6D',
  ink:     '#132A2A',
  red:     '#D14343',
  grid:    '#E1E7E6',
}

const FlowChart = ({
  data = [],
  title = "Real-time Flow Rate",
  className = '',
  height = 300,
  animate = true
}) => {
  // ── Data state — untouched ────────────────────────────────────────────────
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    // Process incoming data for chart display
    const processedData = data.slice(-20).map((reading, index) => ({
      time: new Date(reading.timestamp || Date.now() - (19 - index) * 5000).toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      flow: reading.flow || 0,
      timestamp: reading.timestamp || Date.now() - (19 - index) * 5000
    }))

    setChartData(processedData)
  }, [data])

  // Generate demo data if no real data available
  useEffect(() => {
    if (data.length === 0) {
      const demoData = Array.from({ length: 20 }, (_, i) => {
        const timestamp = Date.now() - (19 - i) * 5000
        const baseFlow = 15 + Math.sin(i * 0.3) * 8
        const noise = (Math.random() - 0.5) * 4
        return {
          time: new Date(timestamp).toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          flow: Math.max(0, baseFlow + noise),
          timestamp
        }
      })
      setChartData(demoData)
    }
  }, [data.length])

  // ── Restyled tooltip — same data variables ────────────────────────────────
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
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
          }}>
            {`${payload[0].value.toFixed(2)} L/min`}
          </p>
        </div>
      )
    }
    return null
  }

  const content = (
    <Card variant="default" className={className} animate={false}>
      {/* Card header */}
      <div className="mb-5 flex items-start justify-between">
        <div>
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
            Live sensor data updated every 5 seconds
          </p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span
            className="inline-block w-6 border-t-2"
            style={{ borderColor: DS.teal }}
          />
          <span
            className="text-xs text-hs-muted"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Flow Rate
          </span>
        </div>
      </div>

      {/* Chart — data props entirely untouched */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
            {/* Horizontal-only light gridlines, no vertical */}
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
              label={{
                value: 'L/min',
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
            {/* Teal primary line — same dataKey */}
            <Line
              type="monotone"
              dataKey="flow"
              stroke={DS.teal}
              strokeWidth={2}
              dot={{ fill: DS.teal, strokeWidth: 0, r: 2.5 }}
              activeDot={{ r: 5, stroke: DS.teal, strokeWidth: 2, fill: '#FFFFFF' }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer stats — same data variables, JetBrains Mono for numbers */}
      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <span
            className="text-xs text-hs-muted"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Current:
          </span>
          <span
            className="text-sm font-semibold text-hs-teal"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            {chartData.length > 0 ? chartData[chartData.length - 1]?.flow.toFixed(2) : '0.00'} L/min
          </span>
        </div>
        <span
          className="text-xs text-hs-muted"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          Last updated: {chartData.length > 0 ? new Date().toLocaleTimeString() : 'No data'}
        </span>
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
      transition={{ duration: 0.6 }}
    >
      {content}
    </motion.div>
  )
}

export default FlowChart