/**
 * useCards hook
 * 
 * Hook for card operations (move, update, toggle blocked, etc.)
 */

import { useCallback } from 'react'
import { useAppStore, selectCards, selectCardsByLane, selectCardsByStatus } from '../state/app-store'
import type { CardStatus } from '@/core'

export function useCards() {
  const cards = useAppStore(selectCards)
  const actions = useAppStore(state => state.actions)
  
  const getCardsByLane = useCallback((laneId: string) => {
    return useAppStore.getState().project?.cards.filter(card => card.laneId === laneId) ?? []
  }, [])
  
  const getCardsByStatus = useCallback((status: CardStatus) => {
    return useAppStore.getState().project?.cards.filter(card => card.status === status) ?? []
  }, [])
  
  const moveCard = useCallback((cardId: string, newStatus: CardStatus) => {
    actions.moveCard(cardId, newStatus)
  }, [actions])
  
  const updateCard = useCallback((cardId: string, updates: any) => {
    actions.updateCard(cardId, updates)
  }, [actions])
  
  const toggleBlocked = useCallback((cardId: string) => {
    actions.toggleBlocked(cardId)
  }, [actions])
  
  return {
    cards,
    getCardsByLane,
    getCardsByStatus,
    moveCard,
    updateCard,
    toggleBlocked,
  }
}
