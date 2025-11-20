# End-to-End Tests

Complete user workflow tests that validate the entire application from user's perspective.

## Characteristics

- ✅ Full application integration
- ✅ Real browser interactions
- ✅ Network mocked with MSW
- ✅ Slow execution (1-10s per test)
- ✅ Tests critical user journeys only

## Coverage Target

**Critical user paths only** (not line coverage)

## Directory Structure

```
e2e/
├── local-mode.spec.ts         # File upload/download workflow
├── github-mode.spec.ts        # GitHub integration workflow
├── ui-interactions.spec.ts    # Drag-drop, lane collapse, card editing
└── performance.spec.ts        # Large file handling, virtualization
```

## What to Test

Focus on **happy paths** and **critical scenarios** only:

### Local Mode
- Upload STATUS.md file
- View board with cards
- Edit card description
- Move card between columns
- Download updated file

### GitHub Mode
- Connect to GitHub
- Load project from repository
- Edit cards
- Save changes back to GitHub
- Handle sync conflicts

### UI Interactions
- Drag-and-drop cards
- Collapse/expand swimlanes
- Open/close card detail drawer
- Switch between tabs (board/notes/raw)
- Mobile responsive behavior

### Performance
- Load large files (500+ cards)
- Verify virtualized scrolling
- Smooth drag-and-drop

## Example Test (Local Mode)

```typescript
import { test, expect } from 'vitest'
import { render } from '@/tests/helpers/render-utils'
import App from '@/ui/App'

test('local mode: upload → view → edit → download', async () => {
  // GIVEN: App is loaded
  const { container } = render(<App />)
  
  // WHEN: User uploads a file
  const fileInput = container.querySelector('input[type="file"]')
  const file = new File(
    ['# Test Project\n## Lane\n- ❗ Todo task'],
    'STATUS.md',
    { type: 'text/markdown' }
  )
  
  // Simulate file selection
  Object.defineProperty(fileInput, 'files', {
    value: [file]
  })
  fireEvent.change(fileInput)
  
  // THEN: Board displays
  await waitFor(() => {
    expect(screen.getByText('Test Project')).toBeInTheDocument()
    expect(screen.getByText('Todo task')).toBeInTheDocument()
  })
  
  // WHEN: User edits a card
  fireEvent.click(screen.getByText('Todo task'))
  
  await waitFor(() => {
    expect(screen.getByTestId('card-drawer')).toBeVisible()
  })
  
  const descriptionInput = screen.getByTestId('description-input')
  await userEvent.clear(descriptionInput)
  await userEvent.type(descriptionInput, 'New description')
  
  fireEvent.click(screen.getByTestId('drawer-save'))
  
  // THEN: Card is updated
  await waitFor(() => {
    expect(screen.queryByTestId('card-drawer')).not.toBeInTheDocument()
  })
  
  // WHEN: User downloads
  fireEvent.click(screen.getByTestId('download-button'))
  
  // THEN: Download is triggered
  // (Note: Actual download verification is tricky in tests)
  // You might mock the download function instead
})
```

## Example Test (GitHub Mode)

```typescript
import { test, expect } from 'vitest'
import { server } from '@/tests/helpers/msw-server'
import { http, HttpResponse } from 'msw'

test('github mode: connect → load → edit → save', async () => {
  // GIVEN: Mock GitHub API
  server.use(
    http.get('https://api.github.com/repos/:owner/:repo/contents/STATUS.md', () => {
      return HttpResponse.json({
        content: btoa('# Project\n## Lane\n- ❗ Todo'),
        sha: 'abc123'
      })
    }),
    
    http.put('https://api.github.com/repos/:owner/:repo/contents/STATUS.md', async ({ request }) => {
      const body = await request.json()
      return HttpResponse.json({
        content: { sha: 'new-sha' },
        commit: { message: body.message }
      })
    })
  )
  
  // WHEN: User connects to GitHub
  const { container } = render(<App />)
  
  fireEvent.click(screen.getByText('Connect to GitHub'))
  
  // Fill in GitHub credentials
  await userEvent.type(screen.getByLabelText('Token'), 'test-token')
  await userEvent.type(screen.getByLabelText('Owner'), 'test-owner')
  await userEvent.type(screen.getByLabelText('Repository'), 'test-repo')
  
  fireEvent.click(screen.getByText('Connect'))
  
  // THEN: Project loads
  await waitFor(() => {
    expect(screen.getByText('Project')).toBeInTheDocument()
    expect(screen.getByText('Todo')).toBeInTheDocument()
  })
  
  // WHEN: User edits a card
  fireEvent.click(screen.getByText('Todo'))
  
  const titleInput = screen.getByLabelText('Title')
  await userEvent.clear(titleInput)
  await userEvent.type(titleInput, 'Updated task')
  
  fireEvent.click(screen.getByText('Save'))
  
  // THEN: Card is updated locally
  await waitFor(() => {
    expect(screen.getByText('Updated task')).toBeInTheDocument()
  })
  
  // WHEN: User saves to GitHub
  fireEvent.click(screen.getByTestId('save-to-github'))
  
  // THEN: Success toast appears
  await waitFor(() => {
    expect(screen.getByText(/saved successfully/i)).toBeInTheDocument()
  })
})
```

