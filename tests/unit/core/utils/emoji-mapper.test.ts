/**
 * Unit tests for emoji mapper utility
 */

import { describe, it, expect } from 'vitest'
import { 
  statusToEmoji, 
  emojiToStatus, 
  isStatusEmoji, 
  isBlockedEmoji,
  BLOCKED_EMOJI 
} from '@/core/utils/emoji-mapper'
import type { CardStatus } from '@/core/domain/types'

describe('Emoji Mapper', () => {
  describe('status to emoji mapping', () => {
    it('should map todo to ❗', () => {
      expect(statusToEmoji('todo')).toBe('❗')
    })

    it('should map in_progress to ⚠️', () => {
      expect(statusToEmoji('in_progress')).toBe('⚠️')
    })

    it('should map done to ✅', () => {
      expect(statusToEmoji('done')).toBe('✅')
    })

    it('should return default emoji for invalid status', () => {
      const result = statusToEmoji('invalid' as CardStatus)
      expect(result).toBe('❗')
    })
  })

  describe('emoji to status mapping', () => {
    it('should map ❗ to todo', () => {
      expect(emojiToStatus('❗')).toBe('todo')
    })

    it('should map ⚠️ to in_progress', () => {
      expect(emojiToStatus('⚠️')).toBe('in_progress')
    })

    it('should map ✅ to done', () => {
      expect(emojiToStatus('✅')).toBe('done')
    })

    it('should handle unknown emoji', () => {
      expect(emojiToStatus('🔥')).toBeNull()
    })

    it('should return null for blocked emoji', () => {
      expect(emojiToStatus('❌')).toBeNull()
    })
  })

  describe('blocked emoji detection', () => {
    it('should detect ❌ as blocked', () => {
      expect(isBlockedEmoji('❌')).toBe(true)
    })

    it('should return false for non-blocked emojis', () => {
      expect(isBlockedEmoji('✅')).toBe(false)
      expect(isBlockedEmoji('⚠️')).toBe(false)
    })
  })

  describe('status emoji detection', () => {
    it('should return true for valid status emojis', () => {
      expect(isStatusEmoji('❗')).toBe(true)
      expect(isStatusEmoji('⚠️')).toBe(true)
      expect(isStatusEmoji('✅')).toBe(true)
    })

    it('should return false for non-status emojis', () => {
      expect(isStatusEmoji('❌')).toBe(false)
      expect(isStatusEmoji('🔥')).toBe(false)
    })
  })

  describe('BLOCKED_EMOJI constant', () => {
    it('should be defined as ❌', () => {
      expect(BLOCKED_EMOJI).toBe('❌')
    })
  })
})
