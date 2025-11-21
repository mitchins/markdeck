/**
 * Unit tests for markdown parser
 * 
 * Tests the main parser that converts STATUS.md to domain model
 */

import { describe, it, expect } from 'vitest'
import { parseStatusMarkdown } from '@/core/parsers/markdown-parser'

describe('Markdown Parser', () => {
  describe('parseStatusMarkdown', () => {
    it('should parse valid STATUS.md with RAGB emojis', () => {
      const markdown = `# My Project

## Backend Tasks

- 🟢 Setup database
- 🟡 Create API endpoints
- 🔵 Write tests`

      const project = parseStatusMarkdown(markdown)
      
      expect(project.metadata.title).toBe('My Project')
      expect(project.cards).toHaveLength(3)
      expect(project.swimlanes).toHaveLength(1)
      expect(project.rawMarkdown).toBe(markdown)
    })

    it('should extract metadata from H1 and bold lines', () => {
      const markdown = `# Project Title

**Version:** 1.0.0

## Tasks

- 🟢 Task 1`

      const project = parseStatusMarkdown(markdown)
      
      expect(project.metadata.title).toBe('Project Title')
    })

    it('should parse swimlanes from H2 headers', () => {
      const markdown = `# Project

## Frontend

- 🟢 Task 1

## Backend

- 🟡 Task 2`

      const project = parseStatusMarkdown(markdown)
      
      expect(project.swimlanes).toHaveLength(2)
      expect(project.swimlanes[0].title).toBe('Frontend')
      expect(project.swimlanes[1].title).toBe('Backend')
    })

    it('should parse cards with RYGBO status emojis', () => {
      const markdown = `# Project

## Tasks

- 🟢 Completed task
- 🟡 In progress task
- 🔵 Todo task
- 🔴 Blocked todo task
- 🟧 Blocked in progress task`

      const project = parseStatusMarkdown(markdown)
      
      expect(project.cards).toHaveLength(5)
      expect(project.cards[0].status).toBe('done')
      expect(project.cards[0].blocked).toBe(false)
      expect(project.cards[1].status).toBe('in_progress')
      expect(project.cards[1].blocked).toBe(false)
      expect(project.cards[2].status).toBe('todo')
      expect(project.cards[2].blocked).toBe(false)
      expect(project.cards[3].status).toBe('todo')
      expect(project.cards[3].blocked).toBe(true)
      expect(project.cards[4].status).toBe('in_progress')
      expect(project.cards[4].blocked).toBe(true)
    })

    it('should handle malformed markdown gracefully', () => {
      const markdown = `# Project

Some random text

- Regular bullet without emoji
- 🟢 Valid card

Not a bullet`

      const project = parseStatusMarkdown(markdown)
      
      // Should parse both cards - one defaults to TODO
      expect(project.cards).toHaveLength(2)
      expect(project.cards[0].title).toBe('Regular bullet without emoji')
      expect(project.cards[0].status).toBe('todo')
      expect(project.cards[1].title).toBe('Valid card')
    })

    it('should default to TODO for bullets without emoji', () => {
      const markdown = `# Project

## Tasks

- Custom domain setup
    Need to configure DNS
    SSL certificate automation
- 🟢 Working feature
- Rate limiting
    GitHub API limits not handled`

      const project = parseStatusMarkdown(markdown)
      
      // Should parse all three cards
      expect(project.cards).toHaveLength(3)
      
      // First card: no emoji defaults to TODO
      expect(project.cards[0].title).toBe('Custom domain setup')
      expect(project.cards[0].status).toBe('todo')
      expect(project.cards[0].description).toContain('Need to configure DNS')
      
      // Second card: normal 🟢 card
      expect(project.cards[1].title).toBe('Working feature')
      expect(project.cards[1].status).toBe('done')
      
      // Third card: no emoji defaults to TODO
      expect(project.cards[2].title).toBe('Rate limiting')
      expect(project.cards[2].status).toBe('todo')
    })

    it('should parse cards with descriptions', () => {
      const markdown = `# Project

## Tasks

- 🟢 Task with description
  This is the description
  Second line of description`

      const project = parseStatusMarkdown(markdown)
      
      expect(project.cards).toHaveLength(1)
      expect(project.cards[0].description).toContain('This is the description')
      expect(project.cards[0].description).toContain('Second line')
    })

    it('should handle code blocks without parsing them', () => {
      const markdown = `# Project

## Tasks

\`\`\`markdown
- 🟢 This should not be parsed as a card
\`\`\`

- 🟢 This should be parsed`

      const project = parseStatusMarkdown(markdown)
      
      // Only the card outside the code block should be parsed
      expect(project.cards).toHaveLength(1)
      expect(project.cards[0].title).toBe('This should be parsed')
    })

    it('should extract links from cards', () => {
      const markdown = `# Project

## Tasks

- 🟢 Task with link https://example.com
  See also http://test.com`

      const project = parseStatusMarkdown(markdown)
      
      expect(project.cards).toHaveLength(1)
      expect(project.cards[0].links).toEqual(['https://example.com', 'http://test.com'])
    })

    it('should ignore legacy emojis and treat them as part of title', () => {
      const markdown = `# Project

## Tasks

- ✅ Legacy completed task
- ⚠️ Legacy in progress
- ❗ Legacy todo
- ❌ Legacy blocked`

      const project = parseStatusMarkdown(markdown)
      
      // All cards default to TODO since legacy emojis are not recognized
      expect(project.cards).toHaveLength(4)
      expect(project.cards[0].status).toBe('todo')
      expect(project.cards[0].title).toBe('✅ Legacy completed task')
      expect(project.cards[1].status).toBe('todo')
      expect(project.cards[1].title).toBe('⚠️ Legacy in progress')
      expect(project.cards[2].status).toBe('todo')
      expect(project.cards[2].title).toBe('❗ Legacy todo')
      expect(project.cards[3].status).toBe('todo')
      expect(project.cards[3].title).toBe('❌ Legacy blocked')
    })
  })
})
