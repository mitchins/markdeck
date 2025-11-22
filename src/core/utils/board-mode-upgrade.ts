/**
 * Board mode upgrade utilities
 * 
 * Handles converting projects from simple checkbox mode to full emoji mode.
 */

import type { Project, Card } from '../domain/types'

/**
 * Upgrade a project from simple checkbox mode to full emoji mode.
 * Converts all checkbox-format cards to emoji format.
 * 
 * @param project - The project to upgrade
 * @returns A new project with all cards converted to emoji format
 */
export function upgradeToFullMode(project: Project): Project {
  // Convert all checkbox cards to emoji format
  const upgradedCards: Card[] = project.cards.map((card: Card) => {
    if (card.originalFormat === 'checkbox') {
      return {
        ...card,
        originalFormat: 'emoji' as const,
      }
    }
    return card
  })

  return {
    ...project,
    cards: upgradedCards,
    boardMode: 'full',
  }
}
