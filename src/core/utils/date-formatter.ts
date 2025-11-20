/**
 * Date formatter utility
 * 
 * Provides date formatting for project metadata.
 */

export function formatISODate(date: Date = new Date()): string {
  return date.toISOString().split('T')[0]
}

export function formatLastUpdated(date: Date = new Date()): string {
  return formatISODate(date)
}

export function parseDate(dateString: string): Date | null {
  try {
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? null : date
  } catch {
    return null
  }
}
