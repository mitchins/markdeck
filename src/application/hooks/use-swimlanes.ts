/**
 * useSwimlanes hook
 * 
 * Hook for swimlane operations and state.
 */

import { useCallback } from 'react'
import { useAppStore, selectSwimlanes } from '../state/app-store'

export function useSwimlanes() {
  const swimlanes = useAppStore(selectSwimlanes)
  const collapsedLanes = useAppStore(state => state.ui.collapsedLanes)
  const actions = useAppStore(state => state.actions)
  
  const isLaneCollapsed = useCallback((laneId: string) => {
    return collapsedLanes.has(laneId)
  }, [collapsedLanes])
  
  const toggleLaneCollapse = useCallback((laneId: string) => {
    actions.toggleLaneCollapse(laneId)
  }, [actions])
  
  return {
    swimlanes,
    isLaneCollapsed,
    toggleLaneCollapse,
  }
}
