/**
 * Actions for TUI mutations
 * 
 * Handles card movements and state changes
 */

import type { Project, Card, CardStatus } from '../../../src/core/domain/types.js'
import { STATUS_COLUMNS } from '../../../src/core/domain/types.js'

/**
 * Move a card to a different lane (status)
 */
export function moveCardToLane(project: Project, cardId: string, direction: 'left' | 'right'): Project {
  const card = project.cards.find(c => c.id === cardId)
  if (!card) return project
  
  const currentIndex = STATUS_COLUMNS.findIndex(col => col.key === card.status)
  const newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1
  
  // Check bounds
  if (newIndex < 0 || newIndex >= STATUS_COLUMNS.length) {
    return project
  }
  
  const newStatus = STATUS_COLUMNS[newIndex].key
  
  // Create updated card
  const updatedCard: Card = {
    ...card,
    status: newStatus,
  }
  
  // Return updated project
  return {
    ...project,
    cards: project.cards.map(c => c.id === cardId ? updatedCard : c),
  }
}

/**
 * Toggle blocked status of a card
 */
export function toggleCardBlocked(project: Project, cardId: string): Project {
  const card = project.cards.find(c => c.id === cardId)
  if (!card) return project
  
  // Create updated card
  const updatedCard: Card = {
    ...card,
    blocked: !card.blocked,
  }
  
  // Return updated project
  return {
    ...project,
    cards: project.cards.map(c => c.id === cardId ? updatedCard : c),
  }
}

/**
 * Get all cards in a specific lane and status, sorted
 */
export function getCardsInLaneAndStatus(project: Project, laneId: string, status: CardStatus): Card[] {
  return project.cards
    .filter(c => c.laneId === laneId && c.status === status)
    .sort((a, b) => a.originalLine - b.originalLine)
}

/**
 * Get all cards across all lanes, ordered by lane order and status
 */
export function getAllCardsOrdered(project: Project): Card[] {
  const lanes = [...project.swimlanes].sort((a, b) => a.order - b.order)
  const allCards: Card[] = []
  
  for (const lane of lanes) {
    for (const column of STATUS_COLUMNS) {
      const cards = getCardsInLaneAndStatus(project, lane.id, column.key)
      allCards.push(...cards)
    }
  }
  
  return allCards
}

/**
 * Navigate to next/previous card
 */
export function navigateCard(project: Project, currentCardId: string | null, direction: 'up' | 'down'): string | null {
  const orderedCards = getAllCardsOrdered(project)
  
  if (orderedCards.length === 0) return null
  
  // If no current card, select first
  if (!currentCardId) {
    return orderedCards[0].id
  }
  
  const currentIndex = orderedCards.findIndex(c => c.id === currentCardId)
  if (currentIndex === -1) {
    return orderedCards[0].id
  }
  
  const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
  
  // Wrap around
  if (newIndex < 0) {
    return orderedCards[orderedCards.length - 1].id
  }
  if (newIndex >= orderedCards.length) {
    return orderedCards[0].id
  }
  
  return orderedCards[newIndex].id
}
