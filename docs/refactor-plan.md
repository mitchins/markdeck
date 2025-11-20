# MarkDeck v0.2 Refactoring Plan

**Author:** Tech Lead  
**Date:** 2025-11-20  
**Status:** Approved for execution  
**Estimated Duration:** 3 weeks  

---

## Overview

This document outlines a **phased, incremental refactoring strategy** to transform the MarkDeck prototype into the v0.2 architecture without breaking existing functionality. Each phase is independent, testable, and delivers value.

**Principles:**
- ✅ **Incremental:** Small, safe changes. No "big bang" rewrites.
- ✅ **Testable:** Every phase includes tests before moving forward.
- ✅ **Reversible:** Each commit can be reverted without breaking the app.
- ✅ **Value-driven:** Each phase delivers measurable improvement.
- ✅ **Prototype-preserving:** Keep prototype working until new system is ready.

---

## Phase 1: Core Extraction (Week 1, Days 1-3)

**Goal:** Extract pure domain logic and parsers from App.tsx into `src/core/`.

**Why first:** Core logic is the foundation. Once isolated, we can test it independently.

### Tasks

#### 1.1: Create Core Directory Structure
```bash
mkdir -p src/core/domain
mkdir -p src/core/parsers
mkdir -p src/core/services
mkdir -p src/core/utils
```

**Deliverable:** New folder structure in place.

---

#### 1.2: Extract Domain Types (2 hours)

**Current:** `src/lib/types.ts` mixes domain and UI concerns  
**Target:** Pure domain types in `src/core/domain/types.ts`

**Steps:**
1. Create `src/core/domain/types.ts`
2. Move core types: `Card`, `Swimlane`, `Status`, `Project`, `Note`, `ProjectMetadata`
3. Remove UI-specific fields (e.g., `collapsed` from `Swimlane`)
4. Add strict TypeScript: no `any`, use `readonly` where appropriate
5. Update imports in existing files to point to new location
6. Run build: `npm run build` → should succeed

**Validation:**
```bash
npm run build  # Must succeed
git diff       # Review changes are type-only moves
```

**Commit:** `refactor(core): extract domain types to src/core/domain/types.ts`

---

#### 1.3: Extract Emoji Utilities (1 hour)

**Current:** Constants in `src/lib/types.ts`  
**Target:** Pure utilities in `src/core/utils/emoji-mapper.ts`

**Steps:**
1. Create `src/core/utils/emoji-mapper.ts`
2. Move `EMOJI_TO_STATUS`, `STATUS_COLUMNS`, `BLOCKED_EMOJI`
3. Add functions:
   ```typescript
   export function getEmojiForStatus(status: CardStatus): string
   export function getStatusForEmoji(emoji: string): CardStatus | null
   export function isBlockedEmoji(emoji: string): boolean
   ```
4. Update imports
5. Run build

**Commit:** `refactor(core): extract emoji mapping utilities`

---

#### 1.4: Extract ID Generator (1 hour)

**Current:** `slugify()` function in `parser.ts`  
**Target:** `src/core/utils/id-generator.ts`

**Steps:**
1. Create `src/core/utils/id-generator.ts`
2. Move `slugify()` function
3. Add `generateCardId(laneId: string, title: string, usedIds: Map<string, number>): string`
4. Update parser to use new utility
5. Run build

**Commit:** `refactor(core): extract ID generation to utilities`

---

#### 1.5: Split Parser into Modules (4 hours)

**Current:** Monolithic `parser.ts` with 325 lines  
**Target:** Focused parser modules

**Steps:**

1. **Create `src/core/parsers/metadata-extractor.ts`:**
   ```typescript
   export function extractMetadata(lines: string[]): ProjectMetadata {
     // Move parseMetadata() logic here
   }
   ```

2. **Create `src/core/parsers/swimlane-parser.ts`:**
   ```typescript
   export function parseSwimlanes(lines: string[]): {
     swimlanes: Swimlane[]
     swimlaneMap: Map<number, string> // line number → lane ID
   } {
     // Extract swimlane parsing logic
   }
   ```

3. **Create `src/core/parsers/card-parser.ts`:**
   ```typescript
   export function parseCards(
     lines: string[],
     swimlaneMap: Map<number, string>
   ): Card[] {
     // Extract card parsing logic
   }
   ```

4. **Create `src/core/parsers/notes-parser.ts`:**
   ```typescript
   export function parseNotes(
     lines: string[],
     cardLines: Set<number>
   ): Note[] {
     // Extract note parsing logic
   }
   ```

5. **Refactor `src/core/parsers/markdown-parser.ts`:**
   ```typescript
   import { extractMetadata } from './metadata-extractor'
   import { parseSwimlanes } from './swimlane-parser'
   import { parseCards } from './card-parser'
   import { parseNotes } from './notes-parser'
   
   export function parseStatusMarkdown(markdown: string): ParsedProject {
     const lines = markdown.split('\n')
     
     const metadata = extractMetadata(lines)
     const { swimlanes, swimlaneMap } = parseSwimlanes(lines)
     const cards = parseCards(lines, swimlaneMap)
     const cardLines = new Set(cards.map(c => c.originalLine))
     const notes = parseNotes(lines, cardLines)
     
     return {
       metadata,
       swimlanes,
       cards,
       notes,
       rawMarkdown: markdown,
     }
   }
   ```

