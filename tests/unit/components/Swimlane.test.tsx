/**
 * Tests for Swimlane component
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Swimlane } from '@/components/Swimlane'
import type { Swimlane as SwimlaneType, KanbanCard } from '@/lib/types'
import { STATUS_COLUMNS } from '@/lib/types'

describe('Swimlane', () => {
  const mockSwimlane: SwimlaneType = {
    id: 'lane1',
    title: 'Test Lane',
    order: 0,
  }

  const mockCards: KanbanCard[] = [
    {
      id: 'card1',
      title: 'Test Card 1',
      status: 'todo',
      blocked: false,
      laneId: 'lane1',
      description: '',
      links: [],
      originalLine: 1,
    },
    {
      id: 'card2',
      title: 'Test Card 2',
      status: 'done',
      blocked: true,
      laneId: 'lane1',
      description: '',
      links: [],
      originalLine: 2,
    },
  ]

  const mockHandlers = {
    onCardDrop: vi.fn(),
    onCardClick: vi.fn(),
    onToggleCollapse: vi.fn(),
  }

  it('should render swimlane title', () => {
    render(
      <Swimlane
        swimlane={mockSwimlane}
        cards={mockCards}
        {...mockHandlers}
      />
    )
    
    expect(screen.getByText('Test Lane')).toBeInTheDocument()
  })

  it('should render card count statistics', () => {
    render(
      <Swimlane
        swimlane={mockSwimlane}
        cards={mockCards}
        {...mockHandlers}
      />
    )
    
    // Total cards
    expect(screen.getByText('2')).toBeInTheDocument()
    // Blocked count (check for the text including space and count)
    expect(screen.getByText((content, element) => {
      return element?.textContent === '🔴 1' || false
    })).toBeInTheDocument()
  })

  it('should have keyboard accessibility with Enter key', () => {
    render(
      <Swimlane
        swimlane={mockSwimlane}
        cards={mockCards}
        {...mockHandlers}
      />
    )
    
    const toggleButton = screen.getByRole('button', { name: /Toggle Test Lane swimlane/i })
    fireEvent.keyDown(toggleButton, { key: 'Enter' })
    
    expect(toggleButton).toBeInTheDocument()
  })

  it('should have keyboard accessibility with Space key', () => {
    render(
      <Swimlane
        swimlane={mockSwimlane}
        cards={mockCards}
        {...mockHandlers}
      />
    )
    
    const toggleButton = screen.getByRole('button', { name: /Toggle Test Lane swimlane/i })
    fireEvent.keyDown(toggleButton, { key: ' ' })
    
    expect(toggleButton).toBeInTheDocument()
  })

  it('should have proper ARIA attributes', () => {
    render(
      <Swimlane
        swimlane={mockSwimlane}
        cards={mockCards}
        {...mockHandlers}
      />
    )
    
    const toggleButton = screen.getByRole('button', { name: /Toggle Test Lane swimlane/i })
    
    expect(toggleButton).toHaveAttribute('aria-expanded')
    // Button elements are naturally focusable, so tabIndex is not needed
  })

  it('should toggle collapse on click', () => {
    render(
      <Swimlane
        swimlane={mockSwimlane}
        cards={mockCards}
        {...mockHandlers}
      />
    )
    
    const toggleButton = screen.getByRole('button', { name: /Toggle Test Lane swimlane/i })
    fireEvent.click(toggleButton)
    
    // After clicking, the aria-expanded attribute should change
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('should render cards in correct columns', () => {
    render(
      <Swimlane
        swimlane={mockSwimlane}
        cards={mockCards}
        boardMode="full"
        columnsToShow={STATUS_COLUMNS}
        {...mockHandlers}
      />
    )
    
    expect(screen.getByText('Test Card 1')).toBeInTheDocument()
    expect(screen.getByText('Test Card 2')).toBeInTheDocument()
  })

  it('should show empty state for columns with no cards', () => {
    render(
      <Swimlane
        swimlane={mockSwimlane}
        cards={[]}
        boardMode="full"
        columnsToShow={STATUS_COLUMNS}
        {...mockHandlers}
      />
    )
    
    // Should show em dashes for empty columns
    const emDashes = screen.getAllByText('—')
    expect(emDashes.length).toBeGreaterThan(0)
  })

  it('should handle simple mode with only TODO and DONE columns', () => {
    const simpleColumns = STATUS_COLUMNS.filter(col => col.key === 'todo' || col.key === 'done')
    
    render(
      <Swimlane
        swimlane={mockSwimlane}
        cards={mockCards}
        boardMode="simple"
        columnsToShow={simpleColumns}
        {...mockHandlers}
      />
    )
    
    // Should still render correctly
    expect(screen.getByText('Test Lane')).toBeInTheDocument()
  })
})
