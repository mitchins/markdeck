import { describe, expect, it, vi } from 'vitest'

import { GitHubClient } from '@/adapters/api/github-client'

const mocks = vi.hoisted(() => ({
  getContent: vi.fn(),
  createOrUpdateFileContents: vi.fn(),
  listForAuthenticatedUser: vi.fn(),
  getAuthenticated: vi.fn(),
}))

vi.mock('octokit', () => {
  const rest = {
    repos: {
      getContent: mocks.getContent,
      createOrUpdateFileContents: mocks.createOrUpdateFileContents,
      listForAuthenticatedUser: mocks.listForAuthenticatedUser,
    },
    users: {
      getAuthenticated: mocks.getAuthenticated,
    },
  }

  const Octokit = vi.fn().mockImplementation(() => ({ rest }))

  return { Octokit, __esModule: true }
})

describe('GitHubClient', () => {
  it('decodes base64 file content and returns metadata', async () => {
    const client = new GitHubClient({ token: 'token' })

    mocks.getContent.mockResolvedValue({
      data: {
        content: 'SGVsbG8=\n',
        encoding: 'base64',
        sha: 'abc123',
        size: 8,
      },
    })

    const file = await client.getFile('owner', 'repo', 'STATUS.md')

    expect(file).toEqual({
      content: 'Hello',
      sha: 'abc123',
      encoding: 'base64',
      size: 8,
    })
    expect(mocks.getContent).toHaveBeenCalledWith({ owner: 'owner', repo: 'repo', path: 'STATUS.md', ref: undefined })
  })

  it('throws for unsupported encodings', async () => {
    const client = new GitHubClient({ token: 'token' })

    mocks.getContent.mockResolvedValue({
      data: {
        content: 'deadbeef',
        encoding: 'hex',
      },
    })

    await expect(client.getFile('o', 'r', 'path')).rejects.toThrow('Unsupported encoding: hex')
  })
})
