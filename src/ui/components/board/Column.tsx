import { ScrollArea } from '@/components/ui/scroll-area'
import { KanbanCard } from './KanbanCard'
import type { KanbanCard as KanbanCardType, CardStatus } from '@/lib/types'
import { CheckCircle, WarningCircle, XCircle } from '@phosphor-icons/react'

interface KanbanColumnProps {
  status: CardStatus
  cards: KanbanCardType[]
  onCardDrop: (cardId: string, newStatus: CardStatus) => void
}

const columnConfig = {
  Done: {
    title: 'DONE',
    icon: CheckCircle,
    color: 'text-success',
    bgColor: 'bg-success/5',
  },
  InProgress: {
    title: 'IN PROGRESS',
    icon: WarningCircle,
    color: 'text-warning',
    bgColor: 'bg-warning/5',
  },
  Blocked: {
    title: 'BLOCKED',
    icon: XCircle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/5',
  },
}

export function KanbanColumn({ status, cards, onCardDrop }: KanbanColumnProps) {
  const config = columnConfig[status]
  const Icon = config.icon

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const cardId = e.dataTransfer.getData('cardId')
    if (cardId) {
      onCardDrop(cardId, status)
    }
  }

  return (
    <div
      className={`flex flex-col h-full rounded-lg border border-border ${config.bgColor}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon className={config.color} size={20} weight="bold" />
          <h3 className="text-sm font-medium tracking-wider">{config.title}</h3>
          <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {cards.length}
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {cards.map((card) => (
            <div
              key={card.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('cardId', card.id)
              }}
            >
              <KanbanCard card={card} />
            </div>
          ))}
          
          {cards.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-8">
              No items
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
