import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, Badge, Button } from '../ui'
import { Flex } from '../layout'
import { AlertTriangle, Droplets, Shield, Zap, X, Bell, BellOff } from 'lucide-react'

const AlertManager = ({ 
  alerts = [],
  onDismiss = () => {},
  onMute = () => {},
  className = '',
  maxVisible = 5 
}) => {
  const [visibleAlerts, setVisibleAlerts] = useState([])
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    // Sort alerts by priority and timestamp
    const sortedAlerts = [...alerts].sort((a, b) => {
      const priorityOrder = { critical: 3, high: 2, medium: 1, low: 0 }
      const aPriority = priorityOrder[a.priority] || 0
      const bPriority = priorityOrder[b.priority] || 0
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority
      }
      
      return (b.timestamp || 0) - (a.timestamp || 0)
    })

    setVisibleAlerts(sortedAlerts.slice(0, maxVisible))
  }, [alerts, maxVisible])

  const getAlertIcon = (type) => {
    switch (type) {
      case 'leakage': return Droplets
      case 'theft': return Shield
      case 'tampering': return AlertTriangle
      case 'pressure': return Zap
      default: return AlertTriangle
    }
  }

  const getAlertColor = (priority) => {
    switch (priority) {
      case 'critical': return 'border-red-500/50 bg-red-500/5'
      case 'high': return 'border-red-400/50 bg-red-400/5'
      case 'medium': return 'border-yellow-400/50 bg-yellow-400/5'
      case 'low': return 'border-blue-400/50 bg-blue-400/5'
      default: return 'border-gray-400/50 bg-gray-400/5'
    }
  }

  const getBadgeVariant = (priority) => {
    switch (priority) {
      case 'critical': return 'error'
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'info'
      default: return 'default'
    }
  }

  const handleDismiss = (alertId) => {
    setVisibleAlerts(prev => prev.filter(alert => alert.id !== alertId))
    onDismiss(alertId)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    onMute(!isMuted)
  }

  if (visibleAlerts.length === 0) {
    return (
      <Card variant="default" className={`p-6 text-center ${className}`}>
        <Shield className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-400 mb-2">All Clear</h3>
        <p className="text-gray-400">No active alerts. System operating normally.</p>
      </Card>
    )
  }

  return (
    <div className={className}>
      {/* Alert Header */}
      <Card variant="neon" className="p-4 mb-4">
        <Flex align="center" justify="between" animate={false}>
          <Flex align="center" gap={3} animate={false}>
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h3 className="text-lg font-semibold text-white">Active Alerts</h3>
            <Badge variant="error" size="sm">{visibleAlerts.length}</Badge>
          </Flex>
          <Flex align="center" gap={2} animate={false}>
            <Button
              variant={isMuted ? 'secondary' : 'primary'}
              size="sm"
              onClick={toggleMute}
            >
              {isMuted ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
              {isMuted ? 'Unmute' : 'Mute'}
            </Button>
          </Flex>
        </Flex>
      </Card>

      {/* Alert List */}
      <div className="space-y-3">
        <AnimatePresence>
          {visibleAlerts.map((alert, index) => {
            const IconComponent = getAlertIcon(alert.type)
            const alertColor = getAlertColor(alert.priority)
            
            return (
              <motion.div
                key={alert.id || index}
                initial={{ opacity: 0, x: -50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.95 }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ scale: 1.02 }}
              >
                <Card 
                  variant="compact" 
                  className={`p-4 border ${alertColor} ${!isMuted ? 'animate-pulse' : ''}`}
                >
                  <Flex align="start" gap={4} animate={false}>
                    <motion.div
                      animate={!isMuted ? { 
                        rotate: [0, -10, 10, -10, 0],
                        scale: [1, 1.1, 1, 1.1, 1]
                      } : {}}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        repeatDelay: 3 
                      }}
                    >
                      <IconComponent className={`w-6 h-6 ${
                        alert.priority === 'critical' ? 'text-red-400' :
                        alert.priority === 'high' ? 'text-red-400' :
                        alert.priority === 'medium' ? 'text-yellow-400' :
                        'text-blue-400'
                      }`} />
                    </motion.div>
                    
                    <div className="flex-1">
                      <Flex align="center" gap={3} className="mb-2" animate={false}>
                        <h4 className="font-semibold text-white">
                          {alert.title || `${alert.type?.charAt(0).toUpperCase() + alert.type?.slice(1)} Alert`}
                        </h4>
                        <Badge variant={getBadgeVariant(alert.priority)} size="sm">
                          {alert.priority?.toUpperCase() || 'ALERT'}
                        </Badge>
                      </Flex>
                      
                      <p className="text-gray-300 mb-2">
                        {alert.message || 'System anomaly detected requiring attention'}
                      </p>
                      
                      <Flex align="center" justify="between" animate={false}>
                        <div className="text-xs text-gray-400">
                          {alert.timestamp ? 
                            new Date(alert.timestamp).toLocaleString() : 
                            'Just now'
                          }
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDismiss(alert.id || index)}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Dismiss
                        </Button>
                      </Flex>
                    </div>
                  </Flex>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Alert Summary */}
      {alerts.length > maxVisible && (
        <Card variant="compact" className="p-3 mt-4 text-center">
          <p className="text-sm text-gray-400">
            Showing {visibleAlerts.length} of {alerts.length} alerts
          </p>
        </Card>
      )}
    </div>
  )
}

export default AlertManager