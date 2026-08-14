import { describe, it, expect, vi, afterEach } from 'vitest'
import type { Timestamp } from 'firebase/firestore'
import { getSchoolYearLockStatus } from './schoolYearLock'
import { TeacherProfile } from './types'

const fakeTimestamp = (date: Date): Timestamp => ({ toDate: () => date }) as unknown as Timestamp

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000
const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000

describe('getSchoolYearLockStatus', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns none when there is no profile', () => {
    expect(getSchoolYearLockStatus(null)).toEqual({ status: 'none', lockDate: null, archiveDate: null })
  })

  it('returns none when the profile has no schoolYearEndDate - the feature is a permanent no-op until set', () => {
    const profile = { updatedAt: '2026-01-01' } as TeacherProfile
    expect(getSchoolYearLockStatus(profile)).toEqual({ status: 'none', lockDate: null, archiveDate: null })
  })

  it('returns active before the 2-day lock grace period elapses', () => {
    const endDate = new Date('2026-06-30T23:59:59')
    vi.useFakeTimers()
    vi.setSystemTime(new Date(endDate.getTime() + TWO_DAYS_MS - 1000))

    const profile = { schoolYearEndDate: fakeTimestamp(endDate), updatedAt: '2026-01-01' } as TeacherProfile
    expect(getSchoolYearLockStatus(profile).status).toBe('active')
  })

  it('returns locked once the 2-day grace period has elapsed', () => {
    const endDate = new Date('2026-06-30T23:59:59')
    vi.useFakeTimers()
    vi.setSystemTime(new Date(endDate.getTime() + TWO_DAYS_MS + 1000))

    const profile = { schoolYearEndDate: fakeTimestamp(endDate), updatedAt: '2026-01-01' } as TeacherProfile
    expect(getSchoolYearLockStatus(profile).status).toBe('locked')
  })

  it('computes lockDate and archiveDate as exactly +2d/+90d from the end date', () => {
    const endDate = new Date('2026-06-30T23:59:59')
    const profile = { schoolYearEndDate: fakeTimestamp(endDate), updatedAt: '2026-01-01' } as TeacherProfile

    const result = getSchoolYearLockStatus(profile)
    expect(result.lockDate?.getTime()).toBe(endDate.getTime() + TWO_DAYS_MS)
    expect(result.archiveDate?.getTime()).toBe(endDate.getTime() + SIXTY_DAYS_MS)
  })
})
