import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Swimlane } from '@/components/Swimlane'
import { FileUploader } from '@/components/FileUploader'
import { NotesPanel } from '@/components/NotesPanel'
import { CardDetailDrawer } from '@/components/CardDetailDrawer'
import { GitHubConnector } from '@/components/GitHubConnector'
import { ProjectSelector } from '@/components/ProjectSelector'
import { parseStatusMarkdown, projectToMarkdown } from '@/lib/parser'
import type { ParsedStatus, KanbanCard, CardStatus } from '@/lib/types'
import { Download, Eye, FileText, ArrowsClockwise, Kanban, Info, GithubLogo, Upload } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { decodeBase64ToUtf8, encodeUtf8ToBase64 } from '@/lib/encoding-utils'

function App() {
  const [parsedData, setParsedData] = useKV<ParsedStatus | null>('parsed-status', null)
  const [githubToken, setGithubToken] = useKV<string | null>('github-token', null)
  const [currentRepo, setCurrentRepo] = useKV<{ name: string; full_name: string; owner: string; default_branch: string } | null>('current-repo', null)
  const [hasChanges, setHasChanges] = useState(false)
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showGitHubConnector, setShowGitHubConnector] = useState(false)

  const normalizedData = parsedData && parsedData.swimlanes ? parsedData : null

  const handleGitHubConnect = (token: string) => {
    setGithubToken(token)
    setShowGitHubConnector(false)
  }

  const handleGitHubDisconnect = () => {
    setGithubToken(null)
    setCurrentRepo(null)
    setParsedData(null)
  }

  const handleProjectSelect = async (repo: { name: string; full_name: string; owner: string; default_branch: string }) => {
    if (!githubToken) return

    setCurrentRepo(repo)

    try {
      const response = await fetch(
        `https://api.github.com/repos/${repo.full_name}/contents/STATUS.md`,
        {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch STATUS.md')
      }

      const data = await response.json()
      const content = decodeBase64ToUtf8(data.content)
      
      const parsed = parseStatusMarkdown(content)
      setParsedData(parsed)
      setHasChanges(false)
      toast.success(`Loaded ${parsed.cards.length} cards from ${repo.full_name}`)
    } catch (error) {
      toast.error('Failed to load STATUS.md from GitHub', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  const handleFileLoad = (content: string) => {
    try {
      if (!content || content.trim().length === 0) {
        toast.error('File is empty - please provide valid STATUS.md content')
        return
      }

      const parsed = parseStatusMarkdown(content)
      
      if (!parsed.cards || parsed.cards.length === 0) {
        toast.error('No cards found! Make sure your file includes items with 🔵 🟡 🔴 or 🟢 emoji', {
          description: 'Try the demo to see the expected format',
          duration: 6000,
        })
        return
      }

      setParsedData(parsed)
      setCurrentRepo(null)
      setHasChanges(false)
      toast.success(`Loaded ${parsed.cards.length} cards across ${parsed.swimlanes.length} sections`)
    } catch (error) {
      toast.error('Failed to parse STATUS.md', {
        description: error instanceof Error ? error.message : 'Unknown parsing error',
        duration: 5000,
      })
      console.error('Parse error:', error)
    }
  }

  const handleCardMove = (cardId: string, newStatus: CardStatus) => {
    if (!normalizedData) return

    setParsedData((current) => {
      if (!current || !current.swimlanes) return null
      
      const updatedCards = current.cards.map((card) =>
        card.id === cardId ? { ...card, status: newStatus } : card
      )

      return {
        ...current,
        cards: updatedCards,
      }
    })

    setHasChanges(true)
    toast.success('Card status updated')
  }

  const handleCardClick = (card: KanbanCard) => {
    setSelectedCard(card)
    setDrawerOpen(true)
  }

  const handleCardSave = (updatedCard: KanbanCard) => {
    if (!normalizedData) return

    setParsedData((current) => {
      if (!current || !current.swimlanes) return null
      
      const updatedCards = current.cards.map((card) =>
        card.id === updatedCard.id ? updatedCard : card
      )

      return {
        ...current,
        cards: updatedCards,
      }
    })

    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!normalizedData) return

    const updated = projectToMarkdown(
      normalizedData.metadata,
      normalizedData.cards,
      normalizedData.rawMarkdown
    )

    if (currentRepo && githubToken) {
      try {
        const fileResponse = await fetch(
          `https://api.github.com/repos/${currentRepo.full_name}/contents/STATUS.md`,
          {
            headers: {
              'Authorization': `token ${githubToken}`,
              'Accept': 'application/vnd.github.v3+json',
            },
          }
        )

        if (!fileResponse.ok) {
          throw new Error('Failed to fetch current file')
        }

        const fileData = await fileResponse.json()
        
        const updateResponse = await fetch(
          `https://api.github.com/repos/${currentRepo.full_name}/contents/STATUS.md`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `token ${githubToken}`,
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: 'Update STATUS.md via MarkDeck',
              content: encodeUtf8ToBase64(updated),
              sha: fileData.sha,
            }),
          }
        )

        if (!updateResponse.ok) {
          throw new Error('Failed to update file on GitHub')
        }

        setParsedData((current) => {
          if (!current || !current.swimlanes) return null
          return {
            ...current,
            rawMarkdown: updated,
          }
        })

        setHasChanges(false)
        toast.success('STATUS.md updated on GitHub')
      } catch (error) {
        toast.error('Failed to save to GitHub', {
          description: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    } else {
      const blob = new Blob([updated], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'STATUS.md'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setParsedData((current) => {
        if (!current || !current.swimlanes) return null
        return {
          ...current,
          rawMarkdown: updated,
        }
      })

      setHasChanges(false)
      toast.success('STATUS.md downloaded')
    }
  }

  const handleReset = () => {
    setParsedData(null)
    setCurrentRepo(null)
    setHasChanges(false)
    toast.info('Reset to file upload')
  }

  if (!normalizedData) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Kanban size={32} className="text-primary" weight="duotone" />
              <h1 className="text-2xl font-bold tracking-tight">MarkDeck</h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Visual project tracking from STATUS.md files
            </p>
          </header>

          <div className="mb-6 flex items-center justify-center gap-2">
            {githubToken ? (
              <ProjectSelector
                githubToken={githubToken}
                onDisconnect={handleGitHubDisconnect}
                onProjectSelect={handleProjectSelect}
              />
            ) : (
              <Button onClick={() => setShowGitHubConnector(true)} variant="outline">
                <GithubLogo className="mr-2" size={16} weight="fill" />
                Connect GitHub
              </Button>
            )}
          </div>

          <FileUploader onFileLoad={handleFileLoad} />
        </div>

        <GitHubConnector
          open={showGitHubConnector}
          onConnect={handleGitHubConnect}
          onClose={() => setShowGitHubConnector(false)}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Kanban size={24} className="text-primary" weight="duotone" />
                <h1 className="text-xl font-bold tracking-tight">{normalizedData.metadata.title}</h1>
              </div>
              <div className="flex items-center gap-4 mt-1">
                {normalizedData.metadata.version && (
                  <span className="text-xs text-muted-foreground">
                    v{normalizedData.metadata.version}
                  </span>
                )}
                {normalizedData.metadata.lastUpdated && (
                  <span className="text-xs text-muted-foreground">
                    Updated: {normalizedData.metadata.lastUpdated}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {normalizedData.cards.length} cards · {normalizedData.swimlanes.length} sections
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {githubToken && (
                <ProjectSelector
                  githubToken={githubToken}
                  onDisconnect={handleGitHubDisconnect}
                  onProjectSelect={handleProjectSelect}
                />
              )}
              <Button variant="outline" size="sm" onClick={handleReset}>
                <ArrowsClockwise className="mr-2" size={16} />
                New File
              </Button>
              <Button
                onClick={handleSave}
                size="sm"
                className={hasChanges ? 'bg-accent text-accent-foreground hover:bg-accent/90' : ''}
              >
                {currentRepo ? (
                  <>
                    <Upload className="mr-2" size={16} />
                    {hasChanges ? 'Push to GitHub' : 'Update GitHub'}
                  </>
                ) : (
                  <>
                    <Download className="mr-2" size={16} />
                    {hasChanges ? 'Save Changes' : 'Download'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto p-6">
        <Tabs defaultValue="board" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="board">
              <Eye className="mr-2" size={16} />
              Board
            </TabsTrigger>
            <TabsTrigger value="notes">
              <FileText className="mr-2" size={16} />
              Notes ({normalizedData.notes.length})
            </TabsTrigger>
            <TabsTrigger value="raw">
              <FileText className="mr-2" size={16} />
              Raw Markdown
            </TabsTrigger>
          </TabsList>

          <TabsContent value="board" className="mt-0">
            {normalizedData.cards.length === 0 ? (
              <Alert>
                <Info />
                <AlertTitle>No cards found in this file</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">
                    Your STATUS.md file was parsed, but no Kanban cards were detected.
                  </p>
                  <p className="mb-2">
                    Cards must be markdown list items with status emojis:
                  </p>
                  <ul className="list-disc list-inside space-y-1 font-mono text-xs">
                    <li>🔵 TODO (default)</li>
                    <li>🟡 IN PROGRESS</li>
                    <li>🔴 BLOCKED</li>
                    <li>🟢 DONE</li>
                  </ul>
                  <p className="mt-3">
                    Try the <Button variant="link" className="h-auto p-0 text-sm" onClick={handleReset}>Demo file</Button> to see the expected format.
                  </p>
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {normalizedData.swimlanes.map((swimlane) => {
                  const laneCards = normalizedData.cards.filter(card => card.laneId === swimlane.id)
                  return (
                    <Swimlane
                      key={swimlane.id}
                      swimlane={swimlane}
                      cards={laneCards}
                      onCardDrop={handleCardMove}
                      onCardClick={handleCardClick}
                    />
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="notes" className="mt-0">
            <div className="max-w-4xl">
              <NotesPanel notes={normalizedData.notes} />
            </div>
          </TabsContent>

          <TabsContent value="raw" className="mt-0">
            <Textarea
              value={normalizedData.rawMarkdown}
              readOnly
              className="font-mono text-sm h-[calc(100vh-240px)] resize-none"
            />
          </TabsContent>
        </Tabs>
      </main>

      <CardDetailDrawer
        card={selectedCard}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
          setSelectedCard(null)
        }}
        onSave={handleCardSave}
      />

      <GitHubConnector
        open={showGitHubConnector}
        onConnect={handleGitHubConnect}
        onClose={() => setShowGitHubConnector(false)}
      />
    </div>
  )
}

export default App