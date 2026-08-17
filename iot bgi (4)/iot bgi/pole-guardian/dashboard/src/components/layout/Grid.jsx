import React from 'react'
import { motion } from 'framer-motion'

const Grid = ({ 
  children, 
  cols = 4, 
  gap = 6, 
  className = '',
  animate = true,
  ...props 
}) => {
  const getGridClass = () => {
    const gapClass = `gap-${gap}`
    
    switch (cols) {
      case 1:
        return `grid grid-cols-1 ${gapClass}`
      case 2:
        return `grid grid-cols-1 md:grid-cols-2 ${gapClass}`
      case 3:
        return `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${gapClass}`
      case 4:
        return `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 ${gapClass}`
      case 6:
        return `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 ${gapClass}`
      default:
        return `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 ${gapClass}`
    }
  }

  const gridClass = `${getGridClass()} ${className}`

  if (!animate) {
    return (
      <div className={gridClass} {...props}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, staggerChildren: 0.1 }}
      className={gridClass}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

export default Grid