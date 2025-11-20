import type { ParsedStatus, KanbanCard, Note, ProjectMetadata, CardStatus, Swimlane } from './types'
import { EMOJI_TO_STATUS, BLOCKED_EMOJI, STATUS_COLUMNS } from './types'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function extractEmoji(text: string): { 
  statusEmoji: string | null
  blockedEmoji: string | null
  remaining: string 
} {
  const statusEmojiRegex = /(✅|⚠️|❗)/
  const blockedEmojiRegex = /(❌)/
  
  const statusMatch = text.match(statusEmojiRegex)
  const blockedMatch = text.match(blockedEmojiRegex)
  
  let remaining = text
  
  if (statusMatch) {
    remaining = remaining.replace(statusEmojiRegex, '').trim()
  }
  
  if (blockedMatch) {
    remaining = remaining.replace(blockedEmojiRegex, '').trim()
  }
  
  return {
    statusEmoji: statusMatch ? statusMatch[1] : null,
    blockedEmoji: blockedMatch ? blockedMatch[1] : null,
    remaining: remaining.trim(),
  }
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

function getIndentLevel(line: string): number {
  const match = line.match(/^(\s*)/)
  return match ? match[1].length : 0
}

export function parseStatusMarkdown(markdown: string): ParsedStatus {
  const lines = markdown.split('\n')
  const cards: KanbanCard[] = []
  const notes: Note[] = []
  const swimlanes: Swimlane[] = []
  const usedIds = new Map<string, number>()
  const swimlaneIds = new Map<string, string>()
  
  const metadata = parseMetadata(lines)
  
  const headingStack: string[] = []
  let currentLaneId = 'default'
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
    
    const headingMatch = line.match(/^(#{2,3})\s+(.+)/)
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
      
      if (level === 2 || level === 3) {
        const laneSlug = slugify(title)
        if (!swimlaneIds.has(laneSlug)) {
          swimlaneIds.set(laneSlug, laneSlug)
          swimlanes.push({
            id: laneSlug,
            title,
            order: swimlanes.length,
          })
        }
        currentLaneId = laneSlug
      }
      
      while (headingStack.length >= level - 1) {
        headingStack.pop()
      }
      headingStack.push(title)
      
      continue
    }
    
    const bulletMatch = line.match(/^(\s*)[-*]\s+(.+)/)
    if (bulletMatch) {
      const indent = bulletMatch[1]
      const bulletText = bulletMatch[2]
      const { statusEmoji, blockedEmoji, remaining } = extractEmoji(bulletText)
      
      if (statusEmoji && EMOJI_TO_STATUS[statusEmoji]) {
        const title = remaining.trim()
        
        const descriptionLines: string[] = []
        let j = i + 1
        const baseIndentLevel = getIndentLevel(line)
        
        while (j < lines.length) {
          const nextLine = lines[j]
          if (nextLine.trim() === '') {
            j++
            continue
          }
          
          const nextIndent = getIndentLevel(nextLine)
          
          if (nextIndent > baseIndentLevel && !nextLine.match(/^(#{1,6})\s+/)) {
            descriptionLines.push(nextLine.trim())
            j++
          } else {
            break
          }
        }
        
        const baseId = slugify(`${currentLaneId}-${title}`)
        
        let id = baseId
        if (usedIds.has(baseId)) {
          const count = usedIds.get(baseId)! + 1
          usedIds.set(baseId, count)
          id = `${baseId}-${count}`
        } else {
          usedIds.set(baseId, 0)
        }
        
        const fullText = [title, ...descriptionLines].join('\n')
        const links = extractLinks(fullText)
        
        cards.push({
          id,
          title,
          status: EMOJI_TO_STATUS[statusEmoji],
          laneId: currentLaneId,
          blocked: !!blockedEmoji,
          description: descriptionLines.length > 0 ? descriptionLines.join('\n') : undefined,
          links,
          originalLine: i,
        })
      } else if (statusEmoji === null && remaining.length > 0) {
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
  
  if (swimlanes.length === 0) {
    swimlanes.push({
      id: 'default',
      title: 'All Items',
      order: 0,
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
  
  const updatedLines: string[] = []
  let i = 0
  
  while (i < lines.length) {
    const line = lines[i]
    const card = cardsByLine.get(i)
    
    if (!card) {
      updatedLines.push(line)
      i++
      continue
    }
    
    const { statusEmoji } = extractEmoji(line)
    if (!statusEmoji) {
      updatedLines.push(line)
      i++
      continue
    }
    
    const newEmoji = getEmojiForStatus(card.status)
    const blockedEmoji = card.blocked ? ` ${BLOCKED_EMOJI}` : ''
    const indent = line.match(/^\s*/)?.[0] || ''
    
    updatedLines.push(`${indent}- ${newEmoji}${blockedEmoji} ${card.title}`)
    
    if (card.description && card.description.trim()) {
      const descLines = card.description.split('\n')
      descLines.forEach((descLine) => {
        updatedLines.push(`${indent}    ${descLine}`)
      })
    }
    
    const baseIndentLevel = getIndentLevel(line)
    i++
    
    while (i < lines.length) {
      const nextLine = lines[i]
      if (nextLine.trim() === '') {
        i++
        continue
      }
      
      const nextIndent = getIndentLevel(nextLine)
      
      if (nextIndent > baseIndentLevel && !nextLine.match(/^(#{1,6})\s+/)) {
        i++
      } else {
        break
      }
    }
  }
  
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
  const statusColumn = STATUS_COLUMNS.find(col => col.key === status)
  return statusColumn?.emoji || '❗'
}
