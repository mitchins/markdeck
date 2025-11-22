/**
 * Tests for BoardView component
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BoardView } from '@/components/BoardView'
import type { ParsedStatus } from '@/lib/types'

describe('BoardView', () => {
  const mockData: ParsedStatus = {
    metadata: {
      title: 'Test Project',
    },
    swimlanes: [
      { id: 'lane1', title: 'Core Features', order: 0 },
      { id: 'lane2', title: 'Infrastructure', order: 1 },
    ],
    cards: [
      {
        id: 'card1',
        title: 'Task 1',
        status: 'todo',
        blocked: false,
        laneId: 'lane1',
        description: '',
        links: [],
        originalLine: 1,
      },
      {
        id: 'card2',
        title: 'Task 2',
        status: 'in_progress',
        blocked: false,
        laneId: 'lane1',
        description: '',
        links: [],
        originalLine: 2,
      },
      {
        id: 'card3',
        title: 'Task 3',
        status: 'done',
        blocked: false,
        laneId: 'lane2',
        description: '',
        links: [],
        originalLine: 3,
      },
    ],
    notes: [],
    rawMarkdown: '',
    boardMode: 'full',
  }

  const mockHandlers = {
    onCardMove: vi.fn(),
    onCardClick: vi.fn(),
  }

  it('should render single header row with column labels', () => {
    render(<BoardView data={mockData} {...mockHandlers} />)
    
    expect(screen.getByText('Swimlane')).toBeInTheDocument()
    expect(screen.getByText('TODO')).toBeInTheDocument()
    expect(screen.getByText('IN PROGRESS')).toBeInTheDocument()
    expect(screen.getByText('DONE')).toBeInTheDocument()
  })

  it('should render all swimlanes', () => {
    render(<BoardView data={mockData} {...mockHandlers} />)
    
    expect(screen.getByText('Core Features')).toBeInTheDocument()
    expect(screen.getByText('Infrastructure')).toBeInTheDocument()
  })

  it('should render in simple mode with only TODO and DONE columns', () => {
    const simpleData = { ...mockData, boardMode: 'simple' as const }
    render(<BoardView data={simpleData} {...mockHandlers} />)
    
    expect(screen.getByText('TODO')).toBeInTheDocument()
    expect(screen.getByText('DONE')).toBeInTheDocument()
    expect(screen.queryByText('IN PROGRESS')).not.toBeInTheDocument()
  })

  it('should use correct grid layout for full mode', () => {
    const { container } = render(<BoardView data={mockData} {...mockHandlers} />)
    
    const headerRow = container.querySelector('.grid-cols-\\[auto_1fr_1fr_1fr\\]')
    expect(headerRow).toBeInTheDocument()
  })

  it('should use correct grid layout for simple mode', () => {
    const simpleData = { ...mockData, boardMode: 'simple' as const }
    const { container } = render(<BoardView data={simpleData} {...mockHandlers} />)
    
    const headerRow = container.querySelector('.grid-cols-\\[auto_1fr_1fr\\]')
    expect(headerRow).toBeInTheDocument()
  })
})