6. **Move original `parser.ts` to `markdown-parser.ts`**
7. Update imports in App.tsx
8. Run build

**Validation:**
```bash
npm run build  # Must succeed
# Manually test: upload EXAMPLE-STATUS.md, verify cards display correctly
```

**Commit:** `refactor(core): split monolithic parser into focused modules`

---

#### 1.6: Extract Serializer (3 hours)

**Current:** `projectToMarkdown()` in `parser.ts`  
**Target:** `src/core/parsers/markdown-serializer.ts`

**Steps:**
1. Create `src/core/parsers/markdown-serializer.ts`
2. Move `projectToMarkdown()` function
3. Rename to `serializeProject()` for clarity
4. Add helper functions:
   ```typescript
   function updateCardLine(card: Card, originalLine: string): string
   function updateTimestamp(line: string): string
   ```
5. Update imports in App.tsx
6. Run build

**Commit:** `refactor(core): extract markdown serializer`

---

#### 1.7: Add Parser Tests (4 hours)

**Setup:** Install Vitest
```bash
npm install -D vitest @vitest/ui
```

**Update `package.json`:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

**Create tests:**

1. **`tests/unit/core/parsers/round-trip.test.ts`:**
   ```typescript
   import { describe, it, expect } from 'vitest'
   import { parseStatusMarkdown } from '@/core/parsers/markdown-parser'
   import { serializeProject } from '@/core/parsers/markdown-serializer'
   import { readFileSync } from 'fs'
   
   describe('Round-trip fidelity', () => {
     it('preserves EXAMPLE-STATUS.md exactly (non-card content)', () => {
       const input = readFileSync('./EXAMPLE-STATUS.md', 'utf-8')
       const parsed = parseStatusMarkdown(input)
       const output = serializeProject(parsed.metadata, parsed.cards, parsed.rawMarkdown)
       
       // Extract non-card lines
       const inputLines = input.split('\n')
       const outputLines = output.split('\n')
       
       const cardLineNumbers = new Set(parsed.cards.map(c => c.originalLine))
       
       inputLines.forEach((line, i) => {
         if (!cardLineNumbers.has(i)) {
           expect(outputLines[i]).toBe(line)
         }
       })
     })
     
     it('correctly updates card status emojis', () => {
       const input = '## Test\n- ❗ Todo item\n'
       const parsed = parseStatusMarkdown(input)
       
       // Move card to done
       parsed.cards[0].status = 'done'
       
       const output = serializeProject(parsed.metadata, parsed.cards, parsed.rawMarkdown)
       expect(output).toContain('- ✅ Todo item')
     })
   })
   ```

2. **`tests/unit/core/parsers/metadata-extractor.test.ts`:**
   ```typescript
   describe('Metadata extraction', () => {
     it('extracts title from H1', () => {
       const lines = ['# My Project', '', 'Content']
       const metadata = extractMetadata(lines)
       expect(metadata.title).toBe('My Project')
     })
     
     it('extracts version and lastUpdated', () => {
       const lines = [
         '# Project',
         '**Last Updated:** 2025-01-15',
         '**Version:** Alpha 3'
       ]
       const metadata = extractMetadata(lines)
       expect(metadata.lastUpdated).toBe('2025-01-15')
       expect(metadata.version).toBe('Alpha 3')
     })
   })
   ```

3. **`tests/unit/core/parsers/card-parser.test.ts`:**
   ```typescript
   describe('Card parsing', () => {
     it('parses card with status emoji', () => {
       const lines = ['## Lane', '- ✅ Done item']
       const swimlaneMap = new Map([[0, 'lane']])
       const cards = parseCards(lines, swimlaneMap)
       
       expect(cards).toHaveLength(1)
       expect(cards[0].status).toBe('done')
       expect(cards[0].title).toBe('Done item')
     })
     
     it('parses blocked flag', () => {
       const lines = ['## Lane', '- ⚠️ ❌ Blocked item']
       const swimlaneMap = new Map([[0, 'lane']])
       const cards = parseCards(lines, swimlaneMap)
       
       expect(cards[0].blocked).toBe(true)
     })
     
     it('parses multi-line descriptions', () => {
       const lines = [
         '## Lane',
         '- ❗ Todo',
         '    Description line 1',
         '    Description line 2'
       ]
       const swimlaneMap = new Map([[0, 'lane']])
       const cards = parseCards(lines, swimlaneMap)
       
       expect(cards[0].description).toBe('Description line 1\nDescription line 2')
     })
   })
   ```

**Run tests:**
```bash
npm test
```

**Commit:** `test(core): add comprehensive parser tests with round-trip validation`

---

### Phase 1 Success Criteria
- ✅ Core domain types in `src/core/domain/`
- ✅ Parser split into focused modules in `src/core/parsers/`
- ✅ Utilities in `src/core/utils/`
- ✅ 90%+ test coverage for parsers
- ✅ Round-trip tests pass with 100% fidelity
- ✅ App still builds and runs
- ✅ EXAMPLE-STATUS.md loads and displays correctly

---

## Phase 2: UI Cleanup & Modularization (Week 1, Days 4-5)

**Goal:** Reorganize UI components for better separation of concerns.

### Tasks

