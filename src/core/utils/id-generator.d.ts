/**
 * ID generator utility
 *
 * Generates stable, unique IDs for cards based on lane and title.
 * Handles collisions by appending counters.
 */
export declare function slugify(text: string): string;
export declare class IdGenerator {
    private usedIds;
    generateCardId(laneId: string, title: string): string;
    generateSwimlaneId(title: string): string;
    reset(): void;
}
//# sourceMappingURL=id-generator.d.ts.map