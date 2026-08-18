// Automates the manual verification step the Incident Response Plan already
// calls for ("attempt the previously-possible unauthorized read/write from a
// second test account") so a future rules regression fails CI instead of
// waiting for live discovery. Requires the Firestore + Storage emulators -
// run via `npm run test:rules` (wraps this in `firebase emulators:exec`),
// never as part of the plain `npm run test` unit suite.
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  Timestamp,
} from 'firebase/firestore';
import {
  ref as storageRef,
  uploadBytes,
  getBytes,
  deleteObject,
} from 'firebase/storage';

const TEACHER_A = 'teacher-a';
const TEACHER_B = 'teacher-b';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-laurel-rules-test',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
      host: 'localhost',
      port: 8080,
    },
    storage: {
      rules: readFileSync('storage.rules', 'utf8'),
      host: 'localhost',
      port: 9199,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

afterEach(async () => {
  await testEnv.clearFirestore();
  await testEnv.clearStorage();
});

async function seed(path: string, data: Record<string, unknown>): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), path), data);
  });
}

// The four owner-scoped, lockable collections share the exact rule shape:
// read/delete: owns existing; update: owns existing && !locked; create: owns
// incoming && !locked. Parametrized so a shape bug shows up on all four
// rather than needing four near-identical hand-written blocks.
const LOCKABLE_COLLECTIONS = ['classes', 'students', 'observations'] as const;

describe.each(LOCKABLE_COLLECTIONS)('%s - cross-teacher isolation', (collectionName) => {
  it("teacher A cannot read teacher B's document", async () => {
    await seed(`${collectionName}/doc1`, { teacherId: TEACHER_B, grade: '5', createdAt: '2026-01-01' });
    const a = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertFails(getDoc(doc(a, collectionName, 'doc1')));
  });

  it("teacher A cannot update teacher B's document", async () => {
    await seed(`${collectionName}/doc1`, { teacherId: TEACHER_B, grade: '5', createdAt: '2026-01-01' });
    const a = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertFails(updateDoc(doc(a, collectionName, 'doc1'), { grade: '6' }));
  });

  it("teacher A cannot delete teacher B's document", async () => {
    await seed(`${collectionName}/doc1`, { teacherId: TEACHER_B, grade: '5', createdAt: '2026-01-01' });
    const a = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertFails(deleteDoc(doc(a, collectionName, 'doc1')));
  });

  it('teacher A can read/update/delete their own document', async () => {
    await seed(`${collectionName}/doc1`, { teacherId: TEACHER_A, grade: '5', createdAt: '2026-01-01' });
    const a = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertSucceeds(getDoc(doc(a, collectionName, 'doc1')));
    await assertSucceeds(updateDoc(doc(a, collectionName, 'doc1'), { grade: '6' }));
    await assertSucceeds(deleteDoc(doc(a, collectionName, 'doc1')));
  });

  it("cannot create a document spoofing another teacher's id", async () => {
    const a = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertFails(
      addDoc(collection(a, collectionName), { teacherId: TEACHER_B, grade: '5', createdAt: '2026-01-01' })
    );
  });

  it('unauthenticated requests are denied entirely', async () => {
    await seed(`${collectionName}/doc1`, { teacherId: TEACHER_A, grade: '5', createdAt: '2026-01-01' });
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(anon, collectionName, 'doc1')));
  });

  it('unauthenticated create is denied too, not just read', async () => {
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertFails(
      addDoc(collection(anon, collectionName), { teacherId: TEACHER_A, grade: '5', createdAt: '2026-01-01' })
    );
  });

  it('denies create once the teacher is school-year locked', async () => {
    await seed(`teacherProfiles/${TEACHER_A}`, {
      schoolYearEndDate: Timestamp.fromMillis(Date.now() - 10 * 24 * 60 * 60 * 1000),
    });
    const a = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertFails(
      addDoc(collection(a, collectionName), { teacherId: TEACHER_A, grade: '5', createdAt: '2026-01-01' })
    );
  });

  it('denies update once the teacher is school-year locked, on a doc created before the lock', async () => {
    await seed(`${collectionName}/doc1`, { teacherId: TEACHER_A, grade: '5', createdAt: '2026-01-01' });
    await seed(`teacherProfiles/${TEACHER_A}`, {
      schoolYearEndDate: Timestamp.fromMillis(Date.now() - 10 * 24 * 60 * 60 * 1000),
    });
    const a = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertFails(updateDoc(doc(a, collectionName, 'doc1'), { grade: '6' }));
  });
});

