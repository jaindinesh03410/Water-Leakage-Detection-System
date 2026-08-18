import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import TopNavigation from './TopNavigation'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    nav: ({ children, ...props }) => <nav {...props}>{children}</nav>,
    div: ({ children, ...props }) => <div {...props}>{children}</div>
  }
}))

describe('TopNavigation', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('displays the main system title', () => {
    render(<TopNavigation />)
    
    expect(screen.getByText('Smart Water Intelligence System')).toBeInTheDocument()
    expect(screen.getByText('HydroSense – Industrial IoT Water Monitoring')).toBeInTheDocument()
  })

  it('shows system status indicator', () => {
    render(<TopNavigation systemStatus="online" />)
    
    expect(screen.getByText('System Online')).toBeInTheDocument()
  })

  it('displays device connection status when connected', () => {
    render(<TopNavigation deviceConnected={true} />)
    
    expect(screen.getByText('Connected')).toBeInTheDocument()
  })

  it('displays device connection status when disconnected', () => {
    render(<TopNavigation deviceConnected={false} />)
    
    expect(screen.getByText('Disconnected')).toBeInTheDocument()
  })

  it('shows live system activity indicator', () => {
    render(<TopNavigation />)
    
    expect(screen.getByText('Live')).toBeInTheDocument()
  })

  it('displays API Server status', () => {
    render(<TopNavigation />)
    
    expect(screen.getByText('API Server')).toBeInTheDocument()
  })

  it('displays current date and time', async () => {
    const mockDate = new Date('2024-01-15T10:30:45')
    vi.setSystemTime(mockDate)
    
    render(<TopNavigation />)
    
    // Check for date components (toLocaleDateString('en-GB') gives e.g. "15 Jan 2024" or with commas depending on locale, we use Regex to be safe)
    expect(screen.getByText(/15/)).toBeInTheDocument()
    expect(screen.getByText(/Jan/)).toBeInTheDocument()
    expect(screen.getByText(/2024/)).toBeInTheDocument()
    expect(screen.getByText(/10:30:45/)).toBeInTheDocument()
  })

  it('updates time every second', async () => {
    const mockDate = new Date('2024-01-15T10:30:45')
    vi.setSystemTime(mockDate)
    
    render(<TopNavigation />)
    
    expect(screen.getByText(/10:30:45/)).toBeInTheDocument()
    
    // Advance time by 1 second
    vi.advanceTimersByTime(1000)
    vi.setSystemTime(new Date('2024-01-15T10:30:46'))
    
    await waitFor(() => {
      expect(screen.getByText(/10:30:46/)).toBeInTheDocument()
    })
  })

  it('handles different system status values', () => {
    const { rerender } = render(<TopNavigation systemStatus="offline" />)
    
    expect(screen.getByText('System Offline')).toBeInTheDocument()
    
    rerender(<TopNavigation systemStatus="online" />)
    expect(screen.getByText('System Online')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<TopNavigation className="custom-class" />)
    
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('passes through additional props', () => {
    render(<TopNavigation data-testid="top-nav" />)
    
    expect(screen.getByTestId('top-nav')).toBeInTheDocument()
  })
})