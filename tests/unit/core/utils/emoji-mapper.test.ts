/**
 * Unit tests for emoji mapper utility
 */

import { describe, it, expect } from 'vitest'
import { 
  statusToEmoji, 
  emojiToStatus, 
  emojiToStatusBlocked,
  isStatusEmoji
} from '@/core/utils/emoji-mapper'
import type { CardStatus } from '@/core/domain/types'

describe('Emoji Mapper', () => {
  describe('status to emoji mapping (RYGBO)', () => {
    it('should map todo unblocked to 🔵', () => {
      expect(statusToEmoji('todo', false)).toBe('🔵')
    })

    it('should map todo blocked to 🔴', () => {
      expect(statusToEmoji('todo', true)).toBe('🔴')
    })

    it('should map in_progress unblocked to 🟡', () => {
      expect(statusToEmoji('in_progress', false)).toBe('🟡')
    })

    it('should map in_progress blocked to 🟧', () => {
      expect(statusToEmoji('in_progress', true)).toBe('🟧')
    })

    it('should map done to 🟢 (always unblocked)', () => {
      expect(statusToEmoji('done', false)).toBe('🟢')
      expect(statusToEmoji('done', true)).toBe('🟢') // DONE ignores blocked flag
    })

    it('should default to 🔵 for invalid status', () => {
      const result = statusToEmoji('invalid' as CardStatus, false)
      expect(result).toBe('🔵')
    })
  })

  describe('emoji to (status, blocked) mapping', () => {
    it('should map 🔵 to (todo, false)', () => {
      const result = emojiToStatusBlocked('🔵')
      expect(result).toEqual({ status: 'todo', blocked: false })
    })

    it('should map 🔴 to (todo, true)', () => {
      const result = emojiToStatusBlocked('🔴')
      expect(result).toEqual({ status: 'todo', blocked: true })
    })

    it('should map 🟡 to (in_progress, false)', () => {
      const result = emojiToStatusBlocked('🟡')
      expect(result).toEqual({ status: 'in_progress', blocked: false })
    })

    it('should map 🟧 to (in_progress, true)', () => {
      const result = emojiToStatusBlocked('🟧')
      expect(result).toEqual({ status: 'in_progress', blocked: true })
    })

    it('should map 🟢 to (done, false)', () => {
      const result = emojiToStatusBlocked('🟢')
      expect(result).toEqual({ status: 'done', blocked: false })
    })

    it('should handle unknown emoji', () => {
      expect(emojiToStatusBlocked('🔥')).toBeNull()
    })

    it('should return null for legacy emojis', () => {
      expect(emojiToStatusBlocked('✅')).toBeNull()
      expect(emojiToStatusBlocked('⚠️')).toBeNull()
      expect(emojiToStatusBlocked('❗')).toBeNull()
      expect(emojiToStatusBlocked('❌')).toBeNull()
    })
  })

  describe('legacy emojiToStatus mapping', () => {
    it('should map 🔵 to todo', () => {
      expect(emojiToStatus('🔵')).toBe('todo')
    })

    it('should map 🟡 to in_progress', () => {
      expect(emojiToStatus('🟡')).toBe('in_progress')
    })

    it('should map 🔴 to todo (blocked variant)', () => {
      expect(emojiToStatus('🔴')).toBe('todo')
    })

    it('should map 🟧 to in_progress (blocked variant)', () => {
      expect(emojiToStatus('🟧')).toBe('in_progress')
    })

    it('should map 🟢 to done', () => {
      expect(emojiToStatus('🟢')).toBe('done')
    })
  })

  describe('status emoji detection', () => {
    it('should return true for valid RYGBO status emojis', () => {
      expect(isStatusEmoji('🔵')).toBe(true)
      expect(isStatusEmoji('🟡')).toBe(true)
      expect(isStatusEmoji('🔴')).toBe(true)
      expect(isStatusEmoji('🟧')).toBe(true)
      expect(isStatusEmoji('🟢')).toBe(true)
    })

    it('should return false for non-RYGBO emojis', () => {
      expect(isStatusEmoji('✅')).toBe(false)
      expect(isStatusEmoji('⚠️')).toBe(false)
      expect(isStatusEmoji('❗')).toBe(false)
      expect(isStatusEmoji('❌')).toBe(false)
      expect(isStatusEmoji('🔥')).toBe(false)
    })
  })
})
