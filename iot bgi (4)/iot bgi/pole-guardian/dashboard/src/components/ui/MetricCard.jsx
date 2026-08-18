import React from 'react'
import { motion } from 'framer-motion'
import Card from './Card.jsx'

const MetricCard = ({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  trendValue,
  status = 'normal',
  variant = 'default',
  emphasized = false,
  className = '',
  animate = true,
  ...props
}) => {
  // Status colors for value text
  const statusValueColors = {
    normal:   'text-hs-ink',
    warning:  'text-hs-amber',
    critical: 'text-hs-red',
    info:     'text-hs-teal'
  }

  // Trend indicator: colored arrow + text top-right
  const trendConfig = {
    up:     { arrow: '↑', color: 'text-hs-green' },
    down:   { arrow: '↓', color: 'text-hs-red' },
    stable: { arrow: '→', color: 'text-hs-muted' }
  }

  const td = trendConfig[trend] || trendConfig.stable

  const content = (
    <Card
      variant={variant}
      emphasized={emphasized}
      className={className}
      animate={false}
      {...props}
    >
      {/* Header row: label + trend indicator */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {Icon && (
            <Icon className="w-4 h-4 text-hs-teal flex-shrink-0" />
          )}
          <span
            className="text-sm font-medium text-hs-muted leading-tight"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {title}
          </span>
        </div>
        {trend && trendValue && (
          <span
            className={`text-xs font-medium ${td.color} flex items-center gap-0.5 flex-shrink-0 ml-2`}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {td.arrow} {trendValue}
          </span>
        )}
      </div>

      {/* Large numeric value */}
      <div className="mb-3 leading-none">
        <span
          className={`text-3xl font-semibold ${statusValueColors[status] || statusValueColors.normal}`}
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          {value}
        </span>
        {unit && (
          <span
            className="text-sm text-hs-muted ml-1.5"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {unit}
          </span>
        )}
      </div>

      {/* Status pill */}
      <span className={`hs-status-pill ${status}`}>
        {status === 'normal'    ? 'Normal Range' :
         status === 'warning'   ? 'Attention Required' :
         status === 'critical'  ? 'Critical Level' : 'Information'}
      </span>
    </Card>
  )

  if (!animate) return content

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {content}
    </motion.div>
  )
}

export default MetricCard