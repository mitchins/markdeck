/**
 * Unit tests for swimlane parser
 * 
 * Tests detecting and parsing swimlanes from H2/H3 headers
 */

import { describe, it, expect } from 'vitest'
import { parseSwimlanes, getCurrentSwimlane } from '@/core/parsers/swimlane-parser'

describe('Swimlane Parser', () => {
  describe('parseSwimlanes', () => {
    it('should parse H2 swimlanes', () => {
      const lines = [
        '# Project',
        '## Backend Tasks',
        '## Frontend Tasks'
      ]
      
      const swimlanes = parseSwimlanes(lines)
      
      expect(swimlanes).toHaveLength(2)
      expect(swimlanes[0].title).toBe('Backend Tasks')
      expect(swimlanes[0].id).toBe('backend-tasks')
      expect(swimlanes[1].title).toBe('Frontend Tasks')
      expect(swimlanes[1].id).toBe('frontend-tasks')
    })

    it('should parse H3 nested swimlanes', () => {
      const lines = [
        '# Project',
        '## Development',
        '### Backend',
        '### Frontend'
      ]
      
      const swimlanes = parseSwimlanes(lines)
      
      expect(swimlanes).toHaveLength(3)
      expect(swimlanes.some(s => s.title === 'Development')).toBe(true)
      expect(swimlanes.some(s => s.title === 'Backend')).toBe(true)
      expect(swimlanes.some(s => s.title === 'Frontend')).toBe(true)
    })

    it('should generate stable IDs from titles', () => {
      const lines = [
        '## Backend Tasks (Q1)'
      ]
      
      const swimlanes = parseSwimlanes(lines)
      
      expect(swimlanes[0].id).toBe('backend-tasks-q1')
    })

    it('should handle duplicate swimlane titles', () => {
      const lines = [
        '## Tasks',
        '## Tasks'
      ]
      
      const swimlanes = parseSwimlanes(lines)
      
      // Should only include the first occurrence
      expect(swimlanes).toHaveLength(1)
      expect(swimlanes[0].title).toBe('Tasks')
    })

    it('should preserve swimlane order', () => {
      const lines = [
        '## Third',
        '## First',
        '## Second'
      ]
      
      const swimlanes = parseSwimlanes(lines)
      
      expect(swimlanes[0].title).toBe('Third')
      expect(swimlanes[0].order).toBe(0)
      expect(swimlanes[1].title).toBe('First')
      expect(swimlanes[1].order).toBe(1)
      expect(swimlanes[2].title).toBe('Second')
      expect(swimlanes[2].order).toBe(2)
    })

    it('should create default swimlane if none found', () => {
      const lines = [
        '# Project',
        'Some content'
      ]
      
      const swimlanes = parseSwimlanes(lines)
      
      expect(swimlanes).toHaveLength(1)
      expect(swimlanes[0].id).toBe('default')
      expect(swimlanes[0].title).toBe('All Items')
    })

    it('should ignore H1 and H4+ headers', () => {
      const lines = [
        '# Project Title',
        '#### Detail Section',
        '## Valid Swimlane'
      ]
      
      const swimlanes = parseSwimlanes(lines)
      
      expect(swimlanes).toHaveLength(1)
      expect(swimlanes[0].title).toBe('Valid Swimlane')
    })
  })

  describe('getCurrentSwimlane', () => {
    it('should find current swimlane by looking backwards', () => {
      const lines = [
        '# Project',
        '## Backend',
        '- ✅ Task 1',
        '- ⚠️ Task 2'
      ]
      
      const swimlanes = parseSwimlanes(lines)
      const currentLane = getCurrentSwimlane(lines, 2, swimlanes)
      
      expect(currentLane).toBe('backend')
    })

    it('should return most recent swimlane', () => {
      const lines = [
        '## Frontend',
        '- ✅ Task 1',
        '## Backend',
        '- ⚠️ Task 2'
      ]
      
      const swimlanes = parseSwimlanes(lines)
      const currentLane = getCurrentSwimlane(lines, 3, swimlanes)
      
      expect(currentLane).toBe('backend')
    })

    it('should default to first swimlane if none found', () => {
      const lines = [
        '# Project',
        '- ✅ Task before any swimlane'
      ]
      
      const swimlanes = parseSwimlanes(lines)
      const currentLane = getCurrentSwimlane(lines, 1, swimlanes)
      
      expect(currentLane).toBe('default')
    })
  })
})
