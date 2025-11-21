/**
 * Unit tests for card parser
 * 
 * Tests parsing individual cards from bullet points with RAGB emojis
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { 
  parseCard, 
  extractEmojis, 
  extractLinks, 
  getIndentLevel,
  extractDescription 
} from '@/core/parsers/card-parser'
import { IdGenerator } from '@/core/utils/id-generator'

describe('Card Parser', () => {
  let idGenerator: IdGenerator

  beforeEach(() => {
    idGenerator = new IdGenerator()
  })

  describe('extractEmojis', () => {
    it('should extract RAGB status emoji - done', () => {
      const result = extractEmojis('🟢 Complete task')
      expect(result.statusEmoji).toBe('🟢')
      expect(result.remaining).toBe('Complete task')
    })

    it('should extract RAGB status emoji - todo', () => {
      const result = extractEmojis('🔵 TODO task')
      expect(result.statusEmoji).toBe('🔵')
      expect(result.remaining).toBe('TODO task')
    })

    it('should extract RAGB status emoji - in progress', () => {
      const result = extractEmojis('🟡 In progress task')
      expect(result.statusEmoji).toBe('🟡')
      expect(result.remaining).toBe('In progress task')
    })

    it('should extract RAGB status emoji - blocked', () => {
      const result = extractEmojis('🔴 Blocked task')
      expect(result.statusEmoji).toBe('🔴')
      expect(result.remaining).toBe('Blocked task')
    })

    it('should handle text without emojis', () => {
      const result = extractEmojis('Normal text')
      expect(result.statusEmoji).toBe(null)
      expect(result.remaining).toBe('Normal text')
    })

    it('should not extract legacy emojis', () => {
      const result = extractEmojis('✅ Legacy emoji')
      expect(result.statusEmoji).toBe(null)
      expect(result.remaining).toBe('✅ Legacy emoji')
    })
  })

  describe('extractLinks', () => {
    it('should extract HTTP links', () => {
      const links = extractLinks('Check https://example.com for details')
      expect(links).toEqual(['https://example.com'])
    })

    it('should extract multiple links', () => {
      const links = extractLinks('See https://example.com and http://test.com')
      expect(links).toEqual(['https://example.com', 'http://test.com'])
    })

    it('should return empty array when no links', () => {
      const links = extractLinks('No links here')
      expect(links).toEqual([])
    })
  })

  describe('getIndentLevel', () => {
    it('should return 0 for non-indented line', () => {
      expect(getIndentLevel('- Task')).toBe(0)
    })

    it('should count spaces correctly', () => {
      expect(getIndentLevel('  - Task')).toBe(2)
      expect(getIndentLevel('    - Task')).toBe(4)
    })
  })

  describe('extractDescription', () => {
    it('should extract indented description lines', () => {
      const lines = [
        '- 🟢 Task',
        '  Description line 1',
        '  Description line 2',
        '- Next task'
      ]
      const result = extractDescription(lines, 0, 0)
      expect(result.description).toBe('Description line 1\nDescription line 2')
      expect(result.nextIndex).toBe(3)
    })

    it('should skip empty lines', () => {
      const lines = [
        '- 🟢 Task',
        '  Description line 1',
        '',
        '  Description line 2',
        '- Next task'
      ]
      const result = extractDescription(lines, 0, 0)
      expect(result.description).toBe('Description line 1\nDescription line 2')
    })

    it('should stop at headers', () => {
      const lines = [
        '- 🟢 Task',
        '  Description',
        '## Header',
        '  More text'
      ]
      const result = extractDescription(lines, 0, 0)
      expect(result.description).toBe('Description')
      expect(result.nextIndex).toBe(2)
    })
  })

  describe('parseCard', () => {
    it('should parse card with DONE status', () => {
      const line = '- 🟢 Complete task'
      const card = parseCard(line, 0, [line], 'lane-1', idGenerator)
      
      expect(card).not.toBeNull()
      expect(card?.title).toBe('Complete task')
      expect(card?.status).toBe('done')
      expect(card?.laneId).toBe('lane-1')
    })

    it('should parse card with TODO status', () => {
      const line = '- 🔵 TODO task'
      const card = parseCard(line, 0, [line], 'lane-1', idGenerator)
      
      expect(card).not.toBeNull()
      expect(card?.title).toBe('TODO task')
      expect(card?.status).toBe('todo')
    })

    it('should parse card with IN PROGRESS status', () => {
      const line = '- 🟡 In progress task'
      const card = parseCard(line, 0, [line], 'lane-1', idGenerator)
      
      expect(card).not.toBeNull()
      expect(card?.title).toBe('In progress task')
      expect(card?.status).toBe('in_progress')
    })

    it('should parse card with BLOCKED status', () => {
      const line = '- 🔴 Blocked task'
      const card = parseCard(line, 0, [line], 'lane-1', idGenerator)
      
      expect(card).not.toBeNull()
      expect(card?.title).toBe('Blocked task')
      expect(card?.status).toBe('blocked')
    })

    it('should default to TODO when no emoji present', () => {
      const line = '- Task without emoji'
      const card = parseCard(line, 0, [line], 'lane-1', idGenerator)
      
      expect(card).not.toBeNull()
      expect(card?.title).toBe('Task without emoji')
      expect(card?.status).toBe('todo')
    })

    it('should parse multi-line description', () => {
      const lines = [
        '- 🟢 Task with description',
        '  This is a description',
        '  With multiple lines'
      ]
      const card = parseCard(lines[0], 0, lines, 'lane-1', idGenerator)
      
      expect(card).not.toBeNull()
      expect(card?.description).toBe('This is a description\nWith multiple lines')
    })

    it('should extract links from description', () => {
      const lines = [
        '- 🟢 Task with link https://example.com',
        '  See also http://test.com'
      ]
      const card = parseCard(lines[0], 0, lines, 'lane-1', idGenerator)
      
      expect(card).not.toBeNull()
      expect(card?.links).toEqual(['https://example.com', 'http://test.com'])
    })

    it('should handle card without description', () => {
      const line = '- 🟢 Simple task'
      const card = parseCard(line, 0, [line], 'lane-1', idGenerator)
      
      expect(card).not.toBeNull()
      expect(card?.description).toBeUndefined()
    })

    it('should return null for non-bullet lines', () => {
      const line = 'Not a bullet point'
      const card = parseCard(line, 0, [line], 'lane-1', idGenerator)
      
      expect(card).toBeNull()
    })

    it('should default to TODO for legacy emoji markers', () => {
      const line = '- ✅ Task with legacy emoji'
      const card = parseCard(line, 0, [line], 'lane-1', idGenerator)
      
      expect(card).not.toBeNull()
      expect(card?.status).toBe('todo')
      expect(card?.title).toBe('✅ Task with legacy emoji')
    })

    it('should handle unknown emoji gracefully by defaulting to TODO', () => {
      const line = '- 🔥 Task with unknown emoji'
      const card = parseCard(line, 0, [line], 'lane-1', idGenerator)
      
      expect(card).not.toBeNull()
      expect(card?.status).toBe('todo')
      expect(card?.title).toBe('🔥 Task with unknown emoji')
    })

    it('should parse card with text markers like "x" or "!" as part of title', () => {
      const line = '- 🔵 x Task with x marker'
      const card = parseCard(line, 0, [line], 'lane-1', idGenerator)
      
      expect(card).not.toBeNull()
      expect(card?.title).toBe('x Task with x marker')
      expect(card?.status).toBe('todo')
    })

    it('should handle description with special characters', () => {
      const lines = [
        '- 🔴 Blocked task',
        '  Description with ! and x',
        '  And [ ] checkboxes'
      ]
      const card = parseCard(lines[0], 0, lines, 'lane-1', idGenerator)
      
      expect(card).not.toBeNull()
      expect(card?.status).toBe('blocked')
      expect(card?.title).toBe('Blocked task')
      expect(card?.description).toBe('Description with ! and x\nAnd [ ] checkboxes')
    })
  })
})
