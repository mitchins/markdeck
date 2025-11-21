import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ArrowUp, FileText, Star, Folder } from 'lucide-react'
import { DEMO_STATUS_MD, MARKDECK_STATUS_MD } from '@/lib/demo-data'
import { toast } from 'sonner'

interface FileUploaderProps {
  onFileLoad: (content: string) => void
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export function FileUploader({ onFileLoad }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [pasteContent, setPasteContent] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [githubUrl, setGithubUrl] = useState('')

  const handleFileSelect = (file: File) => {
    // Check file type - both extension and MIME type for security
    if (!file.name.endsWith('.md') || (file.type && !file.type.includes('text') && file.type !== '')) {
      toast.error('Invalid file type', {
        description: 'Please upload a Markdown (.md) file',
      })
      return
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large', {
        description: `Maximum file size is ${MAX_FILE_SIZE / 1024 / 1024}MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`,
      })
      return
    }

    setIsUploading(true)
    toast.info(`Uploading ${file.name}...`, {
      description: `Size: ${(file.size / 1024).toFixed(2)} KB`,
    })

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setIsUploading(false)
      onFileLoad(content)
    }
    reader.onerror = () => {
      setIsUploading(false)
      toast.error('Failed to read file', {
        description: 'Please try again',
      })
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

  const handleLoadFromGitHub = async (repoUrl: string) => {
    // Parse GitHub repo URL (supports various formats)
    const regex = /github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/|$)/
    const match = regex.exec(repoUrl)
    if (!match) {
      toast.error('Invalid GitHub URL', {
        description: 'Please enter a valid GitHub repository URL',
      })
      return
    }

    const [, owner, repo] = match
    
    try {
      toast.info(`Loading STATUS.md from ${owner}/${repo}...`)
      
      // Try to fetch without authentication (public repo)
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/STATUS.md`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      )

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('STATUS.md not found in this repository')
        } else if (response.status === 403) {
          throw new Error('Repository is private - please use GitHub Connect with a token')
        }
        throw new Error(`Failed to load file: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Safely decode base64 content
      let content: string
      try {
        content = atob(data.content)
      } catch (decodeError) {
        console.error('Failed to decode base64 content:', decodeError)
        throw new Error('Failed to decode file content - file may be corrupted')
      }
      
      onFileLoad(content)
      toast.success(`Loaded STATUS.md from ${owner}/${repo}`)
    } catch (error) {
      toast.error('Failed to load from GitHub', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  const handleLoadDemo = () => {
    onFileLoad(DEMO_STATUS_MD)
  }

  const handleLoadMarkDeck = () => {
    onFileLoad(MARKDECK_STATUS_MD)
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
            <FileText size={48} className="text-muted-foreground" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Upload STATUS.md</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drop your file here or click to browse
            </p>
          </div>

          <div className="flex gap-3 justify-center flex-wrap">
            <input
              type="file"
              accept=".md"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
              disabled={isUploading}
            />
            <label htmlFor="file-upload">
              <Button asChild disabled={isUploading}>
                <span>
                  <ArrowUp className="mr-2" size={16} />
                  {isUploading ? 'Uploading...' : 'Choose File'}
                </span>
              </Button>
            </label>
            
            <Button variant="outline" onClick={handleLoadDemo}>
              <Star className="mr-2" size={16} />
              Try Demo
            </Button>

            <Button variant="outline" onClick={handleLoadMarkDeck}>
              <Folder className="mr-2" size={16} />
              MarkDeck Status
            </Button>
          </div>
        </div>
      </Card>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or load from public GitHub repo</span>
        </div>
      </div>

      <Card className="p-4">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Load STATUS.md from any public GitHub repository (no token required)
          </p>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="https://github.com/owner/repo"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && githubUrl.trim()) {
                  handleLoadFromGitHub(githubUrl)
                }
              }}
            />
            <Button 
              onClick={() => handleLoadFromGitHub(githubUrl)}
              variant="outline"
              disabled={!githubUrl.trim()}
            >
              Load
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            For private repos, use the "Connect GitHub" button above
          </p>
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
