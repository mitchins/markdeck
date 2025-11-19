import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { KanbanCard, CardStatus } from '@/lib/types'
import { CheckCircle, WarningCircle, XCircle, FloppyDisk } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface CardDetailDrawerProps {
  card: KanbanCard | null
  open: boolean
  onClose: () => void
  onSave: (updatedCard: KanbanCard) => void
}

const statusOptions: { value: CardStatus; label: string; icon: typeof CheckCircle; color: string }[] = [
  { value: 'Done', label: 'Done', icon: CheckCircle, color: 'text-success' },
  { value: 'InProgress', label: 'In Progress', icon: WarningCircle, color: 'text-warning' },
  { value: 'Blocked', label: 'Blocked', icon: XCircle, color: 'text-destructive' },
]

export function CardDetailDrawer({ card, open, onClose, onSave }: CardDetailDrawerProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<CardStatus>('InProgress')

  useEffect(() => {
    if (card) {
      setTitle(card.title)
      setDescription(card.description || '')
      setStatus(card.status)
    }
  }, [card])

  const handleSave = () => {
    if (!card) return
    
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }

    const updatedCard: KanbanCard = {
      ...card,
      title: title.trim(),
      description: description.trim() || undefined,
      status,
    }

    onSave(updatedCard)
    toast.success('Card updated')
    onClose()
  }

  if (!card) return null

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Card</SheetTitle>
          <SheetDescription>
            Make changes to the task card. Changes will be reflected in the STATUS.md file.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter card title..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as CardStatus)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className={option.color} size={16} weight="fill" />
                        {option.label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description (supports markdown formatting)..."
              className="min-h-[200px] font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Multi-line descriptions will be formatted as indented content in STATUS.md
            </p>
          </div>

          {card.links.length > 0 && (
            <div className="space-y-2">
              <Label>Links</Label>
              <div className="space-y-1">
                {card.links.map((link, i) => (
                  <a
                    key={i}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-accent hover:underline block truncate"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              <FloppyDisk className="mr-2" size={16} />
              Save Changes
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
