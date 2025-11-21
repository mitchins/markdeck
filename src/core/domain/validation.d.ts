/**
 * Domain validation using Zod schemas
 *
 * Provides runtime validation for domain models to ensure data integrity.
 */
import { z } from 'zod';
export declare const CardSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    status: z.ZodEnum<["todo", "in_progress", "done"]>;
    blocked: z.ZodDefault<z.ZodBoolean>;
    laneId: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    links: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    originalLine: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    status: "todo" | "in_progress" | "done";
    blocked: boolean;
    laneId: string;
    links: string[];
    originalLine: number;
    description?: string | undefined;
}, {
    id: string;
    title: string;
    status: "todo" | "in_progress" | "done";
    laneId: string;
    originalLine: number;
    description?: string | undefined;
    blocked?: boolean | undefined;
    links?: string[] | undefined;
}>;
export declare const SwimlaneSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    order: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    order: number;
}, {
    id: string;
    title: string;
    order: number;
}>;
export declare const ProjectMetadataSchema: z.ZodObject<{
    title: z.ZodString;
    version: z.ZodOptional<z.ZodString>;
    lastUpdated: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    version?: string | undefined;
    lastUpdated?: string | undefined;
}, {
    title: string;
    version?: string | undefined;
    lastUpdated?: string | undefined;
}>;
export declare const NoteSchema: z.ZodObject<{
    title: z.ZodString;
    content: z.ZodString;
    section: z.ZodString;
}, "strip", z.ZodTypeAny, {
    title: string;
    content: string;
    section: string;
}, {
    title: string;
    content: string;
    section: string;
}>;
export declare const ProjectSchema: z.ZodObject<{
    metadata: z.ZodObject<{
        title: z.ZodString;
        version: z.ZodOptional<z.ZodString>;
        lastUpdated: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        version?: string | undefined;
        lastUpdated?: string | undefined;
    }, {
        title: string;
        version?: string | undefined;
        lastUpdated?: string | undefined;
    }>;
    cards: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        status: z.ZodEnum<["todo", "in_progress", "done"]>;
        blocked: z.ZodDefault<z.ZodBoolean>;
        laneId: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        links: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        originalLine: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: string;
        title: string;
        status: "todo" | "in_progress" | "done";
        blocked: boolean;
        laneId: string;
        links: string[];
        originalLine: number;
        description?: string | undefined;
    }, {
        id: string;
        title: string;
        status: "todo" | "in_progress" | "done";
        laneId: string;
        originalLine: number;
        description?: string | undefined;
        blocked?: boolean | undefined;
        links?: string[] | undefined;
    }>, "many">;
    swimlanes: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        order: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: string;
        title: string;
        order: number;
    }, {
        id: string;
        title: string;
        order: number;
    }>, "many">;
    notes: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        content: z.ZodString;
        section: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        title: string;
        content: string;
        section: string;
    }, {
        title: string;
        content: string;
        section: string;
    }>, "many">;
    rawMarkdown: z.ZodString;
}, "strip", z.ZodTypeAny, {
    metadata: {
        title: string;
        version?: string | undefined;
        lastUpdated?: string | undefined;
    };
    cards: {
        id: string;
        title: string;
        status: "todo" | "in_progress" | "done";
        blocked: boolean;
        laneId: string;
        links: string[];
        originalLine: number;
        description?: string | undefined;
    }[];
    swimlanes: {
        id: string;
        title: string;
        order: number;
    }[];
    notes: {
        title: string;
        content: string;
        section: string;
    }[];
    rawMarkdown: string;
}, {
    metadata: {
        title: string;
        version?: string | undefined;
        lastUpdated?: string | undefined;
    };
    cards: {
        id: string;
        title: string;
        status: "todo" | "in_progress" | "done";
        laneId: string;
        originalLine: number;
        description?: string | undefined;
        blocked?: boolean | undefined;
        links?: string[] | undefined;
    }[];
    swimlanes: {
        id: string;
        title: string;
        order: number;
    }[];
    notes: {
        title: string;
        content: string;
        section: string;
    }[];
    rawMarkdown: string;
}>;
export type ValidationResult<T> = {
    success: true;
    data: T;
} | {
    success: false;
    error: z.ZodError;
};
export declare function validateCard(card: unknown): ValidationResult<z.infer<typeof CardSchema>>;
export declare function validateProject(project: unknown): ValidationResult<z.infer<typeof ProjectSchema>>;
//# sourceMappingURL=validation.d.ts.map