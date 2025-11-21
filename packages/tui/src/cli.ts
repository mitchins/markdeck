#!/usr/bin/env node

/**
 * CLI entry point for MarkDeck TUI viewer
 * 
 * Usage:
 *   markdeck-tui [options] [file]
 *   
 * Options:
 *   --file <path>    Path to STATUS.md file (default: ./STATUS.md)
 *   --help, -h       Show help message
 */

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { parseStatusMarkdown } from '../../../src/core/parsers/markdown-parser.js'
import { renderProject } from './renderer.js'

interface CliOptions {
  file: string
  color: boolean
  help: boolean
}

/**
 * Parse command-line arguments
 */
function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {
    file: 'STATUS.md',
    color: true,
    help: false,
  }
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    
    switch (arg) {
      case '--help':
      case '-h':
        options.help = true
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
function showHelp(): void {
  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                   MarkDeck TUI Viewer v0.2.0                      ║
╚═══════════════════════════════════════════════════════════════════╝

A lightweight terminal viewer for STATUS.md files.

USAGE:
  markdeck-tui [options] [file]

OPTIONS:
  --file <path>    Path to STATUS.md file (default: ./STATUS.md)
  --help, -h       Show this help message

EXAMPLES:
  markdeck-tui
  markdeck-tui STATUS.md
  markdeck-tui --file docs/STATUS.md

For more information, visit: https://github.com/mitchins/markdeck
`)
}

/**
 * Main CLI function
 */
async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2))
  
  if (options.help) {
    showHelp()
    process.exit(0)
  }
  
  try {
    // Resolve file path relative to current working directory
    const filePath = resolve(process.cwd(), options.file)
    
    // Read the file
    const content = await readFile(filePath, 'utf-8')
    
    // Parse the markdown
    const project = parseStatusMarkdown(content)
    
    // Render to terminal
    const output = renderProject(project, {
      width: process.stdout.columns || 100,
      showMetadata: true,
    })
    
    // Output to terminal
    console.log(output)
    
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
