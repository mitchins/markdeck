/**
 * Mock GitHub API response objects
 */

/**
 * Encode UTF-8 string to base64 (handles Unicode correctly)
 */
function encodeBase64(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf8').toString('base64')
  }
  
  const utf8Bytes = new TextEncoder().encode(str)
  const binaryString = Array.from(utf8Bytes, byte => String.fromCharCode(byte)).join('')
  return btoa(binaryString)
}

export const mockGetFileResponse = {
  name: 'STATUS.md',
  path: 'STATUS.md',
  sha: 'abc123def456',
  size: 1234,
  type: 'file',
  content: encodeBase64('# Test Project\n## Lane\n- 🟢 Card'),
  encoding: 'base64',
}

export const mockUpdateFileResponse = {
  content: {
    name: 'STATUS.md',
    path: 'STATUS.md',
    sha: 'new-sha-789',
    size: 1234,
    type: 'file',
  },
  commit: {
    sha: 'commit-sha-456',
    message: 'Update via MarkDeck',
    author: {
      name: 'Test User',
      email: 'test@example.com',
    },
  },
}

export const mockListReposResponse = [
  {
    id: 1,
    name: 'test-repo',
    full_name: 'test-owner/test-repo',
    owner: {
      login: 'test-owner',
      id: 1,
      avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
    },
    private: false,
    description: 'Test repository',
    updated_at: '2025-11-20T00:00:00Z',
  },
]

export const mockNotFoundError = {
  message: 'Not Found',
  status: 404,
}

export const mockForbiddenError = {
  message: 'Forbidden',
  status: 403,
}

export const mockServerError = {
  message: 'Internal Server Error',
  status: 500,
}
