/**
 * Terminal renderer for MarkDeck projects
 * 
 * Renders a parsed Project as a text-based Kanban board in the terminal
 */

import type { Project, Card, Swimlane, CardStatus } from '../../../src/core/domain/types.js'
import { STATUS_COLUMNS, STATUS_TO_EMOJI } from '../../../src/core/domain/types.js'
import { colorize, separator, ANSI } from './ansi.js'

interface RenderOptions {
  width?: number
  showMetadata?: boolean
}

/**
 * Render a project to terminal output
 */
export function renderProject(project: Project, options: RenderOptions = {}): string {
  const { width = 100, showMetadata = true } = options
  const lines: string[] = []
  
  // Clear screen and move cursor to top
  lines.push(ANSI.clearScreen + ANSI.cursorHome)
  
  // Render metadata header
  if (showMetadata) {
    lines.push(colorize('╔' + '═'.repeat(width - 2) + '╗', 'cyan', 'bold'))
    lines.push(colorize('║ ', 'cyan', 'bold') + colorize(project.metadata.title, 'white', 'bold') + colorize(' '.repeat(width - project.metadata.title.length - 4) + '║', 'cyan', 'bold'))
    
    if (project.metadata.version || project.metadata.lastUpdated) {
      const metaInfo = [
        project.metadata.version ? `v${project.metadata.version}` : null,
        project.metadata.lastUpdated ? `Updated: ${project.metadata.lastUpdated}` : null,
      ].filter(Boolean).join(' • ')
      
      lines.push(colorize('║ ', 'cyan', 'bold') + colorize(metaInfo, 'gray') + colorize(' '.repeat(width - metaInfo.length - 4) + '║', 'cyan', 'bold'))
    }
    
    lines.push(colorize('╚' + '═'.repeat(width - 2) + '╝', 'cyan', 'bold'))
    lines.push('')
  }
  
  // Render swimlanes
  const sortedLanes = [...project.swimlanes].sort((a, b) => a.order - b.order)
  
  for (const lane of sortedLanes) {
    lines.push(...renderSwimlane(lane, project.cards, width))
    lines.push('') // Spacing between swimlanes
  }
  
  // Summary statistics
  const stats = getProjectStats(project)
  lines.push(separator('─', width))
  lines.push(
    colorize('Summary: ', 'cyan', 'bold') +
    colorize(`${stats.total} cards`, 'white') +
    colorize(' • ', 'gray') +
    colorize(`${stats.todo} TODO`, 'yellow') +
    colorize(' • ', 'gray') +
    colorize(`${stats.inProgress} IN PROGRESS`, 'magenta') +
    colorize(' • ', 'gray') +
    colorize(`${stats.done} DONE`, 'green') +
    (stats.blocked > 0 ? colorize(' • ', 'gray') + colorize(`${stats.blocked} BLOCKED`, 'red') : '')
  )
  
  return lines.join('\n')
}

/**
 * Render a single swimlane with its cards grouped by status
 */
function renderSwimlane(lane: Swimlane, allCards: Card[], width: number): string[] {
  const lines: string[] = []
  const laneCards = allCards.filter(card => card.laneId === lane.id)
  
  // Swimlane header
  lines.push(colorize(`▓▓ ${lane.title.toUpperCase()}`, 'blue', 'bold'))
  lines.push(separator('─', width))
  
  // Group cards by status
  const cardsByStatus: Record<CardStatus, Card[]> = {
    todo: [],
    in_progress: [],
    done: [],
  }
  
  for (const card of laneCards) {
    cardsByStatus[card.status].push(card)
  }
  
  // Render each status column
  for (const column of STATUS_COLUMNS) {
    const cards = cardsByStatus[column.key]
    if (cards.length === 0) continue
    
    // Status header
    const statusHeader = `  ${column.emoji} ${column.label}`
    lines.push(colorize(statusHeader, getStatusColor(column.key), 'bold'))
    
    // Render cards in this status
    for (const card of cards) {
      lines.push(...renderCard(card))
    }
    
    lines.push('') // Spacing after status column
  }
  
  return lines
}

/**
 * Render a single card
 */
function renderCard(card: Card): string[] {
  const lines: string[] = []
  const indent = '    '
  
  // Card title with emoji indicator
  const emoji = STATUS_TO_EMOJI[card.status]
  const blockedIndicator = card.blocked ? ' ❌ BLOCKED' : ''
  const titleColor = card.blocked ? 'red' : 'white'
  
  lines.push(indent + colorize(`${emoji} ${card.title}${blockedIndicator}`, titleColor))
  
  // Card description (if present)
  if (card.description) {
    const descLines = card.description.split('\n')
    for (const descLine of descLines) {
      if (descLine.trim()) {
        lines.push(indent + '  ' + colorize(descLine.trim(), 'gray'))
      }
    }
  }
  
  // Card links (if present)
  if (card.links.length > 0) {
    for (const link of card.links) {
      lines.push(indent + '  ' + colorize(`🔗 ${link}`, 'cyan'))
    }
  }
  
  return lines
}

/**
 * Get color for status
 */
function getStatusColor(status: CardStatus): keyof typeof ANSI.fg {
  switch (status) {
    case 'todo':
      return 'yellow'
    case 'in_progress':
      return 'magenta'
    case 'done':
      return 'green'
    default:
      return 'white'
  }
}

/**
 * Calculate project statistics
 */
function getProjectStats(project: Project) {
  return {
    total: project.cards.length,
    todo: project.cards.filter(c => c.status === 'todo').length,
    inProgress: project.cards.filter(c => c.status === 'in_progress').length,
    done: project.cards.filter(c => c.status === 'done').length,
    blocked: project.cards.filter(c => c.blocked).length,
  }
}
