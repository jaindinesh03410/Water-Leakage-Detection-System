import React from 'react'
import { motion } from 'framer-motion'

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  ...props
}) => {
  const variants = {
    primary:   'bg-hs-teal hover:bg-hs-teal-light text-white border border-hs-teal',
    secondary: 'bg-white hover:bg-hs-bg text-hs-teal border border-hs-teal',
    ghost:     'hover:bg-hs-bg text-hs-teal border border-transparent',
    neon:      'bg-white hover:bg-hs-bg text-hs-teal border border-hs-teal',   // legacy alias
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm',
  }

  const buttonClass = `
    ${variants[variant] ?? variants.primary}
    ${sizes[size] ?? sizes.md}
    ${className}
    rounded-md font-medium transition-all duration-150
    disabled:opacity-40 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-hs-teal/40
    inline-flex items-center gap-2
  `.trim()

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={buttonClass}
      disabled={disabled}
      onClick={onClick}
      style={{ fontFamily: 'Inter, sans-serif' }}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export default Button