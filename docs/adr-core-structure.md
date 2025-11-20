# ADR-001: Core Structure & Layered Architecture

**Status:** Accepted  
**Date:** 2025-11-20  
**Deciders:** Tech Lead  
**Tags:** architecture, core-structure, layering

---

## Context

MarkDeck is currently a working prototype with STATUS.md parsing, Kanban UI, and GitHub integration. The code is functional but has architectural issues that limit maintainability, testability, and extensibility:

**Current Issues:**
1. **Tight Coupling:** Parser logic is coupled to React components and state management
2. **No Separation of Concerns:** Domain logic, I/O, and UI are intertwined
3. **Difficult to Test:** Business logic cannot be tested independently of React
4. **Hard to Extend:** Adding new data sources (D1, R2, APIs) requires modifying App.tsx
5. **State Sprawl:** Mix of `useKV` (persisted) and `useState` (ephemeral) with no clear pattern
6. **Performance Issues:** No memoization, unnecessary re-renders

**Business Goals:**
- Support multiple data sources (file, GitHub, Cloudflare D1/R2)
- Enable testing at all levels (unit, integration, E2E)
- Allow future features: undo/redo, offline mode, real-time sync, conflict resolution
- Maintain lightweight, developer-tool aesthetic
- Deploy as Cloudflare Worker (future)

---

## Decision

We will adopt a **layered architecture** with clear boundaries between **core domain logic**, **adapters**, **application layer**, and **UI layer**.

### Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                     UI Layer (React)                    │
│  Components, Hooks, Presentation Logic                  │
│  src/ui/                                                │
├─────────────────────────────────────────────────────────┤
│                  Application Layer                      │
│  State Management, Use Cases, Orchestration             │
│  src/application/                                       │
├─────────────────────────────────────────────────────────┤
│                   Adapter Layer                         │
│  External I/O: Providers, API Clients, Storage          │
│  src/adapters/                                          │
├─────────────────────────────────────────────────────────┤
│                    Core Domain                          │
│  Pure Business Logic, Parsers, Services                 │
│  src/core/                                              │
└─────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

#### 1. Core Domain (`src/core/`)
**Purpose:** Pure, framework-agnostic business logic

**Rules:**
- ✅ CAN: Define types, validate data, parse/serialize markdown, implement business rules
- ❌ CANNOT: Import React, use DOM APIs, make HTTP calls, access localStorage

**Structure:**
```
src/core/
├── domain/           # Types, validation schemas, domain errors
├── parsers/          # Markdown parsing and serialization (pure functions)
├── services/         # Business logic services (card operations, sync)
└── utils/            # Pure utility functions (ID generation, emoji mapping)
```

**Benefits:**
- Testable in isolation (no React, no mocks)
- Can run in Node, Workers, browser
- Portable to other frameworks (Vue, Svelte, etc.)
- Clear boundary for business logic

#### 2. Adapter Layer (`src/adapters/`)
**Purpose:** Interface with external systems (I/O boundary)

**Rules:**
- ✅ CAN: Make HTTP calls, access file system, use localStorage, call external APIs
- ❌ CANNOT: Contain business logic, import React components

**Structure:**
```
src/adapters/
├── providers/        # Status source providers (file, GitHub, D1, R2)
├── api/              # External API clients (GitHub, future: Linear, Notion)
└── storage/          # Client-side persistence (KV, IndexedDB)
```

**Benefits:**
- Pluggable data sources via `StatusProvider` interface
- Easy to mock for testing
- Swappable implementations (GitHub API → GitHub GraphQL)
- Clear error handling at I/O boundary

#### 3. Application Layer (`src/application/`)
**Purpose:** Coordinate core domain with adapters, manage state

**Rules:**
- ✅ CAN: Orchestrate use cases, manage state, handle errors, call core services
- ❌ CANNOT: Render UI directly (no JSX except in hooks)

**Structure:**
```
src/application/
├── state/            # Zustand store, actions, selectors
├── hooks/            # Custom React hooks (bridge UI ↔ state)
└── use-cases/        # Business operations (load project, save, move card)
```

**Benefits:**
- Centralized state management (no scattered useState)
- Reusable hooks across components
- Clear data flow (UI → hooks → store → core)
- Testable use cases (mock providers)

#### 4. UI Layer (`src/ui/`)
**Purpose:** React components, visual presentation

**Rules:**
- ✅ CAN: Render UI, handle events, use hooks, manage local component state
- ❌ CANNOT: Contain business logic, make direct API calls

**Structure:**
```
src/ui/
├── components/       # Feature components (board, drawers, modals, layout)
├── primitives/       # shadcn/ui components (buttons, inputs, cards)
└── App.tsx           # Root component (simplified, <150 lines)
```

