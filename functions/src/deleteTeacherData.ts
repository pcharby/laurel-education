import { Firestore, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

type StorageBucket = ReturnType<ReturnType<typeof getStorage>['bucket']>;

const FIRESTORE_BATCH_LIMIT = 500;

async function commitDeleteBatches(db: Firestore, docs: QueryDocumentSnapshot[]): Promise<void> {
  for (let i = 0; i < docs.length; i += FIRESTORE_BATCH_LIMIT) {
    const batch = db.batch();
    docs.slice(i, i + FIRESTORE_BATCH_LIMIT).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}

async function deleteStorageObjectsForDocs(bucket: StorageBucket, docs: QueryDocumentSnapshot[]): Promise<void> {
  await Promise.all(
    docs.map(async (d) => {
      const storagePath = d.data().storagePath as string | undefined;
      if (!storagePath) return;
      // Best-effort: a missing/already-deleted object shouldn't block the
      // rest of the wipe from finishing.
      await bucket.file(storagePath).delete({ ignoreNotFound: true }).catch(() => {});
    })
  );
}

// Permanently deletes every piece of data one teacher owns: their roster
// (which cascades to observations/evaluations + Storage via
// cascadeDeleteStudentData), then a direct sweep of
// observations/evaluations/classes/rubrics as a backstop for anything the
// cascade didn't reach (e.g. an observation whose student was already
// removed), cleaning up any attached Storage objects along the way, and
// finally the teacherProfiles doc itself.
//
// Shared by purgeInactiveAccounts (2-year inactivity sweep) and
// purgeAllAccounts (admin one-off tool) so there's exactly one place this
// logic lives - mirrors the client-side deleteAllMyData in
// src/app/lib/storage.ts, which should be kept in sync if this changes.
export async function deleteAllDataForTeacher(db: Firestore, bucket: StorageBucket, teacherId: string): Promise<void> {
  const studentsSnap = await db.collection('students').where('teacherId', '==', teacherId).get();
  await commitDeleteBatches(db, studentsSnap.docs);

  for (const collectionName of ['observations', 'evaluations', 'classes', 'rubrics', 'strands', 'schools'] as const) {
    const snap = await db.collection(collectionName).where('teacherId', '==', teacherId).get();
    if (collectionName === 'observations') {
      await deleteStorageObjectsForDocs(bucket, snap.docs);
    }
    await commitDeleteBatches(db, snap.docs);
  }

  await db.collection('teacherProfiles').doc(teacherId).delete();
}
