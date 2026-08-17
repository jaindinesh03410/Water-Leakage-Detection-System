import React from 'react'
import { motion } from 'framer-motion'

const Flex = ({ 
  children, 
  direction = 'row',
  align = 'start',
  justify = 'start',
  wrap = false,
  gap = 4,
  className = '',
  animate = true,
  responsive = false,
  ...props 
}) => {
  const getFlexClass = () => {
    const baseClass = 'flex'
    
    // Direction
    const directionClass = responsive 
      ? `flex-col ${direction === 'row' ? 'md:flex-row' : 'md:flex-col'}`
      : `flex-${direction}`
    
    // Alignment
    const alignClass = `items-${align}`
    
    // Justify
    const justifyClass = `justify-${justify}`
    
    // Wrap
    const wrapClass = wrap ? 'flex-wrap' : ''
    
    // Gap
    const gapClass = `gap-${gap}`
    
    return `${baseClass} ${directionClass} ${alignClass} ${justifyClass} ${wrapClass} ${gapClass}`
  }

  const flexClass = `${getFlexClass()} ${className}`

  if (!animate) {
    return (
      <div className={flexClass} {...props}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, staggerChildren: 0.1 }}
      className={flexClass}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default Flex