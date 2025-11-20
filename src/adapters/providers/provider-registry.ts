/**
 * Provider registry and factory
 * 
 * Central registry for creating provider instances.
 */

import type { StatusProvider, ProviderType } from './base-provider'
import { FileProvider } from './file-provider'
import { GitHubProvider } from './github-provider'
import { StaticProvider } from './static-provider'
import type { GitHubConfig } from '../api/github-client'

export interface ProviderConfig {
  github?: GitHubConfig
  // Future providers
  d1?: {
    databaseId: string
    tableName: string
  }
  r2?: {
    bucketName: string
    objectKey: string
  }
}

type ProviderFactory = (config: ProviderConfig) => StatusProvider

export const PROVIDER_REGISTRY: Record<ProviderType, ProviderFactory> = {
  file: () => new FileProvider(),
  github: (config) => {
    if (!config.github) {
      throw new Error('GitHub configuration is required')
    }
    return new GitHubProvider(config.github)
  },
  static: () => new StaticProvider(),
  d1: () => {
    throw new Error('D1 provider not yet implemented')
  },
  r2: () => {
    throw new Error('R2 provider not yet implemented')
  },
}

export function createProvider(
  type: ProviderType,
  config: ProviderConfig = {}
): StatusProvider {
  const factory = PROVIDER_REGISTRY[type]
  if (!factory) {
    throw new Error(`Unknown provider type: ${type}`)
  }
  return factory(config)
}

export function isProviderAvailable(type: ProviderType): boolean {
  try {
    createProvider(type)
    return true
  } catch {
    return false
  }
}
