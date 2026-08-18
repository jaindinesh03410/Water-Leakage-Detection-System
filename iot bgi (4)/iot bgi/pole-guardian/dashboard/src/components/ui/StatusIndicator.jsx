import React from 'react'
import { motion } from 'framer-motion'

const StatusIndicator = ({
  status = 'online',
  label,
  size = 'md',
  className = '',
  animate = true,
  showLabel = true,
  ...props
}) => {
  const statuses = {
    online:   { color: '#2E9E6C', text: 'Online' },
    offline:  { color: '#D14343', text: 'Offline' },
    warning:  { color: '#C97A1F', text: 'Warning' },
    critical: { color: '#D14343', text: 'Critical' },
    normal:   { color: '#2E9E6C', text: 'Normal' },
  }

  const sizes = {
    sm: 6,
    md: 8,
    lg: 10,
  }

  const cfg = statuses[status] || statuses.normal
  const displayLabel = label || cfg.text
  const dotPx = sizes[size] ?? 8

  const content = (
    <div className={`flex items-center gap-1.5 ${className}`} {...props}>
      {/* Colored dot — only the dot gets the status color */}
      <span
        className="rounded-full flex-shrink-0 animate-pulse"
        style={{
          width: dotPx,
          height: dotPx,
          backgroundColor: cfg.color,
          display: 'inline-block',
        }}
      />
      {showLabel && (
        <span
          className="text-sm text-hs-muted"
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
        >
          {displayLabel}
        </span>
      )}
    </div>
  )

  if (!animate) return content

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {content}
    </motion.div>
  )
}

export default StatusIndicator