#### 2.1: Create UI Directory Structure
```bash
mkdir -p src/ui/components/board
mkdir -p src/ui/components/drawers
mkdir -p src/ui/components/modals
mkdir -p src/ui/components/layout
mkdir -p src/ui/components/file
mkdir -p src/ui/components/notes
mkdir -p src/ui/primitives
```

**Deliverable:** New UI structure.

---

#### 2.2: Move and Rename Components (2 hours)

**Renames for clarity:**
- `KanbanCard.tsx` → `Card.tsx` (in board folder)
- `KanbanColumn.tsx` → `Column.tsx` (in board folder)
- `Swimlane.tsx` → keep name, move to board folder

**Moves:**
```
src/components/Swimlane.tsx → src/ui/components/board/Swimlane.tsx
src/components/KanbanCard.tsx → src/ui/components/board/Card.tsx
src/components/KanbanColumn.tsx → src/ui/components/board/Column.tsx
src/components/CardDetailDrawer.tsx → src/ui/components/drawers/CardDetailDrawer.tsx
src/components/GitHubConnector.tsx → src/ui/components/modals/GitHubConnector.tsx
src/components/ProjectSelector.tsx → src/ui/components/layout/ProjectSelector.tsx
src/components/FileUploader.tsx → src/ui/components/file/FileUploader.tsx
src/components/NotesPanel.tsx → src/ui/components/notes/NotesPanel.tsx
src/components/ui/* → src/ui/primitives/*
```

**Steps:**
1. Move files one by one
2. Update imports in App.tsx
3. Run build after each move
4. Test app still works

**Commit:** `refactor(ui): reorganize components into logical folders`

---

#### 2.3: Create Board Container (1 hour)

**Create `src/ui/components/board/Board.tsx`:**
```typescript
import { Swimlane } from './Swimlane'
import type { Card, Swimlane as SwimlaneType } from '@/core/domain/types'

interface BoardProps {
  swimlanes: SwimlaneType[]
  cards: Card[]
  onCardMove: (cardId: string, newStatus: CardStatus) => void
  onCardClick: (card: Card) => void
}

export function Board({ swimlanes, cards, onCardMove, onCardClick }: BoardProps) {
  return (
    <div className="space-y-4">
      {swimlanes.map((swimlane) => {
        const laneCards = cards.filter(card => card.laneId === swimlane.id)
        return (
          <Swimlane
            key={swimlane.id}
            swimlane={swimlane}
            cards={laneCards}
            onCardDrop={onCardMove}
            onCardClick={onCardClick}
          />
        )
      })}
    </div>
  )
}
```

**Update App.tsx** to use `<Board />` instead of inline swimlane mapping.

**Commit:** `refactor(ui): create Board container component`

---

#### 2.4: Simplify App.tsx (2 hours)

**Goal:** Extract complex logic from App.tsx into smaller components.

**Before:** App.tsx has 435 lines  
**After:** App.tsx should be <200 lines

**Steps:**

1. **Create `src/ui/components/layout/Header.tsx`:**
   ```typescript
   interface HeaderProps {
     title: string
     metadata: ProjectMetadata
     cardCount: number
     swimlaneCount: number
     hasChanges: boolean
     onSave: () => void
     onReset: () => void
     currentRepo: RepoInfo | null
     githubToken: string | null
     onProviderChange: () => void
   }
   
   export function Header({ ... }: HeaderProps) {
     // Move header JSX from App.tsx
   }
   ```

2. **Create `src/ui/components/layout/Tabs.tsx`:**
   ```typescript
   interface TabsLayoutProps {
     boardContent: React.ReactNode
     notesContent: React.ReactNode
     rawContent: React.ReactNode
   }
   
   export function TabsLayout({ ... }: TabsLayoutProps) {
     // Move tabs JSX from App.tsx
   }
   ```

3. **Create `src/ui/components/file/ProjectLoader.tsx`:**
   ```typescript
   interface ProjectLoaderProps {
     onFileLoad: (content: string) => void
     githubToken: string | null
     onGitHubConnect: () => void
   }
   
   export function ProjectLoader({ ... }: ProjectLoaderProps) {
     // Move initial file upload UI from App.tsx
   }
   ```

4. **Refactor App.tsx** to use new components:
   ```typescript
   function App() {
     const [parsedData, setParsedData] = useKV<ParsedStatus | null>('parsed-status', null)
     // ... other state
     
     if (!parsedData) {
       return <ProjectLoader onFileLoad={handleFileLoad} />
     }
     
     return (
       <div>
         <Header 
           title={parsedData.metadata.title}
           onSave={handleSave}
           onReset={handleReset}
           // ...
         />
         <TabsLayout
           boardContent={<Board swimlanes={...} cards={...} />}
           notesContent={<NotesPanel notes={...} />}
           rawContent={<Textarea value={...} />}
         />
         <CardDetailDrawer ... />
       </div>
     )
   }
   ```

**Validation:**
- App.tsx is now <200 lines
- All functionality still works
- No regressions

**Commit:** `refactor(ui): simplify App.tsx by extracting layout components`

---

### Phase 2 Success Criteria
- ✅ UI components organized in logical folders
- ✅ App.tsx simplified to <200 lines
- ✅ Board, Header, TabsLayout, ProjectLoader components created
- ✅ All functionality still works
- ✅ No visual regressions

