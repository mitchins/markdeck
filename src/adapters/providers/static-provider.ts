/**
 * Static provider for demo/test data
 * 
 * Implements StatusProvider for static markdown content.
 */

import type {
  StatusProvider,
  ProviderResult,
  LoadContext,
  SaveContext,
  ListContext,
  ProjectInfo,
} from './base-provider'
import { ProviderError } from './base-provider'

const DEMO_STATUS_MD = `# Sample Project - Kanban Board
**Last Updated:** 2024-01-15
**Version:** 1.0.0

## Frontend Development

- ✅ User authentication flow
    Implemented login, signup, and password reset functionality
    https://github.com/example/repo/pull/123

- ⚠️ Dashboard redesign
    Working on new card-based layout with responsive grid
    Need to finalize mobile breakpoints

- ⚠️ ❌ Dark mode support
    Blocked waiting for design system updates
    https://www.figma.com/design-system

- ❗ Component library setup
    Need to choose between Material-UI and Chakra UI
    Evaluate bundle size and performance

## Backend API

- ✅ RESTful endpoints
    All CRUD operations complete and tested
    Documentation available at /api/docs

- ⚠️ Database migration
    Currently migrating from MongoDB to PostgreSQL
    Expected completion: end of week

- ✅ Authentication middleware
    JWT-based auth with refresh tokens implemented

- ❗ ❌ PayPal verification incomplete
    Needs callback validation
    Needs audit logs

## DevOps & Infrastructure

- ✅ CI/CD pipeline
    Automated testing and deployment on main branch
    https://github.com/example/repo/actions

- ⚠️ Docker containerization
    Base images configured, optimizing layer caching

- ❗ ❌ Load balancing setup
    Waiting for infrastructure approval from ops team

## Documentation

- ✅ API documentation
    Complete OpenAPI spec with examples

- ⚠️ User guide
    Draft complete, needs review and screenshots

- ✅ Contributing guidelines
    CONTRIBUTING.md added with PR templates
`

export class StaticProvider implements StatusProvider {
  readonly type = 'static' as const
  private content: string = DEMO_STATUS_MD

  async load(context: LoadContext): Promise<ProviderResult<string>> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100))

    return { success: true, data: this.content }
  }

  async save(content: string, context: SaveContext): Promise<ProviderResult<void>> {
    // Store in memory only
    this.content = content

    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100))

    return { success: true, data: undefined }
  }

  async list(context: ListContext): Promise<ProviderResult<ProjectInfo[]>> {
    return {
      success: true,
      data: [
        {
          id: 'demo-project',
          name: 'Sample Project - Kanban Board',
          description: 'Demo project showing MarkDeck features',
          lastUpdated: '2024-01-15',
        },
      ],
    }
  }

  isConfigured(): boolean {
    return true
  }

  async validateConfig(): Promise<ProviderResult<void>> {
    return { success: true, data: undefined }
  }

  reset(): void {
    this.content = DEMO_STATUS_MD
  }
}
