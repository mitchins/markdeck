/**
 * Core domain types for MarkDeck
 * 
 * These types define the pure domain model without any UI or framework dependencies.
 */

export type CardStatus = 'todo' | 'in_progress' | 'blocked' | 'done'

export interface StatusColumn {
  key: CardStatus
  label: string
  emoji: string
}

export const STATUS_COLUMNS: StatusColumn[] = [
  { key: 'todo', label: 'TODO', emoji: '🔵' },
  { key: 'in_progress', label: 'IN PROGRESS', emoji: '🟡' },
  { key: 'blocked', label: 'BLOCKED', emoji: '🔴' },
  { key: 'done', label: 'DONE', emoji: '🟢' },
]

export interface Card {
  id: string
  title: string
  status: CardStatus
  laneId: string
  description?: string
  links: string[]
  originalLine: number
}

export interface Swimlane {
  id: string
  title: string
  order: number
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

export interface Project {
  metadata: ProjectMetadata
  cards: Card[]
  swimlanes: Swimlane[]
  notes: Note[]
  rawMarkdown: string
}

export const EMOJI_TO_STATUS: Record<string, CardStatus> = {
  '🔵': 'todo',
  '🟡': 'in_progress',
  '🔴': 'blocked',
  '🟢': 'done',
}

export const STATUS_TO_EMOJI: Record<CardStatus, string> = {
  todo: '🔵',
  in_progress: '🟡',
  blocked: '🔴',
  done: '🟢',
}