---

## Phase 3: Provider System (Week 2, Days 1-3)

**Goal:** Abstract data loading/saving into pluggable providers.

### Tasks

#### 3.1: Create Provider Interface (1 hour)

**Create `src/adapters/providers/base-provider.ts`:**
```typescript
export type ProviderType = 'file' | 'github' | 'static'

export interface LoadContext {
  // Context varies by provider
  [key: string]: any
}

export interface SaveContext {
  [key: string]: any
}

export interface ProviderResult<T> {
  success: boolean
  data?: T
  error?: ProviderError
}

export class ProviderError extends Error {
  constructor(
    message: string,
    public code: string,
    public cause?: Error
  ) {
    super(message)
    this.name = 'ProviderError'
  }
}

export interface StatusProvider {
  readonly type: ProviderType
  
  load(context: LoadContext): Promise<ProviderResult<string>>
  save(content: string, context: SaveContext): Promise<ProviderResult<void>>
  
  isConfigured(): boolean
}
```

**Commit:** `feat(adapters): create StatusProvider interface`

---

#### 3.2: Implement FileProvider (2 hours)

**Create `src/adapters/providers/file-provider.ts`:**
```typescript
import type { StatusProvider, ProviderResult, LoadContext, SaveContext } from './base-provider'

export class FileProvider implements StatusProvider {
  readonly type = 'file' as const
  
  async load(context: LoadContext): Promise<ProviderResult<string>> {
    // File content provided by FileUploader component
    if (!context.content) {
      return {
        success: false,
        error: new ProviderError('No file content provided', 'NO_CONTENT')
      }
    }
    
    return { success: true, data: context.content }
  }
  
  async save(content: string, context: SaveContext): Promise<ProviderResult<void>> {
    // Trigger browser download
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = context.filename || 'STATUS.md'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    return { success: true }
  }
  
  isConfigured(): boolean {
    return true // Always configured
  }
}
```

**Commit:** `feat(adapters): implement FileProvider`

---

#### 3.3: Implement GitHubProvider (3 hours)

**Create `src/adapters/api/github-client.ts`:**
```typescript
import { Octokit } from '@octokit/core'

export class GitHubClient {
  private octokit: Octokit
  
  constructor(token: string) {
    this.octokit = new Octokit({ auth: token })
  }
  
  async getFileContent(owner: string, repo: string, path: string): Promise<{
    content: string
    sha: string
  }> {
    const response = await this.octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner,
      repo,
      path,
    })
    
    return {
      content: atob(response.data.content),
      sha: response.data.sha,
    }
  }
  
  async updateFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    sha: string,
    message: string
  ): Promise<void> {
    await this.octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner,
      repo,
      path,
      message,
      content: btoa(content),
      sha,
    })
  }
  
  async listRepos(): Promise<Array<{ name: string; full_name: string; owner: string }>> {
    const response = await this.octokit.request('GET /user/repos', {
      per_page: 100,
      sort: 'updated',
    })
    
    return response.data.map(repo => ({
      name: repo.name,
      full_name: repo.full_name,
      owner: repo.owner.login,
    }))
  }
}
```

**Create `src/adapters/providers/github-provider.ts`:**
```typescript
import { GitHubClient } from '../api/github-client'
import type { StatusProvider, ProviderResult, LoadContext, SaveContext } from './base-provider'

export interface GitHubConfig {
  token: string
  owner: string
  repo: string
  branch?: string
}

export class GitHubProvider implements StatusProvider {
  readonly type = 'github' as const
  private client: GitHubClient
  private config: GitHubConfig
  private fileSha: string | null = null
  
  constructor(config: GitHubConfig) {
    this.config = config
    this.client = new GitHubClient(config.token)
  }
  
  async load(context: LoadContext): Promise<ProviderResult<string>> {
    try {
      const { content, sha } = await this.client.getFileContent(
        this.config.owner,
        this.config.repo,
        'STATUS.md'
      )
      
      this.fileSha = sha
      return { success: true, data: content }
    } catch (error) {
      return {
        success: false,
        error: new ProviderError(
          'Failed to load from GitHub',
          'GITHUB_LOAD_ERROR',
          error
        )
      }
    }
  }
  
  async save(content: string, context: SaveContext): Promise<ProviderResult<void>> {
    if (!this.fileSha) {
      return {
        success: false,
        error: new ProviderError('No file SHA available', 'NO_FILE_SHA')
      }
    }
    
    try {
      await this.client.updateFile(
        this.config.owner,
        this.config.repo,
        'STATUS.md',
        content,
        this.fileSha,
        context.message || 'Update STATUS.md via MarkDeck'
      )
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: new ProviderError(
          'Failed to save to GitHub',
          'GITHUB_SAVE_ERROR',
          error
        )
      }
    }
  }
  
  isConfigured(): boolean {
    return !!(this.config.token && this.config.owner && this.config.repo)
  }
}
```

**Commit:** `feat(adapters): implement GitHubProvider with error handling`

---

#### 3.4: Implement StaticProvider (1 hour)

**Move demo data to provider:**

