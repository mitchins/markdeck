/**
 * Metadata extractor for STATUS.md files
 * 
 * Extracts project metadata (title, version, lastUpdated) from markdown content.
 */

import type { ProjectMetadata } from '../domain/types'

export function extractMetadata(lines: string[]): ProjectMetadata {
  const metadata: ProjectMetadata = {
    title: 'Untitled Project',
  }
  
  // Only check first 10 lines for metadata
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i]
    
    // Extract H1 title
    if (line.startsWith('# ')) {
      metadata.title = line.replace(/^#\s+/, '').trim()
    }
    
    // Extract last updated date
    if (line.includes('Last Updated:')) {
      const dateMatch = line.match(/Last Updated:.*?(\d{4}-\d{2}-\d{2})/)
      if (dateMatch) {
        metadata.lastUpdated = dateMatch[1].trim()
      }
    }
    
    // Extract version
    if (line.includes('Version:')) {
      const versionMatch = line.match(/Version:\s*(.+)/)
      if (versionMatch) {
        metadata.version = versionMatch[1].trim()
      }
    }
  }
  
  return metadata
}
