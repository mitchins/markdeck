import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { KanbanCard as KanbanCardType } from '@/lib/types'
import { CheckCircle, WarningCircle, XCircle, CaretDown, CaretUp, Link as LinkIcon } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'

interface KanbanCardProps {
  card: KanbanCardType
  isDragging?: boolean
}

const statusConfig = {
  Done: {
    icon: CheckCircle,
    color: 'bg-success/10 text-success-foreground border-success/20',
    iconColor: 'text-success',
  },
  InProgress: {
    icon: WarningCircle,
    color: 'bg-warning/10 text-warning-foreground border-warning/20',
    iconColor: 'text-warning',
  },
  Blocked: {
    icon: XCircle,
    color: 'bg-destructive/10 text-destructive-foreground border-destructive/20',
    iconColor: 'text-destructive',
  },
}

export function KanbanCard({ card, isDragging }: KanbanCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const config = statusConfig[card.status]
  const Icon = config.icon
  const hasDescription = card.description && card.description.trim().length > 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.15 }}
    >
      <Card
        className={`p-3 cursor-pointer transition-shadow hover:shadow-md ${
          isDragging ? 'shadow-2xl rotate-1 opacity-50' : ''
        }`}
      >
        <div className="flex items-start gap-2">
          <Icon className={`${config.iconColor} mt-0.5 flex-shrink-0`} size={16} weight="fill" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-xs text-card-foreground leading-snug flex-1">
                {card.title}
              </h4>
              {hasDescription && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 hover:bg-muted"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsExpanded(!isExpanded)
                  }}
                >
                  {isExpanded ? <CaretUp size={12} /> : <CaretDown size={12} />}
                </Button>
              )}
            </div>
            
            <AnimatePresence>
              {hasDescription && isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed whitespace-pre-wrap">
                    {card.description}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            
            {card.links.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {card.links.map((link, i) => (
                  <a
                    key={i}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-accent hover:underline flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <LinkIcon size={10} />
                    <span className="truncate max-w-[150px]">{new URL(link).hostname}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
