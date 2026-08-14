import './admin.js';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { REGION } from './region.js';
import { deleteAllDataForTeacher } from './deleteTeacherData.js';

// Only this account can ever call this - a mass-deletion admin tool has no
// business being reachable by anyone else, signed in or not. Checked
// against the verified email claim on the caller's own ID token (set by
// Firebase Auth itself), never a client-supplied value.
const ADMIN_EMAIL = 'pcharby@gmail.com';
const FIRESTORE_BATCH_LIMIT = 500;

interface PurgeAccountsRequest {
  /** Without this set to exactly true, only reports what WOULD be deleted. */
  confirm?: boolean;
  /** Scope to specific accounts instead of every account. Also how this
   *  was verified live without ever touching real production accounts. */
  uids?: string[];
  /** Full purges (no uids) leave the shared curriculum library alone by
   *  default, since it may hold real content worth keeping, not just
   *  tester-account data - opt in explicitly to wipe it too. Ignored when
   *  uids is set: a partial purge should never affect content shared with
   *  other, unrelated teachers. */
  purgeCurriculumResources?: boolean;
}

interface PurgeAccountsResponse {
  dryRun: boolean;
  userCount: number;
  users?: { uid: string; email: string | null }[];
  curriculumResourceCount: number;
}

// Admin-only, one-off tool for wiping every tester account before real
// go-live so real teachers start from a genuinely clean slate. Not
// something the app itself ever calls. Defaults to a dry run (confirm not
// exactly true) that only lists what would be deleted; defaults to every
// account (uids omitted) when it does run for real.
export const purgeAllAccounts = onCall<PurgeAccountsRequest>(
  { region: REGION, timeoutSeconds: 540 },
  async (request): Promise<PurgeAccountsResponse> => {
    if (!request.auth || request.auth.token.email !== ADMIN_EMAIL) {
      throw new HttpsError('permission-denied', 'Not authorized to run this.');
    }

    const authAdmin = getAuth();
    const db = getFirestore();
    const bucket = getStorage().bucket();
    const confirm = request.data?.confirm === true;
    const scopedUids = request.data?.uids;
    const isFullPurge = !scopedUids || scopedUids.length === 0;

    let users: { uid: string; email: string | null }[];
    if (!isFullPurge) {
      const results = await Promise.all(scopedUids!.map((uid) => authAdmin.getUser(uid).catch(() => null)));
      users = results
        .filter((u): u is NonNullable<typeof u> => u !== null)
        .map((u) => ({ uid: u.uid, email: u.email ?? null }));
    } else {
      users = [];
      let pageToken: string | undefined;
      do {
        const result = await authAdmin.listUsers(1000, pageToken);
        pageToken = result.pageToken;
        users.push(...result.users.map((u) => ({ uid: u.uid, email: u.email ?? null })));
      } while (pageToken);
    }

    const shouldTouchCurriculum = isFullPurge && request.data?.purgeCurriculumResources === true;
    const curriculumSnap: { docs: QueryDocumentSnapshot[]; size: number } = shouldTouchCurriculum
      ? await db.collection('curriculumResources').get()
      : { docs: [], size: 0 };

    if (!confirm) {
      return {
        dryRun: true,
        userCount: users.length,
        users,
        curriculumResourceCount: curriculumSnap.size,
      };
    }

    for (const user of users) {
      await deleteAllDataForTeacher(db, bucket, user.uid);
      await authAdmin.deleteUser(user.uid);
    }
    logger.info(`purgeAllAccounts: deleted ${users.length} account(s) (${isFullPurge ? 'full purge' : 'scoped'})`);

    if (shouldTouchCurriculum) {
      await Promise.all(
        curriculumSnap.docs.map(async (d) => {
          const storagePath = d.data().storagePath as string | undefined;
          if (storagePath) await bucket.file(storagePath).delete({ ignoreNotFound: true }).catch(() => {});
        })
      );
      for (let i = 0; i < curriculumSnap.docs.length; i += FIRESTORE_BATCH_LIMIT) {
        const batch = db.batch();
        curriculumSnap.docs.slice(i, i + FIRESTORE_BATCH_LIMIT).forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
      logger.info(`purgeAllAccounts: deleted ${curriculumSnap.size} curriculum resource(s)`);
    }

    return {
      dryRun: false,
      userCount: users.length,
      curriculumResourceCount: curriculumSnap.size,
    };
  }
);
