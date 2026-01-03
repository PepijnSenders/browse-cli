/**
 * Utility functions for parsing numbers and text.
 */

/**
 * Parse numbers with K/M/B suffixes (common on social media).
 *
 * Examples:
 * - "12.5K" → 12500
 * - "1.2M" → 1200000
 * - "1,234" → 1234
 * - "5" → 5
 *
 * @param text - The text to parse (e.g., "12.5K", "1.2M", "1,234")
 * @returns The parsed number, or 0 if parsing fails
 */
export function parseNumber(text: string): number {
  if (!text || typeof text !== 'string') {
    return 0;
  }

  const cleaned = text.replace(/,/g, '').trim();

  if (cleaned.endsWith('K') || cleaned.endsWith('k')) {
    const number = parseFloat(cleaned.slice(0, -1));
    return isNaN(number) ? 0 : Math.round(number * 1000);
  }

  if (cleaned.endsWith('M') || cleaned.endsWith('m')) {
    const number = parseFloat(cleaned.slice(0, -1));
    return isNaN(number) ? 0 : Math.round(number * 1_000_000);
  }

  if (cleaned.endsWith('B') || cleaned.endsWith('b')) {
    const number = parseFloat(cleaned.slice(0, -1));
    return isNaN(number) ? 0 : Math.round(number * 1_000_000_000);
  }

  const number = parseInt(cleaned, 10);
  return isNaN(number) ? 0 : number;
}

/**
 * Parse a relative date string (e.g., "2h", "5m", "1d").
 *
 * Examples:
 * - "2h" → 2 hours ago
 * - "5m" → 5 minutes ago
 * - "1d" → 1 day ago
 * - "Jan 15, 2023" → January 15, 2023
 *
 * @param text - The date text
 * @returns ISO 8601 date string, or null if parsing fails
 */
export function parseRelativeDate(text: string): string | null {
  if (!text || typeof text !== 'string') {
    return null;
  }

  const cleaned = text.trim();

  // Relative time (e.g., "2h", "5m", "1d")
  const relativeMatch = cleaned.match(/^(\d+)([smhd])$/);
  if (relativeMatch) {
    const amount = parseInt(relativeMatch[1], 10);
    const unit = relativeMatch[2];

    const now = new Date();
    switch (unit) {
      case 's':
        now.setSeconds(now.getSeconds() - amount);
        break;
      case 'm':
        now.setMinutes(now.getMinutes() - amount);
        break;
      case 'h':
        now.setHours(now.getHours() - amount);
        break;
      case 'd':
        now.setDate(now.getDate() - amount);
        break;
    }

    return now.toISOString();
  }

  // Try parsing as a standard date
  try {
    const date = new Date(cleaned);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  } catch {
    // Fall through
  }

  return null;
}

/**
 * Clean and normalize whitespace in text.
 *
 * @param text - The text to clean
 * @returns Cleaned text with normalized whitespace
 */
export function cleanText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .replace(/[ \t]+/g, ' ') // Replace multiple spaces/tabs with single space (preserve newlines)
    .replace(/\n\s*\n+/g, '\n') // Replace multiple newlines with single newline
    .trim();
}

/**
 * Truncate text to a maximum length with ellipsis.
 *
 * @param text - The text to truncate
 * @param maxLength - Maximum length (including ellipsis)
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength - 3) + '...';
}
