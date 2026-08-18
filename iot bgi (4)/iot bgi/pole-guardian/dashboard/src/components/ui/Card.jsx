import React from 'react'
import { motion } from 'framer-motion'

const Card = ({
  children,
  className = '',
  variant = 'default',
  emphasized = false,
  animate = true,
  ...props
}) => {
  const base = 'bg-white border rounded-lg p-6'
  const variants = {
    default:   `${base} border-hs-border shadow-card`,
    compact:   `bg-white border border-hs-border rounded-lg p-4 shadow-card`,
    large:     `${base} border-hs-border shadow-card p-8`,
    neon:      `${base} border-hs-border shadow-card`,       // legacy alias
    gradient:  `bg-white border border-hs-border rounded-lg shadow-card`, // legacy alias
  }

  const emphasizedClass = emphasized
    ? 'border-hs-teal border-[1.5px]'
    : ''

  const cardClass = `${variants[variant] ?? variants.default} ${emphasizedClass} ${className}`

  if (!animate) {
    return (
      <div className={cardClass} {...props}>
        {variant === 'gradient' ? <div className="p-6">{children}</div> : children}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cardClass}
      {...props}
    >
      {variant === 'gradient' ? <div className="p-6">{children}</div> : children}
    </motion.div>
  )
}

export default Card