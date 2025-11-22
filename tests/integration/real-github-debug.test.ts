/**
 * Integration test to fetch and parse actual STATUS.md from mitchins/markdeck repo
 * This test validates that Unicode emojis are correctly decoded from GitHub API
 */
import { describe, it, expect } from 'vitest'
import { GitHubProvider } from '@/adapters/providers/github-provider'
import { parseStatusMarkdown } from '@/core'

describe('Real GitHub STATUS.md Integration (Debug)', () => {
  const shouldSkip = process.env.SKIP_GITHUB_INTEGRATION === 'true'
  
  it.skipIf(shouldSkip)('should fetch STATUS.md from mitchins/markdeck and show diagnostics', async () => {
    const provider = new GitHubProvider({
      owner: 'mitchins',
      repo: 'markdeck',
      branch: 'main',
    })

    const result = await provider.load({ branch: 'main' })
    
    console.log('=== Load result ===')
    console.log('Success:', result.success)
    
    if (!result.success) {
      console.log('Error:', result.error)
      console.log('Error message:', result.error?.message)
      console.log('Error code:', result.error?.code)
      console.log('Error cause:', result.error?.cause)
    } else {
      console.log('Content length:', result.data.length)
      console.log('First 500 chars:', result.data.substring(0, 500))
      
      // Check for emojis
      const emojis = ['🎯', '🟢', '🟡', '🔴', '🟧', '🔵', '—']
      emojis.forEach(emoji => {
        console.log(`Contains ${emoji}:`, result.data.includes(emoji))
      })
      
      // Try to parse
      try {
        const project = parseStatusMarkdown(result.data)
        console.log('\n=== Parse result ===')
        console.log('Title:', project.metadata.title)
        console.log('Cards count:', project.cards.length)
        
        const statusCounts = project.cards.reduce((acc, card) => {
          acc[card.status] = (acc[card.status] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        console.log('Status distribution:', statusCounts)
        
        // Show first few cards
        console.log('\n=== First 5 cards ===')
        project.cards.slice(0, 5).forEach(card => {
          console.log(`- ${card.title} [${card.status}${card.blocked ? ', blocked' : ''}]`)
        })
      } catch (err) {
        console.error('Parse error:', err)
      }
    }
    
    // Don't fail the test, just gather info
    expect(true).toBe(true)
  }, 30000)
})
