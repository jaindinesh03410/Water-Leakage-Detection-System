import React from 'react'
import { motion } from 'framer-motion'

const Card = ({ 
  children, 
  className = '', 
  variant = 'default',
  animate = true,
  ...props 
}) => {
  const variants = {
    default: 'glass-card p-6',
    compact: 'glass-card p-4',
    large: 'glass-card p-8',
    neon: 'glass-card p-6 subtle-glow',
    gradient: 'gradient-border'
  }

  const cardClass = `${variants[variant]} ${className}`

  if (!animate) {
    return (
      <div className={cardClass} {...props}>
        {variant === 'gradient' ? <div className="p-6">{children}</div> : children}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className={cardClass}
      {...props}
    >
      {variant === 'gradient' ? <div className="p-6">{children}</div> : children}
    </motion.div>
  )
}

export default Card