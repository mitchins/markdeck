/**
 * Integration test for real STATUS.md parsing
 * 
 * Verifies that the actual project STATUS.md is parsed correctly
 */

import { describe, it, expect } from 'vitest'
import { parseStatusMarkdown } from '@/core/parsers/markdown-parser'
import fs from 'fs'
import path from 'path'

describe('Real STATUS.md Parsing', () => {
  it('should parse actual STATUS.md correctly with ❌-only items', () => {
    const statusPath = path.join(process.cwd(), 'STATUS.md')
    const statusContent = fs.readFileSync(statusPath, 'utf-8')
    
    const project = parseStatusMarkdown(statusContent)
    
    // Should have parsed many cards
    expect(project.cards.length).toBeGreaterThan(0)
    
    // Check for specific ❌-only items that should now be cards
    const customDomain = project.cards.find(c => c.title.includes('Custom domain setup'))
    expect(customDomain).toBeDefined()
    expect(customDomain?.status).toBe('todo')
    expect(customDomain?.blocked).toBe(true)
    
    const rateLimiting = project.cards.find(c => c.title.includes('Rate limiting'))
    expect(rateLimiting).toBeDefined()
    expect(rateLimiting?.status).toBe('todo')
    expect(rateLimiting?.blocked).toBe(true)
    
    const visualRegression = project.cards.find(c => c.title.includes('Visual regression testing'))
    expect(visualRegression).toBeDefined()
    expect(visualRegression?.status).toBe('todo')
    expect(visualRegression?.blocked).toBe(true)
    
    // Verify FUTURE ENHANCEMENTS section items are parsed
    const multiFile = project.cards.find(c => c.title.includes('Multi-file support'))
    expect(multiFile).toBeDefined()
    expect(multiFile?.status).toBe('todo')
    expect(multiFile?.blocked).toBe(true)
    
    const collaboration = project.cards.find(c => c.title.includes('Collaboration features'))
    expect(collaboration).toBeDefined()
    
    // All ❌-only items should be TODO + blocked
    const blockedTodos = project.cards.filter(c => c.blocked && c.status === 'todo')
    expect(blockedTodos.length).toBeGreaterThanOrEqual(10) // We have many ❌-only items
    
    // Notes should be minimal (no cards misclassified as notes)
    // We should have fewer notes now that ❌-only items are cards
    expect(project.notes.length).toBeLessThan(project.cards.length)
  })
})