describe('schools - ownsExisting/ownsIncoming scoping, never lock-gated', () => {
  it("teacher A cannot read, update, or delete teacher B's school", async () => {
    await seed('schools/school1', { teacherId: TEACHER_B, name: 'Lincoln Elementary' });
    const a = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertFails(getDoc(doc(a, 'schools', 'school1')));
    await assertFails(updateDoc(doc(a, 'schools', 'school1'), { name: 'Hijacked' }));
    await assertFails(deleteDoc(doc(a, 'schools', 'school1')));
  });

  it('teacher A can read/update/delete their own school', async () => {
    await seed('schools/school1', { teacherId: TEACHER_A, name: 'Lincoln Elementary' });
    const a = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertSucceeds(getDoc(doc(a, 'schools', 'school1')));
    await assertSucceeds(updateDoc(doc(a, 'schools', 'school1'), { name: 'Renamed Elementary' }));
    await assertSucceeds(deleteDoc(doc(a, 'schools', 'school1')));
  });

  it("cannot create a school spoofing another teacher's id", async () => {
    const a = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertFails(addDoc(collection(a, 'schools'), { teacherId: TEACHER_B, name: 'Spoofed' }));
  });

  it('unauthenticated requests are denied entirely', async () => {
    await seed('schools/school1', { teacherId: TEACHER_A, name: 'Lincoln Elementary' });
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(anon, 'schools', 'school1')));
  });

  it('stays writable even once the teacher is school-year locked - structural data, not annual classroom content', async () => {
    await seed('schools/school1', { teacherId: TEACHER_A, name: 'Lincoln Elementary' });
    await seed(`teacherProfiles/${TEACHER_A}`, {
      schoolYearEndDate: Timestamp.fromMillis(Date.now() - 10 * 24 * 60 * 60 * 1000),
    });
    const a = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertSucceeds(updateDoc(doc(a, 'schools', 'school1'), { name: 'Still editable' }));
    await assertSucceeds(addDoc(collection(a, 'schools'), { teacherId: TEACHER_A, name: 'A second school' }));
  });
});

describe.each(['rubrics', 'strands'] as const)('%s - isolation and immutability', (collectionName) => {
  it("teacher A cannot read or delete teacher B's document", async () => {
    await seed(`${collectionName}/doc1`, { teacherId: TEACHER_B });
    const a = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertFails(getDoc(doc(a, collectionName, 'doc1')));
    await assertFails(deleteDoc(doc(a, collectionName, 'doc1')));
  });

  it('update is always denied, even for the owner', async () => {
    await seed(`${collectionName}/doc1`, { teacherId: TEACHER_A });
    const a = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertFails(updateDoc(doc(a, collectionName, 'doc1'), { name: 'changed' }));
  });

  it('owner can read and delete their own document', async () => {
    await seed(`${collectionName}/doc1`, { teacherId: TEACHER_A });
    const a = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertSucceeds(getDoc(doc(a, collectionName, 'doc1')));
    await assertSucceeds(deleteDoc(doc(a, collectionName, 'doc1')));
  });

  it('unauthenticated create is denied', async () => {
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertFails(addDoc(collection(anon, collectionName), { teacherId: TEACHER_A }));
  });

  it('denies create once the teacher is school-year locked', async () => {
    await seed(`teacherProfiles/${TEACHER_A}`, {
      schoolYearEndDate: Timestamp.fromMillis(Date.now() - 10 * 24 * 60 * 60 * 1000),
    });
    const a = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertFails(addDoc(collection(a, collectionName), { teacherId: TEACHER_A }));
  });
});

