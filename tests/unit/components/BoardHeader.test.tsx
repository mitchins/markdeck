/**
 * Tests for BoardHeader component
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BoardHeader } from '@/components/BoardHeader'
import { STATUS_COLUMNS } from '@/lib/types'

describe('BoardHeader', () => {
  it('should render swimlane label', () => {
    render(
      <BoardHeader 
        columnsToShow={STATUS_COLUMNS} 
        gridColsClass="grid-cols-[auto_1fr_1fr_1fr]" 
      />
    )
    
    expect(screen.getByText('Swimlane')).toBeInTheDocument()
  })

  it('should render all column labels in full mode', () => {
    render(
      <BoardHeader 
        columnsToShow={STATUS_COLUMNS} 
        gridColsClass="grid-cols-[auto_1fr_1fr_1fr]" 
      />
    )
    
    expect(screen.getByText('TODO')).toBeInTheDocument()
    expect(screen.getByText('IN PROGRESS')).toBeInTheDocument()
    expect(screen.getByText('DONE')).toBeInTheDocument()
  })

  it('should render only TODO and DONE in simple mode', () => {
    const simpleColumns = STATUS_COLUMNS.filter(col => col.key === 'todo' || col.key === 'done')
    
    render(
      <BoardHeader 
        columnsToShow={simpleColumns} 
        gridColsClass="grid-cols-[auto_1fr_1fr]" 
      />
    )
    
    expect(screen.getByText('TODO')).toBeInTheDocument()
    expect(screen.getByText('DONE')).toBeInTheDocument()
    expect(screen.queryByText('IN PROGRESS')).not.toBeInTheDocument()
  })

  it('should apply correct grid class', () => {
    const { container } = render(
      <BoardHeader 
        columnsToShow={STATUS_COLUMNS} 
        gridColsClass="grid-cols-[auto_1fr_1fr_1fr]" 
      />
    )
    
    const headerDiv = container.querySelector('.grid-cols-\\[auto_1fr_1fr_1fr\\]')
    expect(headerDiv).toBeInTheDocument()
  })

  it('should have sticky positioning', () => {
    const { container } = render(
      <BoardHeader 
        columnsToShow={STATUS_COLUMNS} 
        gridColsClass="grid-cols-[auto_1fr_1fr_1fr]" 
      />
    )
    
    const headerDiv = container.querySelector('.sticky')
    expect(headerDiv).toBeInTheDocument()
  })
})
