/**
 * Unit tests for date formatter utilities
 */

import { describe, it, expect } from 'vitest'
import { formatISODate, formatLastUpdated, parseDate } from '@/core/utils/date-formatter'

describe('Date Formatter', () => {
  describe('formatISODate', () => {
    it('should format date as ISO date string', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const result = formatISODate(date)
      
      expect(result).toBe('2024-01-15')
    })

    it('should use current date when no date provided', () => {
      const result = formatISODate()
      
      // Should be in YYYY-MM-DD format
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })

  describe('formatLastUpdated', () => {
    it('should format date as ISO date string', () => {
      const date = new Date('2024-11-21T08:00:00Z')
      const result = formatLastUpdated(date)
      
      expect(result).toBe('2024-11-21')
    })

    it('should use current date when no date provided', () => {
      const result = formatLastUpdated()
      
      // Should be in YYYY-MM-DD format
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })

  describe('parseDate', () => {
    it('should parse valid ISO date string', () => {
      const result = parseDate('2024-01-15')
      
      expect(result).toBeInstanceOf(Date)
      expect(result?.getFullYear()).toBe(2024)
      expect(result?.getMonth()).toBe(0) // January is 0
      expect(result?.getDate()).toBe(15)
    })

    it('should parse valid datetime string', () => {
      const result = parseDate('2024-01-15T10:30:00Z')
      
      expect(result).toBeInstanceOf(Date)
      expect(result?.getFullYear()).toBe(2024)
    })

    it('should return null for invalid date string', () => {
      const result = parseDate('invalid-date')
      
      expect(result).toBeNull()
    })

    it('should return null for empty string', () => {
      const result = parseDate('')
      
      expect(result).toBeNull()
    })

    it('should return null for non-date string', () => {
      const result = parseDate('not a date at all')
      
      expect(result).toBeNull()
    })
  })
})
