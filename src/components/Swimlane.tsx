import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { KanbanCard } from './KanbanCard'
import type { KanbanCard as KanbanCardType, CardStatus, Swimlane as SwimlaneType, BoardMode, StatusColumn } from '@/lib/types'
import { STATUS_COLUMNS } from '@/lib/types'
import { BadgeCheck, CircleAlert, ChevronDown, ChevronUp, ListChecks } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SwimlaneProps {
  readonly swimlane: SwimlaneType
  readonly cards: KanbanCardType[]
  readonly onCardDrop: (cardId: string, newStatus: CardStatus) => void
  readonly onCardClick: (card: KanbanCardType) => void
  readonly onToggleCollapse?: (laneId: string) => void
  readonly boardMode?: BoardMode
  readonly columnsToShow?: StatusColumn[]
}

export function Swimlane({ swimlane, cards, onCardDrop, onCardClick, onToggleCollapse, boardMode = 'full', columnsToShow }: SwimlaneProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleToggle = () => {
    const newCollapsed = !isCollapsed
    setIsCollapsed(newCollapsed)
    onToggleCollapse?.(swimlane.id)
  }

  // Use provided columns or default to STATUS_COLUMNS
  const columns = columnsToShow || (boardMode === 'simple' 
    ? STATUS_COLUMNS.filter((col: StatusColumn) => col.key === 'todo' || col.key === 'done')
    : STATUS_COLUMNS)

  const cardsByStatus = columns.reduce((acc: Record<CardStatus, KanbanCardType[]>, col: StatusColumn) => {
    acc[col.key] = cards.filter(card => card.status === col.key)
    return acc
  }, {} as Record<CardStatus, KanbanCardType[]>)

  const totalCards = cards.length
  const blockedCount = cards.filter(card => card.blocked).length

  // Grid columns based on mode
  const gridColsClass = boardMode === 'simple'
    ? 'grid-cols-[auto_1fr_1fr]'
    : 'grid-cols-[auto_1fr_1fr_1fr]'

  return (
    <div className="border-b border-border bg-card">
      {/* Swimlane header row - separate from cards */}
      <button
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border/50 w-full text-left bg-transparent border-0"
        onClick={handleToggle}
        aria-expanded={!isCollapsed}
        aria-label={`Toggle ${swimlane.title} swimlane`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation()
              handleToggle()
            }}
            aria-label={isCollapsed ? 'Expand swimlane' : 'Collapse swimlane'}
          >
            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </Button>
          <h2 className="text-base font-semibold truncate">{swimlane.title}</h2>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-shrink-0">
          <span className="flex items-center gap-1">
            <ListChecks size={12} className="text-accent" />
            {cardsByStatus.todo?.length || 0}
          </span>
          {boardMode === 'full' && (
            <span className="flex items-center gap-1">
              <CircleAlert size={12} className="text-warning" />
              {cardsByStatus.in_progress?.length || 0}
            </span>
          )}
          <span className="flex items-center gap-1">
            <BadgeCheck size={12} className="text-success" />
            {cardsByStatus.done?.length || 0}
          </span>
          {blockedCount > 0 && (
            <span className="flex items-center gap-1 text-destructive">
              🔴 {blockedCount}
            </span>
          )}
          <span className="bg-background px-2 py-0.5 rounded-full">
            {totalCards}
          </span>
        </div>
      </button>

      {/* Cards grid - aligned with header columns */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className={`grid ${gridColsClass} gap-4 p-4`}>
              {/* Empty cell for swimlane title column - maintains grid alignment with header */}
              <div />
              
              {/* Column cells */}
              {columns.map((statusCol: StatusColumn) => {
                const statusCards = cardsByStatus[statusCol.key] || []
                
                return (
                  <div
                    key={statusCol.key}
                    className="min-h-[80px]"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      const cardId = e.dataTransfer.getData('cardId')
                      if (cardId) {
                        onCardDrop(cardId, statusCol.key)
                      }
                    }}
                  >
                    <ScrollArea className="max-h-[400px]">
                      <div className="space-y-2 pr-2">
                        {statusCards.map((card) => (
                          <div
                            key={card.id}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData('cardId', card.id)
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              onCardClick(card)
                            }}
                          >
                            <KanbanCard card={card} />
                          </div>
                        ))}
                        
                        {statusCards.length === 0 && (
                          <div className="text-center text-muted-foreground text-xs py-4">
                            —
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
