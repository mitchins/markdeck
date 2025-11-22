/**
 * Integration test to fetch and parse actual STATUS.md from mitchins/markdeck repo
 * This test validates that Unicode emojis are correctly decoded from GitHub API
 */
import { describe, it, expect } from 'vitest'
import { GitHubProvider } from '@/adapters/providers/github-provider'
import { parseStatusMarkdown } from '@/core'

describe('Real GitHub STATUS.md Integration', () => {
  // This test can be skipped in CI if rate limited or if we don't want external calls
  // Set SKIP_GITHUB_INTEGRATION=true to skip
  const shouldSkip = process.env.SKIP_GITHUB_INTEGRATION === 'true'
  
  it.skipIf(shouldSkip)('should fetch and correctly parse STATUS.md from mitchins/markdeck', async () => {
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
    
    // Verify Unicode characters are preserved
    expect(content).toContain('—') // em dash in "MarkDeck — Project Status"
    expect(content).toContain('🎯') // target emoji
    
    // Verify all RYGBO status emojis are present
    expect(content).toContain('🔵') // Blue - todo
    expect(content).toContain('🟡') // Yellow - in_progress
    expect(content).toContain('🔴') // Red - blocked todo
    expect(content).toContain('🟧') // Orange - blocked in_progress
    expect(content).toContain('🟢') // Green - done
    
    // Verify we can parse it correctly
    const project = parseStatusMarkdown(content)
    
    // Should have metadata
    expect(project.metadata.title).toBeTruthy()
    expect(project.metadata.title).toContain('MarkDeck')
    
    // Should have cards with correct statuses (not all todo)
    const cards = project.cards
    expect(cards.length).toBeGreaterThan(0)
    
    // Count cards by status - should have variety, not all todo
    const statusCounts = cards.reduce((acc, card) => {
      acc[card.status] = (acc[card.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    console.log('Status distribution:', statusCounts)
    
    // Should have at least some done and in_progress cards based on STATUS.md
    expect(statusCounts.done).toBeGreaterThan(0)
    expect(statusCounts.in_progress || 0).toBeGreaterThan(0)
    
    // Verify specific cards exist with correct emoji
    const markdownParserCard = cards.find(c => 
      c.title.includes('Markdown parser for STATUS.md format')
    )
    expect(markdownParserCard).toBeDefined()
    expect(markdownParserCard?.status).toBe('done') // Should be 🟢
    expect(markdownParserCard?.blocked).toBe(false)
    
    const githubProviderCard = cards.find(c => 
      c.title.includes('GitHub provider integration')
    )
    expect(githubProviderCard).toBeDefined()
    expect(githubProviderCard?.status).toBe('in_progress') // Should be 🟡
    
    const customDomainCard = cards.find(c => 
      c.title.includes('Custom domain setup')
    )
    expect(customDomainCard).toBeDefined()
    expect(customDomainCard?.status).toBe('todo') // Should be 🔴 (blocked todo)
    expect(customDomainCard?.blocked).toBe(true)
  }, 30000) // 30 second timeout for network request
})
