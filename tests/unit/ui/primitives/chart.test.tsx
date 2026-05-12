import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { ChartContainer } from '@/ui/primitives/chart'

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  Tooltip: () => null,
  Legend: () => null,
}))

describe('ChartContainer', () => {
  it('renders chart styles for color and theme configs', () => {
    const { container } = render(
      <ChartContainer
        config={{
          revenue: { label: 'Revenue', color: '#ff0000' },
          profit: {
            label: 'Profit',
            theme: {
              light: '#111111',
              dark: '#eeeeee',
            },
          },
        }}
      >
        <div data-testid="chart-child">Chart</div>
      </ChartContainer>
    )

    expect(screen.getByTestId('chart-child')).toBeInTheDocument()

    const chart = container.querySelector('[data-slot="chart"]')
    expect(chart?.getAttribute('data-chart')).toMatch(/^chart-/)

    const style = chart?.querySelector('style')
    expect(style?.textContent).toContain('--color-revenue: #ff0000;')
    expect(style?.textContent).toContain('--color-profit: #111111;')
    expect(style?.textContent).toContain('.dark [data-chart=')
  })

  it('skips style output when config has no colors', () => {
    const { container } = render(
      <ChartContainer config={{}}>
        <div data-testid="chart-child">Chart</div>
      </ChartContainer>
    )

    expect(screen.getByTestId('chart-child')).toBeInTheDocument()
    expect(container.querySelector('style')).toBeNull()
  })
})
