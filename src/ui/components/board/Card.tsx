import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { KanbanCard as KanbanCardType } from '@/lib/types'
import { XCircle, CaretDown, CaretUp, Link as LinkIcon } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'

interface KanbanCardProps {
  card: KanbanCardType
  isDragging?: boolean
}

export function KanbanCard({ card, isDragging }: KanbanCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
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
        } ${card.status === 'blocked' ? 'border-destructive/40' : ''}`}
      >
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-medium text-xs text-card-foreground leading-snug">
                    {card.title}
                  </h4>
                  {card.status === 'blocked' && (
                    <Badge variant="destructive" className="h-5 px-1.5 text-[10px] font-medium flex items-center gap-1">
                      <XCircle size={10} weight="fill" />
                      Blocked
                    </Badge>
                  )}
                </div>
              </div>
              {hasDescription && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 hover:bg-muted flex-shrink-0"
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
