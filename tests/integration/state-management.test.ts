/**
 * Integration tests for State Management (Zustand)
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { 
  useAppStore, 
  selectCardsByLane, 
  selectBlockedCards,
  selectCardsByStatus,
  selectHasUnsavedChanges,
  selectIsLoading
} from '@/application/state/app-store'
import type { Project } from '@/core/domain/types'

describe('State Management', () => {
  beforeEach(() => {
    // Reset the store before each test
    const { result } = renderHook(() => useAppStore())
    act(() => {
      result.current.actions.reset()
    })
  })

  describe('App Store', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useAppStore())
      
      expect(result.current.project).toBeNull()
      expect(result.current.provider.type).toBe('file')
      expect(result.current.provider.status).toBe('idle')
      expect(result.current.ui.selectedCardId).toBeNull()
      expect(result.current.ui.drawerOpen).toBe(false)
      expect(result.current.sync.hasChanges).toBe(false)
    })

    it('should update project state', () => {
      const { result } = renderHook(() => useAppStore())
      
      const mockProject: Project = {
        metadata: { title: 'Test Project' },
        cards: [],
        swimlanes: [],
        notes: [],
        rawMarkdown: '# Test'
      }
      
      act(() => {
        result.current.actions.setProject(mockProject)
      })
      
      expect(result.current.project).toEqual(mockProject)
      expect(result.current.sync.hasChanges).toBe(false)
    })

    it('should move card and update hasChanges flag', () => {
      const { result } = renderHook(() => useAppStore())
      
      const mockProject: Project = {
        metadata: { title: 'Test' },
        cards: [
          {
            id: 'card-1',
            title: 'Task',
            status: 'todo',
            laneId: 'lane-1',
            blocked: false,
            links: [],
            originalLine: 0
          }
        ],
        swimlanes: [],
        notes: [],
        rawMarkdown: ''
      }
      
      act(() => {
        result.current.actions.setProject(mockProject)
      })
      
      expect(result.current.sync.hasChanges).toBe(false)
      
      act(() => {
        result.current.actions.moveCard('card-1', 'done')
      })
      
      expect(result.current.project?.cards[0].status).toBe('done')
      expect(result.current.sync.hasChanges).toBe(true)
    })

    it('should maintain state immutability', () => {
      const { result } = renderHook(() => useAppStore())
      
      const mockProject: Project = {
        metadata: { title: 'Test' },
        cards: [
          {
            id: 'card-1',
            title: 'Task',
            status: 'todo',
            laneId: 'lane-1',
            blocked: false,
            links: [],
            originalLine: 0
          }
        ],
        swimlanes: [],
        notes: [],
        rawMarkdown: ''
      }
      
      act(() => {
        result.current.actions.setProject(mockProject)
      })
      
      const originalProject = result.current.project
      
      act(() => {
        result.current.actions.updateCard('card-1', { title: 'Updated Task' })
      })
      
      // Original project should not be mutated
      expect(originalProject?.cards[0].title).toBe('Task')
      expect(result.current.project?.cards[0].title).toBe('Updated Task')
    })

    it('should toggle blocked status', () => {
      const { result } = renderHook(() => useAppStore())
      
      const mockProject: Project = {
        metadata: { title: 'Test' },
        cards: [
          {
            id: 'card-1',
            title: 'Task',
            status: 'todo',
            laneId: 'lane-1',
            blocked: false,
            links: [],
            originalLine: 0
          }
        ],
        swimlanes: [],
        notes: [],
        rawMarkdown: ''
      }
      
      act(() => {
        result.current.actions.setProject(mockProject)
      })
      
      expect(result.current.project?.cards[0].blocked).toBe(false)
      
      act(() => {
        result.current.actions.toggleBlocked('card-1')
      })
      
      expect(result.current.project?.cards[0].blocked).toBe(true)
      
      act(() => {
        result.current.actions.toggleBlocked('card-1')
      })
      
      expect(result.current.project?.cards[0].blocked).toBe(false)
    })

    it('should update UI state', () => {
      const { result } = renderHook(() => useAppStore())
      
      act(() => {
        result.current.actions.setSelectedCard('card-1')
      })
      
      expect(result.current.ui.selectedCardId).toBe('card-1')
      
      act(() => {
        result.current.actions.setDrawerOpen(true)
      })
      
      expect(result.current.ui.drawerOpen).toBe(true)
      
      act(() => {
        result.current.actions.setActiveTab('notes')
      })
      
      expect(result.current.ui.activeTab).toBe('notes')
    })

    it('should toggle lane collapse', () => {
      const { result } = renderHook(() => useAppStore())
      
      act(() => {
        result.current.actions.toggleLaneCollapse('lane-1')
      })
      
      expect(result.current.ui.collapsedLanes.has('lane-1')).toBe(true)
      
      act(() => {
        result.current.actions.toggleLaneCollapse('lane-1')
      })
      
      expect(result.current.ui.collapsedLanes.has('lane-1')).toBe(false)
    })

    it('should update provider state', () => {
      const { result } = renderHook(() => useAppStore())
      
      const mockConfig = { repo: 'test/repo', token: 'test-token' }
      
      act(() => {
        result.current.actions.setProvider('github', mockConfig)
      })
      
      expect(result.current.provider.type).toBe('github')
      expect(result.current.provider.config).toEqual(mockConfig)
      
      act(() => {
        result.current.actions.setProviderStatus('loading')
      })
      
      expect(result.current.provider.status).toBe('loading')
    })

    it('should update sync state', () => {
      const { result } = renderHook(() => useAppStore())
      
      act(() => {
        result.current.actions.markChanges(true)
      })
      
      expect(result.current.sync.hasChanges).toBe(true)
      
      act(() => {
        result.current.actions.updateLastSaved()
      })
      
      expect(result.current.sync.hasChanges).toBe(false)
      expect(result.current.sync.lastSaved).toBeInstanceOf(Date)
      
      act(() => {
        result.current.actions.setRemoteHash('abc123')
      })
      
      expect(result.current.sync.remoteHash).toBe('abc123')
    })
  })

  describe('State selectors', () => {
    it('should select cards by lane', () => {
      const { result } = renderHook(() => useAppStore())
      
      const mockProject: Project = {
        metadata: { title: 'Test' },
        cards: [
          {
            id: 'card-1',
            title: 'Task 1',
            status: 'todo',
            laneId: 'lane-1',
            blocked: false,
            links: [],
            originalLine: 0
          },
          {
            id: 'card-2',
            title: 'Task 2',
            status: 'todo',
            laneId: 'lane-2',
            blocked: false,
            links: [],
            originalLine: 1
          }
        ],
        swimlanes: [],
        notes: [],
        rawMarkdown: ''
      }
      
      act(() => {
        result.current.actions.setProject(mockProject)
      })
      
      const lane1Cards = selectCardsByLane('lane-1')(result.current)
      expect(lane1Cards).toHaveLength(1)
      expect(lane1Cards[0].id).toBe('card-1')
    })

    it('should select blocked cards', () => {
      const { result } = renderHook(() => useAppStore())
      
      const mockProject: Project = {
        metadata: { title: 'Test' },
        cards: [
          {
            id: 'card-1',
            title: 'Task 1',
            status: 'todo',
            laneId: 'lane-1',
            blocked: true,
            links: [],
            originalLine: 0
          },
          {
            id: 'card-2',
            title: 'Task 2',
            status: 'todo',
            laneId: 'lane-1',
            blocked: false,
            links: [],
            originalLine: 1
          }
        ],
        swimlanes: [],
        notes: [],
        rawMarkdown: ''
      }
      
      act(() => {
        result.current.actions.setProject(mockProject)
      })
      
      const blockedCards = selectBlockedCards(result.current)
      expect(blockedCards).toHaveLength(1)
      expect(blockedCards[0].id).toBe('card-1')
    })

    it('should select cards by status', () => {
      const { result } = renderHook(() => useAppStore())
      
      const mockProject: Project = {
        metadata: { title: 'Test' },
        cards: [
          {
            id: 'card-1',
            title: 'Task 1',
            status: 'done',
            laneId: 'lane-1',
            blocked: false,
            links: [],
            originalLine: 0
          },
          {
            id: 'card-2',
            title: 'Task 2',
            status: 'todo',
            laneId: 'lane-1',
            blocked: false,
            links: [],
            originalLine: 1
          }
        ],
        swimlanes: [],
        notes: [],
        rawMarkdown: ''
      }
      
      act(() => {
        result.current.actions.setProject(mockProject)
      })
      
      const doneCards = selectCardsByStatus('done')(result.current)
      expect(doneCards).toHaveLength(1)
      expect(doneCards[0].id).toBe('card-1')
    })

    it('should select unsaved changes flag', () => {
      const { result } = renderHook(() => useAppStore())
      
      expect(selectHasUnsavedChanges(result.current)).toBe(false)
      
      act(() => {
        result.current.actions.markChanges(true)
      })
      
      expect(selectHasUnsavedChanges(result.current)).toBe(true)
    })

    it('should select loading state', () => {
      const { result } = renderHook(() => useAppStore())
      
      expect(selectIsLoading(result.current)).toBe(false)
      
      act(() => {
        result.current.actions.setProviderStatus('loading')
      })
      
      expect(selectIsLoading(result.current)).toBe(true)
      
      act(() => {
        result.current.actions.setProviderStatus('saving')
      })
      
      expect(selectIsLoading(result.current)).toBe(true)
    })
  })
})
