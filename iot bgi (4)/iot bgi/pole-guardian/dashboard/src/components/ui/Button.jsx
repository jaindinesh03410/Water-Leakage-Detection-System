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
    primary: 'bg-accent-blue hover:bg-accent-blue/80 text-white',
    secondary: 'bg-glass-light hover:bg-glass-light/80 text-white border border-white/10',
    ghost: 'hover:bg-glass-light text-accent-blue',
    neon: 'bg-transparent border border-accent-blue text-accent-blue hover:bg-accent-blue hover:text-primary'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  const buttonClass = `
    ${variants[variant]} 
    ${sizes[size]} 
    ${className}
    rounded-lg font-medium transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-accent-blue/50
  `.trim()

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      className={buttonClass}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export default Button