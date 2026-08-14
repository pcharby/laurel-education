import './admin.js';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { REGION } from './region.js';
import { deleteAllDataForTeacher } from './deleteTeacherData.js';

const INACTIVITY_THRESHOLD_MS = 2 * 365 * 24 * 60 * 60 * 1000; // 2 years

// Automated data-retention sweep: accounts with no activity in 2 years have
// their data and Auth user permanently removed. lastRefreshTime is used over
// lastSignInTime since Firebase sessions can go a long time between explicit
// re-logins while the token silently refreshes as long as the app is in use.
export const purgeInactiveAccounts = onSchedule(
  { schedule: 'every 24 hours', region: REGION, timeoutSeconds: 540 },
  async () => {
    const auth = getAuth();
    const db = getFirestore();
    const bucket = getStorage().bucket();
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

        await deleteAllDataForTeacher(db, bucket, user.uid);
        await auth.deleteUser(user.uid);
        purged++;
        logger.info(`Purged inactive account ${user.uid} (last active ${lastActive})`);
      }
    } while (pageToken);

    logger.info(`Retention sweep complete: scanned ${scanned}, purged ${purged}`);
  }
);
