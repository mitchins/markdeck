import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@/components/theme-provider'

describe('ThemeProvider', () => {
  it('wraps children with next-themes provider', () => {
    render(
      <ThemeProvider>
        <div data-testid="child">Test content</div>
      </ThemeProvider>
    )
    
    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('accepts theme configuration props', () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <div>Content</div>
      </ThemeProvider>
    )
    
    expect(screen.getByText('Content')).toBeInTheDocument()
  })
})
