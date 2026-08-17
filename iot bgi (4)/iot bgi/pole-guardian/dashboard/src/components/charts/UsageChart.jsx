import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import Card from '../ui/Card.jsx'

const UsageChart = ({ 
  data = [], 
  title = "Weekly Usage Analytics",
  className = '',
  height = 300,
  animate = true 
}) => {
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    // Generate weekly usage data
    const generateWeeklyData = () => {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      const currentDay = new Date().getDay()
      
      return days.map((day, index) => {
        const isPastDay = index < currentDay
        const isToday = index === currentDay
        
        let usage
        if (isPastDay) {
          // Past days: realistic usage data
          usage = 800 + Math.random() * 600 + (index < 5 ? 200 : -100) // Weekdays higher
        } else if (isToday) {
          // Today: current accumulated usage
          const currentHour = new Date().getHours()
          usage = (currentHour / 24) * (1000 + Math.random() * 400)
        } else {
          // Future days: projected usage
          usage = 900 + Math.random() * 300
        }
        
        const lastWeekUsage = usage * (0.85 + Math.random() * 0.3) // Last week comparison
        
        return {
          day,
          usage: Math.round(usage),
          lastWeek: Math.round(lastWeekUsage),
          target: 1200, // Daily target
          isPastDay,
          isToday,
          efficiency: Math.round((usage / 1200) * 100)
        }
      })
    }

    setChartData(generateWeeklyData())
  }, [data])

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dayData = payload[0].payload
      return (
        <div className="glass-card p-3 border border-accent-cyan/20">
          <p className="text-accent-cyan font-medium">{`${label} Usage`}</p>
          <p className="text-white">
            {`This Week: ${payload[0].value.toLocaleString()} L`}
          </p>
          <p className="text-gray-300">
            {`Last Week: ${payload[1].value.toLocaleString()} L`}
          </p>
          <p className="text-gray-400">
            {`Target: ${dayData.target.toLocaleString()} L`}
          </p>
          <p className={dayData.efficiency > 100 ? 'text-red-400' : dayData.efficiency > 80 ? 'text-yellow-400' : 'text-green-400'}>
            {`Efficiency: ${dayData.efficiency}%`}
          </p>
        </div>
      )
    }
    return null
  }

  const totalThisWeek = chartData.reduce((sum, day) => sum + (day.isPastDay || day.isToday ? day.usage : 0), 0)
  const totalLastWeek = chartData.reduce((sum, day) => sum + day.lastWeek, 0)
  const weeklyChange = totalLastWeek > 0 ? ((totalThisWeek - totalLastWeek) / totalLastWeek * 100) : 0

  const content = (
    <Card variant="default" className={`p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-400">Daily consumption patterns and efficiency tracking</p>
      </div>
      
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="day" 
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
              label={{ value: 'Liters', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="usage" 
              fill="#00d4ff" 
              radius={[2, 2, 0, 0]}
              name="This Week"
            />
            <Bar 
              dataKey="lastWeek" 
              fill="#6b7280" 
              radius={[2, 2, 0, 0]}
              name="Last Week"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <div className="text-accent-blue font-semibold text-lg">
            {totalThisWeek.toLocaleString()}L
          </div>
          <div className="text-gray-400">This Week</div>
        </div>
        <div className="text-center">
          <div className="text-gray-400 font-semibold text-lg">
            {totalLastWeek.toLocaleString()}L
          </div>
          <div className="text-gray-400">Last Week</div>
        </div>
        <div className="text-center">
          <div className={`font-semibold text-lg ${weeklyChange > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {weeklyChange > 0 ? '+' : ''}{weeklyChange.toFixed(1)}%
          </div>
          <div className="text-gray-400">Change</div>
        </div>
        <div className="text-center">
          <div className="text-accent-cyan font-semibold text-lg">
            8,400L
          </div>
          <div className="text-gray-400">Weekly Target</div>
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
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      {content}
    </motion.div>
  )
}

export default UsageChart