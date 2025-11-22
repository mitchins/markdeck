/**
 * Tests for board-utils
 */

import { describe, it, expect } from 'vitest'
import { getColumnsForMode, getGridClass } from '@/lib/board-utils'
import { STATUS_COLUMNS } from '@/lib/types'

describe('board-utils', () => {
  describe('getColumnsForMode', () => {
    it('should return all columns for full mode', () => {
      const columns = getColumnsForMode('full')
      expect(columns).toEqual(STATUS_COLUMNS)
      expect(columns).toHaveLength(3)
      expect(columns.map(c => c.key)).toEqual(['todo', 'in_progress', 'done'])
    })

    it('should return only TODO and DONE columns for simple mode', () => {
      const columns = getColumnsForMode('simple')
      expect(columns).toHaveLength(2)
      expect(columns.map(c => c.key)).toEqual(['todo', 'done'])
    })

    it('should filter out IN_PROGRESS column in simple mode', () => {
      const columns = getColumnsForMode('simple')
      expect(columns.find(c => c.key === 'in_progress')).toBeUndefined()
    })
  })

  describe('getGridClass', () => {
    it('should return 4-column grid class for full mode', () => {
      const gridClass = getGridClass('full')
      expect(gridClass).toBe('grid-cols-[auto_1fr_1fr_1fr]')
    })

    it('should return 3-column grid class for simple mode', () => {
      const gridClass = getGridClass('simple')
      expect(gridClass).toBe('grid-cols-[auto_1fr_1fr]')
    })
  })
})
