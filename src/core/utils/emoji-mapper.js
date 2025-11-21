/**
 * Emoji to status mapper utility
 *
 * Provides bidirectional mapping between RYGBO emoji and (status, blocked) tuples.
 */
import { EMOJI_TO_STATUS_BLOCKED } from '../domain/types';
/**
 * Convert status and blocked state to emoji
 */
export function statusToEmoji(status, blocked = false) {
    if (status === 'done') {
        return '🟢'; // DONE is always green, never blocked
    }
    if (status === 'todo') {
        return blocked ? '🔴' : '🔵';
    }
    if (status === 'in_progress') {
        return blocked ? '🟧' : '🟡';
    }
    return '🔵'; // Default fallback
}
/**
 * Parse emoji to (status, blocked) tuple
 */
export function emojiToStatusBlocked(emoji) {
    return EMOJI_TO_STATUS_BLOCKED[emoji] || null;
}
/**
 * Legacy: Get just the status from emoji (for backward compatibility)
 */
export function emojiToStatus(emoji) {
    const result = EMOJI_TO_STATUS_BLOCKED[emoji];
    return result ? result.status : null;
}
/**
 * Check if emoji is a valid RYGBO status emoji
 */
export function isStatusEmoji(emoji) {
    return emoji in EMOJI_TO_STATUS_BLOCKED;
}
//# sourceMappingURL=emoji-mapper.js.map