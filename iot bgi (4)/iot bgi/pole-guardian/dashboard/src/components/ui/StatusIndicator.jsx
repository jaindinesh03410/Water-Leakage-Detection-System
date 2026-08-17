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
    online: {
      color: 'bg-green-400',
      glow: 'shadow-green-400/60',
      text: 'Online'
    },
    offline: {
      color: 'bg-red-400',
      glow: 'shadow-red-400/60',
      text: 'Offline'
    },
    warning: {
      color: 'bg-yellow-400',
      glow: 'shadow-yellow-400/60',
      text: 'Warning'
    },
    critical: {
      color: 'bg-red-500',
      glow: 'shadow-red-500/60',
      text: 'Critical'
    },
    normal: {
      color: 'bg-green-500',
      glow: 'shadow-green-500/60',
      text: 'Normal'
    }
  }

  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }

  const { color, glow, text } = statuses[status]
  const displayLabel = label || text

  const indicatorClass = `
    ${sizes[size]} 
    ${color}
    rounded-full animate-pulse
  `.trim()

  const content = (
    <div className={`flex items-center gap-2 ${className}`} {...props}>
      <div className={indicatorClass}></div>
      {showLabel && (
        <span className="text-sm font-medium text-gray-300">
          {displayLabel}
        </span>
      )}
    </div>
  )

  if (!animate) {
    return content
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      {content}
    </motion.div>
  )
}

export default StatusIndicator