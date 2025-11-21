/**
 * Domain validation using Zod schemas
 * 
 * Provides runtime validation for domain models to ensure data integrity.
 */

import { z } from 'zod'

export const CardSchema = z.object({
  id: z.string().min(1, 'Card ID is required'),
  title: z.string().min(1, 'Card title is required'),
  status: z.enum(['todo', 'in_progress', 'blocked', 'done']),
  laneId: z.string().min(1, 'Lane ID is required'),
  description: z.string().optional(),
  links: z.array(z.string().url()).default([]),
  originalLine: z.number().int().nonnegative(),
})

export const SwimlaneSchema = z.object({
  id: z.string().min(1, 'Swimlane ID is required'),
  title: z.string().min(1, 'Swimlane title is required'),
  order: z.number().int().nonnegative(),
})

export const ProjectMetadataSchema = z.object({
  title: z.string().min(1, 'Project title is required'),
  version: z.string().optional(),
  lastUpdated: z.string().optional(),
})

export const NoteSchema = z.object({
  title: z.string().min(1, 'Note title is required'),
  content: z.string(),
  section: z.string(),
})

export const ProjectSchema = z.object({
  metadata: ProjectMetadataSchema,
  cards: z.array(CardSchema),
  swimlanes: z.array(SwimlaneSchema),
  notes: z.array(NoteSchema),
  rawMarkdown: z.string(),
})

export type ValidationResult<T> = 
  | { success: true; data: T }
  | { success: false; error: z.ZodError }

export function validateCard(card: unknown): ValidationResult<z.infer<typeof CardSchema>> {
  const result = CardSchema.safeParse(card)
  return result.success 
    ? { success: true, data: result.data }
    : { success: false, error: result.error }
}

export function validateProject(project: unknown): ValidationResult<z.infer<typeof ProjectSchema>> {
  const result = ProjectSchema.safeParse(project)
  return result.success
    ? { success: true, data: result.data }
    : { success: false, error: result.error }
}
