import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import Card from '../ui/Card.jsx'

// ── Design tokens (styling only — no data logic changed) ──────────────────────
const DS = {
  teal:      '#0F5C5B',
  tealLight: '#3E8E8C',
  muted:     '#5B6E6D',
  mutedBar:  '#C5D0CF',   // muted gray for Last Week bars
  ink:       '#132A2A',
  red:       '#D14343',
  green:     '#2E9E6C',
  amber:     '#C97A1F',
  border:    '#E1E7E6',
  grid:      '#E1E7E6',
}

const UsageChart = ({
  data = [],
  title = "Weekly Usage Analytics",
  className = '',
  height = 300,
  animate = true
}) => {
  // ── Data state — untouched ────────────────────────────────────────────────
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    // Generate weekly usage data
    const generateWeeklyData = () => {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      const currentDay = new Date().getDay()

      return days.map((day, index) => {
        const isPastDay = index < currentDay
        const isToday = index === currentDay

        let usage
        if (isPastDay) {
          // Past days: realistic usage data
          usage = 800 + Math.random() * 600 + (index < 5 ? 200 : -100) // Weekdays higher
        } else if (isToday) {
          // Today: current accumulated usage
          const currentHour = new Date().getHours()
          usage = (currentHour / 24) * (1000 + Math.random() * 400)
        } else {
          // Future days: projected usage
          usage = 900 + Math.random() * 300
        }

        const lastWeekUsage = usage * (0.85 + Math.random() * 0.3) // Last week comparison

        return {
          day,
          usage: Math.round(usage),
          lastWeek: Math.round(lastWeekUsage),
          target: 1200, // Daily target
          isPastDay,
          isToday,
          efficiency: Math.round((usage / 1200) * 100)
        }
      })
    }

    setChartData(generateWeeklyData())
  }, [data])

  // ── Stats computation — untouched ────────────────────────────────────────
  const totalThisWeek = chartData.reduce((sum, day) => sum + (day.isPastDay || day.isToday ? day.usage : 0), 0)
  const totalLastWeek = chartData.reduce((sum, day) => sum + day.lastWeek, 0)
  const weeklyChange = totalLastWeek > 0 ? ((totalThisWeek - totalLastWeek) / totalLastWeek * 100) : 0

  // ── Restyled tooltip — same data variables ────────────────────────────────
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dayData = payload[0].payload
      const effColor =
        dayData.efficiency > 100 ? DS.red :
        dayData.efficiency > 80  ? DS.amber :
        DS.green

      return (
        <div style={{
          background: '#FFFFFF',
          border: `1px solid ${DS.border}`,
          borderRadius: 6,
          padding: '8px 12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          minWidth: 160,
        }}>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 11,
            fontWeight: 600,
            color: DS.ink,
            marginBottom: 6,
          }}>
            {`${label} Usage`}
          </p>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12,
            color: DS.teal,
            marginBottom: 2,
          }}>
            {`This Week: ${payload[0].value.toLocaleString()} L`}
          </p>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12,
            color: DS.muted,
            marginBottom: 2,
          }}>
            {`Last Week: ${payload[1].value.toLocaleString()} L`}
          </p>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12,
            color: DS.muted,
            marginBottom: 4,
          }}>
            {`Target: ${dayData.target.toLocaleString()} L`}
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 11,
            fontWeight: 500,
            color: effColor,
          }}>
            {`Efficiency: ${dayData.efficiency}%`}
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
            Daily consumption patterns and efficiency tracking
          </p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: DS.teal }} />
            <span className="text-xs text-hs-muted" style={{ fontFamily: 'Inter, sans-serif' }}>
              This Week
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: DS.mutedBar }} />
            <span className="text-xs text-hs-muted" style={{ fontFamily: 'Inter, sans-serif' }}>
              Last Week
            </span>
          </div>
        </div>
      </div>

      {/* Chart — data props entirely untouched */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
            {/* Horizontal-only light gridlines */}
            <CartesianGrid
              horizontal={true}
              vertical={false}
              stroke={DS.grid}
              strokeDasharray="0"
            />
            <XAxis
              dataKey="day"
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
                value: 'Liters',
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

            {/* Teal primary bars — same dataKey */}
            <Bar
              dataKey="usage"
              fill={DS.teal}
              radius={[2, 2, 0, 0]}
              name="This Week"
            />
            {/* Muted gray secondary bars — same dataKey */}
            <Bar
              dataKey="lastWeek"
              fill={DS.mutedBar}
              radius={[2, 2, 0, 0]}
              name="Last Week"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom stats — same data variables, JetBrains Mono for numbers */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">

        <div className="text-center">
          <div
            className="text-base font-semibold text-hs-teal mb-0.5"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            {totalThisWeek.toLocaleString()}L
          </div>
          <div
            className="text-xs text-hs-muted"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            This Week
          </div>
        </div>

        <div className="text-center">
          <div
            className="text-base font-semibold text-hs-muted mb-0.5"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            {totalLastWeek.toLocaleString()}L
          </div>
          <div
            className="text-xs text-hs-muted"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Last Week
          </div>
        </div>

        <div className="text-center">
          <div
            className="text-base font-semibold mb-0.5"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              color: weeklyChange > 0 ? DS.red : DS.green,
            }}
          >
            {weeklyChange > 0 ? '+' : ''}{weeklyChange.toFixed(1)}%
          </div>
          <div
            className="text-xs text-hs-muted"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Change
          </div>
        </div>

        <div className="text-center">
          <div
            className="text-base font-semibold text-hs-teal-light mb-0.5"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            8,400L
          </div>
          <div
            className="text-xs text-hs-muted"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Weekly Target
          </div>
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
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      {content}
    </motion.div>
  )
}

export default UsageChart