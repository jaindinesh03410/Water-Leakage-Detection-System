class AIAnalyticsEngine {
  constructor() {
    this.historicalData = []
    this.patterns = {
      normalUsage: { min: 10, max: 30, peak: 20 },
      offHoursThreshold: 5,
      leakageThreshold: 50,
      tamperSensitivity: 0.8
    }
  }

  // Add new sensor reading to historical data
  addReading(reading) {
    this.historicalData.push({
      ...reading,
      timestamp: reading.timestamp || Date.now()
    })
    
    // Keep only last 1000 readings for performance
    if (this.historicalData.length > 1000) {
      this.historicalData = this.historicalData.slice(-1000)
    }
  }

  // Calculate theft probability based on usage patterns
  calculateTheftRisk(currentReading) {
    if (!currentReading) return 0

    const currentHour = new Date().getHours()
    const isOffHours = currentHour < 6 || currentHour > 22
    const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6
    
    let riskScore = 0
    
    // Off-hours usage increases risk
    if (isOffHours && currentReading.flow > this.patterns.offHoursThreshold) {
      riskScore += 40
      
      // Higher flow during off-hours is more suspicious
      if (currentReading.flow > 15) riskScore += 30
      if (currentReading.flow > 25) riskScore += 20
    }
    
    // Weekend unusual patterns
    if (isWeekend && currentReading.flow > 20) {
      riskScore += 15
    }
    
    // Sudden flow spikes
    const recentReadings = this.getRecentReadings(10)
    if (recentReadings.length > 5) {
      const avgFlow = recentReadings.reduce((sum, r) => sum + r.flow, 0) / recentReadings.length
      const flowSpike = currentReading.flow / (avgFlow || 1)
      
      if (flowSpike > 2) riskScore += 25
      if (flowSpike > 3) riskScore += 15
    }
    
    // Consistent unusual flow patterns
    const hourlyPattern = this.analyzeHourlyPattern(currentHour)
    if (hourlyPattern.isUnusual) {
      riskScore += hourlyPattern.severity * 20
    }
    
    // Vibration + flow combination (potential tampering)
    if (currentReading.vib && currentReading.flow > 10) {
      riskScore += 35
    }
    
    return Math.min(Math.max(riskScore, 0), 100)
  }

  // Detect potential leaks
  detectLeakage(currentReading) {
    if (!currentReading) return { hasLeak: false, severity: 0, estimatedLoss: 0 }

    const recentReadings = this.getRecentReadings(20)
    if (recentReadings.length < 10) return { hasLeak: false, severity: 0, estimatedLoss: 0 }

    // Check for continuous high flow
    const avgFlow = recentReadings.reduce((sum, r) => sum + r.flow, 0) / recentReadings.length
    const minFlow = Math.min(...recentReadings.map(r => r.flow))
    
    // Leak indicators
    const hasHighContinuousFlow = avgFlow > this.patterns.leakageThreshold
    const hasNoZeroFlow = minFlow > 5 // Water never stops flowing
    const hasFlowSpike = currentReading.flow > avgFlow * 2
    
    let severity = 0
    let estimatedLoss = 0
    
    if (hasHighContinuousFlow) {
      severity += 0.4
      estimatedLoss += (avgFlow - this.patterns.normalUsage.peak) * 60 * 24 // L/day
    }
    
    if (hasNoZeroFlow) {
      severity += 0.3
      estimatedLoss += minFlow * 60 * 24
    }
    
    if (hasFlowSpike) {
      severity += 0.3
      estimatedLoss += (currentReading.flow - avgFlow) * 60 * 24
    }
    
    return {
      hasLeak: severity > 0.5,
      severity: Math.min(severity, 1),
      estimatedLoss: Math.round(estimatedLoss),
      indicators: {
        continuousFlow: hasHighContinuousFlow,
        noZeroFlow: hasNoZeroFlow,
        flowSpike: hasFlowSpike
      }
    }
  }

  // Analyze usage patterns for anomalies
  detectAnomalies(currentReading) {
    const anomalies = []
    
    // Unusual time patterns
    const timeAnomaly = this.detectTimeAnomaly(currentReading)
    if (timeAnomaly.isAnomalous) {
      anomalies.push({
        type: 'temporal',
        severity: timeAnomaly.severity,
        description: timeAnomaly.description
      })
    }
    
    // Flow pattern anomalies
    const flowAnomaly = this.detectFlowAnomaly(currentReading)
    if (flowAnomaly.isAnomalous) {
      anomalies.push({
        type: 'flow',
        severity: flowAnomaly.severity,
        description: flowAnomaly.description
      })
    }
    
    // Vibration anomalies
    if (currentReading.vib) {
      anomalies.push({
        type: 'vibration',
        severity: 0.8,
        description: 'Vibration detected - potential tampering or equipment issue'
      })
    }
    
    return anomalies
  }

  // Predict water loss based on current patterns
  predictWaterLoss(hoursAhead = 24) {
    const recentReadings = this.getRecentReadings(50)
    if (recentReadings.length < 10) return { predicted: 0, confidence: 0 }
    
    const avgFlowRate = recentReadings.reduce((sum, r) => sum + r.flow, 0) / recentReadings.length
    const flowTrend = this.calculateTrend(recentReadings.map(r => r.flow))
    
    // Base prediction on current average
    let predictedFlow = avgFlowRate
    
    // Apply trend
    predictedFlow += flowTrend * hoursAhead * 0.1
    
    // Account for time of day patterns
    const timeMultiplier = this.getTimeMultiplier(hoursAhead)
    predictedFlow *= timeMultiplier
    
    const predictedLoss = predictedFlow * 60 * hoursAhead // Convert to liters
    const confidence = Math.min(recentReadings.length / 50, 1) * 0.8 // Max 80% confidence
    
    return {
      predicted: Math.round(predictedLoss),
      confidence: Math.round(confidence * 100),
      breakdown: {
        baseFlow: Math.round(avgFlowRate),
        trend: Math.round(flowTrend * 100) / 100,
        timeAdjustment: Math.round(timeMultiplier * 100) / 100
      }
    }
  }

  // Generate AI insights summary
  generateInsights(currentReading) {
    const theftRisk = this.calculateTheftRisk(currentReading)
    const leakage = this.detectLeakage(currentReading)
    const anomalies = this.detectAnomalies(currentReading)
    const prediction = this.predictWaterLoss(24)
    
    const insights = []
    
    // Theft risk insights
    if (theftRisk > 70) {
      insights.push({
        type: 'alert',
        priority: 'high',
        title: 'High Theft Risk Detected',
        message: `${theftRisk}% probability of unauthorized usage based on current patterns`,
        action: 'Investigate immediately and consider security measures'
      })
    } else if (theftRisk > 30) {
      insights.push({
        type: 'warning',
        priority: 'medium',
        title: 'Elevated Theft Risk',
        message: `${theftRisk}% theft probability - monitor closely`,
        action: 'Review usage patterns and consider additional monitoring'
      })
    }
    
    // Leakage insights
    if (leakage.hasLeak) {
      insights.push({
        type: 'alert',
        priority: 'high',
        title: 'Potential Leak Detected',
        message: `Estimated loss: ${leakage.estimatedLoss.toLocaleString()}L/day`,
        action: 'Inspect system for leaks and repair immediately'
      })
    }
    
    // Anomaly insights
    anomalies.forEach(anomaly => {
      if (anomaly.severity > 0.6) {
        insights.push({
          type: 'warning',
          priority: anomaly.severity > 0.8 ? 'high' : 'medium',
          title: `${anomaly.type.charAt(0).toUpperCase() + anomaly.type.slice(1)} Anomaly`,
          message: anomaly.description,
          action: 'Investigate unusual pattern'
        })
      }
    })
    
    // Prediction insights
    if (prediction.predicted > 2000 && prediction.confidence > 50) {
      insights.push({
        type: 'info',
        priority: 'low',
        title: 'High Usage Predicted',
        message: `Predicted ${prediction.predicted.toLocaleString()}L usage in next 24h`,
        action: 'Monitor consumption and optimize usage if needed'
      })
    }
    
    return {
      insights,
      summary: {
        theftRisk,
        leakageRisk: leakage.severity * 100,
        anomalyCount: anomalies.length,
        predictedLoss: prediction.predicted,
        confidence: prediction.confidence
      }
    }
  }

  // Helper methods
  getRecentReadings(count) {
    return this.historicalData.slice(-count)
  }

  analyzeHourlyPattern(hour) {
    const hourlyReadings = this.historicalData.filter(r => {
      const readingHour = new Date(r.timestamp).getHours()
      return readingHour === hour
    })
    
    if (hourlyReadings.length < 5) return { isUnusual: false, severity: 0 }
    
    const avgFlow = hourlyReadings.reduce((sum, r) => sum + r.flow, 0) / hourlyReadings.length
    const expectedFlow = this.getExpectedFlowForHour(hour)
    
    const deviation = Math.abs(avgFlow - expectedFlow) / expectedFlow
    
    return {
      isUnusual: deviation > 0.5,
      severity: Math.min(deviation, 1)
    }
  }

  detectTimeAnomaly(reading) {
    const hour = new Date(reading.timestamp).getHours()
    const expectedFlow = this.getExpectedFlowForHour(hour)
    const deviation = Math.abs(reading.flow - expectedFlow) / expectedFlow
    
    return {
      isAnomalous: deviation > 1,
      severity: Math.min(deviation / 2, 1),
      description: `Flow rate ${deviation > 1 ? 'significantly' : 'moderately'} different from expected for this time`
    }
  }

  detectFlowAnomaly(reading) {
    const recentReadings = this.getRecentReadings(10)
    if (recentReadings.length < 5) return { isAnomalous: false }
    
    const avgFlow = recentReadings.reduce((sum, r) => sum + r.flow, 0) / recentReadings.length
    const deviation = Math.abs(reading.flow - avgFlow) / (avgFlow || 1)
    
    return {
      isAnomalous: deviation > 2,
      severity: Math.min(deviation / 3, 1),
      description: `Flow rate spike detected - ${deviation.toFixed(1)}x normal rate`
    }
  }

  calculateTrend(values) {
    if (values.length < 2) return 0
    
    const n = values.length
    const sumX = (n * (n - 1)) / 2
    const sumY = values.reduce((sum, val) => sum + val, 0)
    const sumXY = values.reduce((sum, val, i) => sum + i * val, 0)
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6
    
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  }

  getExpectedFlowForHour(hour) {
    // Typical daily usage pattern
    const patterns = {
      0: 2, 1: 1, 2: 1, 3: 1, 4: 2, 5: 5,
      6: 15, 7: 25, 8: 30, 9: 20, 10: 18, 11: 22,
      12: 28, 13: 25, 14: 20, 15: 18, 16: 20, 17: 25,
      18: 30, 19: 28, 20: 22, 21: 15, 22: 8, 23: 4
    }
    return patterns[hour] || 10
  }

  getTimeMultiplier(hoursAhead) {
    // Simplified time-based usage multiplier
    const currentHour = new Date().getHours()
    const futureHour = (currentHour + hoursAhead) % 24
    
    const peakHours = [7, 8, 12, 18, 19, 20]
    const offHours = [0, 1, 2, 3, 4, 5, 22, 23]
    
    if (peakHours.includes(futureHour)) return 1.3
    if (offHours.includes(futureHour)) return 0.3
    return 1.0
  }
}

// Create singleton instance
const aiAnalyticsEngine = new AIAnalyticsEngine()

export default aiAnalyticsEngine