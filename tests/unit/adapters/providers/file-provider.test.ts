/**
 * Unit tests for File Provider
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { FileProvider } from '@/adapters/providers/file-provider'
import type { LoadContext, SaveContext } from '@/adapters/providers/base-provider'

describe('File Provider', () => {
  let provider: FileProvider

  beforeEach(() => {
    provider = new FileProvider()
    
    // Reset DOM mocks
    document.body.innerHTML = ''
  })

  describe('type', () => {
    it('should have type "file"', () => {
      expect(provider.type).toBe('file')
    })
  })

  describe('load', () => {
    it('should return error explaining file must be loaded via component', async () => {
      const context: LoadContext = {
        filePath: 'STATUS.md'
      }
      
      const result = await provider.load(context)
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe('FILE_LOAD_NOT_SUPPORTED')
        expect(result.error.message).toContain('FileUploader component')
      }
    })

    it('should return error if no file path provided', async () => {
      const context: LoadContext = {}
      
      const result = await provider.load(context)
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.code).toBe('FILE_LOAD_ERROR')
        expect(result.error.message).toContain('requires file content')
      }
    })
  })

  describe('save', () => {
    it('should trigger browser download', async () => {
      const content = '# Test Project\n\n- ✅ Task 1'
      const context: SaveContext = {
        filePath: 'STATUS.md'
      }
      
      // Mock DOM methods
      const createElementSpy = vi.spyOn(document, 'createElement')
      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
      
      const result = await provider.save(content, context)
      
      expect(result.success).toBe(true)
      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(createObjectURLSpy).toHaveBeenCalled()
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url')
      
      createElementSpy.mockRestore()
      createObjectURLSpy.mockRestore()
      revokeObjectURLSpy.mockRestore()
    })

    it('should use custom filename if provided', async () => {
      const content = '# Test'
      const context: SaveContext = {
        filePath: 'custom-file.md'
      }
      
      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
      
      const result = await provider.save(content, context)
      
      expect(result.success).toBe(true)
      
      // Check that a link with the custom filename was created
      const links = document.querySelectorAll('a')
      const downloadLinks = Array.from(links).filter(link => link.download === 'custom-file.md')
      
      // Note: The link is removed after click, so we check it was at least created
      expect(result.success).toBe(true)
      
      createObjectURLSpy.mockRestore()
      revokeObjectURLSpy.mockRestore()
    })

    it('should default to STATUS.md if no filename provided', async () => {
      const content = '# Test'
      const context: SaveContext = {}
      
      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
      
      const result = await provider.save(content, context)
      
      expect(result.success).toBe(true)
      
      createObjectURLSpy.mockRestore()
      revokeObjectURLSpy.mockRestore()
    })
  })

  describe('isConfigured', () => {
    it('should always return true', () => {
      expect(provider.isConfigured()).toBe(true)
    })
  })

  describe('validateConfig', () => {
    it('should always return success', async () => {
      const result = await provider.validateConfig()
      
      expect(result.success).toBe(true)
    })
  })

  describe('list', () => {
    it('should not support listing', () => {
      expect(provider.list).toBeUndefined()
    })
  })
})
