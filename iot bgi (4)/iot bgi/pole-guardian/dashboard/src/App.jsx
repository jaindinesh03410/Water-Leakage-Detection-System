import { useState } from 'react'
import { Card, Button, Alert, Badge, StatusIndicator, MetricCard } from './components/ui'
import { Grid, Container, Section, Flex, TopNavigation } from './components/layout'
import { FlowChart, PressureChart, UsageChart } from './components/charts'
import { AIInsightsPanel } from './components/ai'
import  AlertManager  from './components/alerts'
import { WaterQualityPanel } from './components/quality'
import { Droplets, Activity, Gauge, Shield, Zap, TrendingUp, AlertTriangle, BarChart3, Brain, Beaker } from 'lucide-react'
import { useFirebase } from './contexts/FirebaseContext.jsx'
import { useRealTimeMetrics, useActiveAlerts, useConnectionStatus, useLatestReadings } from './hooks/useFirebaseData.js'

function App() {
  const [showAlert, setShowAlert] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const { loading: firebaseLoading, error: firebaseError } = useFirebase()
  const { metrics, loading: metricsLoading, error: metricsError } = useRealTimeMetrics()
  const { alerts } = useActiveAlerts()
  const { connected } = useConnectionStatus()
  const { readings } = useLatestReadings()

  // Show loading state while Firebase initializes
  if (firebaseLoading || metricsLoading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <Card variant="neon" className="text-center p-8">
          <div className="animate-spin w-8 h-8 border border-accent-blue border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-accent-blue mb-2">Initializing Smart Water Intelligence System</h2>
          <p className="text-gray-400">Connecting to API server and ESP32 sensors...</p>
        </Card>
      </div>
    )
  }

  // Show error state if Firebase fails to initialize
  if (false) {//(firebaseError || metricsError) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <Card variant="neon" className="text-center p-8 border-red-500/20">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-400 mb-2">System Connection Error</h2>
          <p className="text-gray-400 mb-4">
            {firebaseError || metricsError || 'Failed to connect to API server'}
          </p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Retry Connection
          </Button>
        </Card>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'ai', label: 'AI Insights', icon: Brain },
    { id: 'quality', label: 'Water Quality', icon: Beaker },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle }
  ]

  return (
    <div className="min-h-screen bg-primary">
      {/* Top Navigation */}
      <TopNavigation 
        systemStatus="online"
        deviceConnected={true}
      />
      
      <Container animate={true}>
        {/* Connection Status Alert - hidden, data loads automatically */}

        {/* Demo Alert */}
        <Section spacing="none">
          <Alert
            type="success"
            title="Smart Water Intelligence System Active"
            message="Complete IoT monitoring system with real-time analytics, AI insights, and comprehensive water quality monitoring."
            show={showAlert}
            onClose={() => setShowAlert(false)}
          />
        </Section>

        {/* Tab Navigation */}
        <Section spacing="tight">
          <Card variant="compact" className="p-2">
            <Flex gap={2} wrap={true} animate={false}>
              {tabs.map((tab) => {
                const IconComponent = tab.icon
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setActiveTab(tab.id)}
                    className="flex items-center gap-2"
                  >
                    <IconComponent className="w-4 h-4" />
                    {tab.label}
                  </Button>
                )
              })}
            </Flex>
          </Card>
        </Section>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Main Metrics Grid - 4 Column Responsive */}
            <Section title="Real-time Metrics" subtitle="Live monitoring data from IoT sensors">
              <Grid cols={4} gap={6}>
                <MetricCard
                  title="Flow Rate"
                  value={metrics.flowRate?.toFixed(1) || '0.0'}
                  unit="L/min"
                  icon={Droplets}
                  status={metrics.flowRate > 50 ? 'critical' : metrics.flowRate > 25 ? 'warning' : 'normal'}
                  trend={metrics.flowRate > 20 ? 'up' : metrics.flowRate > 10 ? 'stable' : 'down'}
                  trendValue={`${((metrics.flowRate || 0) * 0.1).toFixed(1)}%`}
                  variant="neon"
                />
                
                <MetricCard
                  title="Pressure"
                  value={metrics.pressure?.toFixed(1) || '0.0'}
                  unit="Bar"
                  icon={Gauge}
                  status={metrics.pressure > 3 ? 'critical' : metrics.pressure < 1 ? 'warning' : 'normal'}
                  trend="stable"
                  trendValue="0.0%"
                  variant="default"
                />
                
                <MetricCard
                  title="Vibration Status"
                  value={metrics.vibrationStatus === 'detected' ? 'ALERT' : 'NORMAL'}
                  unit=""
                  icon={Shield}
                  status={metrics.vibrationStatus === 'detected' ? 'critical' : 'normal'}
                  trend={metrics.vibrationStatus === 'detected' ? 'up' : 'stable'}
                  trendValue={metrics.vibrationStatus === 'detected' ? 'TAMPER' : 'OK'}
                  variant="gradient"
                />
                
                <MetricCard
                  title="System Health"
                  value={connected ? '52.0' : '0.0'}
                  unit="%"
                  icon={Zap}
                  status={connected ? 'normal' : 'critical'}
                  trend={connected ? 'up' : 'down'}
                  trendValue={connected ? '1.5%' : 'OFFLINE'}
                  variant="compact"
                />
              </Grid>
            </Section>

            {/* Secondary Metrics - 3 Column */}
            <Section title="Analytics Overview" subtitle="AI-powered insights and predictions">
              <Grid cols={3} gap={4}>
                <Card variant="neon">
                  <Flex direction="column" gap={4} animate={false}>
                    <Flex align="center" gap={3} animate={false}>
                      <TrendingUp className="w-6 h-6 text-accent-cyan" />
                      <h3 className="text-lg font-semibold">Theft Risk</h3>
                      <Badge 
                        variant={metrics.theftRisk > 70 ? 'error' : metrics.theftRisk > 30 ? 'warning' : 'success'} 
                        size="sm"
                      >
                        {metrics.theftRisk > 70 ? 'High' : metrics.theftRisk > 30 ? 'Medium' : 'Low'}
                      </Badge>
                    </Flex>
                    <div className="text-2xl font-bold text-accent-cyan">{metrics.theftRisk}%</div>
                    <div className="text-sm text-gray-400">Based on usage patterns</div>
                  </Flex>
                </Card>

                <Card variant="default">
                  <Flex direction="column" gap={4} animate={false}>
                    <Flex align="center" gap={3} animate={false}>
                      <Activity className="w-6 h-6 text-accent-blue" />
                      <h3 className="text-lg font-semibold">Daily Usage</h3>
                      <Badge variant="info" size="sm">
                        {metrics.totalConsumption > 2000 ? 'High' : 'Normal'}
                      </Badge>
                    </Flex>
                    <div className="text-2xl font-bold text-accent-blue">{metrics.totalConsumption.toLocaleString()} L</div>
                    <div className="text-sm text-gray-400">Today's consumption</div>
                  </Flex>
                </Card>

                <Card variant="gradient">
                  <Flex direction="column" gap={4} animate={false}>
                    <Flex align="center" gap={3} animate={false}>
                      <div className="w-6 h-6 bg-accent-purple rounded-full"></div>
                      <h3 className="text-lg font-semibold">Alerts</h3>
                      <Badge 
                        variant={metrics.alertCount > 5 ? 'error' : metrics.alertCount > 0 ? 'warning' : 'success'} 
                        size="sm"
                      >
                        {metrics.alertCount} Active
                      </Badge>
                    </Flex>
                    <div className="text-2xl font-bold text-accent-purple">{metrics.alertCount}</div>
                    <div className="text-sm text-gray-400">Total today</div>
                  </Flex>
                </Card>
              </Grid>
            </Section>

            {/* Node Status - 6 Column on Large Screens */}
            <Section title="Node Status" subtitle="Pipeline monitoring points">
              <Grid cols={6} gap={3}>
                {['Node 1', 'Node 2', 'Node 3', 'Node 4', 'Node 5', 'Node 6'].map((node, index) => {
                  const nodeStatus = index < metrics.nodeStatus.normal ? 'normal' : 
                                   index < (metrics.nodeStatus.normal + metrics.nodeStatus.warning) ? 'warning' : 'critical'
                  
                  return (
                    <Card key={node} variant="compact" className="text-center">
                      <h4 className="text-sm font-semibold mb-2">{node}</h4>
                      <StatusIndicator 
                        status={nodeStatus} 
                        showLabel={false}
                        className="justify-center"
                      />
                      <div className="text-xs text-gray-400 mt-2 capitalize">
                        {nodeStatus}
                      </div>
                    </Card>
                  )
                })}
              </Grid>
            </Section>
          </>
        )}

        {activeTab === 'analytics' && (
          <>
            <Section title="Data Visualization" subtitle="Real-time charts and analytics">
              <Grid cols={1} gap={6}>
                <FlowChart data={readings ? [readings] : []} />
                <Grid cols={2} gap={6}>
                  <PressureChart data={readings ? [readings] : []} />
                  <UsageChart />
                </Grid>
              </Grid>
            </Section>
          </>
        )}

        {activeTab === 'ai' && (
          <Section title="AI Intelligence Center" subtitle="Machine learning insights and predictions">
            <AIInsightsPanel currentReading={readings} />
          </Section>
        )}

        {activeTab === 'quality' && (
          <Section title="Water Quality Monitoring" subtitle="Comprehensive water quality analysis">
            <WaterQualityPanel />
          </Section>
        )}

        {activeTab === 'alerts' && (
          <Section title="Alert Management" subtitle="System notifications and warnings">
            <AlertManager 
              alerts={alerts} 
              onDismiss={(id) => console.log('Dismiss alert:', id)}
              onMute={(muted) => console.log('Mute alerts:', muted)}
            />
          </Section>
        )}

        {/* System Status Summary */}
        <Section spacing="default">
          <Card variant="large" className="text-center subtle-glow">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 text-accent-blue">
              PoleGuardian Smart Water Intelligence System
            </h2>
            <p className="text-gray-300 mb-6 text-sm md:text-base">
              Complete IoT monitoring solution with live ESP32 sensor data. 
              AI analytics processing {metrics.totalConsumption.toLocaleString()}L daily consumption 
              with {metrics.theftRisk}% theft risk assessment and comprehensive quality monitoring.
            </p>
            
            <Flex justify="center" gap={4} wrap={true} responsive={true} className="mb-8">
              <Button variant="primary" size="lg">
                System Online
              </Button>
              <Button variant="secondary" size="lg" onClick={() => setActiveTab('analytics')}>
                View Analytics
              </Button>
              <Button variant="neon" size="lg" onClick={() => setActiveTab('ai')}>
                AI Insights
              </Button>
            </Flex>
            
            {/* Real-time Status Grid */}
            <Grid cols={4} gap={4} className="text-sm">
              <Card variant="compact" className="glass-card-dark text-center">
                <div className="text-accent-blue font-semibold">Connected</div>
                <div className="text-gray-400">Backend Status</div>
              </Card>
              <Card variant="compact" className="glass-card-dark text-center">
                <div className="text-accent-cyan font-semibold">{metrics.flowRate.toFixed(1)} L/min</div>
                <div className="text-gray-400">Current Flow</div>
              </Card>
              <Card variant="compact" className="glass-card-dark text-center">
                <div className="text-accent-purple font-semibold">{metrics.theftRisk}%</div>
                <div className="text-gray-400">Theft Risk</div>
              </Card>
              <Card variant="compact" className="glass-card-dark text-center">
                <div className="text-green-400 font-semibold">{metrics.alertCount}</div>
                <div className="text-gray-400">Active Alerts</div>
              </Card>
            </Grid>
          </Card>
        </Section>
      </Container>
    </div>
  )
}

export default App