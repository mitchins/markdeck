/**
 * Parser module - Backwards compatibility layer
 * 
 * Re-exports from the new core module for existing code.
 * @deprecated Use @/core instead
 */

import { parseStatusMarkdown as coreParseStatusMarkdown, projectToMarkdown as coreProjectToMarkdown } from '@/core'
import type { Project, Card, ProjectMetadata } from '@/core'

// Type aliases for backwards compatibility
export type ParsedStatus = Project
export type KanbanCard = Card

// Re-export parser functions
export function parseStatusMarkdown(markdown: string): ParsedStatus {
  return coreParseStatusMarkdown(markdown)
}

export function projectToMarkdown(
  metadata: ProjectMetadata,
  cards: KanbanCard[],
  rawMarkdown: string
): string {
  const project: Project = {
    metadata,
    cards,
    swimlanes: [],
    notes: [],
    rawMarkdown,
  }
  return coreProjectToMarkdown(project)
}
