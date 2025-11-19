import { describe, it, expect } from 'vitest'
import { formatRelativeTime } from '../date'

describe('formatRelativeTime', () => {
  it('should format a recent date', () => {
    const date = new Date()
    date.setMinutes(date.getMinutes() - 5)
    const result = formatRelativeTime(date.toISOString())
    // date-fns returns English by default, so we check for common time words
    expect(result).toMatch(/ago|hace|minute|hour|day/i)
  })

  it('should handle invalid date strings', () => {
    const result = formatRelativeTime('invalid-date')
    expect(result).toBe('Fecha desconocida')
  })

  it('should handle valid ISO date strings', () => {
    const date = new Date('2024-01-01T00:00:00Z')
    const result = formatRelativeTime(date.toISOString())
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})

