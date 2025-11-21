/**
 * Swimlane parser for STATUS.md files
 *
 * Extracts swimlanes from H2 and H3 headers.
 */
import type { Swimlane } from '../domain/types';
export declare function parseSwimlanes(lines: string[]): Swimlane[];
export declare function getCurrentSwimlane(lines: string[], lineIndex: number, swimlanes: Swimlane[]): string;
//# sourceMappingURL=swimlane-parser.d.ts.map