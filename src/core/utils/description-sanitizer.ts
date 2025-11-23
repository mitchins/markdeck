/**
 * Description sanitizer for card descriptions
 * 
 * Prevents markdown patterns in descriptions that would be parsed as new swimlanes or cards
 * when the STATUS.md file is reloaded.
 */

/**
 * Sanitizes a description to prevent it from being parsed as swimlanes or cards
 * when the file is reloaded.
 * 
 * Problematic patterns:
 * - H2/H3 headings at start of line (## or ###) - would create new swimlanes
 * - Bullet points with status emojis/checkboxes at start of line - would create new cards
 * 
 * @param description - The raw description text from user input
 * @returns Sanitized description safe for use in STATUS.md
 */
export function sanitizeDescription(description: string): string {
  if (!description) return description
  
  const lines = description.split('\n')
  const sanitizedLines = lines.map(line => {
    // Escape H2/H3 headings by adding a space before them
    // This prevents them from being parsed as swimlane headers
    if (line.trim().match(/^#{2,3}\s+/)) {
      return ' ' + line.trim()
    }
    
    // Escape bullet points that start with status emojis or checkboxes
    // Pattern: `- 🔵`, `- 🟡`, `- 🔴`, `- 🟧`, `- 🟢`, `- [ ]`, `- [x]`, `- [X]`
    if (line.trim().match(/^-\s+([🔵🟡🔴🟧🟢]|\[[xX\s]\])/u)) {
      return ' ' + line.trim()
    }
    
    return line
  })
  
  return sanitizedLines.join('\n')
}

/**
 * Checks if a description contains problematic markdown patterns
 * 
 * @param description - The description to check
 * @returns Object with validation result and list of issues found
 */
export function validateDescription(description: string): {
  isValid: boolean
  issues: string[]
} {
  if (!description) return { isValid: true, issues: [] }
  
  const issues: string[] = []
  const lines = description.split('\n')
  
  lines.forEach((line, index) => {
    // Check for H2/H3 headings
    if (line.trim().match(/^#{2,3}\s+/)) {
      issues.push(`Line ${index + 1}: Heading markers (## or ###) will create a new swimlane`)
    }
    
    // Check for bullet points with status emojis/checkboxes
    if (line.trim().match(/^-\s+([🔵🟡🔴🟧🟢]|\[[xX\s]\])/u)) {
      issues.push(`Line ${index + 1}: Bullet point with status emoji/checkbox will create a new card`)
    }
  })
  
  return {
    isValid: issues.length === 0,
    issues,
  }
}
