import './admin.js';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';
import { getFirestore, Firestore, QueryDocumentSnapshot, Timestamp } from 'firebase-admin/firestore';
import { REGION } from './region.js';

const LOCK_GRACE_MS = 2 * 24 * 60 * 60 * 1000; // 2 days
const ARCHIVE_GRACE_MS = 90 * 24 * 60 * 60 * 1000; // 90 days
const FIRESTORE_BATCH_LIMIT = 500;

// Classes and students get the identical stamp-then-archive treatment - a
// class doesn't own its students (no classId on either), and a teacher's
// roster isn't expected to carry over between years, so both collections
// need to age out of the active views the same way. See
// C:\Users\pchar\.claude\plans\fuzzy-orbiting-pillow.md for the full design.
const STAMPABLE_COLLECTIONS = ['classes', 'students'] as const;

async function commitInBatches(
  db: Firestore,
  docs: QueryDocumentSnapshot[],
  data: Record<string, unknown>
): Promise<void> {
  for (let i = 0; i < docs.length; i += FIRESTORE_BATCH_LIMIT) {
    const batch = db.batch();
    docs.slice(i, i + FIRESTORE_BATCH_LIMIT).forEach((d) => batch.update(d.ref, data));
    await batch.commit();
  }
}

// Snapshots the teacher's current schoolYearEndDate onto each not-yet-stamped
// class/student created before that date. This is deliberately NOT a live
// re-read of the profile at archive time: a teacher who pushes their
// schoolYearEndDate forward to start a new year (the expected workflow,
// since firestore.rules' isTeacherLocked() unlocks the instant they do)
// would otherwise silently push this year's archive date out too, since the
// live profile field would already hold next year's date by then.
async function stampTeacherRecords(
  db: Firestore,
  teacherId: string,
  schoolYearEndDate: Timestamp
): Promise<void> {
  const cutoffIso = schoolYearEndDate.toDate().toISOString();

  for (const collectionName of STAMPABLE_COLLECTIONS) {
    const snap = await db.collection(collectionName).where('teacherId', '==', teacherId).get();
    const toStamp = snap.docs.filter((d) => {
      const data = d.data();
      return !data.schoolYearEndDate && typeof data.createdAt === 'string' && data.createdAt <= cutoffIso;
    });
    await commitInBatches(db, toStamp, { schoolYearEndDate });
  }
}

// 90 days after a class/student's stamped schoolYearEndDate, archive it -
// hides it from the active pickers (ClassSelector, StudentSummarySelector's
// default list) without ever touching the underlying Observation/Evaluation
// records, which persist regardless of a class's or student's lifecycle.
async function archiveCollection(db: Firestore, collectionName: string, cutoff: Timestamp): Promise<void> {
  const snap = await db.collection(collectionName).where('schoolYearEndDate', '<=', cutoff).get();
  const toArchive = snap.docs.filter((d) => d.data().archived !== true);
  await commitInBatches(db, toArchive, { archived: true });
}

// Exported separately from the onSchedule wrapper so it can also be invoked
// on-demand (e.g. a temporary auth-checked onCall during manual testing,
// same pattern used to verify cascadeDeleteStudentData's Storage cleanup
// earlier) without duplicating this logic.
export async function runSchoolYearLockdownSweep(db: Firestore): Promise<{ lockedTeacherCount: number }> {
  const now = Timestamp.now();
  const lockCutoff = Timestamp.fromMillis(now.toMillis() - LOCK_GRACE_MS);
  const archiveCutoff = Timestamp.fromMillis(now.toMillis() - ARCHIVE_GRACE_MS);

  const lockedTeachersSnap = await db
    .collection('teacherProfiles')
    .where('schoolYearEndDate', '<=', lockCutoff)
    .get();

  for (const doc of lockedTeachersSnap.docs) {
    const schoolYearEndDate = doc.data().schoolYearEndDate as Timestamp;
    await stampTeacherRecords(db, doc.id, schoolYearEndDate);
  }

  for (const collectionName of STAMPABLE_COLLECTIONS) {
    await archiveCollection(db, collectionName, archiveCutoff);
  }

  return { lockedTeacherCount: lockedTeachersSnap.size };
}

export const schoolYearLockdownSweep = onSchedule(
  { schedule: 'every 24 hours', region: REGION, timeoutSeconds: 540 },
  async () => {
    const { lockedTeacherCount } = await runSchoolYearLockdownSweep(getFirestore());
    logger.info(`School-year lockdown sweep complete: stamped records for ${lockedTeacherCount} locked teacher(s).`);
  }
);
