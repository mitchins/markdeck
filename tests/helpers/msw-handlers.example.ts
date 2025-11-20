import { http, HttpResponse } from 'msw'

export const handlers = [
  // GitHub API: Get file contents
  http.get('https://api.github.com/repos/:owner/:repo/contents/:path', ({ params }) => {
    const { path } = params
    
    // Default mock response for STATUS.md
    if (path === 'STATUS.md') {
      return HttpResponse.json({
        name: 'STATUS.md',
        path: 'STATUS.md',
        sha: 'abc123def456',
        size: 1234,
        type: 'file',
        content: btoa(`# Test Project

**Last Updated:** 2025-11-20  
**Version:** Alpha 3

## Test Lane

- ✅ Completed task
    This is a description

- ❗ Todo task
    [Link](https://example.com)

- ⚠️ In progress task

- ❌ Blocked task
    **BLOCKED:** Waiting for something

## Notes

This is a note that should be preserved.
`),
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
    const body = await request.json()
    
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
      {
        id: 2,
        name: 'another-repo',
        full_name: 'test-owner/another-repo',
        owner: {
          login: 'test-owner',
          id: 1,
          avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
        },
        private: false,
        description: 'Another test repository',
        updated_at: '2025-11-19T00:00:00Z',
      },
    ])
  }),
]

// Helper to create error handler
export function createErrorHandler(status: number, message: string) {
  return http.get('https://api.github.com/repos/:owner/:repo/contents/:path', () => {
    return HttpResponse.json({ message }, { status })
  })
}

// Helper to create success handler with custom content
export function createSuccessHandler(content: string, sha = 'custom-sha') {
  return http.get('https://api.github.com/repos/:owner/:repo/contents/:path', () => {
    return HttpResponse.json({
      name: 'STATUS.md',
      path: 'STATUS.md',
      sha,
      type: 'file',
      content: btoa(content),
      encoding: 'base64',
    })
  })
}
