import type { ParsedStatus, KanbanCard, Note, ProjectMetadata, CardStatus } from './types'
import { EMOJI_TO_STATUS } from './types'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function extractEmoji(text: string): { emoji: string | null; remaining: string } {
  const emojiRegex = /(✅|⚠️|❌)/
  const match = text.match(emojiRegex)
  
  if (match) {
    return {
      emoji: match[1],
      remaining: text.replace(emojiRegex, '').trim(),
    }
  }
  
  return { emoji: null, remaining: text.trim() }
}

function extractLinks(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s)]+/g
  return text.match(urlRegex) || []
}

function parseMetadata(lines: string[]): ProjectMetadata {
  const metadata: ProjectMetadata = {
    title: 'Untitled Project',
  }
  
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i]
    
    if (line.startsWith('# ')) {
      metadata.title = line.replace(/^#\s+/, '').trim()
    }
    
    if (line.includes('Last Updated:')) {
      const dateMatch = line.match(/Last Updated:\s*(.+)/)
      if (dateMatch) {
        metadata.lastUpdated = dateMatch[1].trim()
      }
    }
    
    if (line.includes('Version:')) {
      const versionMatch = line.match(/Version:\s*(.+)/)
      if (versionMatch) {
        metadata.version = versionMatch[1].trim()
      }
    }
  }
  
  return metadata
}

export function parseStatusMarkdown(markdown: string): ParsedStatus {
  const lines = markdown.split('\n')
  const cards: KanbanCard[] = []
  const notes: Note[] = []
  const usedIds = new Map<string, number>()
  
  const metadata = parseMetadata(lines)
  
  const headingStack: string[] = []
  let inCodeBlock = false
  let currentNoteContent: string[] = []
  let currentNoteTitle = ''
  let currentNoteSection = ''
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
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
    
    const headingMatch = line.match(/^(#{2,6})\s+(.+)/)
    if (headingMatch) {
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
      
      while (headingStack.length >= level - 1) {
        headingStack.pop()
      }
      headingStack.push(title)
      
      continue
    }
    
    const bulletMatch = line.match(/^\s*[-*]\s+(.+)/)
    if (bulletMatch) {
      const bulletText = bulletMatch[1]
      const { emoji, remaining } = extractEmoji(bulletText)
      
      if (emoji && EMOJI_TO_STATUS[emoji]) {
        const titleMatch = remaining.match(/^([^(:]+)/)
        const title = titleMatch ? titleMatch[1].trim() : remaining
        const description = remaining.substring(title.length).replace(/^[:\s-]+/, '').trim()
        
        const section = headingStack.join(' / ')
        const baseId = slugify(`${section}-${title}`)
        
        let id = baseId
        if (usedIds.has(baseId)) {
          const count = usedIds.get(baseId)! + 1
          usedIds.set(baseId, count)
          id = `${baseId}-${count}`
        } else {
          usedIds.set(baseId, 0)
        }
        
        const links = extractLinks(remaining)
        
        cards.push({
          id,
          title,
          status: EMOJI_TO_STATUS[emoji],
          section,
          description: description || undefined,
          links,
          originalLine: i,
        })
      } else if (emoji === null && remaining.length > 0) {
        if (currentNoteTitle) {
          currentNoteContent.push(line)
        } else {
          currentNoteTitle = headingStack[headingStack.length - 1] || 'Notes'
          currentNoteSection = headingStack.slice(0, -1).join(' / ')
          currentNoteContent.push(line)
        }
      }
    } else if (line.trim() && !line.startsWith('#') && currentNoteTitle) {
      currentNoteContent.push(line)
    }
  }
  
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
    notes,
    rawMarkdown: markdown,
  }
}

export function projectToMarkdown(
  metadata: ProjectMetadata,
  cards: KanbanCard[],
  rawMarkdown: string
): string {
  const lines = rawMarkdown.split('\n')
  
  const cardsByLine = new Map<number, KanbanCard>()
  cards.forEach((card) => {
    cardsByLine.set(card.originalLine, card)
  })
  
  const updatedLines = lines.map((line, index) => {
    const card = cardsByLine.get(index)
    if (!card) return line
    
    const { emoji, remaining } = extractEmoji(line)
    if (!emoji) return line
    
    const newEmoji = getEmojiForStatus(card.status)
    const indent = line.match(/^\s*/)?.[0] || ''
    const descriptionPart = card.description ? ` ${card.description}` : ''
    
    return `${indent}- ${newEmoji} ${card.title}${descriptionPart}`
  })
  
  const today = new Date().toISOString().split('T')[0]
  const finalLines = updatedLines.map((line) => {
    if (line.includes('Last Updated:')) {
      return line.replace(/Last Updated:\s*(.+)/, `Last Updated:** ${today}`)
    }
    return line
  })
  
  return finalLines.join('\n')
}

function getEmojiForStatus(status: CardStatus): string {
  const map: Record<CardStatus, string> = {
    Done: '✅',
    InProgress: '⚠️',
    Blocked: '❌',
  }
  return map[status]
}
