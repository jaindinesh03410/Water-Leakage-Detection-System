import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusIndicator from './StatusIndicator.jsx'

describe('StatusIndicator Component', () => {
  it('renders with default online status', () => {
    render(<StatusIndicator />)
    
    expect(screen.getByText('Online')).toBeInTheDocument()
  })

  it('renders custom label when provided', () => {
    render(<StatusIndicator status="warning" label="Custom Warning" />)
    
    expect(screen.getByText('Custom Warning')).toBeInTheDocument()
  })

  it('applies correct status colors', () => {
    const { container } = render(<StatusIndicator status="critical" />)
    
    const indicator = container.querySelector('span.rounded-full')
    expect(indicator).toBeInTheDocument()
    expect(indicator.style.backgroundColor).toBe('rgb(209, 67, 67)') // #D14343
  })

  it('hides label when showLabel is false', () => {
    render(<StatusIndicator showLabel={false} />)
    
    expect(screen.queryByText('Online')).not.toBeInTheDocument()
  })

  it('applies correct size classes', () => {
    const { container } = render(<StatusIndicator size="lg" />)
    
    const indicator = container.querySelector('span.rounded-full')
    expect(indicator).toBeInTheDocument()
    expect(indicator.style.width).toBe('10px')
  })

  it('renders without animation when animate is false', () => {
    const { container } = render(<StatusIndicator animate={false} />)
    
    // Should render a regular div, not motion.div
    expect(container.firstChild.tagName).toBe('DIV')
  })
})