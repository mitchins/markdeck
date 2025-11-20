# MarkDeck v0.2 Architecture Proposal

**Author:** Tech Lead  
**Date:** 2025-11-20  
**Status:** Proposed  
**Version:** 0.2.0

---

## Executive Summary

This document outlines the architectural transformation of MarkDeck from a working prototype to a production-ready, maintainable application. The v0.2 architecture emphasizes clean separation of concerns, testability, extensibility, and future-proofing while maintaining the lightweight developer-tool aesthetic.

**Key Architectural Principles:**
1. **Pure Core Logic** - Domain logic separated from framework and UI
2. **Provider Abstraction** - Pluggable data sources (file, GitHub, future: Cloudflare D1/R2)
3. **Unidirectional Data Flow** - Predictable state management
4. **Round-Trip Fidelity** - Lossless markdown parsing and serialization
5. **Test-First Design** - All core modules have comprehensive test coverage

---

## Current State Analysis

### What Works (Preserve)
- ✅ Emoji-based status parsing (✅ ⚠️ ❗ ❌)
- ✅ Three-column workflow (TODO → IN PROGRESS → DONE)
- ✅ Swimlane organization from H2/H3 headers
- ✅ Multi-line description parsing
- ✅ Blocked flag as boolean attribute
- ✅ GitHub API integration for loading/saving
- ✅ Drag-and-drop card movement
- ✅ Card detail drawer for editing

### Prototype Issues (Fix in v0.2)
- ❌ **Coupling:** Parser logic coupled to App component state
- ❌ **State Management:** No clear state architecture, useKV mixed with useState
- ❌ **Testing:** Zero test coverage, no test harness
- ❌ **Extensibility:** Hard-coded GitHub integration, no plugin system
- ❌ **Validation:** No schema validation for parsed data
- ❌ **Error Handling:** Minimal error boundaries and recovery
- ❌ **Performance:** No memoization, re-renders on every state change
- ❌ **Type Safety:** Loose TypeScript usage, any types in places

---

## v0.2 Directory Structure

