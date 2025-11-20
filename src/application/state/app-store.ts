/**
 * Application state management with Zustand
 * 
 * Central store for all application state including project data,
 * provider configuration, UI state, and sync status.
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Project, Card, CardStatus } from '@/core'
import type { StatusProvider, ProviderType } from '@/adapters'

// Provider configuration state
export interface ProviderState {
  type: ProviderType
  config: {
    github?: {
      token: string
      owner?: string
      repo?: string
      branch?: string
    }
  } | null
  status: 'idle' | 'loading' | 'saving' | 'error'
}

// UI state (ephemeral, not persisted)
export interface UIState {
  selectedCardId: string | null
  drawerOpen: boolean
  collapsedLanes: Set<string>
  activeTab: 'board' | 'notes' | 'raw'
}

// Sync state
export interface SyncState {
  hasChanges: boolean
  lastSaved: Date | null
  remoteHash: string | null
}

// Main application state
export interface AppState {
  // Current project
  project: Project | null
  
  // Provider state
  provider: ProviderState
  
  // UI state
  ui: UIState
  
  // Sync state
  sync: SyncState
  
  // Actions
  actions: {
    // Project operations
    setProject: (project: Project | null) => void
    updateProject: (updater: (project: Project) => Project) => void
    
    // Card operations
    moveCard: (cardId: string, newStatus: CardStatus) => void
    updateCard: (cardId: string, updates: Partial<Card>) => void
    toggleBlocked: (cardId: string) => void
    
    // Provider operations
    setProvider: (type: ProviderType, config: ProviderState['config']) => void
    setProviderStatus: (status: ProviderState['status']) => void
    
    // UI operations
    setSelectedCard: (cardId: string | null) => void
    setDrawerOpen: (open: boolean) => void
    toggleLaneCollapse: (laneId: string) => void
    setActiveTab: (tab: UIState['activeTab']) => void
    
    // Sync operations
    markChanges: (hasChanges: boolean) => void
    updateLastSaved: () => void
    setRemoteHash: (hash: string | null) => void
    
    // Reset
    reset: () => void
  }
}

const initialState = {
  project: null,
  provider: {
    type: 'file' as ProviderType,
    config: null,
    status: 'idle' as const,
  },
  ui: {
    selectedCardId: null,
    drawerOpen: false,
    collapsedLanes: new Set<string>(),
    activeTab: 'board' as const,
  },
  sync: {
    hasChanges: false,
    lastSaved: null,
    remoteHash: null,
  },
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      actions: {
        // Project operations
        setProject: (project) => {
          set({ 
            project,
            sync: { ...get().sync, hasChanges: false },
          })
        },
        
        updateProject: (updater) => {
          const { project } = get()
          if (!project) return
          
          set({ 
            project: updater(project),
            sync: { ...get().sync, hasChanges: true },
          })
        },
        
        // Card operations
        moveCard: (cardId, newStatus) => {
          const { project } = get()
          if (!project) return
          
          const updatedCards = project.cards.map(card =>
            card.id === cardId ? { ...card, status: newStatus } : card
          )
          
          set({
            project: { ...project, cards: updatedCards },
            sync: { ...get().sync, hasChanges: true },
          })
        },
        
        updateCard: (cardId, updates) => {
          const { project } = get()
          if (!project) return
          
          const updatedCards = project.cards.map(card =>
            card.id === cardId ? { ...card, ...updates } : card
          )
          
          set({
            project: { ...project, cards: updatedCards },
            sync: { ...get().sync, hasChanges: true },
          })
        },
        
        toggleBlocked: (cardId) => {
          const { project } = get()
          if (!project) return
          
          const updatedCards = project.cards.map(card =>
            card.id === cardId ? { ...card, blocked: !card.blocked } : card
          )
          
          set({
            project: { ...project, cards: updatedCards },
            sync: { ...get().sync, hasChanges: true },
          })
        },
        
        // Provider operations
        setProvider: (type, config) => {
          set({
            provider: { ...get().provider, type, config },
          })
        },
        
        setProviderStatus: (status) => {
          set({
            provider: { ...get().provider, status },
          })
        },
        
        // UI operations
        setSelectedCard: (cardId) => {
          set({
            ui: { ...get().ui, selectedCardId: cardId },
          })
        },
        
        setDrawerOpen: (open) => {
          set({
            ui: { ...get().ui, drawerOpen: open },
          })
        },
        
        toggleLaneCollapse: (laneId) => {
          const { ui } = get()
          const collapsedLanes = new Set(ui.collapsedLanes)
          
          if (collapsedLanes.has(laneId)) {
            collapsedLanes.delete(laneId)
          } else {
            collapsedLanes.add(laneId)
          }
          
          set({
            ui: { ...ui, collapsedLanes },
          })
        },
        
        setActiveTab: (tab) => {
          set({
            ui: { ...get().ui, activeTab: tab },
          })
        },
        
        // Sync operations
        markChanges: (hasChanges) => {
          set({
            sync: { ...get().sync, hasChanges },
          })
        },
        
        updateLastSaved: () => {
          set({
            sync: { ...get().sync, lastSaved: new Date(), hasChanges: false },
          })
        },
        
        setRemoteHash: (hash) => {
          set({
            sync: { ...get().sync, remoteHash: hash },
          })
        },
        
        // Reset
        reset: () => {
          set(initialState)
        },
      },
    }),
    {
      name: 'markdeck-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist provider config, not the full project
        provider: {
          type: state.provider.type,
          config: state.provider.config,
          status: 'idle' as const, // Reset status on reload
        },
        // Don't persist UI state or project data
      }),
    }
  )
)

// Selectors for derived state
export const selectProject = (state: AppState) => state.project
export const selectCards = (state: AppState) => state.project?.cards ?? []
export const selectSwimlanes = (state: AppState) => state.project?.swimlanes ?? []
export const selectNotes = (state: AppState) => state.project?.notes ?? []
export const selectMetadata = (state: AppState) => state.project?.metadata

export const selectCardsByLane = (laneId: string) => (state: AppState) =>
  state.project?.cards.filter(card => card.laneId === laneId) ?? []

export const selectCardsByStatus = (status: CardStatus) => (state: AppState) =>
  state.project?.cards.filter(card => card.status === status) ?? []

export const selectBlockedCards = (state: AppState) =>
  state.project?.cards.filter(card => card.blocked) ?? []

export const selectHasUnsavedChanges = (state: AppState) =>
  state.sync.hasChanges

export const selectIsLoading = (state: AppState) =>
  state.provider.status === 'loading' || state.provider.status === 'saving'

export const selectSelectedCard = (state: AppState) => {
  const { ui, project } = state
  if (!ui.selectedCardId || !project) return null
  return project.cards.find(card => card.id === ui.selectedCardId) || null
}
