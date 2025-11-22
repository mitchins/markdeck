/**
 * Board component
 * 
 * Main Kanban board that displays swimlanes with columns and cards.
 * Supports both simple (2-column) and full (3-column) modes.
 * 
 * Layout: Single header row at top, swimlanes rendered as rows beneath.
 */

import { Swimlane } from './Swimlane'
import { useSwimlanes, useCards } from '@/application'
import { useAppStore } from '@/application/state/app-store'
import type { Card, CardStatus } from '@/core'
import { STATUS_COLUMNS } from '@/core'
import type { LucideIcon } from 'lucide-react'
import { BadgeCheck, CircleAlert, ListChecks } from 'lucide-react'

const columnConfig: Record<CardStatus, {
  icon: LucideIcon
  color: string
}> = {
  todo: {
    icon: ListChecks,
    color: 'text-accent',
  },
  in_progress: {
    icon: CircleAlert,
    color: 'text-warning',
  },
  done: {
    icon: BadgeCheck,
    color: 'text-success',
  },
}

export function Board() {
  const { swimlanes } = useSwimlanes()
  const { cards, moveCard } = useCards()
  const actions = useAppStore(state => state.actions)
  const project = useAppStore(state => state.project)
  
  const handleCardDrop = (cardId: string, newStatus: CardStatus) => {
    moveCard(cardId, newStatus)
  }
  
  const handleCardClick = (card: Card) => {
    actions.setSelectedCard(card.id)
    actions.setDrawerOpen(true)
  }
  
  if (swimlanes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>No swimlanes found. Upload a STATUS.md file to get started.</p>
      </div>
    )
  }
  
  const boardMode = project?.boardMode || 'full'
  
  // For simple mode, only show TODO and DONE columns
  const columnsToShow = boardMode === 'simple' 
    ? STATUS_COLUMNS.filter(col => col.key === 'todo' || col.key === 'done')
    : STATUS_COLUMNS
  
  // Grid columns based on mode
  const gridColsClass = boardMode === 'simple'
    ? 'grid-cols-[auto_1fr_1fr]'
    : 'grid-cols-[auto_1fr_1fr_1fr]'
  
  return (
    <div className="space-y-0 pb-8">
      {/* Single header row for all columns */}
      <div className={`grid ${gridColsClass} gap-4 p-4 bg-muted/30 border-b border-border sticky top-0 z-10`}>
        <div className="font-semibold text-sm">Swimlane</div>
        {columnsToShow.map((statusCol) => {
          const config = columnConfig[statusCol.key]
          const Icon = config.icon
          return (
            <div key={statusCol.key} className="flex items-center gap-2">
              <Icon className={config.color} size={16} />
              <h3 className="text-xs font-medium tracking-wider">{statusCol.label}</h3>
            </div>
          )
        })}
      </div>
      
      {/* Swimlanes as rows */}
      <div className="space-y-0">
        {swimlanes.map((swimlane) => (
          <Swimlane
            key={swimlane.id}
            swimlane={swimlane}
            cards={cards.filter(card => card.laneId === swimlane.id)}
            onCardDrop={handleCardDrop}
            onCardClick={handleCardClick}
            boardMode={boardMode}
            columnsToShow={columnsToShow}
          />
        ))}
      </div>
    </div>
  )
}