describe('evaluations - ownsExisting/ownsIncoming scoping, not gated by school-year lock', () => {
  it("teacher A cannot read, update, or delete teacher B's evaluation", async () => {
    await seed('evaluations/eval1', { teacherId: TEACHER_B, studentId: 's1', createdAt: '2026-01-01' });
    const a = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertFails(getDoc(doc(a, 'evaluations', 'eval1')));
    await assertFails(updateDoc(doc(a, 'evaluations', 'eval1'), { studentId: 's2' }));
    await assertFails(deleteDoc(doc(a, 'evaluations', 'eval1')));
  });

  it('teacher A can read/update/delete their own evaluation', async () => {
    await seed('evaluations/eval1', { teacherId: TEACHER_A, studentId: 's1', createdAt: '2026-01-01' });
    const a = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertSucceeds(getDoc(doc(a, 'evaluations', 'eval1')));
    await assertSucceeds(updateDoc(doc(a, 'evaluations', 'eval1'), { studentId: 's2' }));
    await assertSucceeds(deleteDoc(doc(a, 'evaluations', 'eval1')));
  });

  it("cannot create an evaluation spoofing another teacher's id", async () => {
    const a = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertFails(
      addDoc(collection(a, 'evaluations'), { teacherId: TEACHER_B, studentId: 's1', createdAt: '2026-01-01' })
    );
  });

  it('unauthenticated requests are denied entirely', async () => {
    await seed('evaluations/eval1', { teacherId: TEACHER_A, studentId: 's1', createdAt: '2026-01-01' });
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(anon, 'evaluations', 'eval1')));
  });

  it('is still creatable after the teacher is locked (report generation must keep working)', async () => {
    await seed(`teacherProfiles/${TEACHER_A}`, {
      schoolYearEndDate: Timestamp.fromMillis(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago - well past the 2-day grace window
    });
    const a = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertSucceeds(
      addDoc(collection(a, 'evaluations'), { teacherId: TEACHER_A, studentId: 's1', createdAt: '2026-01-01' })
    );
  });

  it('is still updatable after the teacher is locked', async () => {
    await seed('evaluations/eval1', { teacherId: TEACHER_A, studentId: 's1', createdAt: '2026-01-01' });
    await seed(`teacherProfiles/${TEACHER_A}`, {
      schoolYearEndDate: Timestamp.fromMillis(Date.now() - 10 * 24 * 60 * 60 * 1000),
    });
    const a = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertSucceeds(updateDoc(doc(a, 'evaluations', 'eval1'), { studentId: 's2' }));
  });
});

describe('default deny', () => {
  it('denies read and write on any collection not explicitly matched in firestore.rules', async () => {
    const a = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertFails(getDoc(doc(a, 'somethingUnlisted', 'doc1')));
    await assertFails(setDoc(doc(a, 'somethingUnlisted', 'doc1'), { anything: true }));
  });
});

describe('auditLogs', () => {
  it('owner can read their own audit trail', async () => {
    await seed('auditLogs/log1', { teacherId: TEACHER_A, collection: 'students', action: 'created' });
    const a = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertSucceeds(getDoc(doc(a, 'auditLogs', 'log1')));
  });

  it("cannot read another teacher's audit trail", async () => {
    await seed('auditLogs/log1', { teacherId: TEACHER_B, collection: 'students', action: 'created' });
    const a = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertFails(getDoc(doc(a, 'auditLogs', 'log1')));
  });

  it('is never client-writable, even by the record owner', async () => {
    const a = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertFails(
      addDoc(collection(a, 'auditLogs'), { teacherId: TEACHER_A, collection: 'students', action: 'created' })
    );
  });
});