```
markdeck/
├── src/
│   ├── core/                          # Pure domain logic (framework-agnostic)
│   │   ├── domain/                    # Domain models and types
│   │   │   ├── types.ts              # Core domain types (Card, Swimlane, Status, etc.)
│   │   │   ├── errors.ts             # Domain-specific error types
│   │   │   └── validation.ts         # Domain validation rules (Zod schemas)
│   │   │
│   │   ├── parsers/                   # Markdown parsing and serialization
│   │   │   ├── markdown-parser.ts    # STATUS.md → domain model
│   │   │   ├── markdown-serializer.ts # domain model → STATUS.md
│   │   │   ├── metadata-extractor.ts # Extract title, version, date
│   │   │   ├── swimlane-parser.ts    # H2/H3 → swimlanes
│   │   │   ├── card-parser.ts        # Bullet points → cards
│   │   │   ├── notes-parser.ts       # Non-card content → notes
│   │   │   └── round-trip.test.ts    # Verify fidelity
│   │   │
│   │   ├── services/                  # Business logic services
│   │   │   ├── card-service.ts       # Card CRUD operations
│   │   │   ├── swimlane-service.ts   # Swimlane management
│   │   │   ├── sync-service.ts       # Conflict resolution, merge logic
│   │   │   └── validation-service.ts # Validate domain operations
│   │   │
│   │   └── utils/                     # Pure utility functions
│   │       ├── id-generator.ts       # Stable ID generation (slug + counter)
│   │       ├── emoji-mapper.ts       # Status ↔ emoji mapping
│   │       └── date-formatter.ts     # Date parsing/formatting
│   │
│   ├── adapters/                      # External integrations (I/O boundary)
│   │   ├── providers/                 # Status source providers
│   │   │   ├── base-provider.ts      # Abstract provider interface
│   │   │   ├── file-provider.ts      # Local file upload/download
│   │   │   ├── github-provider.ts    # GitHub API integration
│   │   │   ├── static-provider.ts    # Static/demo data
│   │   │   └── future/               # Planned providers
│   │   │       ├── d1-provider.ts    # Cloudflare D1 persistence
│   │   │       └── r2-provider.ts    # Cloudflare R2 file storage
│   │   │
│   │   ├── api/                       # External API clients
│   │   │   ├── github-client.ts      # Octokit wrapper with error handling
│   │   │   └── types.ts              # API response types
│   │   │
│   │   └── storage/                   # Client-side persistence
│   │       ├── kv-storage.ts         # GitHub Spark KV wrapper
│   │       └── indexed-db.ts         # Future: offline mode support
│   │
│   ├── application/                   # Application layer (use cases)
│   │   ├── state/                     # Global state management
│   │   │   ├── app-store.ts          # Zustand store (or similar)
│   │   │   ├── actions.ts            # Dispatched actions
│   │   │   ├── selectors.ts          # Derived state selectors
│   │   │   └── middleware.ts         # Logging, persistence hooks
│   │   │
│   │   ├── hooks/                     # React hooks (UI ↔ core bridge)
│   │   │   ├── use-project.ts        # Load/save project
│   │   │   ├── use-cards.ts          # Card operations
│   │   │   ├── use-swimlanes.ts      # Swimlane operations
│   │   │   ├── use-sync.ts           # GitHub sync status
│   │   │   ├── use-provider.ts       # Provider selection/config
│   │   │   └── use-mobile.ts         # Responsive utilities (keep)
│   │   │
│   │   └── use-cases/                 # Business operations
│   │       ├── load-project.ts       # Load STATUS.md from provider
│   │       ├── save-project.ts       # Save changes to provider
│   │       ├── move-card.ts          # Move card between statuses
│   │       ├── toggle-blocked.ts     # Toggle blocked flag
│   │       ├── update-card.ts        # Edit card details
│   │       └── sync-github.ts        # GitHub sync workflow
│   │
│   ├── ui/                            # Presentation layer (React components)
│   │   ├── components/                # Feature components
│   │   │   ├── board/                # Board view components
│   │   │   │   ├── Board.tsx         # Main board container
│   │   │   │   ├── Swimlane.tsx      # Swimlane with collapse
│   │   │   │   ├── Column.tsx        # Status column
│   │   │   │   ├── Card.tsx          # Kanban card (rename from KanbanCard)
│   │   │   │   └── EmptyState.tsx    # No cards message
│   │   │   │
│   │   │   ├── drawers/              # Side panels
│   │   │   │   ├── CardDetailDrawer.tsx
│   │   │   │   └── SettingsDrawer.tsx # Future: app settings
│   │   │   │
│   │   │   ├── modals/               # Dialogs
│   │   │   │   ├── GitHubConnector.tsx
│   │   │   │   ├── ProviderSelector.tsx # Choose provider type
│   │   │   │   └── ConfirmDialog.tsx # Generic confirmation
│   │   │   │
│   │   │   ├── layout/               # Layout components
│   │   │   │   ├── Header.tsx        # App header with actions
│   │   │   │   ├── Tabs.tsx          # Board/Notes/Raw tabs
│   │   │   │   └── ProjectSelector.tsx
│   │   │   │
│   │   │   ├── file/                 # File operations
│   │   │   │   ├── FileUploader.tsx
│   │   │   │   └── DropZone.tsx      # Drag-drop file zone
│   │   │   │
│   │   │   └── notes/                # Notes view
│   │   │       └── NotesPanel.tsx
│   │   │
│   │   ├── primitives/               # shadcn/ui components (keep)
│   │   │   └── [existing ui folder structure]
│   │   │
│   │   └── App.tsx                   # Root component (simplified)
│   │
│   ├── config/                        # Configuration
│   │   ├── constants.ts              # App-wide constants
│   │   ├── emoji-config.ts           # Emoji mappings
│   │   ├── provider-config.ts        # Provider registry
│   │   └── feature-flags.ts          # Optional: feature toggles
│   │
│   ├── lib/                           # Shared utilities (UI-specific)
│   │   ├── utils.ts                  # Keep: cn() and UI helpers
│   │   └── demo-data.ts              # Move to adapters/providers/static-provider.ts
│   │
│   └── main.tsx                       # Entry point (keep)
│
├── tests/                             # Test infrastructure (NEW)
│   ├── unit/                          # Unit tests
│   │   ├── core/                     # Core logic tests
│   │   │   ├── parsers/              # Parser round-trip tests
│   │   │   └── services/             # Service logic tests
│   │   └── adapters/                 # Provider tests
│   │
│   ├── integration/                   # Integration tests
│   │   ├── board-interactions.test.tsx
│   │   └── github-sync.test.tsx
│   │
│   ├── e2e/                           # End-to-end tests
│   │   ├── local-mode.spec.ts        # File upload workflow
│   │   └── github-mode.spec.ts       # GitHub integration workflow
│   │
│   ├── fixtures/                      # Test data
│   │   ├── valid-status.md           # Valid STATUS.md examples
│   │   ├── invalid-status.md         # Malformed markdown
│   │   └── mock-responses.ts         # GitHub API mocks
│   │
│   └── helpers/                       # Test utilities
│       ├── test-providers.ts         # Mock providers
│       ├── render-utils.tsx          # React Testing Library setup
│       └── assertions.ts             # Custom matchers
│
├── docs/                              # Documentation (NEW)
│   ├── architecture.md               # This file
│   ├── adr/                          # Architecture Decision Records
│   │   ├── 001-core-structure.md
│   │   ├── 002-provider-system.md
│   │   └── 003-state-management.md
│   ├── api/                          # API documentation
│   │   ├── providers.md
│   │   └── parsers.md
│   └── refactoring/
│       └── refactor-plan.md
│
└── package.json
```

