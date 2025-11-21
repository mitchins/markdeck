/**
 * Unit tests for Static Provider
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { StaticProvider } from '@/adapters/providers/static-provider'
import type { LoadContext, SaveContext } from '@/adapters/providers/base-provider'

describe('Static Provider', () => {
  let provider: StaticProvider

  beforeEach(() => {
    provider = new StaticProvider()
  })

  describe('type', () => {
    it('should have type "static"', () => {
      expect(provider.type).toBe('static')
    })
  })

  describe('load', () => {
    it('should return demo data', async () => {
      const context: LoadContext = {}
      
      const result = await provider.load(context)
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toContain('Sample Project')
        expect(result.data).toContain('Frontend Development')
        expect(result.data).toContain('Backend API')
        expect(result.data).toContain('🟢')
        expect(result.data).toContain('🟡')
        expect(result.data).toContain('🔵')
      }
    })

    it('should simulate async operation', async () => {
      const context: LoadContext = {}
      
      const start = Date.now()
      await provider.load(context)
      const elapsed = Date.now() - start
      
      // Should take at least 100ms due to setTimeout
      expect(elapsed).toBeGreaterThanOrEqual(90) // Allow small margin
    })
  })

  describe('save', () => {
    it('should store content in memory', async () => {
      const newContent = '# Updated Project\n\n- 🟢 New task'
      const context: SaveContext = {}
      
      const saveResult = await provider.save(newContent, context)
      expect(saveResult.success).toBe(true)
      
      // Load should return the saved content
      const loadResult = await provider.load({})
      expect(loadResult.success).toBe(true)
      if (loadResult.success) {
        expect(loadResult.data).toBe(newContent)
      }
    })

    it('should simulate async operation', async () => {
      const content = '# Test'
      const context: SaveContext = {}
      
      const start = Date.now()
      await provider.save(content, context)
      const elapsed = Date.now() - start
      
      // Should take at least 100ms due to setTimeout
      expect(elapsed).toBeGreaterThanOrEqual(90)
    })
  })

  describe('list', () => {
    it('should return demo project info', async () => {
      const result = await provider.list!()
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(1)
        expect(result.data[0].id).toBe('demo-project')
        expect(result.data[0].name).toContain('Sample Project')
      }
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

  describe('reset', () => {
    it('should restore demo data', async () => {
      const customContent = '# Custom Project'
      
      // Save custom content
      await provider.save(customContent, {})
      
      // Verify it was saved
      let result = await provider.load({})
      expect(result.success && result.data).toBe(customContent)
      
      // Reset
      provider.reset()
      
      // Should return original demo data
      result = await provider.load({})
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toContain('Sample Project')
        expect(result.data).not.toContain('Custom Project')
      }
    })
  })
})
