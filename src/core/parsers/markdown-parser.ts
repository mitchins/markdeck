/**
 * Markdown parser for STATUS.md files
 * 
 * Main parser that converts STATUS.md markdown to domain model.
 */

import type { Project, Note, Card } from '../domain/types'
import { extractMetadata } from './metadata-extractor'
import { parseSwimlanes, getCurrentSwimlane } from './swimlane-parser'
import { parseCard } from './card-parser'
import { IdGenerator } from '../utils/id-generator'

export function parseStatusMarkdown(markdown: string): Project {
  const lines = markdown.split('\n')
  const idGenerator = new IdGenerator()
  
  // Extract metadata from header
  const metadata = extractMetadata(lines)
  
  // Parse swimlanes from H2/H3 headers
  const swimlanes = parseSwimlanes(lines)
  
  // Parse cards and notes
  const cards: Card[] = []
  const notes: Note[] = []
  
  let inCodeBlock = false
  let currentNoteContent: string[] = []
  let currentNoteTitle = ''
  let currentNoteSection = ''
  const headingStack: string[] = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Track code blocks to avoid parsing within them
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock
      if (currentNoteTitle) {
        currentNoteContent.push(line)
      }
      continue
    }
    
    if (inCodeBlock) {
      if (currentNoteTitle) {
        currentNoteContent.push(line)
      }
      continue
    }
    
    // Track headings for note context
    const headingMatch = line.match(/^(#{2,6})\s+(.+)/)
    if (headingMatch) {
      // Save any accumulated note content
      if (currentNoteTitle && currentNoteContent.length > 0) {
        notes.push({
          title: currentNoteTitle,
          content: currentNoteContent.join('\n').trim(),
          section: currentNoteSection,
        })
        currentNoteContent = []
        currentNoteTitle = ''
      }
      
      const level = headingMatch[1].length
      const title = headingMatch[2].trim()
      
      // Update heading stack
      while (headingStack.length >= level - 1) {
        headingStack.pop()
      }
      headingStack.push(title)
      
      continue
    }
    
    // Try to parse as a card
    const currentLaneId = getCurrentSwimlane(lines, i, swimlanes)
    const card = parseCard(line, i, lines, currentLaneId, idGenerator)
    
    if (card) {
      cards.push(card)
    } else if (line.match(/^(\s*)[-*]\s+(.+)/) && line.trim()) {
      // Non-card bullet - collect as note
      if (!currentNoteTitle) {
        currentNoteTitle = headingStack[headingStack.length - 1] || 'Notes'
        currentNoteSection = headingStack.slice(0, -1).join(' / ')
      }
      currentNoteContent.push(line)
    } else if (line.trim() && !line.startsWith('#') && currentNoteTitle) {
      // Regular content line - add to current note
      currentNoteContent.push(line)
    }
  }
  
  // Save any final note content
  if (currentNoteTitle && currentNoteContent.length > 0) {
    notes.push({
      title: currentNoteTitle,
      content: currentNoteContent.join('\n').trim(),
      section: currentNoteSection,
    })
  }
  
  return {
    metadata,
    cards,
    swimlanes,
    notes,
    rawMarkdown: markdown,
  }
}
