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
      bg:   'bg-[#F0FAF5]',
      border: 'border-[#2E9E6C]',
      title: 'text-[#1A6645]',
      body:  'text-[#2E9E6C]',
      iconColor: 'text-[#2E9E6C]',
    },

    error: {
      icon: XCircle,
      bg:   'bg-[#FEF2F2]',
      border: 'border-[#D14343]',
      title: 'text-[#991B1B]',
      body:  'text-[#D14343]',
      iconColor: 'text-[#D14343]',
    },
    warning: {
      icon: AlertTriangle,
      bg:   'bg-[#FEF4E6]',
      border: 'border-[#C97A1F]',
      title: 'text-[#7A4A0A]',
      body:  'text-[#C97A1F]',
      iconColor: 'text-[#C97A1F]',
    },
    info: {
      icon: Info,
      bg:   'bg-[#EEF6F6]',
      border: 'border-[#3E8E8C]',
      title: 'text-[#0F5C5B]',
      body:  'text-[#3E8E8C]',
      iconColor: 'text-[#0F5C5B]',
    }
  }

  const cfg = types[type] || types.info
  const Icon = cfg.icon

  const alertContent = (
    <div
      className={`
        ${cfg.bg} border-l-4 ${cfg.border}
        flex items-start gap-3 px-4 py-3 rounded-md
        ${className}
      `}
    >
      <Icon className={`w-4 h-4 mt-0.5 ${cfg.iconColor} flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        {title && (
          <p className={`text-sm font-semibold ${cfg.title}`}
             style={{ fontFamily: 'Inter, sans-serif' }}>
            {title}
          </p>
        )}
        {message && (
          <p className={`text-sm ${cfg.body} mt-0.5 opacity-90`}
             style={{ fontFamily: 'Inter, sans-serif' }}>
            {message}
          </p>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-hs-muted hover:text-hs-ink transition-colors flex-shrink-0"
          aria-label="Dismiss"
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
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {alertContent}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Alert