**Create `src/adapters/providers/static-provider.ts`:**
```typescript
import type { StatusProvider, ProviderResult } from './base-provider'
import { DEMO_DATA } from './demo-data'

export class StaticProvider implements StatusProvider {
  readonly type = 'static' as const
  
  async load(): Promise<ProviderResult<string>> {
    return { success: true, data: DEMO_DATA }
  }
  
  async save(): Promise<ProviderResult<void>> {
    // Static provider doesn't save
    return {
      success: false,
      error: new ProviderError('Cannot save to static provider', 'READ_ONLY')
    }
  }
  
  isConfigured(): boolean {
    return true
  }
}
```

**Move `src/lib/demo-data.ts` → `src/adapters/providers/demo-data.ts`**

**Commit:** `feat(adapters): implement StaticProvider for demo data`

---

#### 3.5: Create Provider Registry (1 hour)

**Create `src/config/provider-config.ts`:**
```typescript
import type { StatusProvider } from '@/adapters/providers/base-provider'
import { FileProvider } from '@/adapters/providers/file-provider'
import { GitHubProvider } from '@/adapters/providers/github-provider'
import { StaticProvider } from '@/adapters/providers/static-provider'

export type ProviderType = 'file' | 'github' | 'static'

export interface ProviderConfig {
  github?: {
    token: string
    owner: string
    repo: string
  }
}

export function createProvider(
  type: ProviderType,
  config?: ProviderConfig
): StatusProvider {
  switch (type) {
    case 'file':
      return new FileProvider()
    case 'github':
      if (!config?.github) {
        throw new Error('GitHub config required')
      }
      return new GitHubProvider(config.github)
    case 'static':
      return new StaticProvider()
    default:
      throw new Error(`Unknown provider type: ${type}`)
  }
}
```

**Commit:** `feat(config): create provider registry and factory`

---

#### 3.6: Update App.tsx to Use Providers (2 hours)

**Refactor App.tsx:**
```typescript
function App() {
  const [providerType, setProviderType] = useKV<ProviderType>('provider-type', 'file')
  const [githubConfig, setGithubConfig] = useKV<GitHubConfig | null>('github-config', null)
  const [parsedData, setParsedData] = useKV<ParsedStatus | null>('parsed-status', null)
  
  const provider = useMemo(() => {
    return createProvider(providerType, { github: githubConfig })
  }, [providerType, githubConfig])
  
  const handleFileLoad = async (content: string) => {
    const result = await provider.load({ content })
    if (result.success) {
      const parsed = parseStatusMarkdown(result.data)
      setParsedData(parsed)
    } else {
      toast.error('Failed to load file', {
        description: result.error.message
      })
    }
  }
  
  const handleSave = async () => {
    if (!parsedData) return
    
    const content = serializeProject(
      parsedData.metadata,
      parsedData.cards,
      parsedData.rawMarkdown
    )
    
    const result = await provider.save(content, { message: 'Update STATUS.md' })
    if (result.success) {
      toast.success('Saved successfully')
    } else {
      toast.error('Failed to save', {
        description: result.error.message
      })
    }
  }
  
  // ... rest of component
}
```

**Commit:** `refactor(app): use provider system for load/save operations`

---

### Phase 3 Success Criteria
- ✅ `StatusProvider` interface defined
- ✅ FileProvider, GitHubProvider, StaticProvider implemented
- ✅ Provider registry with factory function
- ✅ App.tsx uses providers for all I/O
- ✅ GitHub integration still works
- ✅ File upload/download still works

---

## Phase 4: State Management & Hooks (Week 2, Days 4-5)

**Goal:** Centralize state management with Zustand, create custom hooks.

### Tasks

#### 4.1: Install Zustand (5 minutes)
```bash
npm install zustand
```

---

#### 4.2: Create App Store (3 hours)

**Create `src/application/state/app-store.ts`:**
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Project, Card, CardStatus } from '@/core/domain/types'
import type { ProviderType } from '@/config/provider-config'

interface ProviderState {
  type: ProviderType
  config: any | null
  status: 'idle' | 'loading' | 'saving' | 'error'
}

interface UIState {
  selectedCardId: string | null
  drawerOpen: boolean
  collapsedLanes: Set<string>
  activeTab: 'board' | 'notes' | 'raw'
}

interface SyncState {
  hasChanges: boolean
  lastSaved: Date | null
}

interface AppState {
  // Domain state
  project: Project | null
  
  // Provider state
  provider: ProviderState
  
  // UI state
  ui: UIState
  
  // Sync state
  sync: SyncState
  
  // Actions
  setProject: (project: Project | null) => void
  moveCard: (cardId: string, newStatus: CardStatus) => void
  updateCard: (cardId: string, updates: Partial<Card>) => void
  toggleBlocked: (cardId: string) => void
  setProviderType: (type: ProviderType, config?: any) => void
  setProviderStatus: (status: ProviderState['status']) => void
  setSelectedCard: (cardId: string | null) => void
  setDrawerOpen: (open: boolean) => void
  toggleLaneCollapse: (laneId: string) => void
  setActiveTab: (tab: UIState['activeTab']) => void
  markSaved: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      project: null,
      provider: { type: 'file', config: null, status: 'idle' },
      ui: {
        selectedCardId: null,
        drawerOpen: false,
        collapsedLanes: new Set(),
        activeTab: 'board',
      },
      sync: { hasChanges: false, lastSaved: null },
      