---

## Module Responsibilities

### 1. Core Domain (`src/core/`)

**Purpose:** Pure business logic, framework-agnostic. Can run in Node, Workers, browser.

**Boundaries:**
- ✅ **CAN:** Define types, validate data, transform models
- ❌ **CANNOT:** Import React, use DOM APIs, make HTTP calls, access localStorage

**Key Modules:**

#### `domain/types.ts`
- Define core domain types: `Card`, `Swimlane`, `Status`, `Project`, `Note`
- No UI-specific types (e.g., no `isCollapsed` in domain `Swimlane`)
- Strict TypeScript, no `any` types

#### `domain/validation.ts`
- Zod schemas for runtime validation
- Validate parsed markdown before domain model creation
- Ensure data integrity at boundaries

#### `parsers/markdown-parser.ts`
- **Input:** Raw STATUS.md string
- **Output:** `ParsedProject` domain model
- **Responsibilities:**
  - Extract metadata (title, version, date)
  - Parse swimlanes from H2/H3 headers
  - Parse cards from bullet points with emoji
  - Preserve original line numbers for round-trip
  - Extract notes from non-card content
- **Error Handling:** Throw `ParseError` with line numbers

#### `parsers/markdown-serializer.ts`
- **Input:** `Project` domain model + original markdown
- **Output:** Updated STATUS.md string
- **Responsibilities:**
  - Map cards back to original line numbers
  - Update status emojis and blocked flags
  - Preserve non-card content exactly
  - Update "Last Updated" timestamp
- **Guarantee:** Lossless round-trip for non-card content

#### `services/card-service.ts`
```typescript
export class CardService {
  moveCard(card: Card, newStatus: CardStatus): Card
  toggleBlocked(card: Card): Card
  updateCard(card: Card, updates: Partial<Card>): Card
  validateCard(card: Card): ValidationResult
}
```

#### `services/sync-service.ts`
```typescript
export class SyncService {
  detectConflicts(local: Project, remote: Project): Conflict[]
  mergeChanges(base: Project, local: Project, remote: Project): MergeResult
  resolveConflict(conflict: Conflict, resolution: Resolution): Project
}
```

### 2. Adapters (`src/adapters/`)

**Purpose:** Interface with external systems (I/O boundary).

**Boundaries:**
- ✅ **CAN:** Make HTTP calls, access file system, use localStorage
- ❌ **CANNOT:** Contain business logic, import React components

**Key Modules:**

#### `providers/base-provider.ts`
```typescript
export interface StatusProvider {
  readonly type: 'file' | 'github' | 'd1' | 'r2' | 'static'
  
  // Load STATUS.md content
  load(context: LoadContext): Promise<ProviderResult<string>>
  
  // Save STATUS.md content
  save(content: string, context: SaveContext): Promise<ProviderResult<void>>
  
  // List available projects (for GitHub repos, D1 tables, etc.)
  list?(context: ListContext): Promise<ProviderResult<ProjectInfo[]>>
  
  // Check if provider is configured
  isConfigured(): boolean
  
  // Validate configuration
  validateConfig(): Promise<ProviderResult<void>>
}

export type ProviderResult<T> = 
  | { success: true; data: T }
  | { success: false; error: ProviderError }
```

