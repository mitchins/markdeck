/**
 * Card parser for STATUS.md files
 *
 * Extracts cards from bullet points with RYGBO status emojis.
 */
import { emojiToStatusBlocked, isStatusEmoji } from '../utils/emoji-mapper';
export function extractEmojis(text) {
    // RYGBO emojis: 🔵 todo, 🟡 in_progress, 🔴 blocked todo, 🟧 blocked in_progress, 🟢 done
    const statusEmojiRegex = /(🔵|🟡|🔴|🟧|🟢)/;
    const statusMatch = text.match(statusEmojiRegex);
    let remaining = text;
    if (statusMatch) {
        remaining = remaining.replace(statusEmojiRegex, '').trim();
    }
    return {
        statusEmoji: statusMatch ? statusMatch[1] : null,
        remaining: remaining.trim(),
    };
}
export function extractLinks(text) {
    const urlRegex = /https?:\/\/[^\s)]+/g;
    return text.match(urlRegex) || [];
}
export function getIndentLevel(line) {
    const match = line.match(/^(\s*)/);
    return match ? match[1].length : 0;
}
export function extractDescription(lines, startIndex, baseIndent) {
    const descriptionLines = [];
    let i = startIndex + 1;
    while (i < lines.length) {
        const line = lines[i];
        // Skip empty lines
        if (line.trim() === '') {
            i++;
            continue;
        }
        const indent = getIndentLevel(line);
        // If indented more than the bullet and not a heading, it's part of the description
        if (indent > baseIndent && !line.match(/^(#{1,6})\s+/)) {
            descriptionLines.push(line.trim());
            i++;
        }
        else {
            break;
        }
    }
    return {
        description: descriptionLines.join('\n'),
        nextIndex: i,
    };
}
export function parseCard(line, lineIndex, lines, laneId, idGenerator) {
    // Match bullet points
    const bulletMatch = line.match(/^(\s*)[-*]\s+(.+)/);
    if (!bulletMatch)
        return null;
    const bulletText = bulletMatch[2];
    const { statusEmoji, remaining } = extractEmojis(bulletText);
    // Determine status and blocked: if no emoji, default to (todo, false)
    let status;
    let blocked;
    if (!statusEmoji || !isStatusEmoji(statusEmoji)) {
        status = 'todo';
        blocked = false;
    }
    else {
        const parsed = emojiToStatusBlocked(statusEmoji);
        status = parsed.status;
        blocked = parsed.blocked;
    }
    const title = remaining.trim();
    if (!title)
        return null;
    // Extract description from indented lines
    const baseIndent = getIndentLevel(line);
    const { description } = extractDescription(lines, lineIndex, baseIndent);
    // Extract links from title + description
    const fullText = [title, description].filter(Boolean).join('\n');
    const links = extractLinks(fullText);
    // Generate unique ID
    const id = idGenerator.generateCardId(laneId, title);
    return {
        id,
        title,
        status,
        blocked,
        laneId,
        description: description || undefined,
        links,
        originalLine: lineIndex,
    };
}
//# sourceMappingURL=card-parser.js.map