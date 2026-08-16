import { describe, it, expect, vi, beforeEach } from 'vitest'

// This suite exists to guard the one thing that must never regress: every
// read/write in storage.ts is scoped to the signed-in teacher's uid. This is
// what stands between one teacher's roster and another's - see the
// firestore.rules server-side enforcement of the same invariant.

const { mockAuth } = vi.hoisted(() => ({
  mockAuth: { currentUser: null as { uid: string } | null },
}))

vi.mock('../../firebase', () => ({
  auth: mockAuth,
  db: {},
  functions: {},
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((_db: unknown, name: string) => ({ __type: 'collection', name })),
  query: vi.fn((...args: unknown[]) => ({ __type: 'query', args })),
  where: vi.fn((field: string, op: string, value: unknown) => ({ __type: 'where', field, op, value })),
  getDocs: vi.fn(async () => ({ docs: [] })),
  addDoc: vi.fn(async () => ({ id: 'new-doc-id' })),
  deleteDoc: vi.fn(async () => undefined),
  doc: vi.fn((_db: unknown, col: string, id: string) => ({ __type: 'doc', col, id })),
  setDoc: vi.fn(async () => undefined),
  getDoc: vi.fn(async () => ({ exists: () => false, data: () => undefined })),
  updateDoc: vi.fn(async () => undefined),
  deleteField: vi.fn(() => '__deleteField__'),
}))

vi.mock('firebase/functions', () => ({
  httpsCallable: vi.fn(() => vi.fn(async () => ({ data: undefined }))),
}))

