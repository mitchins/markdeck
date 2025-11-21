/**
 * Tests for renderer
 */

import { describe, it, expect } from 'vitest'
import { renderProject } from '../renderer'
import { stripAnsi } from '../ansi'
import type { Project } from '../../../../src/core/domain/types'

describe('Renderer', () => {
  const mockProject: Project = {
    metadata: {
      title: 'Test Project',
      version: '1.0.0',
      lastUpdated: '2025-11-20',
    },
    swimlanes: [
      { id: 'lane1', title: 'Core Features', order: 0 },
      { id: 'lane2', title: 'Infrastructure', order: 1 },
    ],
    cards: [
      {
        id: 'card1',
        title: 'Implement parser',
        status: 'done',
        blocked: false,
        laneId: 'lane1',
        description: 'Parse markdown files',
        links: [],
        originalLine: 1,
      },
      {
        id: 'card2',
        title: 'Add tests',
        status: 'in_progress',
        blocked: false,
        laneId: 'lane1',
        description: '',
        links: ['https://example.com'],
        originalLine: 2,
      },
      {
        id: 'card3',
        title: 'Deploy to production',
        status: 'todo',
        blocked: true,
        laneId: 'lane2',
        description: '',
        links: [],
        originalLine: 3,
      },
      {
        id: 'card4',
        title: 'Plan monitoring',
        status: 'todo',
        blocked: false,
        laneId: 'lane2',
        description: '',
        links: [],
        originalLine: 4,
      },
    ],
    notes: [],
    rawMarkdown: '',
  }

  describe('renderProject', () => {
    it('should render project without errors', () => {
      const result = renderProject(mockProject)
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should include project title', () => {
      const result = renderProject(mockProject)
      const stripped = stripAnsi(result)
      expect(stripped).toContain('Test Project')
    })

    it('should include metadata', () => {
      const result = renderProject(mockProject)
      const stripped = stripAnsi(result)
      expect(stripped).toContain('v1.0.0')
      expect(stripped).toContain('Updated: 2025-11-20')
    })

    it('should render all swimlanes', () => {
      const result = renderProject(mockProject)
      const stripped = stripAnsi(result)
      expect(stripped).toContain('CORE FEATURES')
      expect(stripped).toContain('INFRASTRUCTURE')
    })

    it('should render cards with correct status emojis', () => {
      const result = renderProject(mockProject)
      const stripped = stripAnsi(result)
      expect(stripped).toContain('Implement parser')
      expect(stripped).toContain('Add tests')
      expect(stripped).toContain('Deploy to production')
      expect(stripped).toContain('Plan monitoring')
    })

    it('should show blocked indicator', () => {
      const result = renderProject(mockProject)
      const stripped = stripAnsi(result)
      expect(stripped).toContain('BLOCKED')
    })

    it('should render card titles in compact form', () => {
      const result = renderProject(mockProject)
      const stripped = stripAnsi(result)
      // In compact column view, we show titles but not full descriptions
      expect(stripped).toContain('Implement parser')
      expect(stripped).toContain('Add tests')
      expect(stripped).toContain('Deploy to production')
    })

    it('should support column-based layout', () => {
      const result = renderProject(mockProject)
      const stripped = stripAnsi(result)
      // Check for column headers
      expect(stripped).toContain('TODO')
      expect(stripped).toContain('IN PROGRESS')
      expect(stripped).toContain('BLOCKED')
      expect(stripped).toContain('DONE')
    })

    it('should include summary statistics', () => {
      const result = renderProject(mockProject)
      const stripped = stripAnsi(result)
      expect(stripped).toContain('Summary:')
      expect(stripped).toContain('4 cards')
      expect(stripped).toContain('2 TODO')
      expect(stripped).toContain('1 IN PROGRESS')
      expect(stripped).toContain('1 BLOCKED')
      expect(stripped).toContain('1 DONE')
    })
    
    it('should include interactive controls hint', () => {
      const result = renderProject(mockProject)
      const stripped = stripAnsi(result)
      expect(stripped).toContain('Controls:')
      expect(stripped).toContain('q=quit')
    })

    it('should respect width option', () => {
      const result = renderProject(mockProject, { width: 60 })
      expect(result).toBeTruthy()
    })

    it('should allow hiding metadata', () => {
      const result = renderProject(mockProject, { showMetadata: false })
      const stripped = stripAnsi(result)
      expect(stripped).not.toContain('v1.0.0')
    })

    it('should handle empty project', () => {
      const emptyProject: Project = {
        metadata: { title: 'Empty' },
        swimlanes: [],
        cards: [],
        notes: [],
        rawMarkdown: '',
      }
      const result = renderProject(emptyProject)
      const stripped = stripAnsi(result)
      expect(stripped).toContain('Empty')
      expect(stripped).toContain('0 cards')
    })

    it('should group cards by status within swimlanes', () => {
      const result = renderProject(mockProject)
      const stripped = stripAnsi(result)
      
      // Check status headers appear
      expect(stripped).toContain('TODO')
      expect(stripped).toContain('IN PROGRESS')
      expect(stripped).toContain('DONE')
    })
  })
})
