import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MetricCard from './MetricCard.jsx'
import { Droplets } from 'lucide-react'

describe('MetricCard Component', () => {
  it('renders title and value correctly', () => {
    render(
      <MetricCard
        title="Flow Rate"
        value="24.5"
        unit="L/min"
      />
    )
    
    expect(screen.getByText('Flow Rate')).toBeInTheDocument()
    expect(screen.getByText('24.5')).toBeInTheDocument()
    expect(screen.getByText('L/min')).toBeInTheDocument()
  })

  it('renders icon when provided', () => {
    render(
      <MetricCard
        title="Flow Rate"
        value="24.5"
        icon={Droplets}
      />
    )
    
    // Check if icon is rendered (Lucide icons render as SVG)
    const icon = document.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('displays trend information correctly', () => {
    render(
      <MetricCard
        title="Flow Rate"
        value="24.5"
        trend="up"
        trendValue="2.1%"
      />
    )
    
    expect(screen.getByText('↗ 2.1%')).toBeInTheDocument()
  })

  it('applies correct status colors', () => {
    render(
      <MetricCard
        title="Flow Rate"
        value="24.5"
        status="warning"
      />
    )
    
    const valueElement = screen.getByText('24.5')
    expect(valueElement).toHaveClass('text-yellow-400')
  })

  it('shows correct status text', () => {
    render(
      <MetricCard
        title="Flow Rate"
        value="24.5"
        status="critical"
      />
    )
    
    expect(screen.getByText('Critical Level')).toBeInTheDocument()
  })

  it('renders without animation when animate is false', () => {
    const { container } = render(
      <MetricCard
        title="Flow Rate"
        value="24.5"
        animate={false}
      />
    )
    
    // Should not have motion wrapper
    expect(container.firstChild).toHaveClass('glass-card')
  })
})