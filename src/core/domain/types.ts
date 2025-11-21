/**
 * Core domain types for MarkDeck
 * 
 * These types define the pure domain model without any UI or framework dependencies.
 */

export type CardStatus = 'todo' | 'in_progress' | 'done'

export interface StatusColumn {
  key: CardStatus
  label: string
  emoji: string
}

export const STATUS_COLUMNS: StatusColumn[] = [
  { key: 'todo', label: 'TODO', emoji: '🔵' },
  { key: 'in_progress', label: 'IN PROGRESS', emoji: '🟡' },
  { key: 'done', label: 'DONE', emoji: '🟢' },
]

export interface Card {
  id: string
  title: string
  status: CardStatus
  blocked: boolean
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

// RYGBO emoji mappings - emojis map to (status, blocked) tuples
export const EMOJI_TO_STATUS_BLOCKED: Record<string, { status: CardStatus; blocked: boolean }> = {
  '🔵': { status: 'todo', blocked: false },       // Blue - TODO
  '🔴': { status: 'todo', blocked: true },        // Red - Blocked TODO
  '🟡': { status: 'in_progress', blocked: false }, // Yellow - IN PROGRESS
  '🟧': { status: 'in_progress', blocked: true },  // Orange - Blocked IN PROGRESS
  '🟢': { status: 'done', blocked: false },       // Green - DONE
}

// Legacy mappings for backward compatibility (deprecated)
export const EMOJI_TO_STATUS: Record<string, CardStatus> = {
  '🔵': 'todo',
  '🟡': 'in_progress',
  '🔴': 'todo',  // Legacy: mapped to todo
  '🟧': 'in_progress',  // Legacy: mapped to in_progress
  '🟢': 'done',
}

export const STATUS_TO_EMOJI: Record<CardStatus, string> = {
  todo: '🔵',
  in_progress: '🟡',
  done: '🟢',
}
