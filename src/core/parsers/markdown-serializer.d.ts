/**
 * Markdown serializer for STATUS.md files
 *
 * Converts domain model back to STATUS.md markdown with round-trip fidelity using RYGBO emojis.
 */
import type { Project } from '../domain/types';
export declare function serializeProject(project: Project): string;
export declare function projectToMarkdown(project: Project): string;
//# sourceMappingURL=markdown-serializer.d.ts.map