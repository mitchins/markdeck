import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GithubLogo, Key } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface GitHubConnectorProps {
  open: boolean
  onConnect: (token: string) => void
  onClose: () => void
}

export function GitHubConnector({ open, onConnect, onClose }: GitHubConnectorProps) {
  const [token, setToken] = useState('')
  const [isValidating, setIsValidating] = useState(false)

  const handleConnect = async () => {
    if (!token.trim()) {
      toast.error('Please enter a GitHub token')
      return
    }

    setIsValidating(true)
    
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      })

      if (!response.ok) {
        throw new Error('Invalid token')
      }

      const user = await response.json()
      toast.success(`Connected as ${user.login}`)
      onConnect(token)
      setToken('')
    } catch {
      toast.error('Failed to validate GitHub token', {
        description: 'Please check your token and try again',
      })
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GithubLogo size={24} weight="fill" />
            Connect to GitHub
          </DialogTitle>
          <DialogDescription>
            Enter a GitHub Personal Access Token to sync STATUS.md files from your repositories.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="github-token" className="flex items-center gap-2">
              <Key size={16} />
              Personal Access Token
            </Label>
            <Input
              id="github-token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleConnect()
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Create a token at{' '}
              <a
                href="https://github.com/settings/tokens/new?scopes=repo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                github.com/settings/tokens
              </a>
              {' '}with <code className="bg-muted px-1 rounded">repo</code> scope
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConnect} disabled={isValidating}>
            {isValidating ? 'Validating...' : 'Connect'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