      setProject: (project) => set({ project, sync: { hasChanges: false, lastSaved: null } }),
      
      moveCard: (cardId, newStatus) => {
        const { project } = get()
        if (!project) return
        
        const updatedCards = project.cards.map(card =>
          card.id === cardId ? { ...card, status: newStatus } : card
        )
        
        set({
          project: { ...project, cards: updatedCards },
          sync: { ...get().sync, hasChanges: true },
        })
      },
      
      updateCard: (cardId, updates) => {
        const { project } = get()
        if (!project) return
        
        const updatedCards = project.cards.map(card =>
          card.id === cardId ? { ...card, ...updates } : card
        )
        
        set({
          project: { ...project, cards: updatedCards },
          sync: { ...get().sync, hasChanges: true },
        })
      },
      
      toggleBlocked: (cardId) => {
        const { project } = get()
        if (!project) return
        
        const updatedCards = project.cards.map(card =>
          card.id === cardId ? { ...card, blocked: !card.blocked } : card
        )
        
        set({
          project: { ...project, cards: updatedCards },
          sync: { ...get().sync, hasChanges: true },
        })
      },
      
      setProviderType: (type, config) =>
        set({ provider: { type, config, status: 'idle' } }),
      
      setProviderStatus: (status) =>
        set({ provider: { ...get().provider, status } }),
      
      setSelectedCard: (cardId) =>
        set({ ui: { ...get().ui, selectedCardId: cardId } }),
      
      setDrawerOpen: (open) =>
        set({ ui: { ...get().ui, drawerOpen: open } }),
      
      toggleLaneCollapse: (laneId) => {
        const { ui } = get()
        const newCollapsed = new Set(ui.collapsedLanes)
        if (newCollapsed.has(laneId)) {
          newCollapsed.delete(laneId)
        } else {
          newCollapsed.add(laneId)
        }
        set({ ui: { ...ui, collapsedLanes: newCollapsed } })
      },
      
      setActiveTab: (tab) =>
        set({ ui: { ...get().ui, activeTab: tab } }),
      
      markSaved: () =>
        set({ sync: { hasChanges: false, lastSaved: new Date() } }),
    }),
    {
      name: 'markdeck-storage',
      partialize: (state) => ({
        provider: state.provider,
        ui: {
          ...state.ui,
          selectedCardId: null,
          drawerOpen: false,
        },
      }),
    }
  )
)
```

**Commit:** `feat(state): create Zustand app store with persistence`

---

#### 4.3: Create Custom Hooks (2 hours)

**Create `src/application/hooks/use-project.ts`:**
```typescript
import { useAppStore } from '../state/app-store'

export function useProject() {
  const project = useAppStore(state => state.project)
  const setProject = useAppStore(state => state.setProject)
  const hasChanges = useAppStore(state => state.sync.hasChanges)
  const lastSaved = useAppStore(state => state.sync.lastSaved)
  
  return {
    project,
    setProject,
    hasChanges,
    lastSaved,
  }
}
```

**Create `src/application/hooks/use-cards.ts`:**
```typescript
import { useAppStore } from '../state/app-store'

export function useCards() {
  const cards = useAppStore(state => state.project?.cards ?? [])
  const moveCard = useAppStore(state => state.moveCard)
  const updateCard = useAppStore(state => state.updateCard)
  const toggleBlocked = useAppStore(state => state.toggleBlocked)
  
  return {
    cards,
    moveCard,
    updateCard,
    toggleBlocked,
  }
}
```

**Create `src/application/hooks/use-provider.ts`:**
```typescript
import { useMemo } from 'react'
import { useAppStore } from '../state/app-store'
import { createProvider } from '@/config/provider-config'

export function useProvider() {
  const providerType = useAppStore(state => state.provider.type)
  const providerConfig = useAppStore(state => state.provider.config)
  const providerStatus = useAppStore(state => state.provider.status)
  const setProviderType = useAppStore(state => state.setProviderType)
  const setProviderStatus = useAppStore(state => state.setProviderStatus)
  
  const provider = useMemo(
    () => createProvider(providerType, providerConfig),
    [providerType, providerConfig]
  )
  
  return {
    provider,
    type: providerType,
    config: providerConfig,
    status: providerStatus,
    setType: setProviderType,
    setStatus: setProviderStatus,
  }
}
```

**Create `src/application/hooks/use-ui.ts`:**
```typescript
import { useAppStore } from '../state/app-store'

export function useUI() {
  const selectedCardId = useAppStore(state => state.ui.selectedCardId)
  const drawerOpen = useAppStore(state => state.ui.drawerOpen)
  const activeTab = useAppStore(state => state.ui.activeTab)
  const collapsedLanes = useAppStore(state => state.ui.collapsedLanes)
  
  const setSelectedCard = useAppStore(state => state.setSelectedCard)
  const setDrawerOpen = useAppStore(state => state.setDrawerOpen)
  const setActiveTab = useAppStore(state => state.setActiveTab)
  const toggleLaneCollapse = useAppStore(state => state.toggleLaneCollapse)
  
  return {
    selectedCardId,
    drawerOpen,
    activeTab,
    collapsedLanes,
    setSelectedCard,
    setDrawerOpen,
    setActiveTab,
    toggleLaneCollapse,
  }
}
```

**Commit:** `feat(hooks): create custom hooks for state access`

---

#### 4.4: Refactor App.tsx to Use Hooks (2 hours)

**Update App.tsx:**
```typescript
import { useProject } from '@/application/hooks/use-project'
import { useCards } from '@/application/hooks/use-cards'
import { useProvider } from '@/application/hooks/use-provider'
import { useUI } from '@/application/hooks/use-ui'

