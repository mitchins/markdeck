/**
 * Input handler for TUI
 * 
 * Handles raw keyboard input without external dependencies
 */

import { stdin as input } from 'node:process'

export type KeyPress = {
  name: string
  ctrl: boolean
  shift: boolean
}

export type InputCallback = (key: KeyPress) => void

/**
 * Setup raw input mode and keyboard handling
 */
export function setupInput(callback: InputCallback): () => void {
  // Enable raw mode
  if (input.isTTY) {
    input.setRawMode(true)
  }
  input.resume()
  input.setEncoding('utf8')
  
  const listener = (data: string) => {
    const key = parseKey(data)
    if (key) {
      callback(key)
    }
  }
  
  input.on('data', listener)
  
  // Return cleanup function
  return () => {
    input.removeListener('data', listener)
    if (input.isTTY) {
      input.setRawMode(false)
    }
    input.pause()
  }
}

/**
 * Parse raw input data into key press events
 */
function parseKey(data: string): KeyPress | null {
  const byte = data.charCodeAt(0)
  
  // Ctrl+C
  if (byte === 3) {
    return { name: 'c', ctrl: true, shift: false }
  }
  
  // ESC or arrow keys
  if (byte === 27) {
    if (data.length === 1) {
      return { name: 'escape', ctrl: false, shift: false }
    }
    
    // Arrow keys: ESC [ A/B/C/D
    if (data.length === 3 && data[1] === '[') {
      const code = data[2]
      if (code === 'A') return { name: 'up', ctrl: false, shift: false }
      if (code === 'B') return { name: 'down', ctrl: false, shift: false }
      if (code === 'C') return { name: 'right', ctrl: false, shift: false }
      if (code === 'D') return { name: 'left', ctrl: false, shift: false }
    }
    
    // Shift+Arrow keys: ESC [ 1 ; 2 A/B/C/D
    if (data.length === 6 && data.startsWith('\x1b[1;2')) {
      const code = data[5]
      if (code === 'A') return { name: 'up', ctrl: false, shift: true }
      if (code === 'B') return { name: 'down', ctrl: false, shift: true }
      if (code === 'C') return { name: 'right', ctrl: false, shift: true }
      if (code === 'D') return { name: 'left', ctrl: false, shift: true }
    }
    
    return null
  }
  
  // Regular characters
  if (data.length === 1) {
    return { name: data, ctrl: false, shift: false }
  }
  
  return null
}
