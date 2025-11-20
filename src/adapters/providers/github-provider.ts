/**
 * GitHub provider for STATUS.md files in GitHub repositories
 * 
 * Implements StatusProvider for GitHub API integration.
 */

import type {
  StatusProvider,
  ProviderResult,
  LoadContext,
  SaveContext,
  ListContext,
  ProjectInfo,
} from './base-provider'
import { ProviderError } from './base-provider'
import { GitHubClient, type GitHubConfig } from '../api/github-client'

export class GitHubProvider implements StatusProvider {
  readonly type = 'github' as const
  private client: GitHubClient
  private fileSha: string | null = null

  constructor(private config: GitHubConfig) {
    this.client = new GitHubClient(config)
  }

  async load(context: LoadContext): Promise<ProviderResult<string>> {
    try {
      if (!this.config.owner || !this.config.repo) {
        return {
          success: false,
          error: new ProviderError(
            'GitHub provider requires owner and repo to be configured',
            'GITHUB_CONFIG_ERROR',
            'github'
          ),
        }
      }

      const file = await this.client.getFile(
        this.config.owner,
        this.config.repo,
        'STATUS.md',
        context.branch || this.config.branch
      )

      // Store the SHA for later updates
      this.fileSha = file.sha

      return { success: true, data: file.content }
    } catch (error) {
      return {
        success: false,
        error: new ProviderError(
          `Failed to load STATUS.md from GitHub: ${(error as Error).message}`,
          'GITHUB_LOAD_ERROR',
          'github',
          error as Error
        ),
      }
    }
  }

  async save(content: string, context: SaveContext): Promise<ProviderResult<void>> {
    try {
      if (!this.config.owner || !this.config.repo) {
        return {
          success: false,
          error: new ProviderError(
            'GitHub provider requires owner and repo to be configured',
            'GITHUB_CONFIG_ERROR',
            'github'
          ),
        }
      }

      if (!this.fileSha) {
        return {
          success: false,
          error: new ProviderError(
            'File must be loaded before it can be saved',
            'GITHUB_SAVE_ERROR',
            'github'
          ),
        }
      }

      const result = await this.client.updateFile(
        this.config.owner,
        this.config.repo,
        'STATUS.md',
        content,
        this.fileSha,
        context.message || 'Update STATUS.md via MarkDeck',
        context.branch || this.config.branch
      )

      // Update the stored SHA
      this.fileSha = result.sha

      return { success: true, data: undefined }
    } catch (error) {
      return {
        success: false,
        error: new ProviderError(
          `Failed to save STATUS.md to GitHub: ${(error as Error).message}`,
          'GITHUB_SAVE_ERROR',
          'github',
          error as Error
        ),
      }
    }
  }

  async list(context: ListContext): Promise<ProviderResult<ProjectInfo[]>> {
    try {
      const repos = await this.client.listRepos(context.limit || 100)

      // Check each repo for STATUS.md file
      const projectsWithStatus: ProjectInfo[] = []

      for (const repo of repos) {
        const hasStatusMd = await this.client.checkFileExists(
          repo.owner,
          repo.name,
          'STATUS.md'
        )

        if (hasStatusMd) {
          projectsWithStatus.push({
            id: repo.full_name,
            name: repo.name,
            description: repo.description,
            lastUpdated: repo.updated_at,
          })
        }
      }

      return { success: true, data: projectsWithStatus }
    } catch (error) {
      return {
        success: false,
        error: new ProviderError(
          `Failed to list GitHub repositories: ${(error as Error).message}`,
          'GITHUB_LIST_ERROR',
          'github',
          error as Error
        ),
      }
    }
  }

  isConfigured(): boolean {
    return !!(this.config.token && this.config.owner && this.config.repo)
  }

  async validateConfig(): Promise<ProviderResult<void>> {
    try {
      const isValid = await this.client.validateToken()
      
      if (!isValid) {
        return {
          success: false,
          error: new ProviderError(
            'Invalid GitHub token',
            'GITHUB_AUTH_ERROR',
            'github'
          ),
        }
      }

      return { success: true, data: undefined }
    } catch (error) {
      return {
        success: false,
        error: new ProviderError(
          `GitHub validation failed: ${(error as Error).message}`,
          'GITHUB_VALIDATION_ERROR',
          'github',
          error as Error
        ),
      }
    }
  }

  updateConfig(config: Partial<GitHubConfig>): void {
    this.config = { ...this.config, ...config }
    this.client = new GitHubClient(this.config)
    this.fileSha = null // Reset SHA when config changes
  }
}
