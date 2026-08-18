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
    default: 'bg-hs-bg text-hs-muted border border-hs-border',
    success: 'bg-[#E8F5EE] text-[#2E9E6C] border border-[#2E9E6C]/30',
    error:   'bg-[#FDEAEA] text-[#D14343] border border-[#D14343]/30',
    warning: 'bg-[#FEF4E6] text-[#C97A1F] border border-[#C97A1F]/30',
    info:    'bg-[#EEF6F6] text-[#0F5C5B] border border-[#0F5C5B]/30',
    neon:    'bg-transparent text-[#0F5C5B] border border-[#0F5C5B]',  // legacy alias
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  }

  const badgeClass = `
    ${variants[variant] ?? variants.default}
    ${sizes[size] ?? sizes.md}
    ${className}
    inline-flex items-center rounded font-medium
  `.trim()

  if (!animate) {
    return (
      <span
        className={badgeClass}
        style={{ fontFamily: 'Inter, sans-serif' }}
        {...props}
      >
        {children}
      </span>
    )
  }

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={badgeClass}
      style={{ fontFamily: 'Inter, sans-serif' }}
      {...props}
    >
      {children}
    </motion.span>
  )
}

export default Badge