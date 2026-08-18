import React, { useState, useEffect } from 'react'
import { Flex } from './index'
import { StatusIndicator } from '../ui'
import { Wifi, WifiOff, Activity, Server, Clock } from 'lucide-react'

/**
 * TopNavigation — now renders as the top header bar inside the main content panel
 * (the sidebar is rendered directly in App.jsx).
 * Props are unchanged so App.jsx requires no data-binding edits.
 */
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
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour:   '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <header
      className={`
        bg-white border-b border-hs-border px-6 py-4
        flex items-start justify-between gap-4
        ${className}
      `}
      {...props}
    >
      {/* Left: system title */}
      <div>
        <h1
          className="text-lg font-bold text-hs-ink leading-tight"
          style={{ fontFamily: 'Space Grotesk, Inter, sans-serif' }}
        >
          Smart Water Intelligence System
        </h1>
        <p
          className="text-xs text-hs-muted mt-0.5"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          HydroSense – Industrial IoT Water Monitoring
        </p>
      </div>

      {/* Right: inline status indicators + clock */}
      <div className="flex items-center gap-5 flex-shrink-0 flex-wrap justify-end">

        {/* System Online */}
        <StatusIndicator
          status={systemStatus}
          label={systemStatus === 'online' ? 'System Online' : 'System Offline'}
          size="sm"
          animate={false}
        />

        {/* Connected / Disconnected */}
        <div className="flex items-center gap-1.5">
          {deviceConnected
            ? <Wifi className="w-3.5 h-3.5 text-hs-teal" />
            : <WifiOff className="w-3.5 h-3.5 text-hs-red" />
          }
          <span
            className="text-xs text-hs-muted"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
          >
            {deviceConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Live */}
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-hs-teal" />
          <span
            className="text-xs text-hs-muted"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
          >
            Live
          </span>
        </div>

        {/* API Server */}
        <div className="flex items-center gap-1.5">
          <Server className="w-3.5 h-3.5 text-hs-muted" />
          <span
            className="text-xs text-hs-muted"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
          >
            API Server
          </span>
        </div>

        {/* Date + Time in JetBrains Mono */}
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-hs-muted" />
          <span
            className="text-xs text-hs-ink tabular-nums"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            {formatDate(currentTime)}&nbsp;&nbsp;{formatTime(currentTime)}
          </span>
        </div>
      </div>
    </header>
  )
}

export default TopNavigation