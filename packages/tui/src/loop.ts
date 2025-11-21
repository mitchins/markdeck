/**
 * Main run loop for TUI
 * 
 * Handles the persistent UI loop with rendering and input
 */

import { writeFile } from 'node:fs/promises'
import type { Project } from '../../../src/core/domain/types.js'
import { renderProject } from './renderer.js'
import { setupInput, type KeyPress } from './input.js'
import { moveCardToLane, toggleCardBlocked, navigateCard, getAllCardsOrdered } from './actions.js'
import { serializeProject } from '../../../src/core/parsers/markdown-serializer.js'

interface LoopState {
  project: Project
  filePath: string
  selectedCardId: string | null
  running: boolean
}

/**
 * Start the interactive TUI loop
 */
export async function startLoop(project: Project, filePath: string): Promise<void> {
  const state: LoopState = {
    project,
    filePath,
    selectedCardId: null,
    running: true,
  }
  
  // Select first card by default
  const orderedCards = getAllCardsOrdered(project)
  if (orderedCards.length > 0) {
    state.selectedCardId = orderedCards[0].id
  }
  
  // Initial render
  render(state)
  
  // Setup input handling
  const cleanup = setupInput((key) => handleInput(state, key))
  
  // Wait for exit
  await new Promise<void>((resolve) => {
    const checkInterval = setInterval(() => {
      if (!state.running) {
        clearInterval(checkInterval)
        cleanup()
        resolve()
      }
    }, 100)
  })
}

/**
 * Handle keyboard input
 */
function handleInput(state: LoopState, key: KeyPress): void {
  // Exit on q or Ctrl+C
  if (key.name === 'q' || (key.ctrl && key.name === 'c')) {
    state.running = false
    // Clear screen on exit
    console.log('\x1b[2J\x1b[H')
    return
  }
  
  // Navigation
  if (key.name === 'up' && !key.shift) {
    state.selectedCardId = navigateCard(state.project, state.selectedCardId, 'up')
    render(state)
    return
  }
  
  if (key.name === 'down' && !key.shift) {
    state.selectedCardId = navigateCard(state.project, state.selectedCardId, 'down')
    render(state)
    return
  }
  
  // Lane mutations (Shift+Left/Right)
  if (key.name === 'left' && key.shift && state.selectedCardId) {
    state.project = moveCardToLane(state.project, state.selectedCardId, 'left')
    saveAndRender(state)
    return
  }
  
  if (key.name === 'right' && key.shift && state.selectedCardId) {
    state.project = moveCardToLane(state.project, state.selectedCardId, 'right')
    saveAndRender(state)
    return
  }
  
  // Toggle blocked (b key)
  if (key.name === 'b' && !key.shift && !key.ctrl && state.selectedCardId) {
    state.project = toggleCardBlocked(state.project, state.selectedCardId)
    saveAndRender(state)
    return
  }
}

/**
 * Render the current state
 */
function render(state: LoopState): void {
  const output = renderProject(state.project, {
    width: process.stdout.columns || 100,
    showMetadata: true,
    highlightedCard: state.selectedCardId || undefined,
  })
  
  process.stdout.write(output)
}

/**
 * Save changes to file and re-render
 */
function saveAndRender(state: LoopState): void {
  // Serialize and save asynchronously
  const markdown = serializeProject(state.project)
  writeFile(state.filePath, markdown, 'utf-8').catch((error) => {
    // Show error but don't crash
    console.error('Error saving file:', error)
  })
  
  // Update the rawMarkdown in project
  state.project = {
    ...state.project,
    rawMarkdown: markdown,
  }
  
  render(state)
}
