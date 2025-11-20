# Testing Strategy Documentation - Summary

**Date:** 2025-11-20  
**Author:** QE Lead  
**Status:** Complete

---

## Overview

This directory contains the complete testing strategy and infrastructure documentation for MarkDeck v0.2, designed to support the layered architecture with comprehensive test coverage.

## Documentation Structure

```
markdeck/
├── testing-strategy.md           # Main testing strategy document
├── tests/
│   ├── README.md                 # Test suite overview and quick start
│   ├── coverage-plan.md          # Detailed module-by-module coverage plan
│   ├── test-infra-setup.md       # Step-by-step setup instructions
│   ├── unit/README.md            # Unit testing guide
│   ├── integration/README.md     # Integration testing guide
│   ├── e2e/README.md             # E2E testing guide
│   ├── fixtures/README.md        # Test data documentation
│   └── helpers/README.md         # Test utilities documentation
│
├── Example Configuration Files:
├── vitest.config.example.ts
├── tests/setup.example.ts
├── tests/helpers/msw-handlers.example.ts
├── tests/helpers/msw-server.example.ts
├── tests/fixtures/valid-status.example.md
├── tests/fixtures/invalid-status.example.md
├── .github/workflows/test.example.yml
└── sonar-project.example.properties
```

---

## Key Documents

### 1. **testing-strategy.md** (Main Strategy)

Comprehensive overview of the testing approach:

- **Testing Pyramid:** 80% unit, 15% integration, 5% E2E
- **Test Levels:** Unit, Integration, E2E with clear boundaries
- **Failure Mode Testing:** Malformed markdown, permissions errors, conflicts
- **Performance Testing:** Large files (500+ cards), virtualization
- **Snapshot Testing:** Round-trip fidelity
- **Quality Gates:** SonarCloud integration, coverage thresholds
- **Best Practices:** GIVEN-WHEN-THEN, test naming, isolation

**Target Audience:** All developers, QE team, stakeholders

---

### 2. **tests/coverage-plan.md** (Detailed Coverage)

Module-by-module coverage targets and test cases:

- **Layer 1: Core Domain** - 95%+ coverage (80-100 tests)
  - Validation (15-20 tests)
  - Parsers (50-60 tests, including critical round-trip tests)
  - Services (24-30 tests)
  - Utilities (19-25 tests)

- **Layer 2: Adapters** - 90%+ coverage (30-40 tests)
  - Providers (FileProvider, GitHubProvider, StaticProvider)
  - API clients (GitHub client with MSW)

- **Layer 3: Application** - 90%+ coverage (35-45 tests)
  - State management (Zustand store)
  - Hooks (useProject, useCards, useProvider, useUI)
  - Use cases (load, save, sync)

- **Layer 4: UI** - 85%+ coverage (40-50 tests)
  - Board components (drag-and-drop)
  - Drawers (card detail editing)
  - Modals (GitHub connector)
  - Layout (header, tabs)

**Total Estimated Tests:** 189-240 unit/integration + ~10 E2E

**Target Audience:** Developers implementing tests

---

### 3. **tests/test-infra-setup.md** (Setup Guide)

Step-by-step instructions for setting up the testing infrastructure:

1. **Install Dependencies** (Vitest, Testing Library, MSW, etc.)
2. **Configure Vitest** (vitest.config.ts)
3. **Set Up Test Helpers** (setup.ts, render-utils, factories)
4. **Configure MSW** (GitHub API mocking)
5. **Create Fixtures** (test data files)
6. **CI/CD Integration** (GitHub Actions, SonarCloud)

**Includes:**
- Configuration examples
- Troubleshooting guide
- Best practices
- VS Code debug setup

**Target Audience:** Developers setting up testing for first time

---

### 4. **tests/README.md** (Quick Start)

Main test documentation with:
- Directory structure
- Running tests (npm scripts)
- Test levels (unit/integration/E2E)
- Examples for each test type
- Debugging tests
- Writing new tests
- Contributing guidelines

**Target Audience:** All developers running or writing tests

---

### 5. **Test Directory READMEs**

Each test directory has detailed documentation:

- **unit/README.md** - Unit testing guide, pure functions, 95% coverage target
- **integration/README.md** - Integration testing, MSW, state management
- **e2e/README.md** - E2E workflows, critical paths only
- **fixtures/README.md** - Test data files, valid/invalid examples
- **helpers/README.md** - Test utilities, factories, custom matchers

**Target Audience:** Developers writing specific types of tests

---

## Coverage Targets Summary

| Layer                 | Target | Min Acceptable | Priority |
|-----------------------|--------|----------------|----------|
| Core Domain           | 95%    | 90%            | P0       |
| Adapters              | 90%    | 85%            | P0       |
| Application           | 90%    | 85%            | P0       |
| UI Components         | 85%    | 75%            | P1       |
| **Overall Project**   | 90%    | 85%            | P0       |

