import { describe, expect, it, vi } from 'vitest'

import { decodeBase64ToUtf8 } from '@/lib/encoding-utils'

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
})
