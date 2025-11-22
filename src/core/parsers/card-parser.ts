/**
 * Card parser for STATUS.md files
 * 
 * Extracts cards from bullet points with RYGBO status emojis or checkbox syntax.
 */

import type { Card, CardStatus } from '../domain/types'
import { emojiToStatusBlocked, isStatusEmoji, checkboxToStatusBlocked, isCheckbox } from '../utils/emoji-mapper'
import { IdGenerator } from '../utils/id-generator'

export interface ParsedEmoji {
  statusEmoji: string | null
  checkbox: string | null
  remaining: string
  format: 'emoji' | 'checkbox' | 'none'
}

export function extractEmojis(text: string): ParsedEmoji {
  // RYGBO emojis: 🔵 todo, 🟡 in_progress, 🔴 blocked todo, 🟧 blocked in_progress, 🟢 done
  const statusEmojiRegex = /(🔵|🟡|🔴|🟧|🟢)/
  
  // Checkbox syntax: [ ] or [x] or [X]
  const checkboxRegex = /\[([ xX])\]/
  
  const statusMatch = statusEmojiRegex.exec(text)
  const checkboxMatch = checkboxRegex.exec(text)
  
  let remaining = text
  let format: 'emoji' | 'checkbox' | 'none' = 'none'
  
  // Emoji takes priority if both exist
  if (statusMatch) {
    remaining = remaining.replace(statusEmojiRegex, '').trim()
    format = 'emoji'
  } else if (checkboxMatch) {
    remaining = remaining.replace(checkboxRegex, '').trim()
    format = 'checkbox'
  }
  
  return {
    statusEmoji: statusMatch ? statusMatch[1] : null,
    checkbox: checkboxMatch ? checkboxMatch[0] : null,
    remaining: remaining.trim(),
    format,
  }
}

export function extractLinks(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s)]+/g
  return text.match(urlRegex) || []
}

export function getIndentLevel(line: string): number {
  const match = line.match(/^(\s*)/)
  return match ? match[1].length : 0
}

export function extractDescription(
  lines: string[],
  startIndex: number,
  baseIndent: number
): { description: string; nextIndex: number } {
  const descriptionLines: string[] = []
  let i = startIndex + 1
  
  while (i < lines.length) {
    const line = lines[i]
    
    // Skip empty lines
    if (line.trim() === '') {
      i++
      continue
    }
    
    const indent = getIndentLevel(line)
    
    // If indented more than the bullet and not a heading, it's part of the description
    if (indent > baseIndent && !line.match(/^(#{1,6})\s+/)) {
      descriptionLines.push(line.trim())
      i++
    } else {
      break
    }
  }
  
  return {
    description: descriptionLines.join('\n'),
    nextIndex: i,
  }
}

export function parseCard(
  line: string,
  lineIndex: number,
  lines: string[],
  laneId: string,
  idGenerator: IdGenerator
): Card | null {
  // Match bullet points
  const bulletMatch = line.match(/^(\s*)[-*]\s+(.+)/)
  if (!bulletMatch) return null
  
  const bulletText = bulletMatch[2]
  const { statusEmoji, checkbox, remaining, format } = extractEmojis(bulletText)
  
  // Determine status and blocked based on format
  let status: CardStatus
  let blocked: boolean
  let originalFormat: 'emoji' | 'checkbox'
  
  if (format === 'emoji' && statusEmoji && isStatusEmoji(statusEmoji)) {
    const parsed = emojiToStatusBlocked(statusEmoji)!
    status = parsed.status
    blocked = parsed.blocked
    originalFormat = 'emoji'
  } else if (format === 'checkbox' && checkbox && isCheckbox(checkbox)) {
    const parsed = checkboxToStatusBlocked(checkbox)!
    status = parsed.status
    blocked = parsed.blocked
    originalFormat = 'checkbox'
  } else {
    // Default to TODO when no recognized format (NOSONAR)
    status = 'todo'
    blocked = false
    originalFormat = 'emoji'  // Default to emoji format for new cards
  }
  
  const title = remaining.trim()
  if (!title) return null
  
  // Extract description from indented lines
  const baseIndent = getIndentLevel(line)
  const { description } = extractDescription(lines, lineIndex, baseIndent)
  
  // Extract links from title + description
  const fullText = [title, description].filter(Boolean).join('\n')
  const links = extractLinks(fullText)
  
  // Generate unique ID
  const id = idGenerator.generateCardId(laneId, title)
  
  return {
    id,
    title,
    status,
    blocked,
    laneId,
    description: description || undefined,
    links,
    originalLine: lineIndex,
    originalFormat,
  }
}
