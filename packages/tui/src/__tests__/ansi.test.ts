/**
 * Tests for ANSI utilities
 */

import { describe, it, expect } from 'vitest'
import { colorize, separator, stripAnsi, ANSI } from '../ansi'

describe('ANSI utilities', () => {
  describe('colorize', () => {
    it('should wrap text with color codes', () => {
      const result = colorize('Hello', 'red')
      expect(result).toContain('Hello')
      expect(result).toContain('\x1b[')
    })
    
    it('should apply bold style', () => {
      const result = colorize('Bold text', 'blue', 'bold')
      expect(result).toContain('\x1b[1m')
    })
    
    it('should apply dim style', () => {
      const result = colorize('Dim text', 'gray', 'dim')
      expect(result).toContain('\x1b[2m')
    })
    
    it('should reset after text', () => {
      const result = colorize('Text', 'green')
      expect(result.endsWith('\x1b[0m')).toBe(true)
    })
  })
  
  describe('separator', () => {
    it('should create a line of repeated characters', () => {
      const result = stripAnsi(separator('─', 10))
      expect(result).toBe('─'.repeat(10))
    })
    
    it('should use default character and width', () => {
      const result = stripAnsi(separator())
      expect(result).toBe('─'.repeat(80))
    })
    
    it('should apply dim styling', () => {
      const result = separator('=', 5)
      expect(result).toContain('\x1b[2m')
    })
  })
  
  describe('stripAnsi', () => {
    it('should remove all ANSI codes', () => {
      const input = '\x1b[31mRed text\x1b[0m'
      const result = stripAnsi(input)
      expect(result).toBe('Red text')
    })
    
    it('should handle multiple ANSI codes', () => {
      const input = '\x1b[1m\x1b[32mBold green\x1b[0m text'
      const result = stripAnsi(input)
      expect(result).toBe('Bold green text')
    })
    
    it('should return plain text unchanged', () => {
      const input = 'Plain text'
      const result = stripAnsi(input)
      expect(result).toBe(input)
    })
  })
  
  describe('ANSI constants', () => {
    it('should have reset code', () => {
      expect(ANSI.reset).toBe('\x1b[0m')
    })
    
    it('should have foreground colors', () => {
      expect(ANSI.fg.red).toBe('\x1b[31m')
      expect(ANSI.fg.green).toBe('\x1b[32m')
      expect(ANSI.fg.blue).toBe('\x1b[34m')
    })
    
    it('should have text styles', () => {
      expect(ANSI.bold).toBe('\x1b[1m')
      expect(ANSI.dim).toBe('\x1b[2m')
    })
    
    it('should have screen control codes', () => {
      expect(ANSI.clearScreen).toBe('\x1b[2J')
      expect(ANSI.cursorHome).toBe('\x1b[H')
    })
  })
})
