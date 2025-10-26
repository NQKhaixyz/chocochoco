/**
 * Time formatting utilities for countdown and timestamps
 */

export interface TimeComponents {
  days: number
  hours: number
  minutes: number
  seconds: number
  totalSeconds: number
}

/**
 * Convert seconds to time components
 */
export function secondsToComponents(totalSeconds: number): TimeComponents {
  const seconds = totalSeconds % 60
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const days = Math.floor(totalSeconds / 86400)
  
  return { days, hours, minutes, seconds, totalSeconds }
}

/**
 * Format seconds to HH:MM:SS or MM:SS
 * @param seconds - Total seconds
 * @param options - Formatting options
 */
export function formatCountdown(
  seconds: number,
  options: {
    showHours?: boolean
    showDays?: boolean
    alwaysShowHours?: boolean
  } = {}
): string {
  const { showDays = false, alwaysShowHours = false } = options
  const components = secondsToComponents(Math.max(0, seconds))
  
  if (showDays && components.days > 0) {
    return `${components.days}d ${components.hours.toString().padStart(2, '0')}:${components.minutes.toString().padStart(2, '0')}:${components.seconds.toString().padStart(2, '0')}`
  }
  
  if (alwaysShowHours || components.hours > 0) {
    return `${components.hours.toString().padStart(2, '0')}:${components.minutes.toString().padStart(2, '0')}:${components.seconds.toString().padStart(2, '0')}`
  }
  
  return `${components.minutes.toString().padStart(2, '0')}:${components.seconds.toString().padStart(2, '0')}`
}

/**
 * Format seconds to human-readable string
 * Example: "2 hours 30 minutes", "45 seconds"
 */
export function formatHumanReadable(seconds: number): string {
  const components = secondsToComponents(Math.max(0, seconds))
  const parts: string[] = []
  
  if (components.days > 0) {
    parts.push(`${components.days} day${components.days !== 1 ? 's' : ''}`)
  }
  if (components.hours > 0) {
    parts.push(`${components.hours} hour${components.hours !== 1 ? 's' : ''}`)
  }
  if (components.minutes > 0) {
    parts.push(`${components.minutes} minute${components.minutes !== 1 ? 's' : ''}`)
  }
  if (components.seconds > 0 || parts.length === 0) {
    parts.push(`${components.seconds} second${components.seconds !== 1 ? 's' : ''}`)
  }
  
  return parts.slice(0, 2).join(' ') // Show max 2 units
}

/**
 * Format unix timestamp to local date string
 */
export function formatTimestamp(
  unixSeconds: number,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const date = new Date(unixSeconds * 1000)
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }
  return date.toLocaleString(undefined, defaultOptions)
}

/**
 * Get time difference in seconds between two timestamps
 */
export function getTimeDiff(endTs: number, startTs?: number): number {
  const start = startTs ?? Math.floor(Date.now() / 1000)
  return Math.max(0, endTs - start)
}

/**
 * Check if timestamp is in the past
 */
export function isExpired(unixSeconds: number, now?: number): boolean {
  const currentTime = now ?? Math.floor(Date.now() / 1000)
  return unixSeconds < currentTime
}

/**
 * Check if timestamp is within a window
 */
export function isInWindow(
  unixSeconds: number,
  startTs: number,
  endTs: number
): boolean {
  return unixSeconds >= startTs && unixSeconds <= endTs
}

/**
 * Format for display in UI - compact version
 */
export function formatCompact(seconds: number): string {
  const components = secondsToComponents(Math.max(0, seconds))
  
  if (components.days > 0) {
    return `${components.days}d ${components.hours}h`
  }
  if (components.hours > 0) {
    return `${components.hours}h ${components.minutes}m`
  }
  if (components.minutes > 0) {
    return `${components.minutes}m ${components.seconds}s`
  }
  return `${components.seconds}s`
}
