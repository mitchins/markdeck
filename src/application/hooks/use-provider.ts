/**
 * useProvider hook
 * 
 * Hook for provider configuration and operations.
 */

import { useCallback } from 'react'
import { useAppStore } from '../state/app-store'
import type { ProviderConfig, ProviderType } from '@/adapters'

export function useProvider() {
  const provider = useAppStore(state => state.provider)
  const actions = useAppStore(state => state.actions)
  
  const setProvider = useCallback((type: ProviderType, config: ProviderConfig) => {
    actions.setProvider(type, config)
  }, [actions])
  
  const isConfigured = useCallback(() => {
    if (provider.type === 'file' || provider.type === 'static') {
      return true
    }
    
    if (provider.type === 'github') {
      return !!(provider.config?.github?.token && 
                provider.config?.github?.owner && 
                provider.config?.github?.repo)
    }
    
    return false
  }, [provider])
  
  return {
    provider,
    setProvider,
    isConfigured: isConfigured(),
  }
}
