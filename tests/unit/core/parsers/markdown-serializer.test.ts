/**
 * Unit tests for markdown serializer
 * 
 * Tests converting domain model back to STATUS.md
 */

import { describe, it, expect } from 'vitest'
import { serializeProject, projectToMarkdown } from '@/core/parsers/markdown-serializer'
import { parseStatusMarkdown } from '@/core/parsers/markdown-parser'
import type { Project } from '@/core/domain/types'

describe('Markdown Serializer', () => {
  describe('serializeProject', () => {
    it('should serialize project to markdown', () => {
      const originalMarkdown = `# My Project

## Tasks

- ✅ Completed task
- ⚠️ In progress task`

      const project = parseStatusMarkdown(originalMarkdown)
      const serialized = serializeProject(project)
      
      expect(serialized).toContain('# My Project')
      expect(serialized).toContain('## Tasks')
      expect(serialized).toContain('- ✅ Completed task')
      expect(serialized).toContain('- ⚠️ In progress task')
    })

    it('should update card status emojis', () => {
      const originalMarkdown = `# Project

## Tasks

- ⚠️ Task to complete`

      const project = parseStatusMarkdown(originalMarkdown)
      
      // Change the task status from in_progress to done
      project.cards[0].status = 'done'
      
      const serialized = serializeProject(project)
      
      expect(serialized).toContain('- ✅ Task to complete')
      expect(serialized).not.toContain('- ⚠️ Task to complete')
    })

    it('should preserve non-card content', () => {
      const originalMarkdown = `# Project

This is some explanatory text.

## Tasks

- ✅ Task 1

Some notes here.`

      const project = parseStatusMarkdown(originalMarkdown)
      const serialized = serializeProject(project)
      
      expect(serialized).toContain('This is some explanatory text.')
      expect(serialized).toContain('Some notes here.')
    })

    it('should handle blocked cards', () => {
      const originalMarkdown = `# Project

## Tasks

- ⚠️ Normal task`

      const project = parseStatusMarkdown(originalMarkdown)
      
      // Mark the task as blocked
      project.cards[0].blocked = true
      
      const serialized = serializeProject(project)
      
      expect(serialized).toContain('- ⚠️ ❌ Normal task')
    })

    it('should preserve card descriptions', () => {
      const originalMarkdown = `# Project

## Tasks

- ✅ Task with description
    This is a description
    Second line`

      const project = parseStatusMarkdown(originalMarkdown)
      const serialized = serializeProject(project)
      
      expect(serialized).toContain('This is a description')
      expect(serialized).toContain('Second line')
    })

    it('should update card descriptions', () => {
      const originalMarkdown = `# Project

## Tasks

- ✅ Task with description
    Old description`

      const project = parseStatusMarkdown(originalMarkdown)
      
      // Update the description
      project.cards[0].description = 'New description\nUpdated content'
      
      const serialized = serializeProject(project)
      
      expect(serialized).toContain('New description')
      expect(serialized).toContain('Updated content')
      expect(serialized).not.toContain('Old description')
    })
  })

  describe('projectToMarkdown', () => {
    it('should be an alias for serializeProject', () => {
      const markdown = `# Project

## Tasks

- ✅ Task 1`

      const project = parseStatusMarkdown(markdown)
      
      const serialized1 = serializeProject(project)
      const serialized2 = projectToMarkdown(project)
      
      expect(serialized1).toBe(serialized2)
    })
  })
})
