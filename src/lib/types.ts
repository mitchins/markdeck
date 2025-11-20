/**
 * Type definitions - Backwards compatibility layer
 * 
 * Re-exports from the new core module for existing code.
 * @deprecated Use @/core instead
 */

export type { 
  Card as KanbanCard,
  CardStatus,
  Project as ParsedStatus,
  ProjectMetadata,
  Swimlane,
  Note,
  StatusColumn,
} from '@/core'

export { 
  STATUS_COLUMNS,
  EMOJI_TO_STATUS,
  STATUS_TO_EMOJI,
  BLOCKED_EMOJI,
} from '@/core'
