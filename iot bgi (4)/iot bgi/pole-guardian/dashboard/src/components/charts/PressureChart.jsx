import React, { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import Card from '../ui/Card.jsx'

const PressureChart = ({ 
  data = [], 
  title = "Pressure Fluctuation",
  className = '',
  height = 300,
  animate = true 
}) => {
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    // Process incoming data for chart display
    const processedData = data.slice(-15).map((reading, index) => {
      const pressure = reading.pressure || (reading.flow ? reading.flow * 0.1 + 1.5 : 2.0)
      return {
        time: new Date(reading.timestamp || Date.now() - (14 - index) * 10000).toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit'
        }),
        pressure: pressure,
        threshold: 2.5, // Normal operating threshold
        timestamp: reading.timestamp || Date.now() - (14 - index) * 10000
      }
    })

    setChartData(processedData)
  }, [data])

  // Generate demo data if no real data available
  useEffect(() => {
    if (data.length === 0) {
      const demoData = Array.from({ length: 15 }, (_, i) => {
        const timestamp = Date.now() - (14 - i) * 10000
        const basePressure = 2.2 + Math.sin(i * 0.2) * 0.3
        const noise = (Math.random() - 0.5) * 0.2
        return {
          time: new Date(timestamp).toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
          }),
          pressure: Math.max(0.5, basePressure + noise),
          threshold: 2.5,
          timestamp
        }
      })
      setChartData(demoData)
    }
  }, [data.length])

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const pressure = payload[0].value
      const status = pressure > 3 ? 'Critical' : pressure < 1 ? 'Low' : 'Normal'
      const statusColor = pressure > 3 ? 'text-red-400' : pressure < 1 ? 'text-yellow-400' : 'text-green-400'
      
      return (
        <div className="glass-card p-3 border border-accent-purple/20">
          <p className="text-accent-purple font-medium">{`Time: ${label}`}</p>
          <p className="text-accent-cyan">
            {`Pressure: ${pressure.toFixed(2)} Bar`}
          </p>
          <p className={statusColor}>
            {`Status: ${status}`}
          </p>
        </div>
      )
    }
    return null
  }

  const currentPressure = chartData.length > 0 ? chartData[chartData.length - 1]?.pressure : 0
  const pressureStatus = currentPressure > 3 ? 'Critical' : currentPressure < 1 ? 'Low' : 'Normal'
  const statusColor = currentPressure > 3 ? 'text-red-400' : currentPressure < 1 ? 'text-yellow-400' : 'text-green-400'

  const content = (
    <Card variant="gradient" className={`p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-400">System pressure monitoring with thresholds</p>
      </div>
      
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="pressureGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="time" 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 4]}
              label={{ value: 'Bar', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="pressure" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              fill="url(#pressureGradient)"
              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 2 }}
            />
            <Area 
              type="monotone" 
              dataKey="threshold" 
              stroke="#fbbf24" 
              strokeWidth={1}
              strokeDasharray="5 5"
              fill="none"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 flex justify-between items-center text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-accent-purple rounded-full"></div>
            <span className="text-gray-400">Pressure</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border border-yellow-400 rounded-full"></div>
            <span className="text-gray-400">Threshold (2.5 Bar)</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-accent-purple">
            Current: {currentPressure.toFixed(2)} Bar
          </div>
          <div className={statusColor}>
            {pressureStatus}
          </div>
        </div>
      </div>
    </Card>
  )

  if (!animate) {
    return content
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {content}
    </motion.div>
  )
}

export default PressureChart