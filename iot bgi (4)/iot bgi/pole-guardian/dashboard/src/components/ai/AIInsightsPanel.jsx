import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, Badge } from '../ui'
import { Grid, Flex } from '../layout'
import { Brain, TrendingUp, AlertTriangle, Droplets, Shield, Zap } from 'lucide-react'
import aiAnalyticsEngine from '../../services/aiAnalytics.js'

const AIInsightsPanel = ({ 
  currentReading = null,
  className = '',
  animate = true 
}) => {
  const [insights, setInsights] = useState({ insights: [], summary: {} })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentReading) {
      // Add reading to AI engine
      aiAnalyticsEngine.addReading(currentReading)
      
      // Generate insights
      const aiInsights = aiAnalyticsEngine.generateInsights(currentReading)
      setInsights(aiInsights)
      setLoading(false)
    }
  }, [currentReading])

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'info'
      default: return 'default'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'alert': return AlertTriangle
      case 'warning': return TrendingUp
      case 'info': return Brain
      default: return Zap
    }
  }

  const content = (
    <div className={className}>
      {/* AI Summary Cards */}
      <Grid cols={4} gap={4} className="mb-6">
        <Card variant="neon" className="p-4 text-center">
          <Shield className="w-6 h-6 text-accent-blue mx-auto mb-2" />
          <div className="text-2xl font-bold text-accent-blue">
            {insights.summary.theftRisk || 0}%
          </div>
          <div className="text-sm text-gray-400">Theft Risk</div>
        </Card>

        <Card variant="gradient" className="p-4 text-center">
          <Droplets className="w-6 h-6 text-accent-purple mx-auto mb-2" />
          <div className="text-2xl font-bold text-accent-purple">
            {Math.round(insights.summary.leakageRisk || 0)}%
          </div>
          <div className="text-sm text-gray-400">Leak Risk</div>
        </Card>

        <Card variant="default" className="p-4 text-center">
          <AlertTriangle className="w-6 h-6 text-accent-cyan mx-auto mb-2" />
          <div className="text-2xl font-bold text-accent-cyan">
            {insights.summary.anomalyCount || 0}
          </div>
          <div className="text-sm text-gray-400">Anomalies</div>
        </Card>

        <Card variant="compact" className="p-4 text-center">
          <Brain className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-400">
            {insights.summary.confidence || 0}%
          </div>
          <div className="text-sm text-gray-400">AI Confidence</div>
        </Card>
      </Grid>

      {/* AI Insights List */}
      <Card variant="large" className="p-6">
        <Flex align="center" gap={3} className="mb-6" animate={false}>
          <Brain className="w-6 h-6 text-accent-blue" />
          <h3 className="text-xl font-semibold text-white">AI Intelligence Center</h3>
          <Badge variant="neon" size="sm">Live Analysis</Badge>
        </Flex>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border border-accent-blue border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Analyzing sensor data patterns...</p>
          </div>
        ) : insights.insights.length > 0 ? (
          <div className="space-y-4">
            {insights.insights.map((insight, index) => {
              const IconComponent = getTypeIcon(insight.type)
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card variant="compact" className="p-4 border-l-4 border-l-accent-blue">
                    <Flex align="start" gap={4} animate={false}>
                      <IconComponent className={`w-5 h-5 mt-1 ${getPriorityColor(insight.priority)}`} />
                      <div className="flex-1">
                        <Flex align="center" gap={3} className="mb-2" animate={false}>
                          <h4 className="font-semibold text-white">{insight.title}</h4>
                          <Badge variant={getPriorityBadge(insight.priority)} size="sm">
                            {insight.priority.toUpperCase()}
                          </Badge>
                        </Flex>
                        <p className="text-gray-300 mb-2">{insight.message}</p>
                        <p className="text-sm text-accent-cyan">
                          <strong>Recommended Action:</strong> {insight.action}
                        </p>
                      </div>
                    </Flex>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-green-400 mb-2">System Operating Normally</h4>
            <p className="text-gray-400">
              AI analysis shows no anomalies or risks detected in current water usage patterns.
            </p>
          </div>
        )}

        {/* Prediction Summary */}
        {insights.summary.predictedLoss > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h4 className="text-lg font-semibold text-white mb-4">24-Hour Prediction</h4>
            <Grid cols={3} gap={4}>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-cyan">
                  {insights.summary.predictedLoss?.toLocaleString() || 0}L
                </div>
                <div className="text-sm text-gray-400">Predicted Usage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-purple">
                  {insights.summary.confidence || 0}%
                </div>
                <div className="text-sm text-gray-400">Confidence Level</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  (insights.summary.predictedLoss || 0) > 2000 ? 'text-red-400' : 'text-green-400'
                }`}>
                  {(insights.summary.predictedLoss || 0) > 2000 ? 'HIGH' : 'NORMAL'}
                </div>
                <div className="text-sm text-gray-400">Usage Level</div>
              </div>
            </Grid>
          </div>
        )}
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
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      {content}
    </motion.div>
  )
}

export default AIInsightsPanel