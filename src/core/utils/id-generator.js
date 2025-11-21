/**
 * ID generator utility
 *
 * Generates stable, unique IDs for cards based on lane and title.
 * Handles collisions by appending counters.
 */
export function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}
export class IdGenerator {
    usedIds = new Map();
    generateCardId(laneId, title) {
        const baseId = slugify(`${laneId}-${title}`);
        if (!this.usedIds.has(baseId)) {
            this.usedIds.set(baseId, 0);
            return baseId;
        }
        const count = this.usedIds.get(baseId) + 1;
        this.usedIds.set(baseId, count);
        return `${baseId}-${count}`;
    }
    generateSwimlaneId(title) {
        return slugify(title);
    }
    reset() {
        this.usedIds.clear();
    }
}
//# sourceMappingURL=id-generator.js.map