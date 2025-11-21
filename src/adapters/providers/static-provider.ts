/**
 * Static provider for demo/test data
 * 
 * Implements StatusProvider for static markdown content.
 */

import type {
  StatusProvider,
  ProviderResult,
  LoadContext,
  SaveContext,
  ProjectInfo,
} from './base-provider'
import { DEMO_STATUS_MD } from '@/lib/demo-data'

export class StaticProvider implements StatusProvider {
  readonly type = 'static' as const
  private content: string = DEMO_STATUS_MD

  async load(context: LoadContext): Promise<ProviderResult<string>> {
    void context
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100))

    return { success: true, data: this.content }
  }

  async save(content: string, context: SaveContext): Promise<ProviderResult<void>> {
    void context
    // Store in memory only
    this.content = content

    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100))

    return { success: true, data: undefined }
  }

  async list(): Promise<ProviderResult<ProjectInfo[]>> {
    return {
      success: true,
      data: [
        {
          id: 'demo-project',
          name: 'Sample Project - Kanban Board',
          description: 'Demo project showing MarkDeck features',
          lastUpdated: '2024-01-15',
        },
      ],
    }
  }

  isConfigured(): boolean {
    return true
  }

  async validateConfig(): Promise<ProviderResult<void>> {
    return { success: true, data: undefined }
  }

  reset(): void {
    this.content = DEMO_STATUS_MD
  }
}