#### `providers/github-provider.ts`
- Implements `StatusProvider` for GitHub API
- Uses `github-client.ts` for API calls
- Handles auth token management
- Fetches/updates STATUS.md via Contents API
- Lists repos with STATUS.md files

#### `providers/file-provider.ts`
- Implements `StatusProvider` for local files
- Triggers browser file picker
- Downloads updated markdown as file
- No persistence (stateless)

#### `providers/static-provider.ts`
- Implements `StatusProvider` for demo/test data
- Loads predefined STATUS.md examples
- Used for onboarding and tests

### 3. Application Layer (`src/application/`)

**Purpose:** Coordinate core domain with adapters, manage state.

**Boundaries:**
- ✅ **CAN:** Orchestrate use cases, manage state, handle errors
- ❌ **CANNOT:** Render UI directly (no JSX except hooks)

**Key Modules:**

#### `state/app-store.ts`
```typescript
interface AppState {
  // Current project
  project: Project | null
  
  // Provider state
  provider: {
    type: ProviderType
    config: ProviderConfig | null
    status: 'idle' | 'loading' | 'saving' | 'error'
  }
  
  // UI state (separate from domain)
  ui: {
    selectedCardId: string | null
    drawerOpen: boolean
    collapsedLanes: Set<string>
    activeTab: 'board' | 'notes' | 'raw'
  }
  
  // Sync state
  sync: {
    hasChanges: boolean
    lastSaved: Date | null
    remoteHash: string | null // For conflict detection
  }
  
  // Actions
  actions: {
    loadProject: (provider: StatusProvider, context: LoadContext) => Promise<void>
    saveProject: () => Promise<void>
    moveCard: (cardId: string, newStatus: CardStatus) => void
    updateCard: (cardId: string, updates: Partial<Card>) => void
    toggleBlocked: (cardId: string) => void
    setProvider: (type: ProviderType, config: ProviderConfig) => void
  }
}
```

#### `hooks/use-project.ts`
```typescript
export function useProject() {
  const store = useAppStore()
  
  return {
    project: store.project,
    isLoading: store.provider.status === 'loading',
    hasChanges: store.sync.hasChanges,
    load: store.actions.loadProject,
    save: store.actions.saveProject,
  }
}
```

#### `use-cases/load-project.ts`
```typescript
export async function loadProject(
  provider: StatusProvider,
  context: LoadContext
): Promise<LoadResult> {
  // 1. Load raw markdown from provider
  const result = await provider.load(context)
  if (!result.success) return { error: result.error }
  
  // 2. Parse markdown to domain model
  const parsed = parseStatusMarkdown(result.data)
  
  // 3. Validate domain model
  const validation = validateProject(parsed)
  if (!validation.success) return { error: validation.error }
  
  // 4. Return validated project
  return { project: parsed }
}
```

### 4. UI Layer (`src/ui/`)

**Purpose:** React components, visual presentation.

**Boundaries:**
- ✅ **CAN:** Render UI, handle events, use hooks
- ❌ **CANNOT:** Contain business logic, make direct API calls

**Key Components:**

#### `App.tsx` (Simplified)
```typescript
function App() {
  const { project, load, save } = useProject()
  const { cards } = useCards()
  const { provider, setProvider } = useProvider()
  
  if (!project) {
    return <ProjectLoader onLoad={load} />
  }
  
  return (
    <div>
      <Header onSave={save} />
      <Tabs>
        <TabPanel value="board">
          <Board cards={cards} />
        </TabPanel>
        <TabPanel value="notes">
          <NotesPanel notes={project.notes} />
        </TabPanel>
        <TabPanel value="raw">
          <RawMarkdown content={project.rawMarkdown} />
        </TabPanel>
      </Tabs>
    </div>
  )
}
```

---

## Core Parsing Strategy

### Isolation Goals
1. **Pure Functions:** Parsers are pure functions (input → output, no side effects)
2. **Testable:** 100% test coverage with snapshot tests
3. **Composable:** Small, focused parsers combined into pipeline
4. **Lossless:** Round-trip preserves all non-card content

### Parser Pipeline

```
Raw Markdown String
    ↓
┌─────────────────────┐
│ Metadata Extractor  │ → { title, version, lastUpdated }
└─────────────────────┘
    ↓
┌─────────────────────┐
│ Swimlane Parser     │ → Swimlane[] (from H2/H3 headers)
└─────────────────────┘
    ↓
┌─────────────────────┐
│ Card Parser         │ → Card[] (from emoji bullets + indented descriptions)
└─────────────────────┘
    ↓
┌─────────────────────┐
│ Notes Parser        │ → Note[] (non-card content)
└─────────────────────┘
    ↓
ParsedProject { metadata, swimlanes, cards, notes, rawMarkdown }
```

