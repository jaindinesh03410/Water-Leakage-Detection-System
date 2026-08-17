import React from 'react'
import { motion } from 'framer-motion'

const Section = ({ 
  children, 
  title,
  subtitle,
  spacing = 'default',
  className = '',
  animate = true,
  ...props 
}) => {
  const spacings = {
    tight: 'py-4',
    default: 'py-8',
    loose: 'py-12',
    none: ''
  }

  const sectionClass = `${spacings[spacing]} ${className}`

  const content = (
    <section className={sectionClass} {...props}>
      {(title || subtitle) && (
        <div className="mb-8">
          {title && (
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 neon-text">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-gray-300 text-lg">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  )

  if (!animate) {
    return content
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {content}
    </motion.div>
  )
}

export default Section