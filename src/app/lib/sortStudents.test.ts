import { describe, it, expect } from 'vitest'
import { compareStudentsByFirstName } from './sortStudents'
import { Student } from './types'

const student = (name: string): Student => ({
  id: name,
  teacherId: 'teacher-abc',
  name,
  grade: '5',
  createdAt: '2026-01-01',
})

describe('compareStudentsByFirstName', () => {
  it('sorts by first name alphabetically', () => {
    const students = [student('Liam Chen'), student('Emma Thompson'), student('Ava Brown')]
    const sorted = [...students].sort(compareStudentsByFirstName)
    expect(sorted.map(s => s.name)).toEqual(['Ava Brown', 'Emma Thompson', 'Liam Chen'])
  })

  it('sorts already-minimized bulk-import names the same way, by first name', () => {
    const students = [student('Liam C.'), student('Emma T.'), student('Ava B.')]
    const sorted = [...students].sort(compareStudentsByFirstName)
    expect(sorted.map(s => s.name)).toEqual(['Ava B.', 'Emma T.', 'Liam C.'])
  })

  it('is case-insensitive', () => {
    const students = [student('liam Chen'), student('Emma Thompson')]
    const sorted = [...students].sort(compareStudentsByFirstName)
    expect(sorted.map(s => s.name)).toEqual(['Emma Thompson', 'liam Chen'])
  })

  it('breaks ties on the full name when first names match', () => {
    const students = [student('Emma Thompson'), student('Emma Ta.')]
    const sorted = [...students].sort(compareStudentsByFirstName)
    expect(sorted.map(s => s.name)).toEqual(['Emma Ta.', 'Emma Thompson'])
  })

  it('handles a bare single-word name', () => {
    const students = [student('Madonna'), student('Ava Brown')]
    const sorted = [...students].sort(compareStudentsByFirstName)
    expect(sorted.map(s => s.name)).toEqual(['Ava Brown', 'Madonna'])
  })
})
