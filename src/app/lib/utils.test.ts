import { describe, it, expect } from 'vitest'
import { formatStudentName } from './utils'

describe('formatStudentName', () => {
  it('formats a two-part name to first name + last initial', () => {
    expect(formatStudentName('Emma Thompson')).toBe('Emma T.')
  })

  it('uses the last part of a multi-part name for the initial', () => {
    expect(formatStudentName('Mary Jane Watson')).toBe('Mary W.')
  })

  it('returns a single-word name unchanged', () => {
    expect(formatStudentName('Cher')).toBe('Cher')
  })

  it('collapses extra whitespace between name parts', () => {
    expect(formatStudentName('  Emma   Thompson  ')).toBe('Emma T.')
  })

  it('uppercases a lowercase last initial', () => {
    expect(formatStudentName('emma thompson')).toBe('emma T.')
  })
})
