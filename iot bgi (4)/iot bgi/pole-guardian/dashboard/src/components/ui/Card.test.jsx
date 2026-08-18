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
    expect(card).toHaveClass('bg-white', 'border', 'rounded-lg', 'p-6', 'border-hs-border', 'shadow-card')
  })

  it('applies compact variant classes', () => {
    const { container } = render(<Card variant="compact">Content</Card>)
    const card = container.firstChild
    expect(card).toHaveClass('bg-white', 'border', 'border-hs-border', 'rounded-lg', 'p-4', 'shadow-card')
  })

  it('applies neon variant classes', () => {
    const { container } = render(<Card variant="neon">Content</Card>)
    const card = container.firstChild
    expect(card).toHaveClass('bg-white', 'border', 'rounded-lg', 'p-6', 'border-hs-border', 'shadow-card')
  })

  it('handles gradient variant with nested div', () => {
    const { container } = render(<Card variant="gradient">Content</Card>)
    const card = container.firstChild
    expect(card).toHaveClass('bg-white', 'border', 'border-hs-border', 'rounded-lg', 'shadow-card')
    expect(card.firstChild).toHaveClass('p-6')
  })

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>)
    const card = container.firstChild
    expect(card).toHaveClass('custom-class')
  })
})