describe('rateLimits', () => {
  it('is never readable or writable by any client', async () => {
    await seed('rateLimits/teacher-a_generateEvaluation', { windowStart: Date.now(), count: 1 });
    const a = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertFails(getDoc(doc(a, 'rateLimits', 'teacher-a_generateEvaluation')));
    await assertFails(setDoc(doc(a, 'rateLimits', 'teacher-a_generateEvaluation'), { windowStart: Date.now(), count: 99 }));
  });
});

describe('bugReports', () => {
  it('a signed-in user can file their own report', async () => {
    const a = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertSucceeds(addDoc(collection(a, 'bugReports'), { teacherId: TEACHER_A, message: 'test' }));
  });

  it('nobody can read, update, or delete a report afterward - not even the filer', async () => {
    await seed('bugReports/report1', { teacherId: TEACHER_A, message: 'test' });
    const a = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertFails(getDoc(doc(a, 'bugReports', 'report1')));
    await assertFails(deleteDoc(doc(a, 'bugReports', 'report1')));
  });
});

describe('teacherProfiles', () => {
  it('a teacher can read and write only their own profile document', async () => {
    const a = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertSucceeds(setDoc(doc(a, 'teacherProfiles', TEACHER_A), { schoolName: 'Test School' }));
    await assertFails(setDoc(doc(a, 'teacherProfiles', TEACHER_B), { schoolName: 'Hijacked' }));
  });

  it('remains writable even while the teacher is locked - unlocking requires writing here', async () => {
    await seed(`teacherProfiles/${TEACHER_A}`, {
      schoolYearEndDate: Timestamp.fromMillis(Date.now() - 10 * 24 * 60 * 60 * 1000),
    });
    const a = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertSucceeds(updateDoc(doc(a, 'teacherProfiles', TEACHER_A), { schoolYearEndDate: Timestamp.fromMillis(Date.now() + 1000) }));
  });
});

describe('curriculumResources - shared cross-teacher library', () => {
  it('any signed-in teacher can read the shared library', async () => {
    await seed('curriculumResources/res1', { addedByTeacherId: TEACHER_B, title: 'Shared doc' });
    const a = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertSucceeds(getDoc(doc(a, 'curriculumResources', 'res1')));
  });

  it('creating requires the incoming addedByTeacherId to match the caller', async () => {
    const a = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertFails(addDoc(collection(a, 'curriculumResources'), { addedByTeacherId: TEACHER_B, title: 'Spoofed' }));
    await assertSucceeds(addDoc(collection(a, 'curriculumResources'), { addedByTeacherId: TEACHER_A, title: 'Mine' }));
  });

  it('update is always denied', async () => {
    await seed('curriculumResources/res1', { addedByTeacherId: TEACHER_A, title: 'Original' });
    const a = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertFails(updateDoc(doc(a, 'curriculumResources', 'res1'), { title: 'Edited' }));
  });

  it('only the teacher who added a resource can delete it', async () => {
    await seed('curriculumResources/res1', { addedByTeacherId: TEACHER_B, title: 'Not yours' });
    const a = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertFails(deleteDoc(doc(a, 'curriculumResources', 'res1')));
    const b = testEnv.authenticatedContext(TEACHER_B).firestore();
    await assertSucceeds(deleteDoc(doc(b, 'curriculumResources', 'res1')));
  });
});

