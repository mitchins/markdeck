# Integration Tests

Tests that verify interactions between multiple modules and components.

## Characteristics

- ✅ Tests multiple layers together
- ✅ Mocked external dependencies (GitHub API via MSW)
- ✅ React component testing with React Testing Library
- ✅ State management testing (Zustand store)
- ✅ Moderate execution time (10-100ms per test)

## Coverage Target

**90%+** for application and UI layers

## Directory Structure

```
integration/
├── provider-system.test.ts         # Provider factory and configuration
├── state-management.test.ts        # Zustand store actions and selectors
├── board-interactions.test.tsx     # Board component with drag-and-drop
├── github-sync.test.tsx            # GitHub provider with MSW
├── file-operations.test.tsx        # File upload/download workflow
├── use-cases.test.ts               # Load/save/sync use cases
├── hooks.test.ts                   # Custom hooks (useProject, useCards, etc.)
├── card-drawer.test.tsx            # Card detail drawer
├── modals.test.tsx                 # GitHub connector, provider selector
└── layout.test.tsx                 # Header, tabs, project selector
```

## What to Test

### Provider System

**Focus:** Multiple providers working together, factory pattern

**Examples:**
- Provider factory creates correct provider
- Switching between providers
- Provider configuration validation
- Error handling across providers

### State Management

**Focus:** Zustand store, actions, derived state

**Examples:**
- Store actions update state correctly
- State updates are immutable
- Selectors compute derived state
- Persistence middleware works

### UI Components

**Focus:** Component interactions, user events, state updates

**Examples:**
- Board renders cards in correct columns
- Drag-and-drop moves cards
- Card click opens drawer
- Form submissions update state

### Use Cases

**Focus:** Multi-layer workflows

**Examples:**
- Load: provider → parser → validation → state
- Save: state → serializer → provider
- Sync: detect conflicts → merge → resolve

## Example Test

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Board } from '@/ui/components/board/Board'

describe('Board integration', () => {
  it('should display cards in correct columns', () => {
    // GIVEN: Swimlanes and cards
    const swimlanes = [
      { id: 'lane-1', title: 'Feature Work', order: 0 }
    ]
    const cards = [
      { 
        id: 'card-1', 
        title: 'Implement login', 
        status: 'todo',
        laneId: 'lane-1'
      },
      { 
        id: 'card-2', 
        title: 'Add tests', 
        status: 'done',
        laneId: 'lane-1'
      }
    ]
    
    // WHEN: Rendering the board
    render(
      <Board 
        swimlanes={swimlanes}
        cards={cards}
        onCardMove={jest.fn()}
        onCardClick={jest.fn()}
      />
    )
    
    // THEN: Cards are displayed in correct columns
    const todoColumn = screen.getByTestId('column-todo')
    const doneColumn = screen.getByTestId('column-done')
    
    expect(todoColumn).toContainElement(screen.getByText('Implement login'))
    expect(doneColumn).toContainElement(screen.getByText('Add tests'))
  })
  
  it('should call onCardClick when card is clicked', async () => {
    const onCardClick = jest.fn()
    const cards = [
      { id: 'card-1', title: 'Task', status: 'todo', laneId: 'lane-1' }
    ]
    
    render(<Board {...props} cards={cards} onCardClick={onCardClick} />)
    
    // Click the card
    await userEvent.click(screen.getByText('Task'))
    
    expect(onCardClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'card-1' })
    )
  })
})
```

## GitHub Provider Integration Test

```typescript
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { GitHubProvider } from '@/adapters/providers/github-provider'

// Set up MSW server
const server = setupServer(
  http.get('https://api.github.com/repos/:owner/:repo/contents/STATUS.md', () => {
    return HttpResponse.json({
      content: btoa('# Test Project\n## Lane\n- ✅ Card'),
      sha: 'abc123'
    })
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('GitHubProvider integration', () => {
  it('should load STATUS.md from GitHub', async () => {
    const provider = new GitHubProvider({
      token: 'test-token',
      owner: 'test-owner',
      repo: 'test-repo'
    })
    
    const result = await provider.load({})
    
    expect(result.success).toBe(true)
    expect(result.data).toContain('# Test Project')
  })
  
  it('should handle 404 error gracefully', async () => {
    server.use(
      http.get('*/STATUS.md', () => {
        return HttpResponse.json(
          { message: 'Not Found' },
          { status: 404 }
        )
      })
    )
    
    const provider = new GitHubProvider(config)
    const result = await provider.load({})
    
    expect(result.success).toBe(false)
    expect(result.error.code).toBe('GITHUB_LOAD_ERROR')
  })
})
```

## State Management Integration Test

```typescript
import { renderHook, act } from '@testing-library/react'
import { useCards } from '@/application/hooks/use-cards'
import { useAppStore } from '@/application/state/app-store'

describe('useCards integration', () => {
  beforeEach(() => {
    // Reset store before each test
    useAppStore.setState({
      project: {
        cards: [
          { id: 'card-1', status: 'todo', title: 'Task', laneId: 'lane-1' }
        ]
      }
    })
  })
  
  it('should move card and update state', () => {
    const { result } = renderHook(() => useCards())
    
    // Move card from TODO to DONE
    act(() => {
      result.current.moveCard('card-1', 'done')
    })
    
    // Verify state updated
    expect(result.current.cards[0].status).toBe('done')
    
    // Verify hasChanges flag set
    const state = useAppStore.getState()
    expect(state.sync.hasChanges).toBe(true)
  })
})
```

## Running Integration Tests

```bash
# Run all integration tests
npm run test:integration

# Run specific file
npm test github-sync.test.tsx

# Watch mode
npm test -- --watch integration/

# Coverage
npm run test:coverage -- integration/
```

## Best Practices

1. **Mock External Dependencies**
   - Use MSW for HTTP requests
   - Mock file system operations
   - Mock browser APIs (localStorage, etc.)

2. **Test User Interactions**
   - Use `@testing-library/user-event` for realistic interactions
   - Simulate clicks, typing, drag-and-drop
   - Verify UI updates correctly

3. **Test State Updates**
   - Verify state changes after actions
   - Check derived state (selectors)
   - Ensure immutability

4. **Test Error Handling**
   - Network errors (404, 403, 500)
   - Validation errors
   - Timeout errors

5. **Use Custom Render**
   ```typescript
   import { render } from '@/tests/helpers/render-utils'
   
   // Automatically wraps with providers
   render(<MyComponent />)
   ```

## MSW Setup

All GitHub API mocking is configured in:
- `tests/helpers/msw-handlers.ts` - Request handlers
- `tests/helpers/msw-server.ts` - Server setup
- `tests/setup.ts` - Server lifecycle (start/stop)

Default handlers are loaded automatically. Override in specific tests:

```typescript
server.use(
  http.get('*/STATUS.md', () => {
    return HttpResponse.json({ custom: 'response' })
  })
)
```

---

**Next:** Write E2E tests in `e2e/`
