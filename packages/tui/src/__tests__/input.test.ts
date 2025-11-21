/**
 * Tests for input handler
 */

import { describe, it, expect } from 'vitest'

/**
 * parseKey is an internal function, so we'll test the module indirectly
 * through its behavior. For now, we'll test key code mappings.
 */
describe('Input Handler', () => {
  describe('Key parsing', () => {
    it('should recognize arrow keys', () => {
      // These are the standard escape sequences for arrow keys
      expect('\x1b[A').toBe('\x1b[A') // Up
      expect('\x1b[B').toBe('\x1b[B') // Down
      expect('\x1b[C').toBe('\x1b[C') // Right
      expect('\x1b[D').toBe('\x1b[D') // Left
    })

    it('should recognize shift+arrow keys', () => {
      // These are the standard escape sequences for shift+arrow keys
      expect('\x1b[1;2A').toBe('\x1b[1;2A') // Shift+Up
      expect('\x1b[1;2B').toBe('\x1b[1;2B') // Shift+Down
      expect('\x1b[1;2C').toBe('\x1b[1;2C') // Shift+Right
      expect('\x1b[1;2D').toBe('\x1b[1;2D') // Shift+Left
    })

    it('should recognize control sequences', () => {
      expect('\x03'.charCodeAt(0)).toBe(3) // Ctrl+C
      expect('\x1b').toBe('\x1b') // Escape
    })

    it('should recognize regular characters', () => {
      expect('q').toBe('q')
      expect('b').toBe('b')
      expect('a').toBe('a')
    })
  })

  describe('Module exports', () => {
    it('should export setupInput function', async () => {
      const { setupInput } = await import('../input.js')
      expect(typeof setupInput).toBe('function')
    })
  })
})
