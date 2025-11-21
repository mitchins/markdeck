/**
 * Unit tests for domain validation (Zod schemas)
 */

import { describe, it, expect } from 'vitest'
import { 
  validateCard, 
  validateProject,
  CardSchema,
  SwimlaneSchema,
  ProjectMetadataSchema,
  NoteSchema,
  ProjectSchema
} from '@/core/domain/validation'

describe('Domain Validation', () => {
  describe('Card validation', () => {
    it('should validate valid card', () => {
      const validCard = {
        id: 'card-1',
        title: 'Test Card',
        status: 'todo',
        laneId: 'lane-1',
        links: [],
        originalLine: 0
      }
      
      const result = validateCard(validCard)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual({
          ...validCard,
          blocked: false // Default value added by schema
        })
      }
    })

    it('should validate card with blocked field', () => {
      const card = {
        id: 'card-1',
        title: 'Test Card',
        status: 'todo',
        blocked: true,
        laneId: 'lane-1',
        links: [],
        originalLine: 0
      }
      
      const result = validateCard(card)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.blocked).toBe(true)
      }
    })

    it('should default blocked to false when not provided', () => {
      const card = {
        id: 'card-1',
        title: 'Test Card',
        status: 'in_progress',
        laneId: 'lane-1',
        links: [],
        originalLine: 0
      }
      
      const result = validateCard(card)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.blocked).toBe(false)
      }
    })

    it('should validate card with optional description', () => {
      const card = {
        id: 'card-1',
        title: 'Test Card',
        status: 'in_progress',
        laneId: 'lane-1',
        description: 'This is a description',
        links: ['https://example.com'],
        originalLine: 5
      }
      
      const result = validateCard(card)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.description).toBe('This is a description')
      }
    })

    it('should reject card with missing required fields', () => {
      const invalidCard = {
        id: 'card-1',
        title: 'Test Card'
        // Missing status, laneId, links, originalLine
      }
      
      const result = validateCard(invalidCard)
      expect(result.success).toBe(false)
    })

    it('should reject card with empty title', () => {
      const invalidCard = {
        id: 'card-1',
        title: '',
        status: 'todo',
        laneId: 'lane-1',
        links: [],
        originalLine: 0
      }
      
      const result = validateCard(invalidCard)
      expect(result.success).toBe(false)
    })

    it('should reject card with invalid status', () => {
      const invalidCard = {
        id: 'card-1',
        title: 'Test Card',
        status: 'invalid_status',
        laneId: 'lane-1',
        links: [],
        originalLine: 0
      }
      
      const result = validateCard(invalidCard)
      expect(result.success).toBe(false)
    })

    it('should reject old blocked status value', () => {
      const invalidCard = {
        id: 'card-1',
        title: 'Test Card',
        status: 'blocked', // Old status value, no longer valid
        laneId: 'lane-1',
        links: [],
        originalLine: 0
      }
      
      const result = validateCard(invalidCard)
      expect(result.success).toBe(false)
    })

    it('should reject card with invalid URL in links', () => {
      const invalidCard = {
        id: 'card-1',
        title: 'Test Card',
        status: 'todo',
        laneId: 'lane-1',
        links: ['not-a-url'],
        originalLine: 0
      }
      
      const result = validateCard(invalidCard)
      expect(result.success).toBe(false)
    })

    it('should reject card with negative originalLine', () => {
      const invalidCard = {
        id: 'card-1',
        title: 'Test Card',
        status: 'todo',
        laneId: 'lane-1',
        links: [],
        originalLine: -1
      }
      
      const result = validateCard(invalidCard)
      expect(result.success).toBe(false)
    })
  })

  describe('Swimlane validation', () => {
    it('should validate valid swimlane', () => {
      const validLane = {
        id: 'lane-1',
        title: 'Backend Tasks',
        order: 0
      }
      
      const result = SwimlaneSchema.safeParse(validLane)
      expect(result.success).toBe(true)
    })

    it('should reject swimlane with empty title', () => {
      const invalidLane = {
        id: 'lane-1',
        title: '',
        order: 0
      }
      
      const result = SwimlaneSchema.safeParse(invalidLane)
      expect(result.success).toBe(false)
    })

    it('should reject swimlane with negative order', () => {
      const invalidLane = {
        id: 'lane-1',
        title: 'Test',
        order: -1
      }
      
      const result = SwimlaneSchema.safeParse(invalidLane)
      expect(result.success).toBe(false)
    })
  })

  describe('ProjectMetadata validation', () => {
    it('should validate metadata with required fields only', () => {
      const metadata = {
        title: 'My Project'
      }
      
      const result = ProjectMetadataSchema.safeParse(metadata)
      expect(result.success).toBe(true)
    })

    it('should validate metadata with optional fields', () => {
      const metadata = {
        title: 'My Project',
        version: '1.0.0',
        lastUpdated: '2024-01-01'
      }
      
      const result = ProjectMetadataSchema.safeParse(metadata)
      expect(result.success).toBe(true)
    })

    it('should reject metadata with empty title', () => {
      const metadata = {
        title: ''
      }
      
      const result = ProjectMetadataSchema.safeParse(metadata)
      expect(result.success).toBe(false)
    })
  })

  describe('Note validation', () => {
    it('should validate valid note', () => {
      const note = {
        title: 'Important Note',
        content: 'This is the note content',
        section: 'Notes'
      }
      
      const result = NoteSchema.safeParse(note)
      expect(result.success).toBe(true)
    })

    it('should reject note with empty title', () => {
      const note = {
        title: '',
        content: 'Content',
        section: 'Notes'
      }
      
      const result = NoteSchema.safeParse(note)
      expect(result.success).toBe(false)
    })
  })

  describe('Project validation', () => {
    it('should validate valid project', () => {
      const validProject = {
        metadata: {
          title: 'Test Project'
        },
        cards: [
          {
            id: 'card-1',
            title: 'Task 1',
            status: 'todo',
            laneId: 'lane-1',
            links: [],
            originalLine: 0
          }
        ],
        swimlanes: [
          {
            id: 'lane-1',
            title: 'Backend',
            order: 0
          }
        ],
        notes: [],
        rawMarkdown: '# Project\n\n- 🔵 Task 1'
      }
      
      const result = validateProject(validProject)
      expect(result.success).toBe(true)
    })

    it('should reject project with invalid nested cards', () => {
      const invalidProject = {
        metadata: {
          title: 'Test Project'
        },
        cards: [
          {
            id: 'card-1',
            title: '',  // Invalid: empty title
            status: 'todo',
            laneId: 'lane-1',
            links: [],
            originalLine: 0
          }
        ],
        swimlanes: [],
        notes: [],
        rawMarkdown: ''
      }
      
      const result = validateProject(invalidProject)
      expect(result.success).toBe(false)
    })

    it('should reject project with missing metadata', () => {
      const invalidProject = {
        cards: [],
        swimlanes: [],
        notes: [],
        rawMarkdown: ''
      }
      
      const result = validateProject(invalidProject)
      expect(result.success).toBe(false)
    })
  })
})