import { where, addDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore'
import * as storage from './storage'

describe('storage.ts teacher scoping', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.currentUser = null
  })

  describe('when signed out', () => {
    it('getStudents throws instead of returning unscoped data', async () => {
      await expect(storage.getStudents()).rejects.toThrow('Not signed in')
    })

    it('saveStudent throws instead of writing an unowned document', async () => {
      await expect(
        storage.saveStudent({ id: 'x', name: 'Test', grade: '5', createdAt: '2026-01-01' })
      ).rejects.toThrow('Not signed in')
    })

    it('getObservationsByStudent throws', async () => {
      await expect(storage.getObservationsByStudent('student-1')).rejects.toThrow('Not signed in')
    })

    it('getEvaluationsByStudent throws', async () => {
      await expect(storage.getEvaluationsByStudent('student-1')).rejects.toThrow('Not signed in')
    })

    it('deleteObservation has no client-side auth check - ownership is enforced by firestore.rules instead', async () => {
      // Documents an intentional asymmetry: every other operation here checks
      // auth.currentUser client-side AND is enforced server-side. Delete only
      // relies on firestore.rules. If this test starts failing because someone
      // added a client-side check, update firestore.rules to match rather than
      // assuming the old rules are still correct.
      await expect(storage.deleteObservation({ id: 'obs-1' })).resolves.toBeUndefined()
    })
  })

  describe('when signed in', () => {
    beforeEach(() => {
      mockAuth.currentUser = { uid: 'teacher-abc' }
    })

    it('getStudents filters by the signed-in teacher\'s uid', async () => {
      await storage.getStudents()
      expect(where).toHaveBeenCalledWith('teacherId', '==', 'teacher-abc')
    })

    it('saveStudent stamps the document with the signed-in teacher\'s uid', async () => {
      await storage.saveStudent({ id: 'x', name: 'Test', grade: '5', createdAt: '2026-01-01' })
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ teacherId: 'teacher-abc' })
      )
    })

    it('a caller cannot override teacherId on save - it is always stamped from the session', async () => {
      await storage.saveStudent({
        id: 'x',
        name: 'Test',
        grade: '5',
        createdAt: '2026-01-01',
        // @ts-expect-error - teacherId is intentionally excluded from the input type
        teacherId: 'someone-elses-uid',
      })
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ teacherId: 'teacher-abc' })
      )
    })

    it('getObservationsByStudent filters by both teacherId and studentId', async () => {
      await storage.getObservationsByStudent('student-1')
      expect(where).toHaveBeenCalledWith('teacherId', '==', 'teacher-abc')
      expect(where).toHaveBeenCalledWith('studentId', '==', 'student-1')
    })

    it('getEvaluationsByStudent filters by both teacherId and studentId', async () => {
      await storage.getEvaluationsByStudent('student-1')
      expect(where).toHaveBeenCalledWith('teacherId', '==', 'teacher-abc')
      expect(where).toHaveBeenCalledWith('studentId', '==', 'student-1')
    })

    it('saveObservation stamps the document with the signed-in teacher\'s uid', async () => {
      await storage.saveObservation({
        id: 'obs-1',
        studentId: 'student-1',
        type: 'text',
        content: 'x',
        timestamp: '2026-01-01',
        tags: [],
      })
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ teacherId: 'teacher-abc' })
      )
    })

    it('saveObservation includes performanceLevel when set, and strips it when absent', async () => {
      await storage.saveObservation({
        id: 'obs-2',
        studentId: 'student-1',
        type: 'text',
        content: 'x',
        timestamp: '2026-01-01',
        tags: [],
        performanceLevel: 'meets-expectations',
      })
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ performanceLevel: 'meets-expectations' })
      )

      await storage.saveObservation({
        id: 'obs-3',
        studentId: 'student-1',
        type: 'text',
        content: 'x',
        timestamp: '2026-01-01',
        tags: [],
      })
      expect(vi.mocked(addDoc).mock.calls.at(-1)?.[1]).not.toHaveProperty('performanceLevel')
    })

    it('saveEvaluation stamps the document with the signed-in teacher\'s uid', async () => {
      await storage.saveEvaluation({
        id: 'eval-1',
        studentId: 'student-1',
        generatedText: 'x',
        strengths: [],
        areasForImprovement: [],
        date: '2026-01-01',
      })
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ teacherId: 'teacher-abc' })
      )
    })

    // Teachers don't carry a roster between school years - see
    // schoolYearLockdownSweep - so getStudents()'s default meaning of "my
    // students" excludes anything the sweep has archived, without every
    // picker screen needing to remember to filter it out itself.
    it('getStudents filters out archived students', async () => {
      vi.mocked(getDocs).mockResolvedValueOnce({
        docs: [
          { id: 's1', data: () => ({ teacherId: 'teacher-abc', name: 'Active Student', grade: '5', createdAt: '2026-01-01' }) },
          { id: 's2', data: () => ({ teacherId: 'teacher-abc', name: 'Old Student', grade: '5', createdAt: '2025-01-01', archived: true }) },
        ],
      } as never)

      const result = await storage.getStudents()
      expect(result.map(s => s.id)).toEqual(['s1'])
    })

    it('getArchivedStudents returns only archived students', async () => {
      vi.mocked(getDocs).mockResolvedValueOnce({
        docs: [
          { id: 's1', data: () => ({ teacherId: 'teacher-abc', name: 'Active Student', grade: '5', createdAt: '2026-01-01' }) },
          { id: 's2', data: () => ({ teacherId: 'teacher-abc', name: 'Old Student', grade: '5', createdAt: '2025-01-01', archived: true }) },
        ],
      } as never)

      const result = await storage.getArchivedStudents()
      expect(result.map(s => s.id)).toEqual(['s2'])
    })

    it('saveTeacherProfile passes schoolYearEndDate through untouched', async () => {
      const fakeTimestamp = { seconds: 1, nanoseconds: 0 } as never
      await storage.saveTeacherProfile({ schoolYearEndDate: fakeTimestamp })
      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ schoolYearEndDate: fakeTimestamp }),
        expect.anything()
      )
    })

    it('clearSchoolYearEndDate clears the field via the deleteField() sentinel, not a stored null', async () => {
      await storage.clearSchoolYearEndDate()
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ schoolYearEndDate: '__deleteField__' })
      )
    })
  })
})
