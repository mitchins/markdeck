import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Swimlane } from '@/components/Swimlane'
import { FileUploader } from '@/components/FileUploader'
import { NotesPanel } from '@/components/NotesPanel'
import { CardDetailDrawer } from '@/components/CardDetailDrawer'
import { parseStatusMarkdown, projectToMarkdown } from '@/lib/parser'
import type { ParsedStatus, KanbanCard, CardStatus } from '@/lib/types'
import { Download, Eye, FileText, ArrowsClockwise, Kanban } from '@phosphor-icons/react'
import { toast } from 'sonner'

function App() {
  const [parsedData, setParsedData] = useKV<ParsedStatus | null>('parsed-status', null)
  const [hasChanges, setHasChanges] = useState(false)
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleFileLoad = (content: string) => {
    try {
      const parsed = parseStatusMarkdown(content)
      setParsedData(parsed)
      setHasChanges(false)
      toast.success(`Loaded ${parsed.cards.length} cards across ${parsed.swimlanes.length} sections`)
    } catch (error) {
      toast.error('Failed to parse STATUS.md')
      console.error(error)
    }
  }

  const handleCardMove = (cardId: string, newStatus: CardStatus) => {
    if (!parsedData) return

    setParsedData((current) => {
      if (!current) return null
      
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
    if (!parsedData) return

    setParsedData((current) => {
      if (!current) return null
      
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

  const handleSave = () => {
    if (!parsedData) return

    const updated = projectToMarkdown(
      parsedData.metadata,
      parsedData.cards,
      parsedData.rawMarkdown
    )

    const blob = new Blob([updated], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'STATUS.md'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setParsedData((current) => ({
      ...current!,
      rawMarkdown: updated,
    }))

    setHasChanges(false)
    toast.success('STATUS.md downloaded')
  }

  const handleReset = () => {
    setParsedData(null)
    setHasChanges(false)
    toast.info('Reset to file upload')
  }

  if (!parsedData) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Kanban size={32} className="text-primary" weight="duotone" />
              <h1 className="text-2xl font-bold tracking-tight">Kanban in a Can</h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Visual project tracking from STATUS.md files
            </p>
          </header>

          <FileUploader onFileLoad={handleFileLoad} />
        </div>
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
                <h1 className="text-xl font-bold tracking-tight">{parsedData.metadata.title}</h1>
              </div>
              <div className="flex items-center gap-4 mt-1">
                {parsedData.metadata.version && (
                  <span className="text-xs text-muted-foreground">
                    v{parsedData.metadata.version}
                  </span>
                )}
                {parsedData.metadata.lastUpdated && (
                  <span className="text-xs text-muted-foreground">
                    Updated: {parsedData.metadata.lastUpdated}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {parsedData.cards.length} cards · {parsedData.swimlanes.length} sections
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <ArrowsClockwise className="mr-2" size={16} />
                New File
              </Button>
              <Button
                onClick={handleSave}
                size="sm"
                className={hasChanges ? 'bg-accent text-accent-foreground hover:bg-accent/90' : ''}
              >
                <Download className="mr-2" size={16} />
                {hasChanges ? 'Save Changes' : 'Download'}
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
              Notes ({parsedData.notes.length})
            </TabsTrigger>
            <TabsTrigger value="raw">
              <FileText className="mr-2" size={16} />
              Raw Markdown
            </TabsTrigger>
          </TabsList>

          <TabsContent value="board" className="mt-0">
            <div className="space-y-4">
              {parsedData.swimlanes.map((swimlane) => {
                const laneCards = parsedData.cards.filter(card => card.laneId === swimlane.id)
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
          </TabsContent>

          <TabsContent value="notes" className="mt-0">
            <div className="max-w-4xl">
              <NotesPanel notes={parsedData.notes} />
            </div>
          </TabsContent>

          <TabsContent value="raw" className="mt-0">
            <Textarea
              value={parsedData.rawMarkdown}
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
    </div>
  )
}

export default App