/**
 * Tests for description sanitizer utility
 */

import { describe, it, expect } from 'vitest'
import { sanitizeDescription, validateDescription } from '@/core/utils/description-sanitizer'

describe('sanitizeDescription', () => {
  it('should not modify descriptions without problematic patterns', () => {
    const input = 'This is a normal description\nwith multiple lines\nand no markdown issues'
    const result = sanitizeDescription(input)
    expect(result).toBe(input)
  })

  it('should escape H2 headings at start of lines', () => {
    const input = 'This is a description\n## This would create a swimlane\nMore text'
    const result = sanitizeDescription(input)
    expect(result).toContain(' ## This would create a swimlane')
    expect(result).not.toMatch(/\n##\s+/)
  })

  it('should escape H3 headings at start of lines', () => {
    const input = 'Some text\n### Another swimlane\nMore text'
    const result = sanitizeDescription(input)
    expect(result).toContain(' ### Another swimlane')
    expect(result).not.toMatch(/\n###\s+/)
  })

  it('should escape bullet points with status emojis', () => {
    const input = 'Description:\n- 🔵 This would create a card\n- 🟡 Another card'
    const result = sanitizeDescription(input)
    expect(result).toContain(' - 🔵 This would create a card')
    expect(result).toContain(' - 🟡 Another card')
  })

  it('should escape checkbox bullet points', () => {
    const input = 'Tasks:\n- [ ] Todo item\n- [x] Done item\n- [X] Also done'
    const result = sanitizeDescription(input)
    expect(result).toContain(' - [ ] Todo item')
    expect(result).toContain(' - [x] Done item')
    expect(result).toContain(' - [X] Also done')
  })

  it('should handle multiple problematic patterns in same description', () => {
    const input = `Description:

## Heading

- 🔵 Task 1
- [ ] Task 2
Normal text here`
    
    const result = sanitizeDescription(input)
    expect(result).toContain(' ## Heading')
    expect(result).toContain(' - 🔵 Task 1')
    expect(result).toContain(' - [ ] Task 2')
    expect(result).toContain('Normal text here')
  })

  it('should handle empty descriptions', () => {
    expect(sanitizeDescription('')).toBe('')
    expect(sanitizeDescription(null as unknown as string)).toBe(null)
    expect(sanitizeDescription(undefined as unknown as string)).toBe(undefined)
  })

  it('should not modify headings that are not at start of line', () => {
    const input = 'Some text ## heading here\nNot a ## heading either'
    const result = sanitizeDescription(input)
    // Headings that are inline (not at the start after other text) should not be modified
    expect(result).toBe(input)
  })

  it('should preserve whitespace correctly', () => {
    const input = 'Line 1\n\n## Heading\n\nLine 4'
    const result = sanitizeDescription(input)
    const lines = result.split('\n')
    expect(lines[0]).toBe('Line 1')
    expect(lines[1]).toBe('')
    expect(lines[2]).toBe(' ## Heading')
    expect(lines[3]).toBe('')
    expect(lines[4]).toBe('Line 4')
  })
})

describe('validateDescription', () => {
  it('should validate clean descriptions as valid', () => {
    const input = 'This is a clean description\nwith no issues'
    const result = validateDescription(input)
    expect(result.isValid).toBe(true)
    expect(result.issues).toHaveLength(0)
  })

  it('should detect H2 headings', () => {
    const input = 'Text\n## Heading\nMore text'
    const result = validateDescription(input)
    expect(result.isValid).toBe(false)
    expect(result.issues).toHaveLength(1)
    expect(result.issues[0]).toContain('Line 2')
    expect(result.issues[0]).toContain('swimlane')
  })

  it('should detect H3 headings', () => {
    const input = '### Heading at start'
    const result = validateDescription(input)
    expect(result.isValid).toBe(false)
    expect(result.issues).toHaveLength(1)
    expect(result.issues[0]).toContain('Line 1')
  })

  it('should detect emoji bullet points', () => {
    const input = 'Text\n- 🔵 Task'
    const result = validateDescription(input)
    expect(result.isValid).toBe(false)
    expect(result.issues).toHaveLength(1)
    expect(result.issues[0]).toContain('Line 2')
    expect(result.issues[0]).toContain('new card')
  })

  it('should detect checkbox bullet points', () => {
    const input = '- [ ] Todo\n- [x] Done'
    const result = validateDescription(input)
    expect(result.isValid).toBe(false)
    expect(result.issues).toHaveLength(2)
  })

  it('should detect multiple issues and report all line numbers', () => {
    const input = `## Heading 1
Text here
- 🔵 Task
## Heading 2
- [ ] Checkbox`
    
    const result = validateDescription(input)
    expect(result.isValid).toBe(false)
    expect(result.issues).toHaveLength(4)
    expect(result.issues[0]).toContain('Line 1')
    expect(result.issues[1]).toContain('Line 3')
    expect(result.issues[2]).toContain('Line 4')
    expect(result.issues[3]).toContain('Line 5')
  })

  it('should handle empty descriptions', () => {
    const result = validateDescription('')
    expect(result.isValid).toBe(true)
    expect(result.issues).toHaveLength(0)
  })
})
