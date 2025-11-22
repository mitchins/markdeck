/**
 * Tests for column-config
 */

import { describe, it, expect } from 'vitest'
import { getColumnIcon, getColumnColor, columnConfig } from '@/lib/column-config'
import { ListChecks, CircleAlert, BadgeCheck } from 'lucide-react'

describe('column-config', () => {
  describe('columnConfig', () => {
    it('should have config for all status types', () => {
      expect(columnConfig.todo).toBeDefined()
      expect(columnConfig.in_progress).toBeDefined()
      expect(columnConfig.done).toBeDefined()
    })

    it('should have correct icon for each status', () => {
      expect(columnConfig.todo.icon).toBe(ListChecks)
      expect(columnConfig.in_progress.icon).toBe(CircleAlert)
      expect(columnConfig.done.icon).toBe(BadgeCheck)
    })

    it('should have correct color for each status', () => {
      expect(columnConfig.todo.color).toBe('text-accent')
      expect(columnConfig.in_progress.color).toBe('text-warning')
      expect(columnConfig.done.color).toBe('text-success')
    })
  })

  describe('getColumnIcon', () => {
    it('should return ListChecks for todo', () => {
      expect(getColumnIcon('todo')).toBe(ListChecks)
    })

    it('should return CircleAlert for in_progress', () => {
      expect(getColumnIcon('in_progress')).toBe(CircleAlert)
    })

    it('should return BadgeCheck for done', () => {
      expect(getColumnIcon('done')).toBe(BadgeCheck)
    })
  })

  describe('getColumnColor', () => {
    it('should return text-accent for todo', () => {
      expect(getColumnColor('todo')).toBe('text-accent')
    })

    it('should return text-warning for in_progress', () => {
      expect(getColumnColor('in_progress')).toBe('text-warning')
    })

    it('should return text-success for done', () => {
      expect(getColumnColor('done')).toBe('text-success')
    })
  })
})