### Round-Trip Fidelity

**Problem:** Users hand-craft STATUS.md files. We must preserve:
- Comments
- Non-card bullets
- Custom sections (not H2/H3)
- Spacing/formatting
- Order of non-card content

**Solution:**
1. **Track Line Numbers:** Each card stores `originalLine` number
2. **Preserve Non-Card Lines:** Don't modify lines not associated with cards
3. **In-Place Updates:** Replace card lines at original positions
4. **Append New Cards:** If new cards added, append to appropriate section

**Test Strategy:**
```typescript
describe('Round-trip fidelity', () => {
  it('preserves non-card content exactly', () => {
    const input = readFixture('complex-status.md')
    const parsed = parseStatusMarkdown(input)
    const output = projectToMarkdown(parsed)
    
    // Extract non-card lines from both
    const inputNonCardLines = extractNonCardLines(input)
    const outputNonCardLines = extractNonCardLines(output)
    
    expect(outputNonCardLines).toEqual(inputNonCardLines)
  })
})
```

---

## Provider System Architecture

### Design Goals
1. **Pluggable:** Easy to add new providers (D1, R2, Notion, Linear, etc.)
2. **Uniform Interface:** All providers implement same contract
3. **Testable:** Mock providers for testing
4. **Configurable:** Runtime provider selection

### Provider Interface

```typescript
export interface StatusProvider {
  readonly type: ProviderType
  
  load(context: LoadContext): Promise<ProviderResult<string>>
  save(content: string, context: SaveContext): Promise<ProviderResult<void>>
  list?(context: ListContext): Promise<ProviderResult<ProjectInfo[]>>
  
  isConfigured(): boolean
  validateConfig(): Promise<ProviderResult<void>>
}

export type ProviderType = 'file' | 'github' | 'd1' | 'r2' | 'static'

export interface ProviderConfig {
  github?: {
    token: string
    owner: string
    repo: string
    branch?: string
  }
  d1?: {
    databaseId: string
    tableName: string
  }
  r2?: {
    bucketName: string
    objectKey: string
  }
}
```

### Provider Registry

```typescript
// src/config/provider-config.ts
export const PROVIDERS: Record<ProviderType, ProviderFactory> = {
  file: () => new FileProvider(),
  github: (config) => new GitHubProvider(config.github!),
  static: () => new StaticProvider(),
  d1: (config) => new D1Provider(config.d1!), // Future
  r2: (config) => new R2Provider(config.r2!), // Future
}

export function createProvider(type: ProviderType, config: ProviderConfig): StatusProvider {
  return PROVIDERS[type](config)
}
```

### Usage in App

```typescript
function App() {
  const [providerType, setProviderType] = useState<ProviderType>('file')
  const [providerConfig, setProviderConfig] = useState<ProviderConfig>({})
  
  const provider = useMemo(
    () => createProvider(providerType, providerConfig),
    [providerType, providerConfig]
  )
  
  // ... rest of app
}
```

---

## State Management Strategy

### Current Issues
- Mixed use of `useKV` (Spark persistence) and `useState` (ephemeral)
- State scattered across components
- No clear source of truth

### v0.2 Solution: Zustand Store

**Why Zustand:**
- Lightweight (no Provider hell)
- Works with Spark KV for persistence
- Simple API, TypeScript-first
- Middleware support for logging/persistence

**Store Structure:**

