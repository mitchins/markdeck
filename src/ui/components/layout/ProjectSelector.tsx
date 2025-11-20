import { useState, useEffect, useCallback } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { FolderOpen, GithubLogo, SignOut } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Repository {
  name: string
  full_name: string
  owner: string
  default_branch: string
}

interface GitHubRepositoryResponse {
  name: string
  full_name: string
  owner: {
    login: string
  }
  default_branch: string
}

interface ProjectSelectorProps {
  githubToken: string | null
  onDisconnect: () => void
  onProjectSelect: (repo: Repository) => void
}

export function ProjectSelector({ githubToken, onDisconnect, onProjectSelect }: ProjectSelectorProps) {
  const [repos, setRepos] = useState<Repository[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRepo, setSelectedRepo] = useState<string>('')

  const loadRepositories = useCallback(async () => {
    if (!githubToken) return

    setIsLoading(true)
    try {
      const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch repositories')
      }

      const allRepos = await response.json() as GitHubRepositoryResponse[]
      
      const reposWithStatus = await Promise.all(
        allRepos.map(async (repo: GitHubRepositoryResponse) => {
          try {
            const statusResponse = await fetch(
              `https://api.github.com/repos/${repo.full_name}/contents/STATUS.md`,
              {
                headers: {
                  'Authorization': `token ${githubToken}`,
                  'Accept': 'application/vnd.github.v3+json',
                },
              }
            )

            if (statusResponse.ok) {
              return {
                name: repo.name,
                full_name: repo.full_name,
                owner: repo.owner.login,
                default_branch: repo.default_branch,
              }
            }
          } catch {
            return null
          }
          return null
        })
      )

      const filteredRepos = reposWithStatus.filter((r): r is Repository => r !== null)
      setRepos(filteredRepos)

      if (filteredRepos.length === 0) {
        toast.info('No repositories with STATUS.md found', {
          description: 'Create a STATUS.md file in your repository to get started',
        })
      }
    } catch (error) {
      toast.error('Failed to load repositories', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setIsLoading(false)
    }
  }, [githubToken])

  useEffect(() => {
    if (githubToken) {
      void loadRepositories()
    }
  }, [githubToken, loadRepositories])

  const handleRepoChange = (fullName: string) => {
    setSelectedRepo(fullName)
    const repo = repos.find(r => r.full_name === fullName)
    if (repo) {
      onProjectSelect(repo)
    }
  }

  if (!githubToken) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      {isLoading ? (
        <Skeleton className="h-9 w-[250px]" />
      ) : (
        <>
          <Select value={selectedRepo} onValueChange={handleRepoChange}>
            <SelectTrigger className="w-[250px]">
              <div className="flex items-center gap-2">
                <FolderOpen size={16} />
                <SelectValue placeholder="Select a repository..." />
              </div>
            </SelectTrigger>
            <SelectContent>
              {repos.map((repo) => (
                <SelectItem key={repo.full_name} value={repo.full_name}>
                  <div className="flex items-center gap-2">
                    <GithubLogo size={14} />
                    {repo.full_name}
                  </div>
                </SelectItem>
              ))}
              {repos.length === 0 && (
                <div className="p-2 text-xs text-muted-foreground text-center">
                  No repositories found
                </div>
              )}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDisconnect}
            title="Disconnect GitHub"
          >
            <SignOut size={16} />
          </Button>
        </>
      )}
    </div>
  )
}
