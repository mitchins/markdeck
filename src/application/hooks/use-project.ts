/**
 * useProject hook
 * 
 * Main hook for project operations (load, save, etc.)
 */

import { useCallback } from 'react'
import { toast } from 'sonner'
import { useAppStore, selectProject, selectHasUnsavedChanges, selectIsLoading } from '../state/app-store'
import { createProvider, type ProviderConfig, type ProviderType } from '@/adapters'
import { loadProject } from '../use-cases/load-project'
import { saveProject } from '../use-cases/save-project'

export function useProject() {
  const project = useAppStore(selectProject)
  const hasChanges = useAppStore(selectHasUnsavedChanges)
  const isLoading = useAppStore(selectIsLoading)
  const provider = useAppStore(state => state.provider)
  const actions = useAppStore(state => state.actions)
  
  const load = useCallback(async (providerType?: ProviderType, config?: ProviderConfig) => {
    actions.setProviderStatus('loading')
    
    try {
      const providerInstance = createProvider(
        providerType || provider.type,
        config || provider.config || {}
      )
      
      const result = await loadProject(providerInstance)
      
      if (result.success && result.project) {
        actions.setProject(result.project)
        toast.success(`Loaded ${result.project.cards.length} cards`)
        return result.project
      } else {
        toast.error('Failed to load project', {
          description: result.error?.message,
        })
        return null
      }
    } catch (error) {
      toast.error('Failed to load project', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
      return null
    } finally {
      actions.setProviderStatus('idle')
    }
  }, [provider, actions])
  
  const save = useCallback(async () => {
    if (!project) {
      toast.error('No project to save')
      return false
    }
    
    actions.setProviderStatus('saving')
    
    try {
      const providerInstance = createProvider(provider.type, provider.config || {})
      const result = await saveProject(project, providerInstance)
      
      if (result.success) {
        actions.updateLastSaved()
        toast.success('Project saved successfully')
        return true
      } else {
        toast.error('Failed to save project', {
          description: result.error?.message,
        })
        return false
      }
    } catch (error) {
      toast.error('Failed to save project', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
      return false
    } finally {
      actions.setProviderStatus('idle')
    }
  }, [project, provider, actions])
  
  return {
    project,
    hasChanges,
    isLoading,
    load,
    save,
  }
}