function App() {
  const { project, setProject, hasChanges } = useProject()
  const { cards, moveCard, updateCard } = useCards()
  const { provider, status, setStatus } = useProvider()
  const { selectedCardId, drawerOpen, setSelectedCard, setDrawerOpen } = useUI()
  
  const handleFileLoad = async (content: string) => {
    setStatus('loading')
    const result = await provider.load({ content })
    
    if (result.success) {
      const parsed = parseStatusMarkdown(result.data)
      setProject(parsed)
      toast.success(`Loaded ${parsed.cards.length} cards`)
    } else {
      toast.error('Failed to load', { description: result.error.message })
    }
    
    setStatus('idle')
  }
  
  // ... rest of component simplified
}
```

**Validation:**
- All state now in Zustand store
- No more useState/useKV in App.tsx
- App.tsx is now <150 lines

**Commit:** `refactor(app): migrate to Zustand hooks, simplify App.tsx`

---

### Phase 4 Success Criteria
- ✅ Zustand store created with persistence
- ✅ Custom hooks for project, cards, provider, UI
- ✅ App.tsx uses hooks exclusively
- ✅ No useState/useKV in App.tsx
- ✅ App.tsx <150 lines
- ✅ All functionality still works

---

## Phase 5: Testing Infrastructure (Week 3, Days 1-3)

**Goal:** Add comprehensive test coverage.

### Tasks

#### 5.1: Set Up Testing Tools (1 hour)

**Install dependencies:**
```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event happy-dom
```

**Create `vitest.config.ts`:**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**Create `tests/setup.ts`:**
```typescript
import '@testing-library/jest-dom'
```

**Commit:** `test: set up Vitest and Testing Library`

---

#### 5.2: Write Core Unit Tests (4 hours)

Already covered parser tests in Phase 1. Add more:

**Create `tests/unit/core/services/card-service.test.ts`:**
```typescript
import { describe, it, expect } from 'vitest'
import { CardService } from '@/core/services/card-service'

describe('CardService', () => {
  it('moves card to new status', () => {
    const card = { id: '1', status: 'todo', ... }
    const updated = CardService.moveCard(card, 'done')
    expect(updated.status).toBe('done')
  })
  
  it('toggles blocked flag', () => {
    const card = { id: '1', blocked: false, ... }
    const updated = CardService.toggleBlocked(card)
    expect(updated.blocked).toBe(true)
  })
})
```

**Create `tests/unit/adapters/providers/file-provider.test.ts`:**
```typescript
describe('FileProvider', () => {
  it('loads content from context', async () => {
    const provider = new FileProvider()
    const result = await provider.load({ content: '# Test' })
    
    expect(result.success).toBe(true)
    expect(result.data).toBe('# Test')
  })
})
```

**Commit:** `test: add unit tests for services and providers`

---

#### 5.3: Write Component Tests (3 hours)

**Create `tests/integration/board-interactions.test.tsx`:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Board } from '@/ui/components/board/Board'

describe('Board interactions', () => {
  it('displays swimlanes with cards', () => {
    const swimlanes = [{ id: 'lane1', title: 'Lane 1', order: 0 }]
    const cards = [{ id: 'card1', title: 'Card 1', laneId: 'lane1', status: 'todo', ... }]
    
    render(<Board swimlanes={swimlanes} cards={cards} onCardMove={jest.fn()} onCardClick={jest.fn()} />)
    
    expect(screen.getByText('Lane 1')).toBeInTheDocument()
    expect(screen.getByText('Card 1')).toBeInTheDocument()
  })
  
  it('calls onCardClick when card is clicked', () => {
    const onCardClick = jest.fn()
    // ... render and test
  })
})
```

**Commit:** `test: add component integration tests`

---

#### 5.4: Add E2E Tests (Optional, if Playwright configured) (2 hours)

**Create `tests/e2e/local-mode.spec.ts`:**
```typescript
import { test, expect } from '@playwright/test'

test('loads STATUS.md from file upload', async ({ page }) => {
  await page.goto('http://localhost:5173')
  
  // Upload file
  const fileInput = await page.locator('input[type="file"]')
  await fileInput.setInputFiles('./EXAMPLE-STATUS.md')
  
  // Verify board displays
  await expect(page.locator('h1')).toContainText('Example Project')
  await expect(page.locator('.swimlane')).toHaveCount(3)
})
```

**Commit:** `test: add E2E tests for file upload workflow`

---

### Phase 5 Success Criteria
- ✅ Vitest configured
- ✅ 90%+ coverage for core modules
- ✅ Component tests for Board, Card, Swimlane
- ✅ E2E tests for file upload (optional)
- ✅ All tests pass: `npm test`

---

## Phase 6: Config & Extensibility (Week 3, Days 4-5)

**Goal:** Add configuration system and extensibility hooks.

### Tasks

#### 6.1: Create Constants Config (1 hour)

