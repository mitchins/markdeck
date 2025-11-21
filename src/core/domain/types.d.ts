/**
 * Core domain types for MarkDeck
 *
 * These types define the pure domain model without any UI or framework dependencies.
 */
export type CardStatus = 'todo' | 'in_progress' | 'done';
export interface StatusColumn {
    key: CardStatus;
    label: string;
    emoji: string;
}
export declare const STATUS_COLUMNS: StatusColumn[];
export interface Card {
    id: string;
    title: string;
    status: CardStatus;
    blocked: boolean;
    laneId: string;
    description?: string;
    links: string[];
    originalLine: number;
}
export interface Swimlane {
    id: string;
    title: string;
    order: number;
}
export interface ProjectMetadata {
    title: string;
    version?: string;
    lastUpdated?: string;
}
export interface Note {
    title: string;
    content: string;
    section: string;
}
export interface Project {
    metadata: ProjectMetadata;
    cards: Card[];
    swimlanes: Swimlane[];
    notes: Note[];
    rawMarkdown: string;
}
export declare const EMOJI_TO_STATUS_BLOCKED: Record<string, {
    status: CardStatus;
    blocked: boolean;
}>;
export declare const EMOJI_TO_STATUS: Record<string, CardStatus>;
export declare const STATUS_TO_EMOJI: Record<CardStatus, string>;
//# sourceMappingURL=types.d.ts.map