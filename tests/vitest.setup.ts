import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll, vi } from 'vitest'

function createStorageMock(): Storage {
  const store = new Map<string, string>()

  return {
    get length() {
      return store.size
    },
    clear() {
      store.clear()
    },
    getItem(key) {
      return store.get(key) ?? null
    },
    key(index) {
      return Array.from(store.keys())[index] ?? null
    },
    removeItem(key) {
      store.delete(key)
    },
    setItem(key, value) {
      store.set(key, String(value))
    },
  }
}

function ensureStorage(name: 'localStorage' | 'sessionStorage'): void {
  const storage = window[name]

  if (
    storage &&
    typeof storage.getItem === 'function' &&
    typeof storage.setItem === 'function'
  ) {
    return
  }

  const mockStorage = createStorageMock()
  Object.defineProperty(window, name, {
    configurable: true,
    value: mockStorage,
  })
  Object.defineProperty(globalThis, name, {
    configurable: true,
    value: mockStorage,
  })
}

ensureStorage('localStorage')
ensureStorage('sessionStorage')

let server: typeof import('./helpers/msw-server')['server'] | undefined

// Start MSW server before all tests
beforeAll(async () => {
  ;({ server } = await import('./helpers/msw-server'))
  server.listen({ onUnhandledRequest: 'error' })
})

// Reset handlers and cleanup after each test
afterEach(() => {
  server?.resetHandlers()
  cleanup()
})

// Clean up after all tests
afterAll(() => {
  server?.close()
})

// Mock window.matchMedia for responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver for lazy loading
global.IntersectionObserver = class IntersectionObserver {
  constructor() { /* noop */ }
  disconnect(): void { /* noop */ }
  observe(): void { /* noop */ }
  unobserve(): void { /* noop */ }
  takeRecords() {
    return []
  }
}

// Mock ResizeObserver for responsive layouts
global.ResizeObserver = class ResizeObserver {
  constructor() { /* noop */ }
  disconnect(): void { /* noop */ }
  observe(): void { /* noop */ }
  unobserve(): void { /* noop */ }
}

// Mock scrollIntoView (not implemented in happy-dom)
Element.prototype.scrollIntoView = vi.fn()