## Drag-and-Drop Test

```typescript
test('drag card from TODO to DONE', async () => {
  const { container } = render(<App initialProject={testProject} />)
  
  // Get drag source and drop target
  const todoCard = screen.getByText('Todo task')
  const doneColumn = screen.getByTestId('column-done')
  
  // Simulate drag-and-drop
  fireEvent.dragStart(todoCard)
  fireEvent.dragEnter(doneColumn)
  fireEvent.drop(doneColumn)
  fireEvent.dragEnd(todoCard)
  
  // Verify card moved
  await waitFor(() => {
    const todoColumn = screen.getByTestId('column-todo')
    expect(todoColumn).not.toContainElement(todoCard)
    expect(doneColumn).toContainElement(screen.getByText('Todo task'))
  })
  
  // Verify card status updated
  const updatedCard = testProject.cards.find(c => c.title === 'Todo task')
  expect(updatedCard.status).toBe('done')
})
```

## Performance Test

```typescript
test('handles large file with 500+ cards', async () => {
  // GIVEN: Large project with 500 cards
  const largeProject = createLargeProject(500)
  
  // WHEN: Rendering the board
  const start = performance.now()
  const { container } = render(<App initialProject={largeProject} />)
  const renderTime = performance.now() - start
  
  // THEN: Renders in reasonable time
  expect(renderTime).toBeLessThan(1000) // <1s
  
  // THEN: Only visible cards are rendered (virtualization)
  const renderedCards = container.querySelectorAll('[data-testid="card"]')
  expect(renderedCards.length).toBeLessThan(100) // Not all 500
  
  // WHEN: Scrolling down
  const boardContainer = screen.getByTestId('board-container')
  fireEvent.scroll(boardContainer, { target: { scrollTop: 1000 } })
  
  // THEN: New cards are rendered
  await waitFor(() => {
    const newCards = container.querySelectorAll('[data-testid="card"]')
    expect(newCards.length).toBeGreaterThan(0)
  })
})
```

## Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npm test local-mode.spec.ts

# Run in headless mode (default)
npm run test:e2e

# Run in watch mode
npm test -- --watch e2e/
```

## Best Practices

1. **Test Critical Paths Only**
   - Don't test every edge case in E2E
   - Focus on most common user workflows
   - Leave edge cases to unit/integration tests

2. **Use Data Test IDs**
   ```tsx
   <button data-testid="save-button">Save</button>
   ```
   - More stable than text content
   - Easier to maintain

3. **Wait for Asynchronous Updates**
   ```typescript
   await waitFor(() => {
     expect(screen.getByText('Loaded')).toBeInTheDocument()
   })
   ```

4. **Mock Network Requests**
   - Use MSW, not real API calls
   - Faster and more reliable
   - No external dependencies

5. **Clean Up Between Tests**
   ```typescript
   afterEach(() => {
     cleanup()
     server.resetHandlers()
   })
   ```

6. **Keep Tests Independent**
   - Each test should set up its own data
   - Don't rely on test execution order

## Common Patterns

### File Upload Simulation

```typescript
const file = new File(['content'], 'status.md', { type: 'text/markdown' })
const input = screen.getByLabelText('Upload file')

Object.defineProperty(input, 'files', { value: [file] })
fireEvent.change(input)
```

### Waiting for Element

```typescript
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
}, { timeout: 5000 })
```

### User Typing

```typescript
import userEvent from '@testing-library/user-event'

await userEvent.type(input, 'Hello world')
```

### Checking Element Visibility

```typescript
expect(drawer).toBeVisible()
expect(modal).not.toBeInTheDocument()
```

## Debugging E2E Tests

### Screenshot on Failure

```typescript
import { screen } from '@testing-library/react'

test('my test', async () => {
  try {
    // ... test code
  } catch (error) {
    // Save screenshot for debugging
    console.log(screen.debug())
    throw error
  }
})
```

### Verbose Output

```bash
npm test -- --reporter=verbose e2e/
```

---

**Note:** E2E tests are the slowest. Keep the suite small and focused on critical workflows.