describe('isTeacherLocked() - school-year lockdown', () => {
  it('a teacher who never set a schoolYearEndDate is never locked (no profile doc at all)', async () => {
    const a = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertSucceeds(
      addDoc(collection(a, 'classes'), { teacherId: TEACHER_A, subject: 'Math', grade: '5', createdAt: '2026-01-01' })
    );
  });

  it('a teacher with an existing profile but no schoolYearEndDate field is never locked (the historical bug)', async () => {
    await seed(`teacherProfiles/${TEACHER_A}`, { schoolName: 'Has a name, never touched the school-year field' });
    const a = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertSucceeds(
      addDoc(collection(a, 'classes'), { teacherId: TEACHER_A, subject: 'Math', grade: '5', createdAt: '2026-01-01' })
    );
  });

  it('stays unlocked within the 2-day grace window', async () => {
    await seed(`teacherProfiles/${TEACHER_A}`, {
      schoolYearEndDate: Timestamp.fromMillis(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    });
    const a = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertSucceeds(
      addDoc(collection(a, 'classes'), { teacherId: TEACHER_A, subject: 'Math', grade: '5', createdAt: '2026-01-01' })
    );
  });

  it('blocks create/update on classes once locked (see the per-collection lock checks above for students/observations/rubrics/strands)', async () => {
    await seed(`teacherProfiles/${TEACHER_A}`, {
      schoolYearEndDate: Timestamp.fromMillis(Date.now() - 10 * 24 * 60 * 60 * 1000),
    });
    await seed('classes/existing', { teacherId: TEACHER_A, subject: 'Math', grade: '5', createdAt: '2026-01-01' });
    const a = testEnv.authenticatedContext(TEACHER_A).firestore();

    await assertFails(
      addDoc(collection(a, 'classes'), { teacherId: TEACHER_A, subject: 'Science', grade: '5', createdAt: '2026-01-01' })
    );
    await assertFails(updateDoc(doc(a, 'classes', 'existing'), { grade: '6' }));
  });

  it('still allows deletes once locked (right-to-erasure is never blocked)', async () => {
    await seed(`teacherProfiles/${TEACHER_A}`, {
      schoolYearEndDate: Timestamp.fromMillis(Date.now() - 10 * 24 * 60 * 60 * 1000),
    });
    await seed('classes/existing', { teacherId: TEACHER_A, subject: 'Math', grade: '5', createdAt: '2026-01-01' });
    const a = testEnv.authenticatedContext(TEACHER_A).firestore();
    await assertSucceeds(deleteDoc(doc(a, 'classes', 'existing')));
  });
});

describe('Storage rules', () => {
  it('curriculum: any signed-in user can upload within size/type limits', async () => {
    const a = testEnv.authenticatedContext(TEACHER_A).storage();
    const smallPdf = new Uint8Array(1024);
    await assertSucceeds(
      uploadBytes(storageRef(a, 'curriculum/res1/file.pdf'), smallPdf, { contentType: 'application/pdf' })
    );
  });

  it('curriculum: an oversized or wrong-type upload is rejected', async () => {
    const a = testEnv.authenticatedContext(TEACHER_A).storage();
    await assertFails(
      uploadBytes(storageRef(a, 'curriculum/res1/file.exe'), new Uint8Array(10), { contentType: 'application/x-msdownload' })
    );
  });

  it('curriculum: only the uploader can delete their file', async () => {
    const a = testEnv.authenticatedContext(TEACHER_A).storage();
    await uploadBytes(storageRef(a, 'curriculum/res1/file.pdf'), new Uint8Array(10), {
      contentType: 'application/pdf',
      customMetadata: { uploadedBy: TEACHER_A },
    });
    const b = testEnv.authenticatedContext(TEACHER_B).storage();
    await assertFails(deleteObject(storageRef(b, 'curriculum/res1/file.pdf')));
    await assertSucceeds(deleteObject(storageRef(a, 'curriculum/res1/file.pdf')));
  });

  it('observations: attachments are private to the uploader, unlike curriculum', async () => {
    const a = testEnv.authenticatedContext(TEACHER_A).storage();
    await uploadBytes(storageRef(a, 'observations/obs1/audio.webm'), new Uint8Array(10), {
      contentType: 'audio/webm',
      customMetadata: { uploadedBy: TEACHER_A },
    });
    const b = testEnv.authenticatedContext(TEACHER_B).storage();
    await assertFails(getBytes(storageRef(b, 'observations/obs1/audio.webm')));
    await assertSucceeds(getBytes(storageRef(a, 'observations/obs1/audio.webm')));
  });
});
