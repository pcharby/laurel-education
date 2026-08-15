import { describe, it, expect } from 'vitest'
import { resolveBulkImportNames } from './bulkImportNames'

describe('resolveBulkImportNames', () => {
  it('reduces a plain full name to first name + last initial', () => {
    expect(resolveBulkImportNames(['Emma Thompson'])).toEqual(['Emma T.'])
  })

  it('leaves unrelated names untouched', () => {
    expect(resolveBulkImportNames(['Emma Thompson', 'Liam Chen'])).toEqual(['Emma T.', 'Liam C.'])
  })

  it('escalates the last-name prefix only for students colliding on first name + last initial', () => {
    const result = resolveBulkImportNames(['Emma Thompson', 'Emma Taylor', 'Liam Chen'])
    expect(result).toEqual(['Emma Th.', 'Emma Ta.', 'Liam C.'])
  })

  it('escalates multiple letters when a short prefix still collides', () => {
    // Thompson vs Thomas: "Th", "Tho", "Thom" all still match; "Thomp" vs "Thoma" finally differ.
    const result = resolveBulkImportNames(['Emma Thompson', 'Emma Thomas'])
    expect(result).toEqual(['Emma Thomp.', 'Emma Thoma.'])
  })

  it('falls back to a numeric suffix for true duplicate names', () => {
    const result = resolveBulkImportNames(['Emma Thompson', 'Emma Thompson'])
    expect(result).toEqual(['Emma Thompson. (1)', 'Emma Thompson. (2)'])
  })

  it('is case-insensitive when detecting collisions, but preserves each name\'s own casing', () => {
    const result = resolveBulkImportNames(['emma thompson', 'EMMA TAYLOR'])
    expect(result).toEqual(['emma th.', 'EMMA TA.'])
  })

  it('handles a bare single-word name with no last name', () => {
    expect(resolveBulkImportNames(['Madonna'])).toEqual(['Madonna'])
  })

  it('disambiguates duplicate bare first names with no last name via numeric suffix', () => {
    const result = resolveBulkImportNames(['Madonna', 'Madonna'])
    expect(result).toEqual(['Madonna (1)', 'Madonna (2)'])
  })

  it('is order-preserving across the full roster', () => {
    const result = resolveBulkImportNames(['Liam Chen', 'Emma Thompson', 'Emma Taylor'])
    expect(result).toEqual(['Liam C.', 'Emma Th.', 'Emma Ta.'])
  })
})