**Create `src/config/constants.ts`:**
```typescript
export const APP_NAME = 'MarkDeck'
export const APP_VERSION = '0.2.0'
export const STATUS_FILE_NAME = 'STATUS.md'

export const MAX_CARDS_PER_LANE = 100
export const MAX_DESCRIPTION_LENGTH = 5000

export const STORAGE_KEYS = {
  PROVIDER_TYPE: 'markdeck-provider-type',
  GITHUB_TOKEN: 'markdeck-github-token',
  LAST_PROJECT: 'markdeck-last-project',
} as const
```

**Commit:** `feat(config): add constants configuration`

---

#### 6.2: Add Feature Flags (Optional) (1 hour)

**Create `src/config/feature-flags.ts`:**
```typescript
export const FEATURE_FLAGS = {
  ENABLE_D1_PROVIDER: false,
  ENABLE_R2_PROVIDER: false,
  ENABLE_OFFLINE_MODE: false,
  ENABLE_UNDO_REDO: false,
  ENABLE_REAL_TIME_SYNC: false,
} as const

export function isFeatureEnabled(feature: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[feature]
}
```

**Commit:** `feat(config): add feature flags system`

---

#### 6.3: Document Extension Points (1 hour)

**Create `docs/api/providers.md`:**
```markdown
# Adding a New Provider

To add a new status source provider:

1. Implement `StatusProvider` interface:
   \`\`\`typescript
   export class MyProvider implements StatusProvider {
     readonly type = 'my-provider'
     
     async load(context: LoadContext): Promise<ProviderResult<string>> {
       // Your load logic
     }
     
     async save(content: string, context: SaveContext): Promise<ProviderResult<void>> {
       // Your save logic
     }
     
     isConfigured(): boolean {
       // Check if provider is ready
     }
   }
   \`\`\`

2. Register in `src/config/provider-config.ts`:
   \`\`\`typescript
   export function createProvider(type, config) {
     switch (type) {
       case 'my-provider':
         return new MyProvider(config)
       // ...
     }
   }
   \`\`\`

3. Add tests in `tests/unit/adapters/providers/my-provider.test.ts`
```

**Commit:** `docs: add guide for creating custom providers`

---

### Phase 6 Success Criteria
- ✅ Constants config file created
- ✅ Feature flags system (optional)
- ✅ Extension documentation added
- ✅ All configs centralized

---

## Rollout Plan

### Week 1 (Days 1-5)
- **Days 1-3:** Phase 1 (Core Extraction)
- **Days 4-5:** Phase 2 (UI Cleanup)

### Week 2 (Days 1-5)
- **Days 1-3:** Phase 3 (Provider System)
- **Days 4-5:** Phase 4 (State Management)

### Week 3 (Days 1-5)
- **Days 1-3:** Phase 5 (Testing Infrastructure)
- **Days 4-5:** Phase 6 (Config & Extensibility)

---

## Validation Checklist

After each phase:
- [ ] `npm run build` succeeds
- [ ] `npm test` passes (if tests exist)
- [ ] Manual testing: upload EXAMPLE-STATUS.md, verify cards display
- [ ] Manual testing: edit card, verify changes persist
- [ ] Manual testing: move card, verify status updates
- [ ] Manual testing: save changes, verify download/GitHub push works
- [ ] No console errors in browser
- [ ] No TypeScript errors
- [ ] Git history is clean (meaningful commits)

---

## Risk Mitigation

### Risk: Breaking existing functionality
**Mitigation:** Incremental changes, test after each phase, keep prototype running in parallel

### Risk: Provider abstraction too complex
**Mitigation:** Start simple (file, GitHub, static), add complexity only when needed

### Risk: State management overkill
**Mitigation:** Use Zustand (simple API), avoid over-engineering

### Risk: Test coverage takes too long
**Mitigation:** Prioritize core modules first, add UI tests incrementally

### Risk: Merge conflicts during multi-week refactor
**Mitigation:** Work in feature branch, merge small PRs frequently

---

## Success Metrics

### Code Quality
- ✅ 0 TypeScript `any` types in core
- ✅ 90%+ test coverage for core modules
- ✅ <200 lines in App.tsx
- ✅ All parsers in separate files <200 lines each

### Architecture
- ✅ Core domain has zero UI dependencies
- ✅ All providers implement same interface
- ✅ State management centralized in Zustand

### Performance
- ✅ <100ms parse time for 1000-card file
- ✅ <3s full app load time
- ✅ Smooth drag-and-drop (60fps)

### Developer Experience
- ✅ Tests run in <5 seconds
- ✅ Build time <10 seconds
- ✅ New developer can understand architecture in <30 minutes

---

## Next Steps After v0.2

1. **QE Agent:** Define test harness, snapshot tests, failure state definitions
2. **UX Agent:** Refine board ergonomics, accessibility, responsive design
3. **Cloudflare Integration:** D1 provider, R2 provider, Workers deployment
4. **Advanced Features:** Undo/redo, offline mode, conflict resolution UI

---

## Conclusion

This refactoring plan provides a **safe, incremental path** from prototype to production-ready architecture. By following these phases, we maintain a working app at all times while systematically improving code quality, testability, and extensibility.

Each phase delivers tangible value and can be validated independently, reducing risk and enabling parallel work once the foundation is solid.
