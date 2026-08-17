import React from 'react'
import { motion } from 'framer-motion'

const Badge = ({ 
  children, 
  variant = 'default',
  size = 'md',
  className = '',
  animate = true,
  ...props 
}) => {
  const variants = {
    default: 'bg-glass-light text-white border border-white/20',
    success: 'bg-green-500/20 text-green-400 border border-green-500/30',
    error: 'bg-red-500/20 text-red-400 border border-red-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    info: 'bg-accent-blue/20 text-accent-blue border border-accent-blue/30',
    neon: 'bg-transparent text-accent-blue border border-accent-blue'
  }

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  const badgeClass = `
    ${variants[variant]} 
    ${sizes[size]} 
    ${className}
    inline-flex items-center rounded-full font-medium
  `.trim()

  if (!animate) {
    return (
      <span className={badgeClass} {...props}>
        {children}
      </span>
    )
  }

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={badgeClass}
      {...props}
    >
      {children}
    </motion.span>
  )
}

export default Badge