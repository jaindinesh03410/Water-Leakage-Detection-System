import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App Component', () => {
  it('renders the main title', () => {
    render(<App />)
    expect(screen.getByText('Smart Water Intelligence System')).toBeInTheDocument()
  })

  it('displays the subtitle', () => {
    render(<App />)
    expect(screen.getByText('PoleGuardian - Industrial IoT Water Monitoring')).toBeInTheDocument()
  })

  it('shows system status as online', () => {
    render(<App />)
    expect(screen.getByText('System Online')).toBeInTheDocument()
  })

  it('displays dashboard foundation ready message', () => {
    render(<App />)
    expect(screen.getByText('Dashboard Foundation Ready')).toBeInTheDocument()
  })

  it('shows technology stack information', () => {
    render(<App />)
    expect(screen.getByText('React 18')).toBeInTheDocument()
    expect(screen.getByText('Vite')).toBeInTheDocument()
    expect(screen.getByText('Tailwind')).toBeInTheDocument()
    expect(screen.getByText('Firebase')).toBeInTheDocument()
  })
})