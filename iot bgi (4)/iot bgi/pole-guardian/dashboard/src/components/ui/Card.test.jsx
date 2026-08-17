import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Card from './Card'

describe('Card Component', () => {
  it('renders children content', () => {
    render(<Card>Test Content</Card>)
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('applies default variant classes', () => {
    const { container } = render(<Card>Content</Card>)
    const card = container.firstChild
    expect(card).toHaveClass('glass-card', 'p-6')
  })

  it('applies compact variant classes', () => {
    const { container } = render(<Card variant="compact">Content</Card>)
    const card = container.firstChild
    expect(card).toHaveClass('glass-card', 'p-4')
  })

  it('applies neon variant classes', () => {
    const { container } = render(<Card variant="neon">Content</Card>)
    const card = container.firstChild
    expect(card).toHaveClass('glass-card', 'p-6', 'subtle-glow')
  })

  it('handles gradient variant with nested div', () => {
    const { container } = render(<Card variant="gradient">Content</Card>)
    const card = container.firstChild
    expect(card).toHaveClass('gradient-border')
    expect(card.firstChild).toHaveClass('p-6')
  })

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>)
    const card = container.firstChild
    expect(card).toHaveClass('custom-class')
  })
})