import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { KanbanCard as KanbanCardType } from '@/lib/types'
import { CheckCircle, WarningCircle, XCircle } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

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
  const config = statusConfig[card.status]
  const Icon = config.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`p-4 cursor-move transition-shadow hover:shadow-lg ${
          isDragging ? 'shadow-2xl rotate-1 opacity-50' : ''
        }`}
      >
        <div className="flex items-start gap-3">
          <Icon className={`${config.iconColor} mt-0.5 flex-shrink-0`} size={20} weight="fill" />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-card-foreground mb-1 leading-snug">
              {card.title}
            </h4>
            
            {card.description && (
              <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
                {card.description}
              </p>
            )}
            
            {card.section && (
              <Badge variant="outline" className="text-xs mb-2">
                {card.section}
              </Badge>
            )}
            
            {card.links.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {card.links.map((link, i) => (
                  <a
                    key={i}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-accent hover:underline truncate max-w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {link}
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
