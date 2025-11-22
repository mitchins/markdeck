/**
 * Board component
 * 
 * Main Kanban board that displays swimlanes with columns and cards.
 * Supports both simple (2-column) and full (3-column) modes.
 */

import { Swimlane } from './Swimlane'
import { useSwimlanes, useCards } from '@/application'
import { useAppStore } from '@/application/state/app-store'
import type { Card, CardStatus } from '@/core'

export function Board() {
  const { swimlanes } = useSwimlanes()
  const { cards, moveCard } = useCards()
  const actions = useAppStore(state => state.actions)
  const project = useAppStore(state => state.project)
  
  const handleCardDrop = (cardId: string, newStatus: CardStatus) => {
    moveCard(cardId, newStatus)
  }
  
  const handleCardClick = (card: Card) => {
    actions.setSelectedCard(card.id)
    actions.setDrawerOpen(true)
  }
  
  if (swimlanes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>No swimlanes found. Upload a STATUS.md file to get started.</p>
      </div>
    )
  }
  
  const boardMode = project?.boardMode || 'full'
  
  return (
    <div className="space-y-4 pb-8">
      {swimlanes.map((swimlane) => (
        <Swimlane
          key={swimlane.id}
          swimlane={swimlane}
          cards={cards.filter(card => card.laneId === swimlane.id)}
          onCardDrop={handleCardDrop}
          onCardClick={handleCardClick}
          boardMode={boardMode}
        />
      ))}
    </div>
  )
}
