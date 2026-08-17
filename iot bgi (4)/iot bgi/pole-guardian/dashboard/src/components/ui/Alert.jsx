import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react'

const Alert = ({ 
  type = 'info', 
  title, 
  message, 
  show = true, 
  onClose,
  className = '',
  animate = true 
}) => {
  const types = {
    success: {
      icon: CheckCircle,
      colors: 'border-green-500/50 bg-green-500/10 text-green-400',
      iconColor: 'text-green-400'
    },
    error: {
      icon: XCircle,
      colors: 'border-red-500/50 bg-red-500/10 text-red-400',
      iconColor: 'text-red-400'
    },
    warning: {
      icon: AlertTriangle,
      colors: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400',
      iconColor: 'text-yellow-400'
    },
    info: {
      icon: Info,
      colors: 'border-accent-blue/50 bg-accent-blue/10 text-accent-blue',
      iconColor: 'text-accent-blue'
    }
  }

  const { icon: Icon, colors, iconColor } = types[type]

  const alertContent = (
    <div className={`
      glass-card border ${colors} ${className}
      flex items-start gap-3 p-4 rounded-xl
    `}>
      <Icon className={`w-5 h-5 mt-0.5 ${iconColor} flex-shrink-0`} />
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        {message && <p className="text-sm opacity-90">{message}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )

  if (!animate) {
    return show ? alertContent : null
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          {alertContent}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Alert