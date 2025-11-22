import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/vitest.setup.ts'],
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', 'tests/e2e-playwright/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: [
        'src/core/**/*.{ts,tsx}',
        'src/adapters/providers/*.{ts,tsx}',
        'src/application/state/*.{ts,tsx}',
        'src/lib/encoding-utils.ts',
        'src/adapters/api/github-client.ts',
        'src/components/FileUploader.tsx',
      ],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts',
        '**/index.ts',           // Index files
        'packages/**',           // TUI package has its own tests
        'src/ui/**',             // UI layer not yet tested
        'src/application/hooks/**', // Hooks not yet tested
        'src/application/use-cases/**', // Use cases not yet tested
        'src/adapters/providers/github-provider.ts', // GitHub provider not yet tested
        'src/adapters/providers/provider-registry.ts', // Registry not yet tested
        'src/hooks/**',          // Hooks not yet tested
        'src/main.tsx',          // Entry point
        'src/App.tsx',           // App component not yet tested
        'src/ErrorFallback.tsx', // Error component not yet tested
      ],
      thresholds: {
        global: {
          lines: 90,
          functions: 90,
          branches: 85,
          statements: 90,
        },
        'src/core/': {
          lines: 95,
          functions: 95,
          branches: 90,
          statements: 95,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
