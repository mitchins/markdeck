const textDecoder = new TextDecoder('utf-8')

export function decodeBase64ToUtf8(base64: string): string {
  const normalized = base64.replaceAll('\n', '')

  if (typeof Buffer !== 'undefined') {
    return Buffer.from(normalized, 'base64').toString('utf8')
  }

  const binaryString = atob(normalized)
  const bytes = Uint8Array.from(binaryString, (char) => char.codePointAt(0) || 0)
  return textDecoder.decode(bytes)
}
