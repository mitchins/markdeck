#!/usr/bin/env node
/**
 * Build script for @markdeck/tui
 * 
 * Compiles TypeScript and copies core dependencies into the dist folder
 */

import { execSync } from 'node:child_process'
import { cpSync, mkdirSync, rmSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..', '..')
const distDir = join(__dirname, 'dist')

// Clean dist directory
console.log('Cleaning dist directory...')
rmSync(distDir, { recursive: true, force: true })
mkdirSync(distDir, { recursive: true })

// Compile TypeScript (this includes core module as it's in tsconfig includes)
console.log('Compiling TypeScript...')
execSync('npx tsc', { cwd: __dirname, stdio: 'inherit' })

// Move compiled TUI files from nested structure to dist root
console.log('Reorganizing output...')
const tuiSrcDist = join(distDir, 'packages', 'tui', 'src')
cpSync(tuiSrcDist, distDir, { recursive: true })

// Copy compiled core module from src to dist root
const coreSrcDist = join(distDir, 'src', 'core')
const coreDestDir = join(distDir, 'core')
cpSync(coreSrcDist, coreDestDir, { recursive: true })

// Clean up intermediate directories
rmSync(join(distDir, 'packages'), { recursive: true, force: true })
rmSync(join(distDir, 'src'), { recursive: true, force: true })

// Fix imports in all JS files
console.log('Fixing import paths...')

function fixImportsInFile(filePath) {
  let content = readFileSync(filePath, 'utf-8')
  let modified = false
  
  // Replace imports that point to ../../../src/core with ./core
  if (content.includes('../../../src/core/')) {
    content = content.replace(/from ['"]\.\.\/\.\.\/\.\.\/src\/core\//g, 'from \'./core/')
    modified = true
  }
  
  // Add .js extensions to relative imports that don't have them
  // Match: from './something' or from '../something'
  content = content.replace(/from ['"](\.\/.+?)['"];?/g, (match, path) => {
    if (!path.endsWith('.js') && !path.includes('.json')) {
      return `from '${path}.js';`
    }
    return match
  })
  content = content.replace(/from ['"](\.\.\/.+?)['"];?/g, (match, path) => {
    if (!path.endsWith('.js') && !path.includes('.json')) {
      return `from '${path}.js';`
    }
    return match
  })
  
  writeFileSync(filePath, content, 'utf-8')
}

function fixImportsRecursive(dir) {
  const entries = readdirSync(dir)
  
  for (const entry of entries) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)
    
    if (stat.isDirectory()) {
      fixImportsRecursive(fullPath)
    } else if (extname(entry) === '.js') {
      fixImportsInFile(fullPath)
    }
  }
}

fixImportsRecursive(distDir)

// Make CLI executable
console.log('Setting executable permissions...')
try {
  execSync('chmod +x dist/cli.js', { cwd: __dirname })
} catch {
  // Ignore on Windows
}

console.log('Build complete!')
