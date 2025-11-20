/**
 * Swimlane parser for STATUS.md files
 * 
 * Extracts swimlanes from H2 and H3 headers.
 */

import type { Swimlane } from '../domain/types'
import { slugify } from '../utils/id-generator'

export function parseSwimlanes(lines: string[]): Swimlane[] {
  const swimlanes: Swimlane[] = []
  const seenIds = new Set<string>()
  
  for (const line of lines) {
    const headingMatch = line.match(/^(#{2,3})\s+(.+)/)
    if (!headingMatch) continue
    
    const level = headingMatch[1].length
    const title = headingMatch[2].trim()
    
    // Only H2 and H3 create swimlanes
    if (level === 2 || level === 3) {
      const id = slugify(title)
      
      // Skip duplicates
      if (seenIds.has(id)) continue
      
      seenIds.add(id)
      swimlanes.push({
        id,
        title,
        order: swimlanes.length,
      })
    }
  }
  
  // Always have at least one swimlane
  if (swimlanes.length === 0) {
    swimlanes.push({
      id: 'default',
      title: 'All Items',
      order: 0,
    })
  }
  
  return swimlanes
}

export function getCurrentSwimlane(
  lines: string[],
  lineIndex: number,
  swimlanes: Swimlane[]
): string {
  // Look backwards for the most recent H2/H3 heading
  for (let i = lineIndex; i >= 0; i--) {
    const line = lines[i]
    const headingMatch = line.match(/^(#{2,3})\s+(.+)/)
    if (headingMatch) {
      const title = headingMatch[2].trim()
      const id = slugify(title)
      const swimlane = swimlanes.find(s => s.id === id)
      if (swimlane) {
        return swimlane.id
      }
    }
  }
  
  // Default to first swimlane or 'default'
  return swimlanes[0]?.id || 'default'
}
