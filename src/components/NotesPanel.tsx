import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import type { Note } from '@/lib/types'
import { Article } from '@phosphor-icons/react'

interface NotesPanelProps {
  notes: Note[]
}

export function NotesPanel({ notes }: NotesPanelProps) {
  if (notes.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Article size={32} className="mx-auto mb-3 text-muted-foreground" weight="duotone" />
        <p className="text-sm text-muted-foreground">No notes found</p>
      </Card>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4">
        {notes.map((note, index) => (
          <div key={index}>
            <Card className="p-4">
              <div className="flex items-start gap-2 mb-3">
                <Article size={20} className="text-primary mt-0.5" weight="duotone" />
                <h3 className="font-semibold text-sm">{note.title}</h3>
              </div>
              
              {note.section && (
                <p className="text-xs text-muted-foreground mb-2">{note.section}</p>
              )}
              
              <Separator className="my-3" />
              
              <div className="text-sm text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
                {note.content}
              </div>
            </Card>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
