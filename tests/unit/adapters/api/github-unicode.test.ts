/**
 * Test for Unicode encoding/decoding with GitHub API
 */
import { describe, it, expect, vi } from 'vitest'
import { GitHubClient } from '@/adapters/api/github-client'

const mocks = vi.hoisted(() => ({
  getContent: vi.fn(),
}))

vi.mock('octokit', () => {
  const rest = {
    repos: {
      getContent: mocks.getContent,
      createOrUpdateFileContents: vi.fn(),
      listForAuthenticatedUser: vi.fn(),
    },
    users: {
      getAuthenticated: vi.fn(),
    },
  }

  function MockOctokit(this: { rest: typeof rest }) {
    this.rest = rest
  }

  const Octokit = vi.fn(MockOctokit)

  return { Octokit, __esModule: true }
})

describe('GitHubClient Unicode Support', () => {
  it('should correctly decode Unicode emojis and special characters', async () => {
    const client = new GitHubClient({ token: 'token' })

    // Example content with Unicode emojis (from the actual STATUS.md)
    const originalContent = `# MarkDeck — Project Status

**Last Updated:** 2025-11-20
**Version:** 0.2.0 MVP

## 🎯 CORE FEATURES

- 🟢 Markdown parser for STATUS.md format
    Supports H2/H3 headings as swimlanes
    Parses TODO/IN PROGRESS/DONE columns with RYGBO emojis
    Blocked as modifier (🔴 for blocked TODO, 🟧 for blocked IN PROGRESS)
    Handles indented context and descriptions`

    // Encode as GitHub would (base64 with newlines)
    const base64Content = Buffer.from(originalContent, 'utf8').toString('base64')
    // GitHub adds newlines every 60 characters
    const base64WithNewlines = base64Content.match(/.{1,60}/g)?.join('\n') || base64Content

    mocks.getContent.mockResolvedValue({
      data: {
        content: base64WithNewlines,
        encoding: 'base64',
        sha: 'abc123',
        size: originalContent.length,
      },
    })

    const file = await client.getFile('mitchins', 'markdeck', 'STATUS.md')

    // Verify the content is correctly decoded
    expect(file.content).toBe(originalContent)
    
    // Verify specific Unicode characters are preserved
    expect(file.content).toContain('—') // em dash
    expect(file.content).toContain('🎯') // target emoji
    expect(file.content).toContain('🟢') // green circle emoji
    expect(file.content).toContain('🔴') // red circle emoji
    expect(file.content).toContain('🟧') // orange square emoji
  })

  it('should handle the real STATUS.md from markdeck repo', async () => {
    const client = new GitHubClient({ token: 'token' })

    // This is actual content from STATUS.md with various Unicode characters
    const statusContent = `## 🎯 CORE FEATURES

- 🟢 Markdown parser for STATUS.md format
- 🟡 GitHub provider integration
- 🔴 Custom domain setup

## 🚀 DEPLOYMENT & INFRASTRUCTURE

- 🟢 Vite build configuration`

    const base64Content = Buffer.from(statusContent, 'utf8').toString('base64')
    const base64WithNewlines = base64Content.match(/.{1,60}/g)?.join('\n') || base64Content

    mocks.getContent.mockResolvedValue({
      data: {
        content: base64WithNewlines,
        encoding: 'base64',
        sha: 'def456',
        size: statusContent.length,
      },
    })

    const file = await client.getFile('mitchins', 'markdeck', 'STATUS.md')

    // Check that all status emojis are preserved
    expect(file.content).toContain('🟢') // Green - done
    expect(file.content).toContain('🟡') // Yellow - in progress
    expect(file.content).toContain('🔴') // Red - not started/blocked
    expect(file.content).toContain('🚀') // Rocket
    expect(file.content).toContain('🎯') // Target
  })
})
