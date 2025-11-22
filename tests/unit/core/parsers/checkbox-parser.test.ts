/**
 * Unit tests for checkbox format parsing
 * 
 * Tests simplified checkbox mode ([ ] / [x]) parsing and round-trip preservation
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { parseCard, extractEmojis } from '@/core/parsers/card-parser'
import { parseStatusMarkdown } from '@/core/parsers/markdown-parser'
import { serializeProject } from '@/core/parsers/markdown-serializer'
import { IdGenerator } from '@/core/utils/id-generator'

describe('Checkbox Format Parser', () => {
  let idGenerator: IdGenerator

  beforeEach(() => {
    idGenerator = new IdGenerator()
  })

  describe('extractEmojis with checkboxes', () => {
    it('should extract unchecked checkbox [ ]', () => {
      const result = extractEmojis('[ ] TODO task')
      expect(result.checkbox).toBe('[ ]')
      expect(result.statusEmoji).toBe(null)
      expect(result.remaining).toBe('TODO task')
      expect(result.format).toBe('checkbox')
    })

    it('should extract checked checkbox [x]', () => {
      const result = extractEmojis('[x] Completed task')
      expect(result.checkbox).toBe('[x]')
      expect(result.statusEmoji).toBe(null)
      expect(result.remaining).toBe('Completed task')
      expect(result.format).toBe('checkbox')
    })

    it('should extract checked checkbox [X] (uppercase)', () => {
      const result = extractEmojis('[X] Completed task')
      expect(result.checkbox).toBe('[X]')
      expect(result.statusEmoji).toBe(null)
      expect(result.remaining).toBe('Completed task')
      expect(result.format).toBe('checkbox')
    })

    it('should prioritize emoji over checkbox when both exist', () => {
      const result = extractEmojis('🔵 [ ] Task with both')
      expect(result.statusEmoji).toBe('🔵')
      expect(result.format).toBe('emoji')
      expect(result.remaining).toBe('[ ] Task with both')
    })

    it('should handle text without checkbox or emoji', () => {
      const result = extractEmojis('Plain task')
      expect(result.checkbox).toBe(null)
      expect(result.statusEmoji).toBe(null)
      expect(result.remaining).toBe('Plain task')
      expect(result.format).toBe('none')
    })
  })

  describe('parseCard with checkboxes', () => {
    it('should parse unchecked checkbox as TODO', () => {
      const line = '- [ ] Task to do'
      const card = parseCard(line, 0, [line], 'lane-1', idGenerator)
      
      expect(card).not.toBeNull()
      expect(card?.title).toBe('Task to do')
      expect(card?.status).toBe('todo')
      expect(card?.blocked).toBe(false)
      expect(card?.originalFormat).toBe('checkbox')
    })

    it('should parse checked checkbox as DONE', () => {
      const line = '- [x] Completed task'
      const card = parseCard(line, 0, [line], 'lane-1', idGenerator)
      
      expect(card).not.toBeNull()
      expect(card?.title).toBe('Completed task')
      expect(card?.status).toBe('done')
      expect(card?.blocked).toBe(false)
      expect(card?.originalFormat).toBe('checkbox')
    })

    it('should parse uppercase [X] as DONE', () => {
      const line = '- [X] Done task'
      const card = parseCard(line, 0, [line], 'lane-1', idGenerator)
      
      expect(card).not.toBeNull()
      expect(card?.title).toBe('Done task')
      expect(card?.status).toBe('done')
      expect(card?.originalFormat).toBe('checkbox')
    })

    it('should handle checkbox with description', () => {
      const lines = [
        '- [ ] Task with description',
        '  This is a description',
        '  With multiple lines'
      ]
      const card = parseCard(lines[0], 0, lines, 'lane-1', idGenerator)
      
      expect(card).not.toBeNull()
      expect(card?.title).toBe('Task with description')
      expect(card?.description).toBe('This is a description\nWith multiple lines')
      expect(card?.originalFormat).toBe('checkbox')
    })

    it('should preserve links in checkbox cards', () => {
      const lines = [
        '- [x] Task with link https://example.com',
        '  See also http://test.com'
      ]
      const card = parseCard(lines[0], 0, lines, 'lane-1', idGenerator)
      
      expect(card).not.toBeNull()
      expect(card?.links).toEqual(['https://example.com', 'http://test.com'])
    })
  })

  describe('Board mode detection', () => {
    it('should detect simple mode for checkbox-only file', () => {
      const markdown = `# Todo List

## Tasks
- [ ] Task 1
- [x] Task 2
- [ ] Task 3
`
      const project = parseStatusMarkdown(markdown)
      
      expect(project.boardMode).toBe('simple')
      expect(project.cards.length).toBe(3)
      expect(project.cards.every(c => c.originalFormat === 'checkbox')).toBe(true)
    })

    it('should detect full mode for emoji-based file', () => {
      const markdown = `# Project

## Tasks
- 🔵 Task 1
- 🟡 Task 2
- 🟢 Task 3
`
      const project = parseStatusMarkdown(markdown)
      
      expect(project.boardMode).toBe('full')
      expect(project.cards.length).toBe(3)
      expect(project.cards.every(c => c.originalFormat === 'emoji')).toBe(true)
    })

    it('should detect full mode for mixed emoji and checkbox file', () => {
      const markdown = `# Mixed

## Tasks
- [ ] Task 1
- 🔵 Task 2
- [x] Task 3
`
      const project = parseStatusMarkdown(markdown)
      
      expect(project.boardMode).toBe('full')
      expect(project.cards.length).toBe(3)
    })

    it('should detect full mode when in_progress status exists', () => {
      const markdown = `# Project

## Tasks
- [ ] Task 1
- [x] Task 2
`
      const project = parseStatusMarkdown(markdown)
      
      // Initially simple
      expect(project.boardMode).toBe('simple')
      
      // If we manually add in_progress, should be full
      const markdownWithProgress = `# Project

## Tasks
- [ ] Task 1
- 🟡 Task in progress
- [x] Task 2
`
      const projectWithProgress = parseStatusMarkdown(markdownWithProgress)
      expect(projectWithProgress.boardMode).toBe('full')
    })

    it('should handle empty file as full mode', () => {
      const markdown = `# Empty

## Tasks
`
      const project = parseStatusMarkdown(markdown)
      
      expect(project.boardMode).toBe('full')
      expect(project.cards.length).toBe(0)
    })
  })

  describe('Round-trip preservation', () => {
    it('should preserve checkbox format on round-trip', () => {
      const markdown = `# Todo List

## Tasks
- [ ] Task 1
- [x] Task 2
- [ ] Task 3
`
      const project = parseStatusMarkdown(markdown)
      const serialized = serializeProject(project)
      
      expect(serialized).toContain('- [ ] Task 1')
      expect(serialized).toContain('- [x] Task 2')
      expect(serialized).toContain('- [ ] Task 3')
      expect(serialized).not.toContain('🔵')
      expect(serialized).not.toContain('🟢')
    })

    it('should preserve emoji format on round-trip', () => {
      const markdown = `# Project

## Tasks
- 🔵 Task 1
- 🟢 Task 2
- 🔴 Task 3
`
      const project = parseStatusMarkdown(markdown)
      const serialized = serializeProject(project)
      
      expect(serialized).toContain('- 🔵 Task 1')
      expect(serialized).toContain('- 🟢 Task 2')
      expect(serialized).toContain('- 🔴 Task 3')
      expect(serialized).not.toContain('[ ]')
      expect(serialized).not.toContain('[x]')
    })

    it('should preserve mixed formats on round-trip', () => {
      const markdown = `# Mixed

## Tasks
- [ ] Checkbox task
- 🔵 Emoji task
- [x] Done checkbox
- 🟢 Done emoji
`
      const project = parseStatusMarkdown(markdown)
      const serialized = serializeProject(project)
      
      expect(serialized).toContain('- [ ] Checkbox task')
      expect(serialized).toContain('- 🔵 Emoji task')
      expect(serialized).toContain('- [x] Done checkbox')
      expect(serialized).toContain('- 🟢 Done emoji')
    })

    it('should handle status changes while preserving format', () => {
      const markdown = `# Tasks

## Work
- [ ] Task 1
`
      const project = parseStatusMarkdown(markdown)
      
      // Simulate moving task to done
      project.cards[0].status = 'done'
      
      const serialized = serializeProject(project)
      
      // Should preserve checkbox format
      expect(serialized).toContain('- [x] Task 1')
      expect(serialized).not.toContain('🟢')
    })
  })

  describe('Nested and complex structures', () => {
    it('should handle nested checkboxes', () => {
      const markdown = `# Project

## Backend
- [ ] API auth
  - [ ] JWT refresh
  - [x] Basic login
`
      const project = parseStatusMarkdown(markdown)
      
      expect(project.cards.length).toBe(3)
      expect(project.cards[0].title).toBe('API auth')
      expect(project.cards[1].title).toBe('JWT refresh')
      expect(project.cards[2].title).toBe('Basic login')
      expect(project.cards[2].status).toBe('done')
    })

    it('should parse checkbox with asterisk bullets', () => {
      const markdown = `# Tasks

## Work
* [ ] Task 1
* [x] Task 2
`
      const project = parseStatusMarkdown(markdown)
      
      expect(project.cards.length).toBe(2)
      expect(project.cards[0].status).toBe('todo')
      expect(project.cards[1].status).toBe('done')
    })
  })
})
