import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SidebarMenuSkeleton } from '@/ui/primitives/sidebar'

describe('SidebarMenuSkeleton', () => {
  it('renders the icon skeleton when requested', () => {
    const { container } = render(<SidebarMenuSkeleton showIcon />)

    expect(container.querySelector('[data-sidebar="menu-skeleton-icon"]')).toBeInTheDocument()

    const textSkeleton = container.querySelector(
      '[data-sidebar="menu-skeleton-text"]'
    ) as HTMLElement

    expect(textSkeleton.getAttribute('style')).toMatch(/--skeleton-width:\s*\d+%/)
  })

  it('omits the icon skeleton when not requested', () => {
    const { container } = render(<SidebarMenuSkeleton />)

    expect(container.querySelector('[data-sidebar="menu-skeleton-icon"]')).toBeNull()
    expect(container.querySelector('[data-sidebar="menu-skeleton-text"]')).toBeInTheDocument()
  })
})
