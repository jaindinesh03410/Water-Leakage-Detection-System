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
  className = '',
  animate = true,
  ...props 
}) => {
  const statusColors = {
    normal: 'text-green-400',
    warning: 'text-yellow-400',
    critical: 'text-red-400',
    info: 'text-accent-blue'
  }

  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    stable: 'text-gray-400'
  }

  const content = (
    <Card variant={variant} className={className} animate={false} {...props}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-6 h-6 text-accent-blue" />}
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        {trend && trendValue && (
          <div className={`text-sm ${trendColors[trend]}`}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
          </div>
        )}
      </div>
      
      <div className="mb-2">
        <span className={`text-3xl font-bold ${statusColors[status]}`}>
          {value}
        </span>
        {unit && (
          <span className="text-lg text-gray-400 ml-2">
            {unit}
          </span>
        )}
      </div>
      
      <div className={`text-sm ${statusColors[status]} capitalize`}>
        {status === 'normal' ? 'Normal Range' : 
         status === 'warning' ? 'Attention Required' :
         status === 'critical' ? 'Critical Level' : 'Information'}
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
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      {content}
    </motion.div>
  )
}

export default MetricCard