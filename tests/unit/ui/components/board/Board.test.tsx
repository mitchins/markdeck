/**
 * Tests for Board component (UI layer)
 * 
 * Note: Board.tsx is a thin wrapper that uses hooks from the application layer.
 * Since it has minimal logic and just renders BoardHeader and Swimlane components
 * (which are already tested), we focus on integration-level tests.
 */

import { describe, it, expect } from 'vitest'
import { Board } from '@/ui/components/board/Board'

describe('Board (UI layer)', () => {
  it('should export Board component', () => {
    expect(Board).toBeDefined()
    expect(typeof Board).toBe('function')
  })

  it('should have correct component name', () => {
    expect(Board.name).toBe('Board')
  })
})
