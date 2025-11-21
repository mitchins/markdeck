/**
 * Emoji to status mapper utility
 * 
 * Provides bidirectional mapping between RYGBO emoji and (status, blocked) tuples.
 */

import type { CardStatus } from '../domain/types'
import { EMOJI_TO_STATUS_BLOCKED, statusToEmoji as coreStatusToEmoji } from '../domain/types'

/**
 * Convert status and blocked state to emoji
 */
export function statusToEmoji(status: CardStatus, blocked: boolean = false): string {
  return coreStatusToEmoji(status, blocked)
}

/**
 * Parse emoji to (status, blocked) tuple
 */
export function emojiToStatusBlocked(emoji: string): { status: CardStatus; blocked: boolean } | null {
  return EMOJI_TO_STATUS_BLOCKED[emoji] || null
}

/**
 * Legacy: Get just the status from emoji (for backward compatibility)
 */
export function emojiToStatus(emoji: string): CardStatus | null {
  const result = EMOJI_TO_STATUS_BLOCKED[emoji]
  return result ? result.status : null
}

/**
 * Check if emoji is a valid RYGBO status emoji
 */
export function isStatusEmoji(emoji: string): boolean {
  return emoji in EMOJI_TO_STATUS_BLOCKED
}
