/**
 * Integration test to fetch and parse actual STATUS.md from mitchins/markdeck repo
 * This test validates that Unicode emojis are correctly decoded from GitHub API
 */
import { describe, it, expect } from 'vitest'
import { GitHubProvider } from '@/adapters/providers/github-provider'
import { parseStatusMarkdown } from '@/core'

describe('Real GitHub STATUS.md Integration', () => {
  // This test uses MSW mocks by default, so it tests mock data not real GitHub
  // Set SKIP_GITHUB_INTEGRATION=true to skip, or disable MSW to test real API
  const shouldSkip = process.env.SKIP_GITHUB_INTEGRATION === 'true'
  
  it.skipIf(shouldSkip)('should fetch and correctly parse mocked STATUS.md (validates encoding)', async () => {
    // Create provider for public repo (no token needed for read-only access)
    const provider = new GitHubProvider({
      owner: 'mitchins',
      repo: 'markdeck',
      branch: 'main',
    })

    // Load the actual STATUS.md file
    const result = await provider.load({ branch: 'main' })
    
    expect(result.success).toBe(true)
    if (!result.success) {
      throw new Error('Failed to load STATUS.md')
    }

    const content = result.data
    
    // Verify RYGBO status emojis are present (tests Unicode encoding)
    expect(content).toContain('🔵') // Blue - todo
    expect(content).toContain('🟡') // Yellow - in_progress
    expect(content).toContain('🔴') // Red - blocked todo
    expect(content).toContain('🟢') // Green - done
    // Note: Mock data may not have all emojis, but these are sufficient to test encoding
    
    // Verify we can parse it correctly
    const project = parseStatusMarkdown(content)
    
    // Should have metadata
    expect(project.metadata.title).toBeTruthy()
    
    // Should have cards with correct statuses (not all todo)
    const cards = project.cards
    expect(cards.length).toBeGreaterThan(0)
    
    // Count cards by status - should have variety, not all todo
    const statusCounts = cards.reduce((acc, card) => {
      acc[card.status] = (acc[card.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    console.log('Status distribution:', statusCounts)
    
    // KEY TEST: Cards should NOT all be 'todo' - this was the bug
    // When Unicode encoding was broken, all emojis were garbled and cards defaulted to 'todo'
    expect(statusCounts.done).toBeGreaterThan(0)
    expect(statusCounts.todo).toBeDefined()
    expect(statusCounts.in_progress).toBeDefined()
    
    // Verify at least one card has each status (proves emojis were decoded correctly)
    const completedCard = cards.find(c => c.status === 'done')
    expect(completedCard).toBeDefined()
    expect(completedCard?.title).toContain('Completed task')
    
    const inProgressCard = cards.find(c => c.status === 'in_progress')
    expect(inProgressCard).toBeDefined()
    expect(inProgressCard?.title).toContain('In progress task')
    
    const blockedCard = cards.find(c => c.blocked === true)
    expect(blockedCard).toBeDefined()
    expect(blockedCard?.title).toContain('Blocked task')
  }, 30000) // 30 second timeout for network request
})
