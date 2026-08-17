import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import Card from '../ui/Card.jsx'

const FlowChart = ({ 
  data = [], 
  title = "Real-time Flow Rate",
  className = '',
  height = 300,
  animate = true 
}) => {
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    // Process incoming data for chart display
    const processedData = data.slice(-20).map((reading, index) => ({
      time: new Date(reading.timestamp || Date.now() - (19 - index) * 5000).toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      flow: reading.flow || 0,
      timestamp: reading.timestamp || Date.now() - (19 - index) * 5000
    }))

    setChartData(processedData)
  }, [data])

  // Generate demo data if no real data available
  useEffect(() => {
    if (data.length === 0) {
      const demoData = Array.from({ length: 20 }, (_, i) => {
        const timestamp = Date.now() - (19 - i) * 5000
        const baseFlow = 15 + Math.sin(i * 0.3) * 8
        const noise = (Math.random() - 0.5) * 4
        return {
          time: new Date(timestamp).toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          flow: Math.max(0, baseFlow + noise),
          timestamp
        }
      })
      setChartData(demoData)
    }
  }, [data.length])

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 border border-accent-blue/20">
          <p className="text-accent-blue font-medium">{`Time: ${label}`}</p>
          <p className="text-accent-cyan">
            {`Flow Rate: ${payload[0].value.toFixed(2)} L/min`}
          </p>
        </div>
      )
    }
    return null
  }

  const content = (
    <Card variant="neon" className={`p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-400">Live sensor data updated every 5 seconds</p>
      </div>
      
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
              label={{ value: 'L/min', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="flow" 
              stroke="#00d4ff" 
              strokeWidth={2}
              dot={{ fill: '#00d4ff', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: '#00ffff', strokeWidth: 2, fill: '#00d4ff' }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 flex justify-between items-center text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-accent-blue rounded-full"></div>
            <span className="text-gray-400">Flow Rate</span>
          </div>
          <div className="text-accent-cyan">
            Current: {chartData.length > 0 ? chartData[chartData.length - 1]?.flow.toFixed(2) : '0.00'} L/min
          </div>
        </div>
        <div className="text-gray-400">
          Last updated: {chartData.length > 0 ? new Date().toLocaleTimeString() : 'No data'}
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
      transition={{ duration: 0.6 }}
    >
      {content}
    </motion.div>
  )
}

export default FlowChart