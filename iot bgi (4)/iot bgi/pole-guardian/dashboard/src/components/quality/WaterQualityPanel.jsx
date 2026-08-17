import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, Badge, StatusIndicator } from '../ui'
import { Grid, Flex } from '../layout'
import { Droplets, Thermometer, Zap, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

const WaterQualityPanel = ({ 
  qualityData = null,
  className = '',
  animate = true 
}) => {
  const [quality, setQuality] = useState({
    ph: 7.2,
    temperature: 22,
    chlorine: 0.5,
    turbidity: 1.2,
    overallRating: 'good',
    lastUpdate: Date.now()
  })

  useEffect(() => {
    // Use provided data or generate realistic demo data
    if (qualityData) {
      setQuality(qualityData)
    } else {
      // Generate realistic water quality data
      const generateQualityData = () => {
        const baseValues = {
          ph: 6.8 + Math.random() * 0.8,
          temperature: 18 + Math.random() * 8,
          chlorine: 0.2 + Math.random() * 0.6,
          turbidity: 0.5 + Math.random() * 2,
          lastUpdate: Date.now()
        }

        // Calculate overall rating
        let score = 100
        
        if (baseValues.ph < 6.0 || baseValues.ph > 9.0) score -= 25
        else if (baseValues.ph < 6.5 || baseValues.ph > 8.5) score -= 10
        
        if (baseValues.chlorine < 0.1 || baseValues.chlorine > 2.0) score -= 20
        else if (baseValues.chlorine > 1.0) score -= 5
        
        if (baseValues.turbidity > 4) score -= 25
        else if (baseValues.turbidity > 2) score -= 10
        
        const rating = score >= 85 ? 'excellent' : 
                      score >= 70 ? 'good' : 
                      score >= 50 ? 'fair' : 'poor'

        setQuality({
          ...baseValues,
          overallRating: rating,
          score: Math.max(score, 0)
        })
      }

      generateQualityData()
      
      // Update every 30 seconds
      const interval = setInterval(generateQualityData, 30000)
      return () => clearInterval(interval)
    }
  }, [qualityData])

  const getQualityStatus = (parameter, value) => {
    const thresholds = {
      ph: { excellent: [6.5, 8.5], good: [6.0, 9.0], fair: [5.5, 9.5] },
      temperature: { excellent: [18, 25], good: [15, 30], fair: [10, 35] },
      chlorine: { excellent: [0.2, 1.0], good: [0.1, 1.5], fair: [0.05, 2.0] },
      turbidity: { excellent: [0, 1], good: [0, 2], fair: [0, 4] }
    }

    const ranges = thresholds[parameter]
    if (!ranges) return 'unknown'

    if (value >= ranges.excellent[0] && value <= ranges.excellent[1]) return 'excellent'
    if (value >= ranges.good[0] && value <= ranges.good[1]) return 'good'
    if (value >= ranges.fair[0] && value <= ranges.fair[1]) return 'fair'
    return 'poor'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-400'
      case 'good': return 'text-blue-400'
      case 'fair': return 'text-yellow-400'
      case 'poor': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent': return CheckCircle
      case 'good': return CheckCircle
      case 'fair': return AlertCircle
      case 'poor': return XCircle
      default: return AlertCircle
    }
  }

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'excellent': return 'text-green-400'
      case 'good': return 'text-blue-400'
      case 'fair': return 'text-yellow-400'
      case 'poor': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const parameters = [
    {
      name: 'pH Level',
      value: quality.ph,
      unit: '',
      icon: Zap,
      description: 'Acidity/Alkalinity',
      status: getQualityStatus('ph', quality.ph)
    },
    {
      name: 'Temperature',
      value: quality.temperature,
      unit: '°C',
      icon: Thermometer,
      description: 'Water Temperature',
      status: getQualityStatus('temperature', quality.temperature)
    },
    {
      name: 'Chlorine',
      value: quality.chlorine,
      unit: 'ppm',
      icon: Droplets,
      description: 'Disinfectant Level',
      status: getQualityStatus('chlorine', quality.chlorine)
    },
    {
      name: 'Turbidity',
      value: quality.turbidity,
      unit: 'NTU',
      icon: Droplets,
      description: 'Water Clarity',
      status: getQualityStatus('turbidity', quality.turbidity)
    }
  ]

  const content = (
    <div className={className}>
      {/* Overall Quality Rating */}
      <Card variant="large" className="p-6 mb-6 text-center">
        <Flex direction="column" align="center" gap={4} animate={false}>
          <Droplets className="w-12 h-12 text-accent-blue" />
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Water Quality Assessment</h2>
            <div className={`text-4xl font-bold mb-2 ${getRatingColor(quality.overallRating)}`}>
              {quality.overallRating?.toUpperCase() || 'UNKNOWN'}
            </div>
            {quality.score && (
              <div className="text-lg text-gray-300">
                Quality Score: {Math.round(quality.score)}/100
              </div>
            )}
          </div>
          <Badge 
            variant={
              quality.overallRating === 'excellent' ? 'success' :
              quality.overallRating === 'good' ? 'info' :
              quality.overallRating === 'fair' ? 'warning' : 'error'
            }
            size="lg"
          >
            {quality.overallRating === 'excellent' ? 'Safe for Consumption' :
             quality.overallRating === 'good' ? 'Good Quality' :
             quality.overallRating === 'fair' ? 'Acceptable Quality' : 'Requires Treatment'}
          </Badge>
        </Flex>
      </Card>

      {/* Quality Parameters */}
      <Grid cols={2} gap={4} className="mb-6">
        {parameters.map((param, index) => {
          const IconComponent = param.icon
          const StatusIcon = getStatusIcon(param.status)
          
          return (
            <motion.div
              key={param.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card variant="neon" className="p-4">
                <Flex align="center" gap={3} className="mb-3" animate={false}>
                  <IconComponent className="w-5 h-5 text-accent-blue" />
                  <h4 className="font-semibold text-white">{param.name}</h4>
                  <StatusIcon className={`w-4 h-4 ${getStatusColor(param.status)}`} />
                </Flex>
                
                <div className="mb-2">
                  <span className="text-2xl font-bold text-accent-cyan">
                    {param.value.toFixed(param.name === 'pH Level' ? 1 : 0)}
                  </span>
                  <span className="text-lg text-gray-400 ml-1">{param.unit}</span>
                </div>
                
                <div className="text-sm text-gray-400 mb-2">{param.description}</div>
                
                <Badge 
                  variant={
                    param.status === 'excellent' ? 'success' :
                    param.status === 'good' ? 'info' :
                    param.status === 'fair' ? 'warning' : 'error'
                  }
                  size="sm"
                >
                  {param.status.toUpperCase()}
                </Badge>
              </Card>
            </motion.div>
          )
        })}
      </Grid>

      {/* Quality Trends */}
      <Card variant="gradient" className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quality Monitoring Status</h3>
        
        <Grid cols={2} gap={4}>
          <div className="text-center">
            <StatusIndicator status="normal" size="lg" className="justify-center mb-2" />
            <div className="text-sm font-medium text-white">pH Sensor</div>
            <div className="text-xs text-gray-400">Calibrated</div>
          </div>
          
          <div className="text-center">
            <StatusIndicator status="normal" size="lg" className="justify-center mb-2" />
            <div className="text-sm font-medium text-white">Temp Probe</div>
            <div className="text-xs text-gray-400">Active</div>
          </div>
        </Grid>
        
        <div className="mt-4 pt-4 border-t border-gray-700 text-center">
          <div className="text-sm text-gray-400">
            Last Updated: {new Date(quality.lastUpdate).toLocaleString()}
          </div>
        </div>
      </Card>
    </div>
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

export default WaterQualityPanel