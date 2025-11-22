/**
 * Emoji to status mapper utility
 * 
 * Provides bidirectional mapping between RYGBO emoji and (status, blocked) tuples.
 * Also supports checkbox format for simplified mode.
 */

import type { CardStatus } from '../domain/types'
import { EMOJI_TO_STATUS_BLOCKED, CHECKBOX_TO_STATUS } from '../domain/types'

/**
 * Convert status and blocked state to emoji
 */
export function statusToEmoji(status: CardStatus, blocked = false): string {
  if (status === 'done') {
    return '🟢' // DONE is always green, never blocked
  }
  if (status === 'todo') {
    return blocked ? '🔴' : '🔵'
  }
  if (status === 'in_progress') {
    return blocked ? '🟧' : '🟡'
  }
  return '🔵' // Default fallback
}

/**
 * Convert status to checkbox format (for simple mode)
 */
export function statusToCheckbox(status: CardStatus): string {
  if (status === 'done') {
    return '[x]'
  }
  // Both todo and in_progress map to unchecked in simple mode (NOSONAR)
  return '[ ]'
}

/**
 * Parse emoji to (status, blocked) tuple
 */
export function emojiToStatusBlocked(emoji: string): { status: CardStatus; blocked: boolean } | null {
  return EMOJI_TO_STATUS_BLOCKED[emoji] || null
}

/**
 * Parse checkbox to (status, blocked) tuple
 */
export function checkboxToStatusBlocked(checkbox: string): { status: CardStatus; blocked: boolean } | null {
  return CHECKBOX_TO_STATUS[checkbox] || null
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

/**
 * Check if string is a valid checkbox format
 */
export function isCheckbox(checkbox: string): boolean {
  return checkbox in CHECKBOX_TO_STATUS
}
