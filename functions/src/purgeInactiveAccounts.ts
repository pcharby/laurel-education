import './admin.js';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Firestore, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { REGION } from './region.js';

const INACTIVITY_THRESHOLD_MS = 2 * 365 * 24 * 60 * 60 * 1000; // 2 years
const FIRESTORE_BATCH_LIMIT = 500;

async function commitInBatches(db: Firestore, docs: QueryDocumentSnapshot[]): Promise<void> {
  for (let i = 0; i < docs.length; i += FIRESTORE_BATCH_LIMIT) {
    const batch = db.batch();
    docs.slice(i, i + FIRESTORE_BATCH_LIMIT).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}

// Mirrors the client-side deleteAllMyData (src/app/lib/storage.ts): delete
// students first so cascadeDeleteStudentData can clean up their
// observations/evaluations, then sweep both collections directly as a
// backstop for anything the cascade didn't reach.
async function deleteAllDataForTeacher(db: Firestore, teacherId: string): Promise<void> {
  const studentsSnap = await db.collection('students').where('teacherId', '==', teacherId).get();
  await commitInBatches(db, studentsSnap.docs);

  for (const collectionName of ['observations', 'evaluations'] as const) {
    const snap = await db.collection(collectionName).where('teacherId', '==', teacherId).get();
    await commitInBatches(db, snap.docs);
  }
}

// Automated data-retention sweep: accounts with no activity in 2 years have
// their data and Auth user permanently removed. lastRefreshTime is used over
// lastSignInTime since Firebase sessions can go a long time between explicit
// re-logins while the token silently refreshes as long as the app is in use.
export const purgeInactiveAccounts = onSchedule(
  { schedule: 'every 24 hours', region: REGION, timeoutSeconds: 540 },
  async () => {
    const auth = getAuth();
    const db = getFirestore();
    const now = Date.now();
    let pageToken: string | undefined;
    let purged = 0;
    let scanned = 0;

    do {
      const result = await auth.listUsers(1000, pageToken);
      pageToken = result.pageToken;

      for (const user of result.users) {
        scanned++;
        const lastActive =
          user.metadata.lastRefreshTime ?? user.metadata.lastSignInTime ?? user.metadata.creationTime;
        const lastActiveMs = new Date(lastActive).getTime();

        if (now - lastActiveMs < INACTIVITY_THRESHOLD_MS) continue;

        await deleteAllDataForTeacher(db, user.uid);
        await auth.deleteUser(user.uid);
        purged++;
        logger.info(`Purged inactive account ${user.uid} (last active ${lastActive})`);
      }
    } while (pageToken);

    logger.info(`Retention sweep complete: scanned ${scanned}, purged ${purged}`);
  }
);
