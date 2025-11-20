/**
 * Save project use case
 * 
 * Orchestrates serializing a project to markdown and
 * saving it via a provider.
 */

import type { StatusProvider, SaveContext, ProviderError } from '@/adapters'
import { projectToMarkdown } from '@/core'
import type { Project } from '@/core'

export interface SaveProjectResult {
  success: boolean
  error?: ProviderError | Error
}

export async function saveProject(
  project: Project,
  provider: StatusProvider,
  context: SaveContext = {}
): Promise<SaveProjectResult> {
  try {
    // 1. Serialize project to markdown
    const markdown = projectToMarkdown(project)
    
    // 2. Save via provider
    const result = await provider.save(markdown, context)
    
    if (!result.success) {
      return {
        success: false,
        error: result.error,
      }
    }
    
    return {
      success: true,
    }
  } catch (error) {
    return {
      success: false,
      error: error as Error,
    }
  }
}
