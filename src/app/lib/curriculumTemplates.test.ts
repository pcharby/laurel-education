import { describe, it, expect } from 'vitest'
import { getCurriculumTemplate } from './curriculumTemplates'

describe('getCurriculumTemplate', () => {
  it('matches a known subject case-insensitively', () => {
    expect(getCurriculumTemplate('mathematics')?.strands).toContain('Number Sense')
    expect(getCurriculumTemplate('MATHEMATICS')?.strands).toContain('Number Sense')
  })

  it('matches with surrounding whitespace trimmed', () => {
    expect(getCurriculumTemplate('  Science  ')?.rubrics).toContain('Scientific Inquiry')
  })

  it('returns undefined for a subject with no template', () => {
    expect(getCurriculumTemplate('Advanced Robotics')).toBeUndefined()
  })

  it('every template has at least one strand and one rubric', () => {
    for (const subject of ['Mathematics', 'Science', 'Language Arts', 'French', 'Music', 'Art']) {
      const template = getCurriculumTemplate(subject)
      expect(template?.strands.length).toBeGreaterThan(0)
      expect(template?.rubrics.length).toBeGreaterThan(0)
    }
  })
})
