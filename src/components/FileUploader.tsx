import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Upload, FileText } from '@phosphor-icons/react'

interface FileUploaderProps {
  onFileLoad: (content: string) => void
}

export function FileUploader({ onFileLoad }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [pasteContent, setPasteContent] = useState('')

  const handleFileSelect = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      onFileLoad(content)
    }
    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.md')) {
      handleFileSelect(file)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handlePaste = () => {
    if (pasteContent.trim()) {
      onFileLoad(pasteContent)
      setPasteContent('')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card
        className={`p-12 border-2 border-dashed transition-all ${
          isDragging
            ? 'border-accent bg-accent/5 scale-105'
            : 'border-border hover:border-accent/50'
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <FileText size={48} className="text-muted-foreground" weight="duotone" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Upload STATUS.md</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drop your file here or click to browse
            </p>
          </div>

          <div>
            <input
              type="file"
              accept=".md"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button asChild>
                <span>
                  <Upload className="mr-2" size={16} />
                  Choose File
                </span>
              </Button>
            </label>
          </div>
        </div>
      </Card>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or paste content</span>
        </div>
      </div>

      <Card className="p-4">
        <Textarea
          placeholder="Paste your STATUS.md content here..."
          value={pasteContent}
          onChange={(e) => setPasteContent(e.target.value)}
          className="min-h-[200px] font-mono text-sm"
        />
        <div className="mt-4">
          <Button onClick={handlePaste} disabled={!pasteContent.trim()} className="w-full">
            Load from Paste
          </Button>
        </div>
      </Card>
    </div>
  )
}
