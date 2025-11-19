export type CardStatus = 'Done' | 'InProgress' | 'Blocked'

export interface KanbanCard {
  id: string
  title: string
  status: CardStatus
  laneId: string
  description?: string
  links: string[]
  tasks?: SubTask[]
  originalLine: number
  hasWarning?: boolean
  warningMessage?: string
}

export interface SubTask {
  title: string
  status: CardStatus
  completed: boolean
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

export const STATUS_EMOJI = {
  Done: '✅',
  InProgress: '⚠️',
  Blocked: '❌',
} as const

export const EMOJI_TO_STATUS: Record<string, CardStatus> = {
  '✅': 'Done',
  '⚠️': 'InProgress',
  '❌': 'Blocked',
}
