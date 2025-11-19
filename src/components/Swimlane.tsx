import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { KanbanCard } from './KanbanCard'
import type { KanbanCard as KanbanCardType, CardStatus, Swimlane as SwimlaneType } from '@/lib/types'
import { CheckCircle, WarningCircle, XCircle, CaretDown, CaretUp } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'

interface SwimlaneProps {
  swimlane: SwimlaneType
  cards: KanbanCardType[]
  onCardDrop: (cardId: string, newStatus: CardStatus) => void
  onCardClick: (card: KanbanCardType) => void
  onToggleCollapse?: (laneId: string) => void
}

const columnConfig = {
  Done: {
    title: 'DONE',
    icon: CheckCircle,
    color: 'text-success',
    bgColor: 'bg-success/5',
    borderColor: 'border-success/20',
  },
  InProgress: {
    title: 'IN PROGRESS',
    icon: WarningCircle,
    color: 'text-warning',
    bgColor: 'bg-warning/5',
    borderColor: 'border-warning/20',
  },
  Blocked: {
    title: 'BLOCKED',
    icon: XCircle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/5',
    borderColor: 'border-destructive/20',
  },
}

const statuses: CardStatus[] = ['Done', 'InProgress', 'Blocked']

export function Swimlane({ swimlane, cards, onCardDrop, onCardClick, onToggleCollapse }: SwimlaneProps) {
  const [isCollapsed, setIsCollapsed] = useState(swimlane.collapsed || false)

  const handleToggle = () => {
    const newCollapsed = !isCollapsed
    setIsCollapsed(newCollapsed)
    onToggleCollapse?.(swimlane.id)
  }

  const cardsByStatus = statuses.reduce((acc, status) => {
    acc[status] = cards.filter(card => card.status === status)
    return acc
  }, {} as Record<CardStatus, KanbanCardType[]>)

  const totalCards = cards.length

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
            <CheckCircle size={14} className="text-success" weight="fill" />
            {cardsByStatus.Done.length}
          </span>
          <span className="flex items-center gap-1">
            <WarningCircle size={14} className="text-warning" weight="fill" />
            {cardsByStatus.InProgress.length}
          </span>
          <span className="flex items-center gap-1">
            <XCircle size={14} className="text-destructive" weight="fill" />
            {cardsByStatus.Blocked.length}
          </span>
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
              {statuses.map((status) => {
                const config = columnConfig[status]
                const Icon = config.icon
                const statusCards = cardsByStatus[status]

                return (
                  <div
                    key={status}
                    className={`flex flex-col rounded-lg border ${config.borderColor} ${config.bgColor} min-h-[200px]`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      const cardId = e.dataTransfer.getData('cardId')
                      if (cardId) {
                        onCardDrop(cardId, status)
                      }
                    }}
                  >
                    <div className="p-3 border-b border-border">
                      <div className="flex items-center gap-2">
                        <Icon className={config.color} size={16} weight="bold" />
                        <h3 className="text-xs font-medium tracking-wider">{config.title}</h3>
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
