export const DEMO_STATUS_MD = `# Sample Project - Kanban Board
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

export const MARKDECK_STATUS_MD = `# MarkDeck — Project Status

**Last Updated:** 2025-11-20
**Version:** 0.2.0 MVP

## 🎯 CORE FEATURES

- ✅ Markdown parser for STATUS.md format
    Supports H2/H3 headings as swimlanes
    Parses TODO/IN PROGRESS/DONE columns
    Handles blocked flag and indented context
- ✅ Three-column Kanban board UI
    Drag-and-drop card movement
    Visual state indicators (✅/⚠️/❌)
    Responsive design with TailwindCSS 4
- ✅ Round-trip safe serialization
    Preserves non-card Markdown
    Maintains formatting and structure
- ⚠️ GitHub provider integration
    Basic pull/push functionality works
    Need better error handling
    Rate limiting not implemented
- ⚠️ Local file support
    File provider implemented
    Needs auto-save capability

## 🚀 DEPLOYMENT & INFRASTRUCTURE

- ✅ Vite build configuration
    Development server working
    Production builds optimized
- ✅ CI/CD pipeline
    GitHub Actions test suite
    Coverage reporting to Codecov
    SonarCloud integration
- ⚠️ Cloudflare Pages deployment
    Configuration in progress
    Secrets available
    Workflow needs testing
- ❌ Custom domain setup
    Need to configure DNS
    SSL certificate automation

## 🧪 TESTING & QUALITY

- ✅ Unit test coverage
    90 tests passing
    Core parsers fully tested
    Domain validation tested
- ✅ Integration tests
    Board interactions tested
    Provider system tested
    State management tested
- ✅ E2E tests
    Local mode verified
    GitHub mode verified
    Performance benchmarks
- ⚠️ Accessibility testing
    ARIA patterns implemented
    Keyboard navigation works
    Screen reader testing needed
- ❌ Visual regression testing
    Need screenshot comparison
    No automated visual tests yet

## 📚 DOCUMENTATION & DX

- ✅ README with quickstart
    Installation instructions
    Tech stack overview
    Testing commands
- ✅ Architecture documentation
    System design documented
    ADRs for key decisions
    UX specifications
- ⚠️ Contributing guide
    Need CONTRIBUTING.md
    Issue templates needed
    PR template needed
- ❌ Live demo site
    Cloudflare deployment pending
    Example data needed
    User onboarding flow

## 🔐 SECURITY & COMPLIANCE

- ✅ Dependency management
    All dependencies updated
    Dependabot enabled
    Security vulnerabilities addressed
- ✅ GitHub token security
    PAT properly scoped
    No tokens in code
    Environment variable usage
- ⚠️ Content Security Policy
    Basic CSP implemented
    Need stricter rules
    Audit required
- ❌ Rate limiting
    GitHub API limits not handled
    No retry logic
    No caching strategy

## 🎨 UX & ACCESSIBILITY

- ✅ Keyboard navigation
    Full keyboard support
    Focus management
    Escape key handling
- ✅ Dark mode support
    Theme switching implemented
    System preference detection
    Consistent theming
- ⚠️ Mobile responsiveness
    Basic responsive design
    Touch interactions work
    Need better mobile UX
- ⚠️ Error states
    Error boundaries implemented
    Need better error messages
    Recovery flows incomplete
- ❌ Onboarding experience
    No tutorial or guide
    First-time user experience
    Need tooltips and hints

## 🔄 FUTURE ENHANCEMENTS

- ❌ Multi-file support
    Track multiple STATUS.md files
    Workspace/project organization
- ❌ Collaboration features
    Real-time updates
    Multi-user editing
    Comments and discussions
- ❌ Advanced filtering
    Filter by status/swimlane
    Search functionality
    Saved views
- ❌ Export capabilities
    Export as PDF
    Export as image
    Export to other formats
- ❌ Analytics dashboard
    Project velocity metrics
    Burndown charts
    Team insights
`
