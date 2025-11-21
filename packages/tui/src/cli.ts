#!/usr/bin/env node

/**
 * CLI entry point for MarkDeck TUI viewer
 * 
 * Usage:
 *   markdeck-tui [options] [file]
 *   
 * Options:
 *   --file <path>    Path to STATUS.md file (default: ./STATUS.md)
 *   --watch, -w      Watch mode with interactive editing
 *   --help, -h       Show help message
 */

import { readFile } from 'node:fs/promises'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseStatusMarkdown } from '../../../src/core/parsers/markdown-parser.js'
import { startLoop } from './loop.js'

// Version is either injected at bundle time or read from package.json
declare const __MARKDECK_VERSION__: string | undefined

async function getVersion(): Promise<string> {
  if (typeof __MARKDECK_VERSION__ !== 'undefined') {
    return __MARKDECK_VERSION__
  }
  const __dirname = dirname(fileURLToPath(import.meta.url))
  const packageJson = JSON.parse(await readFile(join(__dirname, '..', 'package.json'), 'utf-8'))
  return packageJson.version
}

interface CliOptions {
  file: string
  help: boolean
  version: boolean
}

/**
 * Parse command-line arguments
 */
function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {
    file: 'STATUS.md',
    help: false,
    version: false,
  }
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    switch (arg) {
      case '--help':
      case '-h':
        options.help = true
        break
        
      case '--version':
      case '-v':
        options.version = true
        break
        
      case '--file':
        if (i + 1 < args.length) {
          options.file = args[i + 1]
          i++
        } else {
          console.error('Error: --file requires a path argument')
          process.exit(1)
        }
        break
        
      default:
        // Positional argument (file path)
        if (!arg.startsWith('-')) {
          options.file = arg
        } else {
          console.error(`Unknown option: ${arg}`)
          console.error('Run with --help for usage information')
          process.exit(1)
        }
    }
  }
  
  return options
}

/**
 * Show help message
 */
async function showHelp(): Promise<void> {
  const VERSION = await getVersion()
  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                   MarkDeck TUI Viewer v${VERSION}                    ║
╚═══════════════════════════════════════════════════════════════════╝

A lightweight terminal viewer for STATUS.md files.

USAGE:
  markdeck-tui [options] [file]

OPTIONS:
  --file <path>    Path to STATUS.md file (default: ./STATUS.md)
  --version, -v    Show version number
  --help, -h       Show this help message

INTERACTIVE CONTROLS:
  ↑↓              Navigate between cards
  ←→              Navigate between lanes (visual)
  Shift+←→        Move card to previous/next lane
  b               Toggle blocked status on selected card
  q               Quit

EXAMPLES:
  markdeck-tui                    # Interactive mode (default)
  markdeck-tui STATUS.md          # Interactive mode with file
  markdeck-tui --file docs/STATUS.md

For more information, visit: https://github.com/mitchins/markdeck
`)
}

/**
 * Main CLI function
 */
async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2))
  const VERSION = await getVersion()
  
  if (options.version) {
    console.log(`v${VERSION}`)
    process.exit(0)
  }
  
  if (options.help) {
    await showHelp()
    process.exit(0)
  }
  
  try {
    // Resolve file path relative to current working directory
    const filePath = resolve(process.cwd(), options.file)
    
    // Read the file
    const content = await readFile(filePath, 'utf-8')
    
    // Parse the markdown
    const project = parseStatusMarkdown(content)
    
    // Start interactive loop (default behavior)
    await startLoop(project, filePath)
    
    process.exit(0)
  } catch (error) {
    if (error instanceof Error) {
      if ('code' in error && error.code === 'ENOENT') {
        console.error(`Error: File not found: ${options.file}`)
        console.error('\nTry specifying a different file with --file or run from a directory containing STATUS.md')
        process.exit(1)
      } else if ('code' in error && error.code === 'EACCES') {
        console.error(`Error: Permission denied: ${options.file}`)
        process.exit(1)
      } else {
        console.error(`Error parsing STATUS.md: ${error.message}`)
        console.error('\nPlease check that the file is valid markdown.')
        process.exit(1)
      }
    } else {
      console.error('An unexpected error occurred')
      process.exit(1)
    }
  }
}

// Run the CLI
main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
