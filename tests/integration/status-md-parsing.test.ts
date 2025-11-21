/**
 * Integration test for real STATUS.md parsing
 * 
 * Verifies that the actual project STATUS.md is parsed correctly with RAGB emojis
 */

import { describe, it, expect } from 'vitest'
import { parseStatusMarkdown } from '@/core/parsers/markdown-parser'
import fs from 'fs'
import path from 'path'

describe('Real STATUS.md Parsing', () => {
  it('should parse actual STATUS.md correctly', () => {
    const statusPath = path.join(process.cwd(), 'STATUS.md')
    const statusContent = fs.readFileSync(statusPath, 'utf-8')
    
    const project = parseStatusMarkdown(statusContent)
    
    // Should have parsed many cards
    expect(project.cards.length).toBeGreaterThan(0)
    
    // All cards should have valid RAGB statuses
    project.cards.forEach(card => {
      expect(['todo', 'in_progress', 'blocked', 'done']).toContain(card.status)
    })
    
    // Should have swimlanes
    expect(project.swimlanes.length).toBeGreaterThan(0)
    
    // Should have metadata
    expect(project.metadata.title).toBeDefined()
  })
})
