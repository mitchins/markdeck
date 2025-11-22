const textDecoder = new TextDecoder('utf-8')

/**
 * Decode base64-encoded string to UTF-8 string
 * Handles Unicode characters correctly (unlike atob which only works with ASCII)
 * 
 * GitHub API returns file contents as base64-encoded UTF-8 with newlines every 60 chars
 */
export function decodeBase64ToUtf8(base64: string): string {
  // Remove newlines that GitHub adds
  const normalized = base64.replaceAll('\n', '')

  // Node.js path: use Buffer for efficient decoding
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(normalized, 'base64').toString('utf8')
  }

  // Browser path: atob returns a binary string where each character represents a byte
  // We need to convert these bytes to a Uint8Array, then decode as UTF-8
  const binaryString = atob(normalized)
  // Note: Use charCodeAt (not codePointAt) since each char is a single byte (0-255)
  const bytes = Uint8Array.from(binaryString, (char) => char.charCodeAt(0))
  return textDecoder.decode(bytes)
}

/**
 * Encode UTF-8 string to base64
 * Handles Unicode characters correctly (unlike btoa which only works with ASCII)
 */
export function encodeUtf8ToBase64(str: string): string {
  // Node.js path: use Buffer for efficient encoding
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf8').toString('base64')
  }

  // Browser path: encode string to UTF-8 bytes first, then to base64
  const utf8Bytes = new TextEncoder().encode(str)
  const binaryString = Array.from(utf8Bytes, byte => String.fromCharCode(byte)).join('')
  return btoa(binaryString)
}
