import { describe, it, expect } from 'vitest'
import { matchesScope } from './curriculumScope'

describe('matchesScope', () => {
  it('matches an unscoped (legacy) entry against any grade/school', () => {
    expect(matchesScope({}, '6', undefined)).toBe(true)
    expect(matchesScope({}, '8', 'school-a')).toBe(true)
  })

  it('matches a grade-scoped entry only for that grade', () => {
    expect(matchesScope({ grade: '6' }, '6', undefined)).toBe(true)
    expect(matchesScope({ grade: '6' }, '8', undefined)).toBe(false)
  })

  it('matches a school-scoped entry only for that school', () => {
    expect(matchesScope({ schoolId: 'school-a' }, '2', 'school-a')).toBe(true)
    expect(matchesScope({ schoolId: 'school-a' }, '2', 'school-b')).toBe(false)
    expect(matchesScope({ schoolId: 'school-a' }, '2', undefined)).toBe(false)
  })

  it('requires both grade and school to match when both are scoped', () => {
    const entry = { grade: '6', schoolId: 'school-a' }
    expect(matchesScope(entry, '6', 'school-a')).toBe(true)
    expect(matchesScope(entry, '6', 'school-b')).toBe(false)
    expect(matchesScope(entry, '7', 'school-a')).toBe(false)
  })
})
