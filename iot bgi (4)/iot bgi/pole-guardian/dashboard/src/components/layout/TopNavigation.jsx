import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Flex } from './index'
import { StatusIndicator } from '../ui'
import { Wifi, WifiOff, Clock, Activity, Server } from 'lucide-react'

const TopNavigation = ({ 
  systemStatus = 'online',
  deviceConnected = true,
  className = '',
  ...props 
}) => {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`glass-card border-b border-white/10 ${className}`}
      {...props}
    >
      <div className="px-6 py-4">
        {/* Main Title */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mb-4"
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold neon-text">
            Smart Water Intelligence System
          </h1>
          <p className="text-sm md:text-base text-gray-300 mt-1">
            PoleGuardian - Industrial IoT Water Monitoring
          </p>
        </motion.div>

        {/* Status Bar */}
        <Flex 
          direction="row" 
          justify="center" 
          align="center" 
          gap={6} 
          wrap={true}
          responsive={true}
          className="text-sm"
        >
          {/* System Status */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <StatusIndicator 
              status={systemStatus} 
              label={`System ${systemStatus === 'online' ? 'Online' : 'Offline'}`}
              size="md"
            />
          </motion.div>

          {/* Device Connection Status */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Flex align="center" gap={2} animate={false}>
              {deviceConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-accent-blue" />
                  <span className="text-accent-blue font-medium">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 font-medium">Disconnected</span>
                </>
              )}
            </Flex>
          </motion.div>

          {/* Live System Activity */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Flex align="center" gap={2} animate={false}>
              <Activity className="w-4 h-4 text-accent-cyan animate-pulse" />
              <span className="text-accent-cyan font-medium">Live</span>
            </Flex>
          </motion.div>

          {/* Server Status */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <Flex align="center" gap={2} animate={false}>
              <Server className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-medium">API Server</span>
            </Flex>
          </motion.div>

          {/* Date and Time */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            className="text-gray-300 text-center md:text-left"
          >
            <Flex align="center" gap={2} animate={false}>
              <Clock className="w-4 h-4 text-gray-400" />
              <div className="flex flex-col md:flex-row md:gap-2">
                <span className="font-medium">{formatDate(currentTime)}</span>
                <span className="text-accent-blue font-mono">
                  {formatTime(currentTime)}
                </span>
              </div>
            </Flex>
          </motion.div>
        </Flex>
      </div>
    </motion.nav>
  )
}

export default TopNavigation