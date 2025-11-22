/**
 * Integration test for simple checkbox mode
 * 
 * Tests the complete flow of simple mode: parsing, rendering, upgrade, and round-trip.
 */

import { describe, it, expect } from 'vitest'
import { parseStatusMarkdown } from '@/core/parsers/markdown-parser'
import { serializeProject } from '@/core/parsers/markdown-serializer'
import { upgradeToFullMode } from '@/core/utils/board-mode-upgrade'

describe('Simple Checkbox Mode Integration', () => {
  const simpleChecklistMarkdown = `# My Todo List

## Tasks
- [ ] Task 1
- [x] Task 2
- [ ] Task 3

## Shopping
- [ ] Milk
- [x] Bread
- [ ] Eggs
`

  const mixedFormatMarkdown = `# Mixed Format

## Tasks
- [ ] Checkbox task
- 🔵 Emoji task
- [x] Done checkbox
- 🟢 Done emoji
`

  describe('Parsing and detection', () => {
    it('should detect simple mode for checkbox-only file', () => {
      const project = parseStatusMarkdown(simpleChecklistMarkdown)
      
      expect(project.boardMode).toBe('simple')
      expect(project.cards.length).toBe(6)
      expect(project.cards.every(c => c.originalFormat === 'checkbox')).toBe(true)
    })

    it('should detect full mode for mixed format file', () => {
      const project = parseStatusMarkdown(mixedFormatMarkdown)
      
      expect(project.boardMode).toBe('full')
      expect(project.cards.length).toBe(4)
    })

    it('should correctly parse checkbox statuses', () => {
      const project = parseStatusMarkdown(simpleChecklistMarkdown)
      
      const todoCards = project.cards.filter(c => c.status === 'todo')
      const doneCards = project.cards.filter(c => c.status === 'done')
      
      expect(todoCards.length).toBe(4)
      expect(doneCards.length).toBe(2)
    })

    it('should parse nested checkboxes correctly', () => {
      const nestedMarkdown = `# Nested Tasks

## Backend
- [ ] API auth
  - [ ] JWT refresh
  - [x] Basic login
`
      const project = parseStatusMarkdown(nestedMarkdown)
      
      expect(project.boardMode).toBe('simple')
      expect(project.cards.length).toBe(3)
      expect(project.cards[2].status).toBe('done')
    })
  })

  describe('Round-trip preservation', () => {
    it('should preserve checkbox format on save', () => {
      const project = parseStatusMarkdown(simpleChecklistMarkdown)
      const serialized = serializeProject(project)
      
      // Should maintain checkbox format
      expect(serialized).toContain('- [ ] Task 1')
      expect(serialized).toContain('- [x] Task 2')
      expect(serialized).toContain('- [ ] Milk')
      expect(serialized).not.toContain('🔵')
      expect(serialized).not.toContain('🟢')
    })

    it('should preserve format after status changes', () => {
      const project = parseStatusMarkdown(simpleChecklistMarkdown)
      
      // Simulate moving a task to done
      project.cards[0].status = 'done'
      
      const serialized = serializeProject(project)
      
      // Should still use checkbox format
      expect(serialized).toContain('- [x] Task 1')
      expect(serialized).not.toContain('🟢 Task 1')
    })

    it('should handle complete round-trip without data loss', () => {
      const project1 = parseStatusMarkdown(simpleChecklistMarkdown)
      const serialized1 = serializeProject(project1)
      const project2 = parseStatusMarkdown(serialized1)
      const serialized2 = serializeProject(project2)
      
      // Second round-trip should produce identical output
      expect(serialized1).toBe(serialized2)
      expect(project2.boardMode).toBe('simple')
      expect(project2.cards.length).toBe(project1.cards.length)
    })
  })

  describe('Upgrade to full mode', () => {
    it('should convert all checkbox cards to emoji format', () => {
      const project = parseStatusMarkdown(simpleChecklistMarkdown)
      const upgraded = upgradeToFullMode(project)
      
      expect(upgraded.boardMode).toBe('full')
      expect(upgraded.cards.every(c => c.originalFormat === 'emoji')).toBe(true)
    })

    it('should preserve card data during upgrade', () => {
      const project = parseStatusMarkdown(simpleChecklistMarkdown)
      const upgraded = upgradeToFullMode(project)
      
      expect(upgraded.cards.length).toBe(project.cards.length)
      
      project.cards.forEach((originalCard, index) => {
        const upgradedCard = upgraded.cards[index]
        expect(upgradedCard.title).toBe(originalCard.title)
        expect(upgradedCard.status).toBe(originalCard.status)
        expect(upgradedCard.laneId).toBe(originalCard.laneId)
      })
    })

    it('should serialize upgraded project with emoji format', () => {
      const project = parseStatusMarkdown(simpleChecklistMarkdown)
      const upgraded = upgradeToFullMode(project)
      const serialized = serializeProject(upgraded)
      
      // Should use emoji format after upgrade
      expect(serialized).toContain('🔵 Task 1')
      expect(serialized).toContain('🟢 Task 2')
      expect(serialized).not.toContain('[ ]')
      expect(serialized).not.toContain('[x]')
    })

    it('should handle mixed format during upgrade', () => {
      const project = parseStatusMarkdown(mixedFormatMarkdown)
      const upgraded = upgradeToFullMode(project)
      
      expect(upgraded.boardMode).toBe('full')
      expect(upgraded.cards.every(c => c.originalFormat === 'emoji')).toBe(true)
    })
  })

  describe('Real-world scenarios', () => {
    it('should handle GitHub-style checkbox lists', () => {
      const githubStyle = `# Project Tasks

## Frontend
- [x] Setup React app
- [ ] Create components
  - [x] Header
  - [ ] Footer
  - [ ] Sidebar
- [ ] Add routing
`
      const project = parseStatusMarkdown(githubStyle)
      
      expect(project.boardMode).toBe('simple')
      expect(project.cards.length).toBe(6)
      
      const doneCards = project.cards.filter(c => c.status === 'done')
      expect(doneCards.length).toBe(2)
    })

    it('should handle asterisk bullets with checkboxes', () => {
      const asteriskStyle = `# Tasks

## Work
* [ ] Task 1
* [x] Task 2
* [ ] Task 3
`
      const project = parseStatusMarkdown(asteriskStyle)
      
      expect(project.boardMode).toBe('simple')
      expect(project.cards.length).toBe(3)
    })

    it('should handle checkboxes with descriptions', () => {
      const withDescriptions = `# Tasks

## Work
- [ ] Important task
  This needs to be done ASAP
  See https://example.com for details
- [x] Completed task
  Already finished
`
      const project = parseStatusMarkdown(withDescriptions)
      
      expect(project.boardMode).toBe('simple')
      expect(project.cards[0].description).toContain('This needs to be done ASAP')
      expect(project.cards[0].links).toContain('https://example.com')
      expect(project.cards[1].description).toContain('Already finished')
    })

    it('should handle empty sections', () => {
      const emptySection = `# Tasks

## Completed

## Todo
- [ ] Task 1
- [ ] Task 2

## In Review
`
      const project = parseStatusMarkdown(emptySection)
      
      expect(project.boardMode).toBe('simple')
      expect(project.cards.length).toBe(2)
      expect(project.swimlanes.length).toBe(3)
    })
  })
})