**Benefits:**
- Separation of presentation from logic
- Easier to refactor UI without breaking logic
- Component reusability
- Clear testing boundary (render tests)

---

## Consequences

### Positive

1. **Testability**
   - Core logic testable without React (fast unit tests)
   - Providers can be mocked easily
   - UI components can be tested with react-testing-library
   - Clear test boundaries at each layer

2. **Maintainability**
   - Changes in one layer don't cascade to others
   - Easier to onboard new developers (clear structure)
   - Smaller, focused files (<200 lines each)
   - Explicit dependencies (no hidden coupling)

3. **Extensibility**
   - New providers require only implementing `StatusProvider` interface
   - New features (undo/redo) live in application layer
   - UI changes don't affect core logic
   - Easy to add middleware (logging, analytics)

4. **Performance**
   - Core logic can be optimized independently
   - Memoization at hook level prevents unnecessary re-renders
   - Provider calls can be batched/cached
   - Virtual scrolling can be added without touching core

5. **Portability**
   - Core domain can run in Cloudflare Workers
   - Adapters can be swapped for Workers APIs (D1, R2, KV)
   - UI can be replaced (React Native, Electron)
   - Logic reusable in CLI tool, VS Code extension

### Negative

1. **Initial Complexity**
   - More files and folders to navigate
   - Learning curve for new developers
   - More boilerplate (interfaces, types)
   - **Mitigation:** Clear documentation, consistent patterns, linters

2. **Indirection**
   - Feature implementation spans multiple layers
   - Harder to trace data flow initially
   - More abstractions to understand
   - **Mitigation:** Clear naming, use-case orchestrators, architecture docs

3. **Refactoring Cost**
   - Significant upfront work to migrate prototype
   - Risk of breaking existing functionality
   - Time investment before new features
   - **Mitigation:** Incremental refactoring plan, parallel prototype, tests

4. **Over-Engineering Risk**
   - Temptation to add unnecessary abstractions
   - Provider system might be overkill for 3 providers
   - State management might be simpler with Context
   - **Mitigation:** Start simple, add complexity only when needed

---

## Alternatives Considered

### Alternative 1: Keep Current Structure (Monolithic)
**Description:** Continue with current App.tsx-centric structure, refine incrementally

**Pros:**
- No migration cost
- Simple for small changes
- Familiar to current codebase

**Cons:**
- Tight coupling worsens over time
- Testing remains difficult
- Hard to add Cloudflare integration
- State management becomes unmaintainable

**Verdict:** ❌ **Rejected** — Technical debt will compound

---

### Alternative 2: MVC Pattern
**Description:** Traditional Model-View-Controller with React as View

**Pros:**
- Well-understood pattern
- Clear separation of concerns
- Mature best practices

**Cons:**
- Controller layer unclear in React (hooks? HOCs?)
- Model-View boundary fuzzy
- Doesn't map well to React paradigms
- No clear place for I/O (providers)

**Verdict:** ❌ **Rejected** — Poor fit for React ecosystem

---

### Alternative 3: Hexagonal Architecture (Ports & Adapters)
**Description:** Full hexagonal architecture with ports, adapters, domain at center

**Pros:**
- Maximum decoupling
- Industry-standard for DDD
- Highly testable
- Excellent for microservices

**Cons:**
- Overkill for this app size
- Too much ceremony and boilerplate
- Steep learning curve
- Slows down feature development

**Verdict:** ❌ **Rejected** — Over-engineering for MarkDeck's scope

---

### Alternative 4: Remix-style Loader/Action Pattern
**Description:** Use Remix-like loaders/actions for data fetching

**Pros:**
- Declarative data loading
- Server-side rendering ready
- Progressive enhancement

**Cons:**
- Requires framework migration (Remix/Next.js)
- Doesn't solve core domain separation
- Adds framework lock-in
- Not applicable to Cloudflare Workers directly

**Verdict:** ❌ **Rejected** — Framework migration too costly

---

### Alternative 5: Feature-Sliced Design (FSD)
**Description:** Organize by features (board/, auth/, sync/) instead of layers

**Pros:**
- Features are self-contained
- Easy to split into micro-frontends
- Clear ownership boundaries

**Cons:**
- Core domain logic duplicated across features
- Harder to enforce architecture rules
- Less clear for this single-feature app
- Refactoring more complex

**Verdict:** 🤔 **Considered for v0.3** — Good fit when adding major features

---

## Decision Rationale

We chose **Layered Architecture** because:

1. **Right Level of Abstraction**
   - Not too simple (monolithic), not too complex (hexagonal)
   - Clear separation without excessive ceremony
   - Maps well to React ecosystem

