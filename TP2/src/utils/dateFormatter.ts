/**
 * Date formatting utilities with Buenos Aires timezone (GMT-3)
 */

/**
 * Formats a date string to Buenos Aires timezone
 * @param dateStr - ISO date string from the API
 * @param locale - Locale code (es-AR or en-US)
 * @returns Formatted date string
 */
export const formatDateBuenosAires = (dateStr: string, locale: string = 'es-AR'): string => {
  if (!dateStr) return '-'
  
  // Parse the date string (assuming it comes from the API in UTC or local format)
  const date = new Date(dateStr)
  
  // Format with Buenos Aires timezone (America/Argentina/Buenos_Aires)
  return date.toLocaleString(locale, { 
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Formats a date string to only show the date (no time) in Buenos Aires timezone
 * @param dateStr - ISO date string from the API
 * @param locale - Locale code (es-AR or en-US)
 * @returns Formatted date string
 */
export const formatDateOnlyBuenosAires = (dateStr: string, locale: string = 'es-AR'): string => {
  if (!dateStr) return '-'
  
  const date = new Date(dateStr)
  
  return date.toLocaleDateString(locale, { 
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  })
}

/**
 * Formats a date string to only show the time in Buenos Aires timezone
 * @param dateStr - ISO date string from the API
 * @param locale - Locale code (es-AR or en-US)
 * @returns Formatted time string
 */
export const formatTimeOnlyBuenosAires = (dateStr: string, locale: string = 'es-AR'): string => {
  if (!dateStr) return '-'
  
  const date = new Date(dateStr)
  
  return date.toLocaleTimeString(locale, { 
    timeZone: 'America/Argentina/Buenos_Aires',
    hour: '2-digit',
    minute: '2-digit'
  })
}
