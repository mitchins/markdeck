/**
 * BoardView component - renders the board with single header row
 * Extracted from App.tsx to reduce cognitive complexity
 */

import { Swimlane } from './Swimlane'
import { BoardHeader } from './BoardHeader'
import type { ParsedStatus, KanbanCard, CardStatus } from '@/lib/types'
import { getColumnsForMode, getGridClass } from '@/lib/board-utils'

interface BoardViewProps {
  data: ParsedStatus
  onCardMove: (cardId: string, newStatus: CardStatus) => void
  onCardClick: (card: KanbanCard) => void
}

export function BoardView({ data, onCardMove, onCardClick }: BoardViewProps) {
  const boardMode = data.boardMode || 'full'
  const columnsToShow = getColumnsForMode(boardMode)
  const gridColsClass = getGridClass(boardMode)
  
  return (
    <div className="space-y-0">
      <BoardHeader columnsToShow={columnsToShow} gridColsClass={gridColsClass} />
      
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