```typescript
// src/application/state/app-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  // Domain state
  project: Project | null
  
  // Provider state
  provider: ProviderState
  
  // UI state (ephemeral, not persisted)
  ui: UIState
  
  // Sync state
  sync: SyncState
  
  // Actions
  actions: Actions
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      project: null,
      provider: { type: 'file', config: null, status: 'idle' },
      ui: { selectedCardId: null, drawerOpen: false, collapsedLanes: new Set() },
      sync: { hasChanges: false, lastSaved: null, remoteHash: null },
      
      actions: {
        loadProject: async (provider, context) => {
          set({ provider: { ...get().provider, status: 'loading' } })
          const result = await loadProjectUseCase(provider, context)
          if (result.project) {
            set({ 
              project: result.project,
              provider: { ...get().provider, status: 'idle' },
              sync: { hasChanges: false, remoteHash: result.hash }
            })
          }
        },
        
        moveCard: (cardId, newStatus) => {
          const { project } = get()
          if (!project) return
          
          const updatedCards = project.cards.map(card =>
            card.id === cardId ? { ...card, status: newStatus } : card
          )
          
          set({ 
            project: { ...project, cards: updatedCards },
            sync: { ...get().sync, hasChanges: true }
          })
        },
        
        // ... other actions
      },
    }),
    {
      name: 'markdeck-storage',
      partialize: (state) => ({
        // Only persist provider config, not full project (too large)
        provider: state.provider,
      }),
    }
  )
)
```

### Selectors (Derived State)

```typescript
// src/application/state/selectors.ts
export const selectCardsByLane = (laneId: string) => (state: AppState) =>
  state.project?.cards.filter(card => card.laneId === laneId) ?? []

export const selectBlockedCards = (state: AppState) =>
  state.project?.cards.filter(card => card.blocked) ?? []

export const selectHasUnsavedChanges = (state: AppState) =>
  state.sync.hasChanges
```

---

## Error Handling & Validation

### Error Types

```typescript
// src/core/domain/errors.ts
export class MarkDeckError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'MarkDeckError'
  }
}

export class ParseError extends MarkDeckError {
  constructor(message: string, public line?: number) {
    super(message, 'PARSE_ERROR')
  }
}

export class ProviderError extends MarkDeckError {
  constructor(
    message: string,
    public providerType: ProviderType,
    public cause?: Error
  ) {
    super(message, 'PROVIDER_ERROR')
  }
}

export class ValidationError extends MarkDeckError {
  constructor(message: string, public field: string) {
    super(message, 'VALIDATION_ERROR')
  }
}
```

### Validation with Zod

```typescript
// src/core/domain/validation.ts
import { z } from 'zod'

export const CardSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  status: z.enum(['todo', 'in_progress', 'done']),
  laneId: z.string().min(1),
  blocked: z.boolean(),
  description: z.string().optional(),
  links: z.array(z.string().url()),
  originalLine: z.number().int().nonnegative(),
})

export const ProjectSchema = z.object({
  metadata: z.object({
    title: z.string().min(1),
    version: z.string().optional(),
    lastUpdated: z.string().optional(),
  }),
  cards: z.array(CardSchema),
  swimlanes: z.array(z.object({
    id: z.string(),
    title: z.string(),
    order: z.number(),
  })),
  notes: z.array(z.object({
    title: z.string(),
    content: z.string(),
    section: z.string(),
  })),
  rawMarkdown: z.string(),
})

export function validateProject(project: unknown): ValidationResult<Project> {
  const result = ProjectSchema.safeParse(project)
  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { 
      success: false, 
      error: new ValidationError(result.error.message, 'project') 
    }
  }
}
```

---

## Performance Considerations

### Optimization Strategies

1. **Memoization:**
   - Memoize card filtering by lane: `useMemo(() => cards.filter(...))`
   - Memoize provider instances: `useMemo(() => createProvider(...))`
   - React.memo for Card and Swimlane components

2. **Virtual Scrolling:**
   - For swimlanes with 50+ cards, use `react-virtual`
   - Render only visible cards in viewport

3. **Debouncing:**
   - Debounce search/filter inputs
   - Debounce autosave (if implemented)

4. **Code Splitting:**
   - Lazy load heavy components (GitHub connector, settings)
   - Lazy load providers (D1/R2 providers only when configured)

5. **Bundle Optimization:**
   - Tree-shake unused Phosphor icons
   - Code-split by route (if multi-page in future)

---

## Future-Proofing

### Cloudflare Integration (Planned)

**D1 Provider:**
```typescript
// src/adapters/providers/d1-provider.ts
export class D1Provider implements StatusProvider {
  async load(context: LoadContext): Promise<ProviderResult<string>> {
    const result = await this.db
      .prepare('SELECT content FROM projects WHERE id = ?')
      .bind(context.projectId)
      .first<{ content: string }>()
    
    return result 
      ? { success: true, data: result.content }
      : { success: false, error: new ProviderError('Project not found', 'd1') }
  }
  
  async save(content: string, context: SaveContext): Promise<ProviderResult<void>> {
    await this.db
      .prepare('UPDATE projects SET content = ?, updated_at = ? WHERE id = ?')
      .bind(content, new Date().toISOString(), context.projectId)
      .run()
    
    return { success: true, data: undefined }
  }
}
```