2. **Cloudflare-Ready**
   - Core domain can run in Workers (no React)
   - Adapters can interface with D1, R2, KV
   - Application layer coordinates Worker APIs

3. **Testability**
   - Each layer independently testable
   - Clear mocking boundaries
   - Fast unit tests (core) + slower integration tests (UI)

4. **Developer Experience**
   - Familiar to most web developers
   - Easy to explain and document
   - Consistent with React best practices

5. **Incremental Migration**
   - Can refactor layer by layer
   - Prototype keeps working during migration
   - Low risk of breaking changes

---

## Implementation Strategy

### Phase 1: Core Extraction (Week 1)
- Move types to `src/core/domain/`
- Split parser into modules in `src/core/parsers/`
- Add round-trip tests
- **Success:** Core has zero React dependencies

### Phase 2: Provider System (Week 2)
- Create `StatusProvider` interface
- Implement FileProvider, GitHubProvider, StaticProvider
- Add provider factory and registry
- **Success:** App uses providers for all I/O

### Phase 3: State Management (Week 2)
- Set up Zustand store
- Create custom hooks (useProject, useCards, etc.)
- Migrate App.tsx to hooks
- **Success:** No useState/useKV in App.tsx

### Phase 4: UI Refactoring (Week 2-3)
- Reorganize components into `src/ui/components/`
- Create Board, Header, TabsLayout components
- Simplify App.tsx to <150 lines
- **Success:** Clear component hierarchy

### Phase 5: Testing (Week 3)
- Add Vitest, Testing Library
- Write unit tests for core (90%+ coverage)
- Write integration tests for UI
- **Success:** Tests pass, CI green

---

## Validation Metrics

### Code Quality
- [ ] 0 TypeScript `any` types in core domain
- [ ] 90%+ test coverage for core modules
- [ ] <200 lines per file (average)
- [ ] 0 circular dependencies

### Architecture
- [ ] Core domain has 0 React imports
- [ ] All providers implement `StatusProvider`
- [ ] App.tsx <150 lines
- [ ] State managed exclusively by Zustand

### Performance
- [ ] <100ms parse time for 1000-card file
- [ ] <3s full app load time
- [ ] <5ms re-render time for card moves
- [ ] Smooth 60fps drag-and-drop

### Developer Experience
- [ ] New developer understands architecture in <30 minutes
- [ ] Adding new provider requires <50 lines of code
- [ ] Tests run in <5 seconds
- [ ] Build time <10 seconds

---

## Future Considerations

### When to Revisit This Decision

1. **If Adding Real-Time Collaboration**
   - May need CRDT or OT layer in core
   - WebSocket adapter in adapters layer
   - Consider event sourcing for undo/redo

2. **If Scaling to Many Features**
   - Consider Feature-Sliced Design
   - Split into micro-frontends
   - Module federation for code-splitting

3. **If Performance Becomes Critical**
   - Consider moving parser to Web Worker
   - Add virtualization layer for large boards
   - Implement incremental parsing

4. **If Going Multi-Platform**
   - Extract core to shared npm package
   - Create platform-specific adapters (mobile, desktop)
   - Consider React Native or Tauri

---

## Related ADRs

- [ADR-002: Provider System Design](./adr-002-provider-system.md) *(to be written)*
- [ADR-003: State Management with Zustand](./adr-003-state-management.md) *(to be written)*
- [ADR-004: Parsing Strategy & Round-Trip Fidelity](./adr-004-parsing-strategy.md) *(to be written)*

---

