/**
 * Test data factories for creating domain objects
 * 
 * These factories generate consistent test data with sensible defaults
 * and allow overriding specific fields for test scenarios.
 */

// TODO: Import actual types from @/core/domain/types when implemented
type CardStatus = 'todo' | 'in_progress' | 'done'

interface Card {
  id: string
  title: string
  status: CardStatus
  laneId: string
  blocked: boolean
  description: string
  links: string[]
  originalLine: number
}

interface Swimlane {
  id: string
  title: string
  order: number
}

interface ProjectMetadata {
  title: string
  version?: string
  lastUpdated?: string
}

type Note = Record<string, unknown>

interface Project {
  metadata: ProjectMetadata
  cards: Card[]
  swimlanes: Swimlane[]
  notes: Note[]
  rawMarkdown: string
}

let cardIdCounter = 0

/**
 * Create a test Card with default values
 */
export function createCard(overrides?: Partial<Card>): Card {
  return {
    id: `card-${++cardIdCounter}`,
    title: 'Test Card',
    status: 'todo',
    laneId: 'lane-1',
    blocked: false,
    description: '',
    links: [],
    originalLine: 10,
    ...overrides,
  }
}

/**
 * Create a test Swimlane with default values
 */
export function createSwimlane(overrides?: Partial<Swimlane>): Swimlane {
  return {
    id: 'lane-1',
    title: 'Test Lane',
    order: 0,
    ...overrides,
  }
}

/**
 * Create test ProjectMetadata with default values
 */
export function createMetadata(overrides?: Partial<ProjectMetadata>): ProjectMetadata {
  return {
    title: 'Test Project',
    version: 'v1.0',
    lastUpdated: '2025-11-20',
    ...overrides,
  }
}

/**
 * Create a test Project with default values
 */
export function createProject(overrides?: Partial<Project>): Project {
  return {
    metadata: createMetadata(),
    cards: [createCard()],
    swimlanes: [createSwimlane()],
    notes: [],
    rawMarkdown: '# Test Project\n## Test Lane\n- ❗ Test Card',
    ...overrides,
  }
}

/**
 * Generate a large project for performance testing
 * @param cardCount - Number of cards to generate
 */
export function createLargeProject(cardCount: number): Project {
  const cards: Card[] = []
  const swimlanes: Swimlane[] = []
  
  const lanesCount = Math.ceil(cardCount / 50)
  
  for (let i = 0; i < lanesCount; i++) {
    swimlanes.push(createSwimlane({ id: `lane-${i}`, title: `Lane ${i}`, order: i }))
  }
  
  for (let i = 0; i < cardCount; i++) {
    const laneIndex = i % lanesCount
    cards.push(createCard({
      id: `card-${i}`,
      title: `Card ${i}`,
      laneId: `lane-${laneIndex}`,
      status: i % 3 === 0 ? 'done' : i % 3 === 1 ? 'in_progress' : 'todo',
    }))
  }
  
  return createProject({ cards, swimlanes })
}

/**
 * Generate STATUS.md markdown content for testing
 */
export function createStatusMarkdown(options?: {
  cardCount?: number
  swimlaneCount?: number
  includeNotes?: boolean
  includeComments?: boolean
}): string {
  const {
    cardCount = 3,
    swimlaneCount = 1,
    includeNotes = false,
    includeComments = false,
  } = options || {}

  let markdown = `# Test Project

**Last Updated:** 2025-11-20  
**Version:** v1.0

`

  if (includeComments) {
    markdown += '<!-- This is a test comment -->\n\n'
  }

  for (let lane = 0; lane < swimlaneCount; lane++) {
    markdown += `## Lane ${lane}\n\n`
    
    const cardsPerLane = Math.ceil(cardCount / swimlaneCount)
    for (let card = 0; card < cardsPerLane; card++) {
      const statuses = ['✅', '⚠️', '❗', '❌']
      const statusEmoji = statuses[card % statuses.length]
      markdown += `- ${statusEmoji} Card ${lane}-${card}\n`
      markdown += `    Description for card ${lane}-${card}\n\n`
    }
  }

  if (includeNotes) {
    markdown += `## Notes

This is a note section that should be preserved.
`
  }

  return markdown
}
