/**
 * Shared rendering utilities for board layout
 */

import { STATUS_COLUMNS } from '@/lib/types'
import type { StatusColumn, BoardMode } from '@/lib/types'

/**
 * Get columns to display based on board mode
 */
export function getColumnsForMode(boardMode: BoardMode): StatusColumn[] {
  return boardMode === 'simple' 
    ? STATUS_COLUMNS.filter(col => col.key === 'todo' || col.key === 'done')
    : STATUS_COLUMNS
}

/**
 * Get grid CSS class based on board mode
 */
export function getGridClass(boardMode: BoardMode): string {
  return boardMode === 'simple'
    ? 'grid-cols-[auto_1fr_1fr]'
    : 'grid-cols-[auto_1fr_1fr_1fr]'
}
