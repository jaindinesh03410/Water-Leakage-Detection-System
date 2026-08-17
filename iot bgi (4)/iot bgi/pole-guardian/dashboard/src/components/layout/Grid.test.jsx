import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Grid from './Grid.jsx'

describe('Grid Component', () => {
  it('renders children correctly', () => {
    render(
      <Grid>
        <div>Child 1</div>
        <div>Child 2</div>
      </Grid>
    )
    
    expect(screen.getByText('Child 1')).toBeInTheDocument()
    expect(screen.getByText('Child 2')).toBeInTheDocument()
  })

  it('applies correct grid classes for different column counts', () => {
    const { container } = render(
      <Grid cols={2} data-testid="grid">
        <div>Child</div>
      </Grid>
    )
    
    const gridElement = container.firstChild
    expect(gridElement).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2')
  })

  it('applies custom gap spacing', () => {
    const { container } = render(
      <Grid gap={8}>
        <div>Child</div>
      </Grid>
    )
    
    const gridElement = container.firstChild
    expect(gridElement).toHaveClass('gap-8')
  })

  it('renders without animation when animate is false', () => {
    const { container } = render(
      <Grid animate={false}>
        <div>Child</div>
      </Grid>
    )
    
    // Should render a regular div, not motion.div
    expect(container.firstChild.tagName).toBe('DIV')
  })

  it('applies custom className', () => {
    const { container } = render(
      <Grid className="custom-class">
        <div>Child</div>
      </Grid>
    )
    
    const gridElement = container.firstChild
    expect(gridElement).toHaveClass('custom-class')
  })
})