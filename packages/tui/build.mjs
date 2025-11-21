#!/usr/bin/env node
/**
 * Build script for @markdeck/tui
 * 
 * Compiles TypeScript and copies core dependencies into the dist folder
 */

import { execSync } from 'node:child_process'
import { cpSync, mkdirSync, rmSync, readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs'
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

// Prefer local tsc binary (package or hoisted), fall back to npm exec without installing remote packages.
// This avoids npx prompting to install unrelated packages called `tsc`.
const localTscPaths = [
  join(__dirname, 'node_modules', '.bin', 'tsc'),
  join(rootDir, 'node_modules', '.bin', 'tsc'),
  join(__dirname, 'node_modules', '.bin', 'tsc.cmd'),
  join(rootDir, 'node_modules', '.bin', 'tsc.cmd')
]

let tscCmd = null
for (const p of localTscPaths) {
  if (existsSync(p)) {
    tscCmd = p
    break
  }
}

// If not found in node_modules, check for a globally available 'tsc' on PATH
if (!tscCmd) {
  try {
    // If this succeeds, `tsc` exists in path and can be used.
    execSync('tsc --version', { stdio: 'ignore' })
    tscCmd = 'tsc'
  } catch {
    // ignore: we'll fallback to npm exec
  }
}

// If no local tsc binary, try `npm exec --no-install tsc` which will error rather than prompting to install remote packages
if (!tscCmd) tscCmd = 'npm exec --no-install tsc'

try {
  execSync(`${tscCmd} --project tsconfig.json`, { cwd: __dirname, stdio: 'inherit' })
} catch {
  console.error('\nFailed to run TypeScript compiler.');
  console.error('Make sure you have installed dependencies (run `npm install` at the repository root) and that TypeScript is available as a devDependency.');
  console.error('If you are running in CI, ensure dependencies are installed and avoid using `npx` in non-interactive environments.');
  process.exit(1)
}

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
  const isDeclaration = filePath.endsWith('.d.ts')
  
  // Replace imports that point to ../../../src/core with ./core
  if (content.includes('../../../src/core/')) {
     content = content.replaceAll(/from ['"]\.\.\/\.\.\/\.\.\/src\/core\//g, 'from \'./core/')
    // Also handle 'import type' statements in declaration files
  content = content.replaceAll(/import type \{([^}]+)\} from ['"]\.\.\/\.\.\/\.\.\/src\/core\//g, 'import type {$1} from \'./core/')
  }
  
  // Add .js extensions to relative imports that don't have them
  // Match: from './something' or from '../something'
    content = content.replaceAll(/from ['"](\.\.?\/[^'"]+?)['"];?/g, (match, path) => {
      if (!path.endsWith('.js') && !path.includes('.json')) {
      return `from '${path}.js';`
    }
    return match
  })
  
  // Also fix 'import type' statements in declaration files
  if (isDeclaration) {
  content = content.replaceAll(/import type \{([^}]+)\} from ['"](\.\.?\/[^'"]+?)['"];?/g, (match, types, path) => {
      if (!path.endsWith('.js') && !path.includes('.json')) {
        return `import type {${types}} from '${path}.js';`
      }
      return match
    })
  }
  
  writeFileSync(filePath, content, 'utf-8')
}

function fixImportsRecursive(dir) {
  const entries = readdirSync(dir)
  
  for (const entry of entries) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)
    
    if (stat.isDirectory()) {
      fixImportsRecursive(fullPath)
    } else if (extname(entry) === '.js' || entry.endsWith('.d.ts')) {
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
