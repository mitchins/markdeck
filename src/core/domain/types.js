/**
 * Core domain types for MarkDeck
 *
 * These types define the pure domain model without any UI or framework dependencies.
 */
export const STATUS_COLUMNS = [
    { key: 'todo', label: 'TODO', emoji: '🔵' },
    { key: 'in_progress', label: 'IN PROGRESS', emoji: '🟡' },
    { key: 'done', label: 'DONE', emoji: '🟢' },
];
// RYGBO emoji mappings - emojis map to (status, blocked) tuples
export const EMOJI_TO_STATUS_BLOCKED = {
    '🔵': { status: 'todo', blocked: false }, // Blue - Not started
    '🔴': { status: 'todo', blocked: true }, // Red - Blocked (not started)
    '🟡': { status: 'in_progress', blocked: false }, // Yellow - IN PROGRESS
    '🟧': { status: 'in_progress', blocked: true }, // Orange - Blocked IN PROGRESS
    '🟢': { status: 'done', blocked: false }, // Green - DONE
};
// Legacy mappings for backward compatibility (deprecated)
export const EMOJI_TO_STATUS = {
    '🔵': 'todo',
    '🟡': 'in_progress',
    '🔴': 'todo', // Legacy: mapped to 'todo' status
    '🟧': 'in_progress', // Legacy: mapped to in_progress
    '🟢': 'done',
};
export const STATUS_TO_EMOJI = {
    todo: '🔵',
    in_progress: '🟡',
    done: '🟢',
};
//# sourceMappingURL=types.js.map