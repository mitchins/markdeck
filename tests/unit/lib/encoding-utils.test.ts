import { describe, expect, it, vi } from 'vitest'

import { decodeBase64ToUtf8, encodeUtf8ToBase64 } from '@/lib/encoding-utils'

describe('decodeBase64ToUtf8', () => {
  it('decodes base64 content with newlines using Node Buffer path', () => {
    const originalText = 'Hello 🌍'
    const base64 = Buffer.from(originalText, 'utf8').toString('base64')
    const withNewlines = `${base64.slice(0, 4)}\n${base64.slice(4)}`

    expect(decodeBase64ToUtf8(withNewlines)).toBe(originalText)
  })

  it('falls back to atob decoding when Buffer is unavailable', () => {
    const originalBuffer = globalThis.Buffer
    const originalAtob = globalThis.atob

    // Simulate an environment without Buffer support
    vi.stubGlobal('Buffer', undefined as unknown as typeof Buffer)

    if (!originalAtob) {
      vi.stubGlobal(
        'atob',
        (input: string) => originalBuffer.from(input, 'base64').toString('binary')
      )
    }

    const result = decodeBase64ToUtf8('SGVsbG8=')

    expect(result).toBe('Hello')

    vi.stubGlobal('Buffer', originalBuffer)
    vi.stubGlobal('atob', originalAtob)
  })
  
  it('handles Unicode emojis correctly in browser mode', () => {
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

    // Test with emoji
    const emoji = '🟢'
    const base64 = originalBuffer.from(emoji, 'utf8').toString('base64')
    const result = decodeBase64ToUtf8(base64)

    expect(result).toBe(emoji)

    vi.stubGlobal('Buffer', originalBuffer)
    vi.stubGlobal('atob', originalAtob)
  })
})

describe('encodeUtf8ToBase64', () => {
  it('encodes UTF-8 string to base64 using Buffer', () => {
    const text = 'Hello 🌍'
    const encoded = encodeUtf8ToBase64(text)
    const expected = Buffer.from(text, 'utf8').toString('base64')
    
    expect(encoded).toBe(expected)
  })
  
  it('encodes Unicode emojis correctly', () => {
    const emojis = '🟢🟡🔴🟧🔵'
    const encoded = encodeUtf8ToBase64(emojis)
    
    // Verify it can be decoded back
    const decoded = decodeBase64ToUtf8(encoded)
    expect(decoded).toBe(emojis)
  })
  
  it('handles STATUS.md-like content with emojis', () => {
    const content = `# MarkDeck — Project Status

## 🎯 CORE FEATURES

- 🟢 Markdown parser for STATUS.md format
- 🟡 GitHub provider integration
- 🔴 Custom domain setup`
    
    const encoded = encodeUtf8ToBase64(content)
    const decoded = decodeBase64ToUtf8(encoded)
    
    expect(decoded).toBe(content)
  })
  
  it('falls back to browser encoding when Buffer is unavailable', () => {
    const originalBuffer = globalThis.Buffer
    const originalBtoa = globalThis.btoa

    // Simulate browser environment
    vi.stubGlobal('Buffer', undefined as unknown as typeof Buffer)

    if (!originalBtoa) {
      vi.stubGlobal(
        'btoa',
        (input: string) => originalBuffer.from(input, 'binary').toString('base64')
      )
    }

    const text = 'Hello 🌍'
    const encoded = encodeUtf8ToBase64(text)
    
    // Verify it's valid base64 and can be decoded
    expect(encoded).toBeTruthy()
    
    // Restore Buffer to decode
    vi.stubGlobal('Buffer', originalBuffer)
    const decoded = decodeBase64ToUtf8(encoded)
    expect(decoded).toBe(text)

    vi.stubGlobal('btoa', originalBtoa)
  })

  it('round trips Unicode content in browser mode', () => {
    const originalBuffer = globalThis.Buffer
    const originalAtob = globalThis.atob
    const originalBtoa = globalThis.btoa

    try {
      vi.stubGlobal('Buffer', undefined as unknown as typeof Buffer)

      if (!originalAtob) {
        vi.stubGlobal(
          'atob',
          (input: string) => originalBuffer.from(input, 'base64').toString('binary')
        )
      }

      if (!originalBtoa) {
        vi.stubGlobal(
          'btoa',
          (input: string) => originalBuffer.from(input, 'binary').toString('base64')
        )
      }

      const text = '🟢 Browser round trip — こんにちは'
      const encoded = encodeUtf8ToBase64(text)
      const decoded = decodeBase64ToUtf8(encoded)

      expect(decoded).toBe(text)
    } finally {
      vi.stubGlobal('Buffer', originalBuffer)
      vi.stubGlobal('atob', originalAtob)
      vi.stubGlobal('btoa', originalBtoa)
    }
  })
})
