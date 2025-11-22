/**
 * Markdown serializer for STATUS.md files
 * 
 * Converts domain model back to STATUS.md markdown with round-trip fidelity.
 * Preserves original format (emoji or checkbox) per card.
 */

import type { Project, Card } from '../domain/types'
import { statusToEmoji, statusToCheckbox } from '../utils/emoji-mapper'
import { formatLastUpdated } from '../utils/date-formatter'
import { getIndentLevel } from './card-parser'

export function serializeProject(project: Project): string {
  const lines = project.rawMarkdown.split('\n')
  
  // Create a map of cards by their original line number
  const cardsByLine = new Map<number, Card>()
  project.cards.forEach((card) => {
    cardsByLine.set(card.originalLine, card)
  })
  
  const updatedLines: string[] = []
  let i = 0
  
  while (i < lines.length) {
    const line = lines[i]
    const card = cardsByLine.get(i)
    
    // If not a card line, keep original
    if (!card) {
      updatedLines.push(line)
      i++
      continue
    }
    
    // Serialize the card based on its original format
    const indent = line.match(/^\s*/)?.[0] || ''
    let statusMarker: string
    
    if (card.originalFormat === 'checkbox') {
      // Use checkbox format - simple mode only supports todo/done
      statusMarker = statusToCheckbox(card.status)
    } else {
      // Use emoji format with RYGBO based on (status, blocked)
      // DONE cards are never blocked (normalize if needed)
      const blocked = card.status === 'done' ? false : card.blocked
      statusMarker = statusToEmoji(card.status, blocked)
    }
    
    // Add card title line with status
    updatedLines.push(`${indent}- ${statusMarker} ${card.title}`)
    
    // Add description lines if present
    if (card.description && card.description.trim()) {
      const descLines = card.description.split('\n')
      descLines.forEach((descLine) => {
        updatedLines.push(`${indent}    ${descLine}`)
      })
    }
    
    // Skip original description lines in the raw markdown
    const baseIndentLevel = getIndentLevel(line)
    i++
    
    while (i < lines.length) {
      const nextLine = lines[i]
      if (nextLine.trim() === '') {
        i++
        continue
      }
      
      const nextIndent = getIndentLevel(nextLine)
      
      // Skip lines that were part of the original description
      if (nextIndent > baseIndentLevel && !nextLine.match(/^(#{1,6})\s+/)) {
        i++
      } else {
        break
      }
    }
  }
  
  // Update the last updated date
  const today = formatLastUpdated()
  const finalLines = updatedLines.map((line) => {
    if (line.includes('Last Updated:')) {
      return line.replace(/Last Updated:.*?(\d{4}-\d{2}-\d{2})/, `Last Updated:** ${today}`)
    }
    return line
  })
  
  return finalLines.join('\n')
}

export function projectToMarkdown(project: Project): string {
  return serializeProject(project)
}
