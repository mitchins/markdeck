/**
 * Emoji to status mapper utility
 * 
 * Provides bidirectional mapping between RAGB emoji and status values.
 */

import type { CardStatus } from '../domain/types'
import { EMOJI_TO_STATUS, STATUS_TO_EMOJI } from '../domain/types'

export function statusToEmoji(status: CardStatus): string {
  return STATUS_TO_EMOJI[status] || '🔵'
}

export function emojiToStatus(emoji: string): CardStatus | null {
  return EMOJI_TO_STATUS[emoji] || null
}

export function isStatusEmoji(emoji: string): boolean {
  return emoji in EMOJI_TO_STATUS
}
