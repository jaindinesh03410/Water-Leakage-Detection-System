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
    tight:   'py-4',
    default: 'py-6',
    loose:   'py-10',
    none:    '',
  }

  const sectionClass = `${spacings[spacing] ?? spacings.default} ${className}`

  const content = (
    <section className={sectionClass} {...props}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h2
              className="text-base font-semibold text-hs-ink mb-0.5"
              style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p
              className="text-xs text-hs-muted"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  )

  if (!animate) return content

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {content}
    </motion.div>
  )
}

export default Section