#!/usr/bin/env node
/**
 * Bundle script for creating a single-file TUI bundle for pkg
 * This bundles the TUI CLI into a single CJS file for packaging with pkg
 */

import { build } from 'esbuild'
import { mkdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = join(__dirname, 'dist')
const bundleDir = join(distDir, 'bundle')

// Read version from package.json
const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf-8'))
const VERSION = packageJson.version

// Clean bundle directory
console.log('Cleaning bundle directory...')
rmSync(bundleDir, { recursive: true, force: true })
mkdirSync(bundleDir, { recursive: true })

// Bundle the CLI into a single CJS file for pkg
console.log('Bundling TUI CLI for pkg...')
await build({
  entryPoints: [join(distDir, 'cli.js')],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  outfile: join(bundleDir, 'cli.cjs'),
  define: {
    // Inline the version at build time to avoid needing package.json
    '__MARKDECK_VERSION__': JSON.stringify(VERSION),
  },
  external: [
    // No externals - bundle everything for pkg
  ],
  minify: false, // Keep readable for debugging
  sourcemap: false,
  keepNames: true, // Preserve function names for better stack traces
})

// Strip shebang from the bundle as pkg adds its own
const bundlePath = join(bundleDir, 'cli.cjs')
let bundleContent = readFileSync(bundlePath, 'utf-8')
if (bundleContent.startsWith('#!')) {
  bundleContent = bundleContent.replace(/^#!.*\n/, '')
  writeFileSync(bundlePath, bundleContent, 'utf-8')
  console.log('Stripped shebang from bundle')
}

console.log('Bundle complete!')
console.log(`Version: ${VERSION}`)
console.log(`Output: ${bundlePath}`)





