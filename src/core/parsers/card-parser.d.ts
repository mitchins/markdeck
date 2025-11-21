/**
 * Card parser for STATUS.md files
 *
 * Extracts cards from bullet points with RYGBO status emojis.
 */
import type { Card } from '../domain/types';
import { IdGenerator } from '../utils/id-generator';
export interface ParsedEmoji {
    statusEmoji: string | null;
    remaining: string;
}
export declare function extractEmojis(text: string): ParsedEmoji;
export declare function extractLinks(text: string): string[];
export declare function getIndentLevel(line: string): number;
export declare function extractDescription(lines: string[], startIndex: number, baseIndent: number): {
    description: string;
    nextIndex: number;
};
export declare function parseCard(line: string, lineIndex: number, lines: string[], laneId: string, idGenerator: IdGenerator): Card | null;
//# sourceMappingURL=card-parser.d.ts.map