## References

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Zustand State Management](https://github.com/pmndrs/zustand)
- [React Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## Approval

**Approved by:** Tech Lead  
**Date:** 2025-11-20  

**Reviewers:**
- QE Agent: Will define test strategy based on this architecture
- UX Agent: Will design components within this structure
- Infra/DevOps Agent: Will configure CI/CD for layered testing

---

## Appendix A: Directory Structure (Full)

```
markdeck/
├── src/
│   ├── core/                          # Pure domain logic
│   │   ├── domain/
│   │   │   ├── types.ts              # Card, Swimlane, Status, Project
│   │   │   ├── errors.ts             # Domain-specific errors
│   │   │   └── validation.ts         # Zod schemas
│   │   ├── parsers/
│   │   │   ├── markdown-parser.ts    # Main parser orchestrator
│   │   │   ├── markdown-serializer.ts # Project → markdown
│   │   │   ├── metadata-extractor.ts # Extract title, version
│   │   │   ├── swimlane-parser.ts    # Parse H2/H3
│   │   │   ├── card-parser.ts        # Parse bullets with emoji
│   │   │   └── notes-parser.ts       # Extract non-card content
│   │   ├── services/
│   │   │   ├── card-service.ts       # Card CRUD logic
│   │   │   ├── swimlane-service.ts   # Swimlane operations
│   │   │   └── sync-service.ts       # Conflict resolution
│   │   └── utils/
│   │       ├── id-generator.ts       # Stable ID generation
│   │       ├── emoji-mapper.ts       # Emoji ↔ status
│   │       └── date-formatter.ts     # Date utilities
│   │
│   ├── adapters/                      # External integrations
│   │   ├── providers/
│   │   │   ├── base-provider.ts      # StatusProvider interface
│   │   │   ├── file-provider.ts      # File upload/download
│   │   │   ├── github-provider.ts    # GitHub API
│   │   │   └── static-provider.ts    # Demo data
│   │   ├── api/
│   │   │   └── github-client.ts      # Octokit wrapper
│   │   └── storage/
│   │       └── kv-storage.ts         # Spark KV wrapper
│   │
│   ├── application/                   # Application layer
│   │   ├── state/
│   │   │   ├── app-store.ts          # Zustand store
│   │   │   ├── actions.ts            # Store actions
│   │   │   └── selectors.ts          # Derived state
│   │   ├── hooks/
│   │   │   ├── use-project.ts        # Project operations
│   │   │   ├── use-cards.ts          # Card operations
│   │   │   ├── use-provider.ts       # Provider selection
│   │   │   └── use-ui.ts             # UI state
│   │   └── use-cases/
│   │       ├── load-project.ts       # Load workflow
│   │       ├── save-project.ts       # Save workflow
│   │       └── sync-github.ts        # GitHub sync
│   │
│   ├── ui/                            # Presentation layer
│   │   ├── components/
│   │   │   ├── board/                # Board components
│   │   │   ├── drawers/              # Side panels
│   │   │   ├── modals/               # Dialogs
│   │   │   ├── layout/               # Header, tabs
│   │   │   ├── file/                 # File operations
│   │   │   └── notes/                # Notes view
│   │   ├── primitives/               # shadcn/ui
│   │   └── App.tsx                   # Root (<150 lines)
│   │
│   ├── config/                        # Configuration
│   │   ├── constants.ts              # App constants
│   │   ├── provider-config.ts        # Provider registry
│   │   └── feature-flags.ts          # Feature toggles
│   │
│   └── lib/                           # Shared utilities
│       └── utils.ts                  # cn() and UI helpers
│
├── tests/                             # Test infrastructure
│   ├── unit/                          # Fast unit tests
│   ├── integration/                   # Component tests
│   ├── e2e/                           # Playwright E2E
│   ├── fixtures/                      # Test data
│   └── helpers/                       # Test utilities
│
└── docs/                              # Documentation
    ├── architecture.md                # This document
    ├── adr/                           # ADRs
    └── api/                           # API docs
```

---

## Appendix B: Data Flow Example

**User moves a card from TODO to DONE:**

```
1. UI Layer (Card.tsx)
   ↓ User drags card, onDrop event fires
   
2. UI Layer (Board.tsx)
   ↓ Calls onCardMove(cardId, 'done')
   
3. Application Layer (App.tsx)
   ↓ Uses useCards().moveCard(cardId, 'done')
   
4. Application Layer (app-store.ts)
   ↓ Zustand action updates state
   ↓ Immutably updates cards array
   ↓ Sets sync.hasChanges = true
   
5. Application Layer (selectors)
   ↓ Derived state recalculates
   
6. UI Layer (Board.tsx)
   ↓ Re-renders with new card positions
   ↓ Card animates to new column
   
7. User clicks "Save"
   
8. Application Layer (use-project.ts)
   ↓ Calls save() function
   
9. Application Layer (save-project.ts use-case)
   ↓ Gets project from store
   ↓ Calls serializeProject() from core
   
10. Core Domain (markdown-serializer.ts)
    ↓ Converts cards back to markdown
    ↓ Updates emoji from ❗ to ✅
    ↓ Preserves all non-card content
    
11. Application Layer (save-project.ts)
    ↓ Calls provider.save(content)
    
12. Adapter Layer (github-provider.ts)
    ↓ Calls GitHub API to update file
    ↓ Returns success result
    
13. Application Layer (app-store.ts)
    ↓ Sets sync.hasChanges = false
    ↓ Sets sync.lastSaved = now
    
14. UI Layer (Header.tsx)
    ↓ Save button returns to normal state
    ↓ Toast notification shows "Saved!"
```

**Key Observations:**
- UI never directly calls core functions
- Core never knows about React or UI
- Adapters are isolated from domain logic
- State flows unidirectionally (down)
- Actions flow up through layers

---

**END OF ADR-001**
