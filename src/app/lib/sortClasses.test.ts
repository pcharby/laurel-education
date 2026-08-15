import { describe, it, expect } from 'vitest'
import { compareClasses } from './sortClasses'
import { SchoolClass } from './types'

const cls = (subject: string, grade: string, name?: string): SchoolClass => ({
  id: `${subject}-${grade}-${name ?? ''}`,
  teacherId: 'teacher-abc',
  subject,
  grade,
  name,
  createdAt: '2026-01-01',
})

describe('compareClasses', () => {
  it('sorts grades numerically, not alphabetically (10 after 9, not before)', () => {
    const classes = [cls('English', '10'), cls('English', '12'), cls('English', '11'), cls('English', '9')]
    const sorted = [...classes].sort(compareClasses)
    expect(sorted.map(c => c.grade)).toEqual(['9', '10', '11', '12'])
  })

  it('sorts K before all numeric grades', () => {
    const classes = [cls('Mathematics', '1'), cls('Mathematics', 'K')]
    const sorted = [...classes].sort(compareClasses)
    expect(sorted.map(c => c.grade)).toEqual(['K', '1'])
  })

  it('groups by subject alphabetically before grade', () => {
    const classes = [cls('Science', '7'), cls('Mathematics', '8'), cls('Mathematics', '6')]
    const sorted = [...classes].sort(compareClasses)
    expect(sorted.map(c => `${c.subject} ${c.grade}`)).toEqual(['Mathematics 6', 'Mathematics 8', 'Science 7'])
  })

  it('breaks ties on section name for same subject and grade', () => {
    const classes = [cls('Mathematics', '6', 'Period 3'), cls('Mathematics', '6', 'Period 1')]
    const sorted = [...classes].sort(compareClasses)
    expect(sorted.map(c => c.name)).toEqual(['Period 1', 'Period 3'])
  })
})
