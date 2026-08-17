import React from 'react'
import { motion } from 'framer-motion'

const Container = ({ 
  children, 
  size = 'default',
  className = '',
  animate = true,
  ...props 
}) => {
  const sizes = {
    sm: 'max-w-4xl',
    default: 'max-w-7xl',
    lg: 'max-w-full',
    fluid: 'w-full'
  }

  const containerClass = `
    ${sizes[size]} 
    mx-auto px-4 sm:px-6 lg:px-8 
    ${className}
  `.trim()

  if (!animate) {
    return (
      <div className={containerClass} {...props}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className={containerClass}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default Container