/**
 * Date formatter utility
 *
 * Provides date formatting for project metadata.
 */
export function formatISODate(date = new Date()) {
    return date.toISOString().split('T')[0];
}
export function formatLastUpdated(date = new Date()) {
    return formatISODate(date);
}
export function parseDate(dateString) {
    try {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date;
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=date-formatter.js.map