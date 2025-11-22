/**
 * Test for RYGBO emoji encoding/decoding
 */
import { describe, it, expect, vi } from 'vitest'
import { decodeBase64ToUtf8 } from '@/lib/encoding-utils'

describe('RYGBO Emoji Encoding', () => {
  const RYGBO_EMOJIS = {
    '🔵': 'Blue circle - todo',
    '🟡': 'Yellow circle - in_progress',
    '🔴': 'Red circle - blocked todo',
    '🟧': 'Orange square - blocked in_progress',
    '🟢': 'Green circle - done',
  }

  it('should decode all RYGBO emojis correctly using Buffer', () => {
    Object.entries(RYGBO_EMOJIS).forEach(([emoji, description]) => {
      const base64 = Buffer.from(emoji, 'utf8').toString('base64')
      const decoded = decodeBase64ToUtf8(base64)
      expect(decoded).toBe(emoji)
      expect(decoded).toContain(emoji)
    })
  })

  it('should decode content with multiple RYGBO emojis', () => {
    const content = `- 🔵 Not started task
- 🟡 In progress task  
- 🔴 Blocked task
- 🟧 Blocked in progress
- 🟢 Done task`

    const base64 = Buffer.from(content, 'utf8').toString('base64')
    // GitHub adds newlines every 60 chars
    const base64WithNewlines = base64.match(/.{1,60}/g)?.join('\n') || base64
    
    const decoded = decodeBase64ToUtf8(base64WithNewlines)
    
    expect(decoded).toBe(content)
    expect(decoded).toContain('🔵')
    expect(decoded).toContain('🟡')
    expect(decoded).toContain('🔴')
    expect(decoded).toContain('🟧')
    expect(decoded).toContain('🟢')
  })

  it('should decode STATUS.md-like content with emojis', () => {
    const content = `## 🎯 CORE FEATURES

- 🟢 Markdown parser for STATUS.md format
    Supports H2/H3 headings as swimlanes
    Parses TODO/IN PROGRESS/DONE columns with RYGBO emojis
    Blocked as modifier (🔴 for blocked TODO, 🟧 for blocked IN PROGRESS)
- 🟡 GitHub provider integration
    Basic pull/push functionality works
- 🔴 Custom domain setup
    Need to configure DNS`

    const base64 = Buffer.from(content, 'utf8').toString('base64')
    const base64WithNewlines = base64.match(/.{1,60}/g)?.join('\n') || base64
    
    const decoded = decodeBase64ToUtf8(base64WithNewlines)
    
    expect(decoded).toBe(content)
    // Verify all emojis are preserved
    expect(decoded).toContain('🎯')
    expect(decoded).toContain('🟢')
    expect(decoded).toContain('🟡')
    expect(decoded).toContain('🔴')
    expect(decoded).toContain('🟧')
  })

  it('should decode emojis correctly in browser mode (without Buffer)', () => {
    const originalBuffer = globalThis.Buffer
    const originalAtob = globalThis.atob

    // Simulate browser environment
    vi.stubGlobal('Buffer', undefined as unknown as typeof Buffer)
    
    if (!originalAtob) {
      vi.stubGlobal(
        'atob',
        (input: string) => originalBuffer.from(input, 'base64').toString('binary')
      )
    }

    Object.entries(RYGBO_EMOJIS).forEach(([emoji, description]) => {
      const base64 = originalBuffer.from(emoji, 'utf8').toString('base64')
      const decoded = decodeBase64ToUtf8(base64)
      expect(decoded).toBe(emoji)
    })

    // Test with complex content
    const content = '🟢 Done task\n🔴 Blocked task'
    const base64 = originalBuffer.from(content, 'utf8').toString('base64')
    const decoded = decodeBase64ToUtf8(base64)
    expect(decoded).toBe(content)

    vi.stubGlobal('Buffer', originalBuffer)
    vi.stubGlobal('atob', originalAtob)
  })
})
