/**
 * File provider for local file upload/download
 * 
 * Implements StatusProvider for browser-based file operations.
 */

import type {
  StatusProvider,
  ProviderResult,
  LoadContext,
  SaveContext,
  ListContext,
  ProjectInfo,
} from './base-provider'
import { ProviderError } from './base-provider'

export class FileProvider implements StatusProvider {
  readonly type = 'file' as const

  async load(context: LoadContext): Promise<ProviderResult<string>> {
    try {
      // In browser environment, loading is handled by file input
      // This method is called after the file has been read
      if (!context.filePath) {
        return {
          success: false,
          error: new ProviderError(
            'File provider requires file content to be passed via context',
            'FILE_LOAD_ERROR',
            'file'
          ),
        }
      }

      // In a real implementation, this would trigger a file picker
      // For now, we assume the file content is provided externally
      return {
        success: false,
        error: new ProviderError(
          'File loading must be handled by FileUploader component',
          'FILE_LOAD_NOT_SUPPORTED',
          'file'
        ),
      }
    } catch (error) {
      return {
        success: false,
        error: new ProviderError(
          'Failed to load file',
          'FILE_LOAD_ERROR',
          'file',
          error as Error
        ),
      }
    }
  }

  async save(content: string, context: SaveContext): Promise<ProviderResult<void>> {
    try {
      // Download the file to the user's computer
      const blob = new Blob([content], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = context.filePath || 'STATUS.md'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      return { success: true, data: undefined }
    } catch (error) {
      return {
        success: false,
        error: new ProviderError(
          'Failed to download file',
          'FILE_SAVE_ERROR',
          'file',
          error as Error
        ),
      }
    }
  }

  // File provider doesn't support listing
  list?: undefined

  isConfigured(): boolean {
    // File provider doesn't require configuration
    return true
  }

  async validateConfig(): Promise<ProviderResult<void>> {
    // Always valid
    return { success: true, data: undefined }
  }
}
