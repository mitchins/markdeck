/**
 * Terminal renderer for MarkDeck projects
 * 
 * Renders a parsed Project as a text-based Kanban board in the terminal
 */

import type { Project, Card, Swimlane, CardStatus } from '../../../src/core/domain/types.js'
import { STATUS_COLUMNS, STATUS_TO_EMOJI } from '../../../src/core/domain/types.js'
import { colorize, separator, ANSI, stripAnsi } from './ansi.js'

interface RenderOptions {
  width?: number
  showMetadata?: boolean
  highlightedCard?: string // Card ID to highlight
}

/**
 * Render a project to terminal output
 */
export function renderProject(project: Project, options: RenderOptions = {}): string {
  const { width = 100, showMetadata = true, highlightedCard } = options
  const lines: string[] = []
  
  // Clear screen and move cursor to top
  lines.push(ANSI.clearScreen + ANSI.cursorHome)
  
  // Render metadata header
  if (showMetadata) {
    lines.push(colorize('╔' + '═'.repeat(width - 2) + '╗', 'cyan', 'bold'))
    
    // Truncate or pad title to fit
    const titleText = project.metadata.title.length > width - 4 
      ? project.metadata.title.substring(0, width - 7) + '...'
      : project.metadata.title
    const titlePadding = Math.max(0, width - titleText.length - 4)
    lines.push(
      colorize('║ ', 'cyan', 'bold') + 
      colorize(titleText, 'white', 'bold') + 
      colorize(' '.repeat(titlePadding) + '║', 'cyan', 'bold')
    )
    
    if (project.metadata.version || project.metadata.lastUpdated) {
      const metaInfo = [
        project.metadata.version ? `v${project.metadata.version}` : null,
        project.metadata.lastUpdated ? `Updated: ${project.metadata.lastUpdated}` : null,
      ].filter(Boolean).join(' • ')
      
      // Truncate or pad metadata to fit
      const metaText = metaInfo.length > width - 4
        ? metaInfo.substring(0, width - 7) + '...'
        : metaInfo
      const metaPadding = Math.max(0, width - metaText.length - 4)
      lines.push(
        colorize('║ ', 'cyan', 'bold') + 
        colorize(metaText, 'gray') + 
        colorize(' '.repeat(metaPadding) + '║', 'cyan', 'bold')
      )
    }
    
    lines.push(colorize('╚' + '═'.repeat(width - 2) + '╝', 'cyan', 'bold'))
    lines.push('')
  }
  
  // Render swimlanes
  const sortedLanes = [...project.swimlanes].sort((a, b) => a.order - b.order)
  
  for (const lane of sortedLanes) {
    lines.push(...renderSwimlaneColumns(lane, project.cards, width, highlightedCard))
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
  lines.push('')
  lines.push(colorize('Controls: ', 'cyan', 'bold') + colorize('↑↓=navigate  ⇧←⇧→=move to lane  b=toggle block  q=quit', 'gray'))
  
  return lines.join('\n')
}

/**
 * Render a single swimlane with cards in columns
 */
function renderSwimlaneColumns(lane: Swimlane, allCards: Card[], width: number, highlightedCard?: string): string[] {
  const lines: string[] = []
  const laneCards = allCards.filter(card => card.laneId === lane.id)
  
  // Swimlane header
  lines.push(colorize(`▓▓ ${lane.title.toUpperCase()}`, 'blue', 'bold'))
  lines.push(separator('─', width))
  
  // Group cards by status
  const cardsByStatus = STATUS_COLUMNS.reduce((acc, column) => {
    acc[column.key] = []
    return acc
  }, {} as Record<CardStatus, Card[]>)
  
  for (const card of laneCards) {
    cardsByStatus[card.status].push(card)
  }
  
  // Calculate column width (3 columns)
  const colWidth = Math.floor((width - 6) / 3) // 6 chars for spacing
  
  // Convert cards to rendered lines per column
  const columnLines: string[][] = STATUS_COLUMNS.map(column => {
    const cards = cardsByStatus[column.key]
    const colLines: string[] = []
    
    // Column header
    colLines.push(colorize(`${column.emoji} ${column.label}`, getStatusColor(column.key), 'bold'))
    colLines.push(colorize('─'.repeat(colWidth), 'gray'))
    
    // Render cards
    if (cards.length === 0) {
      colLines.push(colorize('(empty)', 'gray'))
    } else {
      for (const card of cards) {
        colLines.push(...renderCardCompact(card, colWidth, highlightedCard))
      }
    }
    
    return colLines
  })
  
  // Find max height
  const maxHeight = Math.max(...columnLines.map(col => col.length))
  
  // Render columns side by side
  for (let row = 0; row < maxHeight; row++) {
    const rowParts: string[] = []
    for (const col of columnLines) {
      const line = col[row] || ''
      const stripped = stripAnsi(line)
      const padding = Math.max(0, colWidth - stripped.length)
      rowParts.push(line + ' '.repeat(padding))
    }
    lines.push(rowParts.join('  '))
  }
  
  return lines
}

/**
 * Render a card in compact form (for columns)
 */
function renderCardCompact(card: Card, maxWidth: number, highlightedCard?: string): string[] {
  const lines: string[] = []
  const emoji = STATUS_TO_EMOJI[card.status]
  const blockedIndicator = card.status === 'blocked' ? ' 🔴' : ''
  
  // Determine if this card is highlighted
  const isHighlighted = highlightedCard === card.id
  
  // Build title without ANSI codes first to check length
  const plainTitle = `${emoji}${blockedIndicator} ${card.title}`
  let displayTitle = plainTitle
  
  // Truncate if necessary (based on plain text length)
  if (plainTitle.length > maxWidth) {
    displayTitle = plainTitle.substring(0, maxWidth - 3) + '...'
  }
  
  // Apply styling after truncation
  if (isHighlighted) {
    lines.push(ANSI.bg.blue + colorize(displayTitle, 'white', 'bold') + ANSI.reset)
  } else if (card.status === 'blocked') {
    lines.push(colorize(displayTitle, 'red'))
  } else {
    lines.push(colorize(displayTitle, 'white'))
  }
  
  lines.push('') // Empty line between cards
  return lines
}

/**
 * Render a single card (detailed view - kept for future use)
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function renderCard(card: Card, highlightedCard?: string): string[] {
  const lines: string[] = []
  const indent = '    '
  
  // Card title with emoji indicator
  const emoji = STATUS_TO_EMOJI[card.status]
  const blockedIndicator = card.status === 'blocked' ? ' 🔴 BLOCKED' : ''
  const titleColor = card.status === 'blocked' ? 'red' : 'white'
  const isHighlighted = highlightedCard === card.id
  
  if (isHighlighted) {
    lines.push(indent + ANSI.bg.blue + colorize(`${emoji} ${card.title}${blockedIndicator}`, 'white', 'bold') + ANSI.reset)
  } else {
    lines.push(indent + colorize(`${emoji} ${card.title}${blockedIndicator}`, titleColor))
  }
  
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
    blocked: project.cards.filter(c => c.status === 'blocked').length,
  }
}
