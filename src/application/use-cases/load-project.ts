/**
 * Load project use case
 * 
 * Orchestrates loading a STATUS.md file from a provider,
 * parsing it, validating it, and updating the store.
 */

import type { StatusProvider, LoadContext, ProviderError } from '@/adapters'
import { parseStatusMarkdown, validateProject } from '@/core'
import type { Project } from '@/core'

export interface LoadProjectResult {
  success: boolean
  project?: Project
  error?: ProviderError | Error
}

export async function loadProject(
  provider: StatusProvider,
  context: LoadContext = {}
): Promise<LoadProjectResult> {
  try {
    // 1. Load raw markdown from provider
    const result = await provider.load(context)
    
    if (!result.success) {
      return {
        success: false,
        error: result.error,
      }
    }
    
    // 2. Parse markdown to domain model
    const project = parseStatusMarkdown(result.data)
    
    // 3. Validate domain model
    const validation = validateProject(project)
    
    if (!validation.success) {
      return {
        success: false,
        error: new Error(`Validation failed: ${validation.error.message}`),
      }
    }
    
    // 4. Return validated project
    return {
      success: true,
      project: validation.data,
    }
  } catch (error) {
    return {
      success: false,
      error: error as Error,
    }
  }
}