**R2 Provider:**
```typescript
// src/adapters/providers/r2-provider.ts
export class R2Provider implements StatusProvider {
  async load(context: LoadContext): Promise<ProviderResult<string>> {
    const object = await this.bucket.get(context.objectKey)
    if (!object) {
      return { success: false, error: new ProviderError('Object not found', 'r2') }
    }
    
    const content = await object.text()
    return { success: true, data: content }
  }
  
  async save(content: string, context: SaveContext): Promise<ProviderResult<void>> {
    await this.bucket.put(context.objectKey, content, {
      httpMetadata: { contentType: 'text/markdown' },
    })
    
    return { success: true, data: undefined }
  }
}
```

### Extension Points

1. **Custom Parsers:** Plugin system for custom markdown formats
2. **Middleware:** Hooks for logging, analytics, error reporting
3. **Themes:** Customizable color schemes, icon sets
4. **Webhooks:** Trigger external systems on card status changes (future)
5. **Real-time Sync:** WebSocket support for multi-user collaboration (future)

---

## Migration Path from v0.1 → v0.2

### Phase 1: Extract Core (Week 1)
- Move types to `src/core/domain/types.ts`
- Move parser to `src/core/parsers/markdown-parser.ts`
- Extract serializer to `src/core/parsers/markdown-serializer.ts`
- Add Zod validation
- Write parser round-trip tests

### Phase 2: Implement Provider System (Week 1-2)
- Create `StatusProvider` interface
- Implement `FileProvider`
- Implement `GitHubProvider`
- Implement `StaticProvider`
- Add provider tests

### Phase 3: Refactor State Management (Week 2)
- Set up Zustand store
- Migrate state from App.tsx
- Create selectors
- Implement middleware

### Phase 4: Reorganize UI (Week 2-3)
- Move components to `src/ui/components/`
- Create use-cases in `src/application/use-cases/`
- Extract hooks to `src/application/hooks/`
- Simplify App.tsx

### Phase 5: Add Testing Infrastructure (Week 3)
- Set up Vitest
- Write unit tests for core
- Write integration tests for UI
- Add E2E tests with Playwright

---

## Success Metrics

### Code Quality
- ✅ 0 TypeScript `any` types in core domain
- ✅ 90%+ test coverage for core modules
- ✅ 100% round-trip fidelity for STATUS.md
- ✅ <100ms parse time for 1000-card file
- ✅ <3s full app load time

### Architecture
- ✅ Core domain has zero React/UI dependencies
- ✅ All providers implement same interface
- ✅ <10 lines to add new provider type
- ✅ State updates cause <5ms re-render time

### Developer Experience
- ✅ New developer can understand architecture in <30 minutes
- ✅ Adding new card field requires changes in <5 files
- ✅ Tests run in <5 seconds
- ✅ Build time <10 seconds

---

## Open Questions

1. **State Persistence:** Should we persist full project in localStorage/KV or only provider config?
   - **Recommendation:** Persist provider config only. Projects can be large (10+ MB).

2. **Conflict Resolution:** How to handle merge conflicts when GitHub file changed remotely?
   - **Recommendation:** Warn user, show diff, let user choose (local, remote, manual merge).

3. **Offline Support:** Should we support offline editing with sync queue?
   - **Recommendation:** Phase 2 feature. Use IndexedDB for offline storage.

4. **Real-time Collaboration:** Multi-user editing?
   - **Recommendation:** Not in v0.2. Requires CRDT or OT, WebSocket infrastructure.

5. **Undo/Redo:** Should we implement undo stack?
   - **Recommendation:** Yes, simple implementation. Store last 10 project states.

---

## Conclusion

This architecture transforms MarkDeck from a working prototype to a production-grade application with:
- **Clear boundaries** between domain, application, and UI layers
- **Pluggable providers** for different data sources
- **Comprehensive testing** at all levels
- **Future-proof design** for Cloudflare Workers, D1, R2
- **Developer-friendly** codebase that's easy to understand and extend

The v0.2 architecture prioritizes **simplicity, testability, and extensibility** while maintaining the lightweight, focused developer-tool aesthetic that makes MarkDeck unique.
