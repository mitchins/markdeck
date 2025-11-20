/**
 * GitHub API client wrapper
 * 
 * Provides error handling and type-safe access to GitHub API.
 */

import { Octokit } from 'octokit'

type OctokitError = {
  status?: number
}

function isOctokitError(error: unknown): error is OctokitError {
  return typeof error === 'object' && error !== null && 'status' in error
}

export interface GitHubConfig {
  token: string
  owner?: string
  repo?: string
  branch?: string
}

export interface GitHubFile {
  content: string
  sha: string
  encoding: string
  size: number
}

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  owner: string
  default_branch: string
  description?: string
  updated_at?: string
  has_status_md?: boolean
}

export class GitHubClient {
  private octokit: Octokit

  constructor(private config: GitHubConfig) {
    this.octokit = new Octokit({ auth: config.token })
  }

  async getFile(
    owner: string,
    repo: string,
    path: string,
    ref?: string
  ): Promise<GitHubFile> {
    try {
      const response = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref,
      })

      if ('content' in response.data) {
        return {
          content: Buffer.from(response.data.content, 'base64').toString('utf-8'),
          sha: response.data.sha,
          encoding: response.data.encoding as string,
          size: response.data.size,
        }
      }

      throw new Error('File not found or is a directory')
    } catch (error: unknown) {
      if (isOctokitError(error) && error.status === 404) {
        throw new Error('File not found')
      }
      throw error
    }
  }

  async updateFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    sha: string,
    message: string,
    branch?: string
  ): Promise<{ sha: string }> {
    const encoded = Buffer.from(content).toString('base64')

    const response = await this.octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: encoded,
      sha,
      branch,
    })

    return { sha: response.data.content?.sha || sha }
  }

  async listRepos(limit = 100): Promise<GitHubRepo[]> {
    const response = await this.octokit.rest.repos.listForAuthenticatedUser({
      per_page: limit,
      sort: 'updated',
    })

    return response.data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      owner: repo.owner?.login || '',
      default_branch: repo.default_branch || 'main',
      description: repo.description || undefined,
      updated_at: repo.updated_at || undefined,
    }))
  }

  async checkFileExists(
    owner: string,
    repo: string,
    path: string
  ): Promise<boolean> {
    try {
      await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
      })
      return true
    } catch (error: unknown) {
      if (isOctokitError(error) && error.status === 404) {
        return false
      }
      throw error
    }
  }

  async validateToken(): Promise<boolean> {
    try {
      await this.octokit.rest.users.getAuthenticated()
      return true
    } catch {
      return false
    }
  }
}
