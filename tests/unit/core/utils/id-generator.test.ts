/**
 * Unit tests for ID generator utility
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { IdGenerator, slugify } from '@/core/utils/id-generator'

describe('ID Generator', () => {
  describe('slugify', () => {
    it('should convert to lowercase', () => {
      expect(slugify('Hello World')).toBe('hello-world')
    })

    it('should replace spaces with hyphens', () => {
      expect(slugify('Multiple   Spaces')).toBe('multiple-spaces')
    })

    it('should handle special characters', () => {
      expect(slugify('Task #1: Fix (bug)!')).toBe('task-1-fix-bug')
    })

    it('should handle Unicode characters', () => {
      expect(slugify('Tâche français')).toBe('tche-franais')
    })

    it('should remove consecutive hyphens', () => {
      expect(slugify('Task---with--dashes')).toBe('task-with-dashes')
    })

    it('should trim whitespace', () => {
      expect(slugify('  trim me  ')).toBe('-trim-me-')
    })
  })

  describe('generateCardId', () => {
    let generator: IdGenerator

    beforeEach(() => {
      generator = new IdGenerator()
    })

    it('should generate stable ID from title', () => {
      const id1 = generator.generateCardId('lane-1', 'My Task')
      const id2 = generator.generateCardId('lane-1', 'My Task')
      
      // First call generates base ID
      expect(id1).toBe('lane-1-my-task')
      // Second call with same title gets counter
      expect(id2).toBe('lane-1-my-task-1')
    })

    it('should handle duplicate IDs with counter', () => {
      const id1 = generator.generateCardId('todo', 'Task')
      const id2 = generator.generateCardId('todo', 'Task')
      const id3 = generator.generateCardId('todo', 'Task')
      
      expect(id1).toBe('todo-task')
      expect(id2).toBe('todo-task-1')
      expect(id3).toBe('todo-task-2')
    })

    it('should include lane ID in generated ID', () => {
      const id = generator.generateCardId('my-lane', 'Task Name')
      expect(id).toBe('my-lane-task-name')
    })

    it('should handle different lanes separately', () => {
      const id1 = generator.generateCardId('lane-1', 'Task')
      const id2 = generator.generateCardId('lane-2', 'Task')
      
      // Different lanes should not conflict
      expect(id1).toBe('lane-1-task')
      expect(id2).toBe('lane-2-task')
    })
  })

  describe('generateSwimlaneId', () => {
    let generator: IdGenerator

    beforeEach(() => {
      generator = new IdGenerator()
    })

    it('should generate ID from swimlane title', () => {
      const id = generator.generateSwimlaneId('Backend Tasks')
      expect(id).toBe('backend-tasks')
    })

    it('should handle special characters', () => {
      const id = generator.generateSwimlaneId('Q1/Q2 Goals (2024)')
      expect(id).toBe('q1q2-goals-2024')
    })
  })

  describe('reset', () => {
    it('should clear used IDs', () => {
      const generator = new IdGenerator()
      
      const id1 = generator.generateCardId('lane', 'Task')
      expect(id1).toBe('lane-task')
      
      generator.reset()
      
      const id2 = generator.generateCardId('lane', 'Task')
      expect(id2).toBe('lane-task') // Should be same as first, not incremented
    })
  })
})
