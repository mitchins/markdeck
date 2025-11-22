/**
 * MSW (Mock Service Worker) request handlers for GitHub API
 * 
 * These handlers intercept HTTP requests during tests and return
 * mock responses, eliminating the need for real API calls.
 */

import { http, HttpResponse } from 'msw'

/**
 * Encode UTF-8 string to base64 (handles Unicode correctly)
 * btoa() fails with Unicode characters, so we need to encode to UTF-8 bytes first
 */
function encodeBase64(str: string): string {
  // Convert string to UTF-8 bytes, then to base64
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf8').toString('base64')
  }
  
  // Browser fallback: encode to UTF-8 bytes manually
  const utf8Bytes = new TextEncoder().encode(str)
  const binaryString = Array.from(utf8Bytes, byte => String.fromCharCode(byte)).join('')
  return btoa(binaryString)
}

export const handlers = [
  // GitHub API: Get file contents
  http.get('https://api.github.com/repos/:owner/:repo/contents/:path', ({ params }) => {
    const { path } = params
    
    // Default mock response for STATUS.md
    if (path === 'STATUS.md') {
      const content = `# Test Project

**Last Updated:** 2025-11-20  
**Version:** Alpha 3

## Test Lane

- 🟢 Completed task
    This is a description

- 🔵 Todo task
    [Link](https://example.com)

- 🟡 In progress task

- 🔴 Blocked task
    **BLOCKED:** Waiting for something
`
      return HttpResponse.json({
        name: 'STATUS.md',
        path: 'STATUS.md',
        sha: 'abc123def456',
        size: content.length,
        type: 'file',
        content: encodeBase64(content),
        encoding: 'base64',
      })
    }
    
    // Default 404 for other files
    return HttpResponse.json(
      { message: 'Not Found' },
      { status: 404 }
    )
  }),

  // GitHub API: Update file contents
  http.put('https://api.github.com/repos/:owner/:repo/contents/:path', async ({ request }) => {
    const body = await request.json() as UpdateFileRequestBody
    
    return HttpResponse.json({
      content: {
        name: body.path || 'STATUS.md',
        path: body.path || 'STATUS.md',
        sha: 'new-sha-' + Date.now(),
        size: body.content ? atob(body.content).length : 0,
        type: 'file',
      },
      commit: {
        sha: 'commit-sha-' + Date.now(),
        message: body.message || 'Update via MarkDeck',
        author: {
          name: 'Test User',
          email: 'test@example.com',
        },
      },
    })
  }),

  // GitHub API: List user repositories
  http.get('https://api.github.com/user/repos', () => {
    return HttpResponse.json([
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
    ])
  }),
]

/**
 * Helper to create error handler for testing error scenarios
 */
export function createErrorHandler(status: number, message: string) {
  return http.get('https://api.github.com/repos/:owner/:repo/contents/:path', () => {
    return HttpResponse.json({ message }, { status })
  })
}

interface UpdateFileRequestBody {
  path?: string
  content?: string
  message?: string
}

/**
 * Helper to create success handler with custom content
 */
export function createSuccessHandler(content: string, sha = 'custom-sha') {
  return http.get('https://api.github.com/repos/:owner/:repo/contents/:path', () => {
    return HttpResponse.json({
      name: 'STATUS.md',
      path: 'STATUS.md',
      sha,
      type: 'file',
      content: encodeBase64(content),
      encoding: 'base64',
    })
  })
}
