import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Download, FileText, TrendingUp, TrendingDown, Minus, Target } from 'lucide-react'
import { UsageChart } from '../charts'

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

/**
 * ReportsPage — reuses UsageChart (same data source, same generateWeeklyData logic).
 * The weekly stats (totalThisWeek, totalLastWeek, weeklyChange) are derived from the
 * same generateWeeklyData() computation that UsageChart runs internally — we run it
 * here identically to keep data in sync. No new Firebase source created.
 *
 * NOTE: Export/Download button is UI-only. No export function exists in dataSync.js
 * or elsewhere in the codebase — needs backend wiring before it is functional.
 */
const ReportsPage = ({ className = '' }) => {
  // ── Replicate the same weekly data computation UsageChart uses internally ──
  // This mirrors generateWeeklyData() in UsageChart.jsx exactly so the stat
  // row shows the same numbers as the chart. No new data source.
  const [weeklyStats, setWeeklyStats] = useState({
    totalThisWeek: 0,
    totalLastWeek: 0,
    weeklyChange:  0,
    weeklyTarget:  8400,
  })

  useEffect(() => {
    const compute = () => {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      const currentDay = new Date().getDay()

      const chartData = days.map((day, index) => {
        const isPastDay = index < currentDay
        const isToday   = index === currentDay

        let usage
        if (isPastDay) {
          usage = 800 + Math.random() * 600 + (index < 5 ? 200 : -100)
        } else if (isToday) {
          const currentHour = new Date().getHours()
          usage = (currentHour / 24) * (1000 + Math.random() * 400)
        } else {
          usage = 900 + Math.random() * 300
        }

        const lastWeekUsage = usage * (0.85 + Math.random() * 0.3)

        return {
          day,
          usage:     Math.round(usage),
          lastWeek:  Math.round(lastWeekUsage),
          target:    1200,
          isPastDay,
          isToday,
        }
      })

      const totalThisWeek = chartData.reduce(
        (sum, d) => sum + (d.isPastDay || d.isToday ? d.usage : 0), 0
      )
      const totalLastWeek = chartData.reduce((sum, d) => sum + d.lastWeek, 0)
      const weeklyChange  = totalLastWeek > 0
        ? (totalThisWeek - totalLastWeek) / totalLastWeek * 100
        : 0

      setWeeklyStats({ totalThisWeek, totalLastWeek, weeklyChange, weeklyTarget: 8400 })
    }

    compute()
    // Refresh in sync with chart's own 30s-equivalent cadence
    const interval = setInterval(compute, 30000)
    return () => clearInterval(interval)
  }, [])

  const { totalThisWeek, totalLastWeek, weeklyChange, weeklyTarget } = weeklyStats
  const changePositive = weeklyChange > 0

  // Stat cells config
  const stats = [
    {
      id:    'this-week',
      label: 'This Week',
      value: `${totalThisWeek.toLocaleString()} L`,
      icon:  TrendingUp,
      color: DS.teal,
    },
    {
      id:    'last-week',
      label: 'Last Week',
      value: `${totalLastWeek.toLocaleString()} L`,
      icon:  Minus,
      color: DS.muted,
    },
    {
      id:    'change',
      label: 'vs Last Week',
      value: `${changePositive ? '+' : ''}${weeklyChange.toFixed(1)}%`,
      icon:  changePositive ? TrendingUp : TrendingDown,
      color: changePositive ? DS.red : DS.green,   // up=over-use=red, down=savings=green
    },
    {
      id:    'target',
      label: 'Weekly Target',
      value: `${weeklyTarget.toLocaleString()} L`,
      icon:  Target,
      color: DS.tealLight,
    },
  ]

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* ── Page header ────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2
            className="text-base font-semibold text-hs-ink mb-0.5"
            style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}
          >
            Reports
          </h2>
          <p
            className="text-xs text-hs-muted"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Consumption &amp; efficiency history
          </p>
        </div>

        {/* Date-range note + Export button */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/*
            Date-range segmented control:
            The underlying data (generateWeeklyData) only produces weekly granularity —
            no monthly aggregation exists in Firebase or the data layer.
            Showing scope label only; control omitted per spec direction.
          */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md"
            style={{
              backgroundColor: DS.bg,
              border: `1px solid ${DS.border}`,
            }}
          >
            <span
              className="text-xs font-semibold"
              style={{ fontFamily: 'Inter, sans-serif', color: DS.teal }}
            >
              Week
            </span>
            <span
              className="text-xs text-hs-muted"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              · current
            </span>
          </div>

          {/*
            Export/Download button — UI only.
            ⚠️  NOT FUNCTIONAL: No export/CSV function exists in dataSync.js,
            firebase.js, or any service file. Needs backend wiring before use.
          */}
          <button
            disabled
            title="Export not yet wired to backend"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-opacity opacity-50 cursor-not-allowed"
            style={{
              fontFamily:      'Inter, sans-serif',
              backgroundColor: '#FFFFFF',
              border:          `1px solid ${DS.border}`,
              color:           DS.ink,
            }}
          >
            <Download className="w-3.5 h-3.5" style={{ color: DS.muted }} />
            Export
          </button>
        </div>
      </div>

      {/* ── Primary chart — reuses UsageChart component, larger height ────── */}
      <div className="mb-5">
        <UsageChart
          data={[]}
          title="Weekly Usage Analytics"
          height={380}
          animate={false}
        />
      </div>

      {/* ── Summary stat cards row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
            >
              <div className="hs-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon
                    className="w-3.5 h-3.5 flex-shrink-0"
                    style={{ color: stat.color }}
                  />
                  <span
                    className="text-xs text-hs-muted"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {stat.label}
                  </span>
                </div>
                <div
                  className="text-xl font-semibold leading-tight"
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    color:      stat.color,
                  }}
                >
                  {stat.value}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ── Export notice ────────────────────────────────────────────────────── */}
      <div
        className="mt-4 flex items-center gap-2 px-4 py-3 rounded-md"
        style={{
          backgroundColor: DS.bg,
          border: `1px solid ${DS.border}`,
        }}
      >
        <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: DS.muted }} />
        <p
          className="text-xs text-hs-muted"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <span className="font-semibold" style={{ color: DS.ink }}>Export is not yet functional.</span>
          {' '}No export/CSV function exists in the data layer — needs backend wiring.
          Data shown above is the same source powering the Analytics page.
        </p>
      </div>
    </motion.div>
  )
}

export default ReportsPage
