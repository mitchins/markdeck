export type CardStatus = 'todo' | 'in_progress' | 'done'

export interface StatusColumn {
  key: CardStatus
  label: string
  emoji: string
}

export const STATUS_COLUMNS: StatusColumn[] = [
  { key: 'todo', label: 'TODO', emoji: '❗' },
  { key: 'in_progress', label: 'IN PROGRESS', emoji: '⚠️' },
  { key: 'done', label: 'DONE', emoji: '✅' },
]

export interface KanbanCard {
  id: string
  title: string
  status: CardStatus
  laneId: string
  blocked: boolean
  description?: string
  links: string[]
  originalLine: number
}

export interface Swimlane {
  id: string
  title: string
  order: number
  collapsed?: boolean
}

export interface ProjectMetadata {
  title: string
  version?: string
  lastUpdated?: string
}

export interface Note {
  title: string
  content: string
  section: string
}

export interface ParsedStatus {
  metadata: ProjectMetadata
  cards: KanbanCard[]
  swimlanes: Swimlane[]
  notes: Note[]
  rawMarkdown: string
}

export const EMOJI_TO_STATUS: Record<string, CardStatus> = {
  '❗': 'todo',
  '⚠️': 'in_progress',
  '✅': 'done',
}

export const BLOCKED_EMOJI = '❌'
