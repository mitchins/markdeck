/**
 * Card parser for STATUS.md files
 * 
 * Extracts cards from bullet points with status emojis.
 */

import type { Card } from '../domain/types'
import { emojiToStatus, isStatusEmoji } from '../utils/emoji-mapper'
import { IdGenerator } from '../utils/id-generator'

export interface ParsedEmoji {
  statusEmoji: string | null
  blockedEmoji: string | null
  remaining: string
}

export function extractEmojis(text: string): ParsedEmoji {
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
  const { statusEmoji, blockedEmoji, remaining } = extractEmojis(bulletText)
  
  // Must have a valid status emoji to be a card
  if (!statusEmoji || !isStatusEmoji(statusEmoji)) {
    return null
  }
  
  const status = emojiToStatus(statusEmoji)
  if (!status) return null
  
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
    laneId,
    blocked: !!blockedEmoji,
    description: description || undefined,
    links,
    originalLine: lineIndex,
  }
}
