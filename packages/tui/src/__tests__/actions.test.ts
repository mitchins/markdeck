/**
 * Tests for actions module
 */

import { describe, it, expect } from 'vitest'
import { moveCardToLane, toggleCardBlocked, navigateCard, getAllCardsOrdered } from '../actions'
import type { Project } from '../../../../src/core/domain/types'

describe('Actions', () => {
  const mockProject: Project = {
    metadata: {
      title: 'Test Project',
      version: '1.0.0',
      lastUpdated: '2025-11-20',
    },
    swimlanes: [
      { id: 'lane1', title: 'Lane 1', order: 0 },
      { id: 'lane2', title: 'Lane 2', order: 1 },
    ],
    cards: [
      {
        id: 'card1',
        title: 'Card 1',
        status: 'todo',
        laneId: 'lane1',        description: '',
        links: [],
        originalLine: 1,
      },
      {
        id: 'card2',
        title: 'Card 2',
        status: 'in_progress',
        laneId: 'lane1',        description: '',
        links: [],
        originalLine: 2,
      },
      {
        id: 'card3',
        title: 'Card 3',
        status: 'done',
        laneId: 'lane2',        description: '',
        links: [],
        originalLine: 3,
      },
    ],
    notes: [],
    rawMarkdown: '',
  }

  describe('moveCardToLane', () => {
    it('should move card to the right (next status)', () => {
      const result = moveCardToLane(mockProject, 'card1', 'right')
      const card = result.cards.find(c => c.id === 'card1')
      expect(card?.status).toBe('in_progress')
    })

    it('should move card to the left (previous status)', () => {
      const result = moveCardToLane(mockProject, 'card2', 'left')
      const card = result.cards.find(c => c.id === 'card2')
      expect(card?.status).toBe('todo')
    })

    it('should not move beyond bounds (right)', () => {
      const result = moveCardToLane(mockProject, 'card3', 'right')
      const card = result.cards.find(c => c.id === 'card3')
      expect(card?.status).toBe('done') // unchanged
    })

    it('should not move beyond bounds (left)', () => {
      const result = moveCardToLane(mockProject, 'card1', 'left')
      const card = result.cards.find(c => c.id === 'card1')
      expect(card?.status).toBe('todo') // unchanged
    })

    it('should return unchanged project for non-existent card', () => {
      const result = moveCardToLane(mockProject, 'non-existent', 'right')
      expect(result).toBe(mockProject)
    })
  })

  describe('toggleCardBlocked', () => {
    it('should toggle status between todo and blocked', () => {
      const blockedResult = toggleCardBlocked(mockProject, 'card1')
      const blockedCard = blockedResult.cards.find(c => c.id === 'card1')
      expect(blockedCard?.status).toBe('blocked')

      const unblockedResult = toggleCardBlocked(blockedResult, 'card1')
      const unblockedCard = unblockedResult.cards.find(c => c.id === 'card1')
      expect(unblockedCard?.status).toBe('todo')
    })

    it('should return unchanged project for non-existent card', () => {
      const result = toggleCardBlocked(mockProject, 'non-existent')
      expect(result).toBe(mockProject)
    })
  })

  describe('getAllCardsOrdered', () => {
    it('should return cards ordered by lane and status', () => {
      const result = getAllCardsOrdered(mockProject)
      expect(result).toHaveLength(3)
      expect(result[0].id).toBe('card1') // lane1, todo
      expect(result[1].id).toBe('card2') // lane1, in_progress
      expect(result[2].id).toBe('card3') // lane2, done
    })

    it('should handle empty project', () => {
      const emptyProject: Project = {
        ...mockProject,
        cards: [],
        swimlanes: [],
      }
      const result = getAllCardsOrdered(emptyProject)
      expect(result).toHaveLength(0)
    })
  })

  describe('navigateCard', () => {
    it('should navigate to next card (down)', () => {
      const result = navigateCard(mockProject, 'card1', 'down')
      expect(result).toBe('card2')
    })

    it('should navigate to previous card (up)', () => {
      const result = navigateCard(mockProject, 'card2', 'up')
      expect(result).toBe('card1')
    })

    it('should wrap around at the end (down)', () => {
      const result = navigateCard(mockProject, 'card3', 'down')
      expect(result).toBe('card1') // wraps to first
    })

    it('should wrap around at the start (up)', () => {
      const result = navigateCard(mockProject, 'card1', 'up')
      expect(result).toBe('card3') // wraps to last
    })

    it('should select first card when currentCardId is null', () => {
      const result = navigateCard(mockProject, null, 'down')
      expect(result).toBe('card1')
    })

    it('should return null for empty project', () => {
      const emptyProject: Project = {
        ...mockProject,
        cards: [],
      }
      const result = navigateCard(emptyProject, null, 'down')
      expect(result).toBeNull()
    })

    it('should return first card if current card not found', () => {
      const result = navigateCard(mockProject, 'non-existent', 'down')
      expect(result).toBe('card1')
    })
  })
})
