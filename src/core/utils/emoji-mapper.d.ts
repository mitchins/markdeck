/**
 * Emoji to status mapper utility
 *
 * Provides bidirectional mapping between RYGBO emoji and (status, blocked) tuples.
 */
import type { CardStatus } from '../domain/types';
/**
 * Convert status and blocked state to emoji
 */
export declare function statusToEmoji(status: CardStatus, blocked?: boolean): string;
/**
 * Parse emoji to (status, blocked) tuple
 */
export declare function emojiToStatusBlocked(emoji: string): {
    status: CardStatus;
    blocked: boolean;
} | null;
/**
 * Legacy: Get just the status from emoji (for backward compatibility)
 */
export declare function emojiToStatus(emoji: string): CardStatus | null;
/**
 * Check if emoji is a valid RYGBO status emoji
 */
export declare function isStatusEmoji(emoji: string): boolean;
//# sourceMappingURL=emoji-mapper.d.ts.map