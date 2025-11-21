/**
 * ANSI escape codes for terminal styling
 * Using basic 16-color palette for maximum compatibility
 */

export const ANSI = {
  // Reset
  reset: '\x1b[0m',
  
  // Text styles
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  
  // Foreground colors (basic 16-color)
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m',
  },
  
  // Background colors
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
  },
  
  // Screen control
  clearScreen: '\x1b[2J',
  clearLine: '\x1b[2K',
  cursorHome: '\x1b[H',
} as const

/**
 * Helper function to colorize text
 */
export function colorize(text: string, color: keyof typeof ANSI.fg, style?: 'bold' | 'dim'): string {
  const styleCode = style ? ANSI[style] : ''
  return `${styleCode}${ANSI.fg[color]}${text}${ANSI.reset}`
}

/**
 * Create a horizontal separator line
 */
export function separator(char = '─', width = 80): string {
  return ANSI.dim + char.repeat(width) + ANSI.reset
}

/**
 * Strip ANSI codes from string (for testing)
 */
export function stripAnsi(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1b\[[0-9;]*m/g, '')
}
