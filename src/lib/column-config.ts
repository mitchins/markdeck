/**
 * Shared column configuration for board rendering
 * Used by both Web UI and inline renderers
 */

import type { CardStatus } from './types'
import type { LucideIcon } from 'lucide-react'
import { BadgeCheck, CircleAlert, ListChecks } from 'lucide-react'

export interface ColumnConfig {
  icon: LucideIcon
  color: string
}

export const columnConfig: Record<CardStatus, ColumnConfig> = {
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

export function getColumnIcon(status: CardStatus): LucideIcon {
  return columnConfig[status].icon
}

export function getColumnColor(status: CardStatus): string {
  return columnConfig[status].color
}
