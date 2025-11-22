/**
 * BoardView component - renders the board with single header row
 * Extracted from App.tsx to reduce cognitive complexity
 */

import { Swimlane } from './Swimlane'
import type { ParsedStatus, KanbanCard, CardStatus } from '@/lib/types'
import { STATUS_COLUMNS } from '@/lib/types'
import { getColumnIcon, getColumnColor } from '@/lib/column-config'

interface BoardViewProps {
  data: ParsedStatus
  onCardMove: (cardId: string, newStatus: CardStatus) => void
  onCardClick: (card: KanbanCard) => void
}

export function BoardView({ data, onCardMove, onCardClick }: BoardViewProps) {
  const boardMode = data.boardMode || 'full'
  
  // For simple mode, only show TODO and DONE columns
  const columnsToShow = boardMode === 'simple' 
    ? STATUS_COLUMNS.filter(col => col.key === 'todo' || col.key === 'done')
    : STATUS_COLUMNS
  
  // Grid columns based on mode
  const gridColsClass = boardMode === 'simple'
    ? 'grid-cols-[auto_1fr_1fr]'
    : 'grid-cols-[auto_1fr_1fr_1fr]'
  
  return (
    <div className="space-y-0">
      {/* Single header row for all columns */}
      <div className={`grid ${gridColsClass} gap-4 p-4 bg-muted/30 border-b border-border sticky top-0 z-10`}>
        <div className="font-semibold text-sm">Swimlane</div>
        {columnsToShow.map((statusCol) => {
          const Icon = getColumnIcon(statusCol.key)
          const color = getColumnColor(statusCol.key)
          return (
            <div key={statusCol.key} className="flex items-center gap-2">
              <Icon className={color} size={16} />
              <h3 className="text-xs font-medium tracking-wider">{statusCol.label}</h3>
            </div>
          )
        })}
      </div>
      
      {/* Swimlanes as rows */}
      <div className="space-y-0">
        {data.swimlanes.map((swimlane) => {
          const laneCards = data.cards.filter(card => card.laneId === swimlane.id)
          return (
            <Swimlane
              key={swimlane.id}
              swimlane={swimlane}
              cards={laneCards}
              onCardDrop={onCardMove}
              onCardClick={onCardClick}
              boardMode={boardMode}
              columnsToShow={columnsToShow}
            />
          )
        })}
      </div>
    </div>
  )
}