---

## Tooling Stack

### Primary Framework
- **Vitest** - Fast, Vite-native test runner
  - Jest-compatible API
  - Built-in coverage (v8)
  - TypeScript support
  - Watch mode with HMR

### Supporting Libraries
- **React Testing Library** - User-centric component testing
- **@testing-library/user-event** - Realistic user interactions
- **MSW (Mock Service Worker)** - Network request mocking
- **happy-dom** - Lightweight DOM environment
- **@testing-library/jest-dom** - Custom DOM matchers

### CI/CD
- **GitHub Actions** - Automated testing on push/PR
- **SonarCloud** - Code quality and coverage monitoring
- **Codecov** (optional) - Additional coverage visualization

---

## Implementation Phases

### Phase 1: Core Domain Tests (Week 1)
**Goal:** 95%+ coverage on core domain

- [ ] Install Vitest and dependencies
- [ ] Configure vitest.config.ts
- [ ] Set up test helpers (setup.ts, factories, etc.)
- [ ] Write parser tests (including round-trip)
- [ ] Write service tests
- [ ] Write utility tests

**Success Metric:** Core domain coverage ≥95%

---

### Phase 2: Adapter Tests (Week 2)
**Goal:** 90%+ coverage on adapters

- [ ] Set up MSW for GitHub API mocking
- [ ] Write provider tests (File, GitHub, Static)
- [ ] Write GitHub client tests
- [ ] Write storage tests

**Success Metric:** Adapters coverage ≥90%

---

### Phase 3: Application Layer Tests (Week 2-3)
**Goal:** 90%+ coverage on application layer

- [ ] Write state management tests (Zustand)
- [ ] Write hook tests
- [ ] Write use case tests (load, save, sync)

**Success Metric:** Application coverage ≥90%

---

### Phase 4: UI Component Tests (Week 3)
**Goal:** 85%+ coverage on UI

- [ ] Write board component tests
- [ ] Write drawer/modal tests
- [ ] Write layout tests

**Success Metric:** UI coverage ≥85%

---

### Phase 5: E2E Tests (Week 3)
**Goal:** Cover critical user journeys

- [ ] Local mode workflow (upload → edit → download)
- [ ] GitHub mode workflow (connect → load → save)
- [ ] Drag-and-drop interactions

**Success Metric:** All critical paths covered

---

### Phase 6: CI/CD Integration (Week 3)
**Goal:** Automated testing pipeline

- [ ] Set up GitHub Actions workflow
- [ ] Configure SonarCloud
- [ ] Add coverage reporting
- [ ] Set up quality gates

**Success Metric:** CI/CD pipeline running on all PRs

---

## Example Files Provided

All example configuration files are named with `.example` suffix:

1. **vitest.config.example.ts** - Vitest configuration with coverage thresholds
2. **tests/setup.example.ts** - Global test setup with MSW and mocks
3. **tests/helpers/msw-handlers.example.ts** - GitHub API mock handlers
4. **tests/helpers/msw-server.example.ts** - MSW server setup
5. **tests/fixtures/valid-status.example.md** - Valid STATUS.md for testing
6. **tests/fixtures/invalid-status.example.md** - Malformed markdown examples
7. **.github/workflows/test.example.yml** - GitHub Actions CI/CD workflow
8. **sonar-project.example.properties** - SonarCloud configuration

**To use:** Copy `.example` files, remove `.example` suffix, and customize as needed.

---

## Quality Gates

### Pre-commit
```bash
npm run lint
npm run type-check
npm run test:unit
```

### Pre-push
```bash
npm run test
npm run build
```

### CI/CD (GitHub Actions)
- All tests must pass
- Coverage must not decrease from baseline
- SonarCloud quality gate must pass
- Build must succeed

---

## Next Steps

1. ✅ **Documentation Complete** (this deliverable)
2. [ ] **Review with team** - Get feedback on strategy
3. [ ] **Implement infrastructure** - Install dependencies, configure tools
4. [ ] **Begin Phase 1** - Core domain tests
5. [ ] **Iterate through phases** - Progressive coverage improvement
6. [ ] **Achieve targets** - 90%+ overall, 95%+ core

---

## Resources

### Documentation
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [MSW Documentation](https://mswjs.io/)
- [Kent C. Dodds Testing Blog](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Internal
- `architecture.md` - System architecture
- `refactor-plan.md` - Refactoring roadmap
- `adr-core-structure.md` - Architecture decisions

---

## Questions?

For questions or clarifications, contact:
- **QE Lead** - Testing strategy and implementation
- **Tech Lead** - Architecture alignment
- **Team** - Collaborative improvement

---

**Status:** ✅ Documentation complete and ready for implementation  
**Version:** 1.0  
**Last Updated:** 2025-11-20
