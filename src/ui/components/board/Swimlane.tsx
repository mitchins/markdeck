import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { KanbanCard } from './Card'
import type { KanbanCard as KanbanCardType, CardStatus, Swimlane as SwimlaneType } from '@/lib/types'
import { STATUS_COLUMNS } from '@/lib/types'
import { ListChecks, WarningCircle, CheckCircle, Prohibit, CaretDown, CaretUp } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'

interface SwimlaneProps {
  swimlane: SwimlaneType
  cards: KanbanCardType[]
  onCardDrop: (cardId: string, newStatus: CardStatus) => void
  onCardClick: (card: KanbanCardType) => void
  onToggleCollapse?: (laneId: string) => void
}

const columnConfig: Record<CardStatus, {
  icon: typeof ListChecks
  color: string
  bgColor: string
  borderColor: string
}> = {
  todo: {
    icon: ListChecks,
    color: 'text-accent',
    bgColor: 'bg-accent/5',
    borderColor: 'border-accent/20',
  },
  in_progress: {
    icon: WarningCircle,
    color: 'text-warning',
    bgColor: 'bg-warning/5',
    borderColor: 'border-warning/20',
  },
  blocked: {
    icon: Prohibit,
    color: 'text-destructive',
    bgColor: 'bg-destructive/5',
    borderColor: 'border-destructive/20',
  },
  done: {
    icon: CheckCircle,
    color: 'text-success',
    bgColor: 'bg-success/5',
    borderColor: 'border-success/20',
  },
}

export function Swimlane({ swimlane, cards, onCardDrop, onCardClick, onToggleCollapse }: SwimlaneProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleToggle = () => {
    const newCollapsed = !isCollapsed
    setIsCollapsed(newCollapsed)
    onToggleCollapse?.(swimlane.id)
  }

  const cardsByStatus = STATUS_COLUMNS.reduce((acc, col) => {
    acc[col.key] = cards.filter(card => card.status === col.key)
    return acc
  }, {} as Record<CardStatus, KanbanCardType[]>)

  const totalCards = cards.length
  const blockedCount = cards.filter(card => card.status === 'blocked').length

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      <div 
        className="flex items-center justify-between p-4 bg-muted/30 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={handleToggle}
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation()
              handleToggle()
            }}
          >
            {isCollapsed ? <CaretDown size={16} /> : <CaretUp size={16} />}
          </Button>
          <h2 className="text-base font-semibold">{swimlane.title}</h2>
          <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-full">
            {totalCards}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <ListChecks size={14} className="text-accent" weight="fill" />
            {cardsByStatus.todo.length}
          </span>
          <span className="flex items-center gap-1">
            <WarningCircle size={14} className="text-warning" weight="fill" />
            {cardsByStatus.in_progress.length}
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle size={14} className="text-success" weight="fill" />
            {cardsByStatus.done.length}
          </span>
          {blockedCount > 0 && (
            <span className="flex items-center gap-1">
              <Prohibit size={14} className="text-destructive" weight="fill" />
              {blockedCount}
            </span>
          )}
        </div>
      </div>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {STATUS_COLUMNS.map((statusCol) => {
                const config = columnConfig[statusCol.key]
                const Icon = config.icon
                const statusCards = cardsByStatus[statusCol.key]

                return (
                  <div
                    key={statusCol.key}
                    className={`flex flex-col rounded-lg border ${config.borderColor} ${config.bgColor} min-h-[200px]`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      const cardId = e.dataTransfer.getData('cardId')
                      if (cardId) {
                        onCardDrop(cardId, statusCol.key)
                      }
                    }}
                  >
                    <div className="p-3 border-b border-border">
                      <div className="flex items-center gap-2">
                        <Icon className={config.color} size={16} weight="bold" />
                        <h3 className="text-xs font-medium tracking-wider">{statusCol.label}</h3>
                        <span className="ml-auto text-xs text-muted-foreground bg-background/50 px-2 py-0.5 rounded-full">
                          {statusCards.length}
                        </span>
                      </div>
                    </div>

                    <ScrollArea className="flex-1 max-h-[500px]">
                      <div className="p-2 space-y-2">
                        {statusCards.map((card) => (
                          <div
                            key={card.id}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData('cardId', card.id)
                            }}
                            onClick={() => onCardClick(card)}
                          >
                            <KanbanCard card={card} />
                          </div>
                        ))}
                        
                        {statusCards.length === 0 && (
                          <div className="text-center text-muted-foreground text-xs py-6">
                            No items
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
