/**
 * Base provider interface and types
 * 
 * Defines the contract that all status providers must implement.
 */

export type ProviderType = 'file' | 'github' | 'static' | 'd1' | 'r2'

export interface LoadContext {
  projectId?: string
  filePath?: string
  branch?: string
}

export interface SaveContext {
  projectId?: string
  filePath?: string
  branch?: string
  message?: string
}

export interface ListContext {
  search?: string
  limit?: number
}

export interface ProjectInfo {
  id: string
  name: string
  description?: string
  lastUpdated?: string
}

export class ProviderError extends Error {
  constructor(
    message: string,
    public code: string,
    public providerType: ProviderType,
    public cause?: Error
  ) {
    super(message)
    this.name = 'ProviderError'
  }
}

export type ProviderResult<T> = 
  | { success: true; data: T }
  | { success: false; error: ProviderError }

export interface StatusProvider {
  readonly type: ProviderType
  
  /**
   * Load STATUS.md content from the provider
   */
  load(context: LoadContext): Promise<ProviderResult<string>>
  
  /**
   * Save STATUS.md content to the provider
   */
  save(content: string, context: SaveContext): Promise<ProviderResult<void>>
  
  /**
   * List available projects (optional, not all providers support this)
   */
  list?(context: ListContext): Promise<ProviderResult<ProjectInfo[]>>
  
  /**
   * Check if the provider is properly configured
   */
  isConfigured(): boolean
  
  /**
   * Validate the provider's configuration
   */
  validateConfig(): Promise<ProviderResult<void>>
}
