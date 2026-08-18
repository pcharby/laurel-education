import './admin.js';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { REGION } from './region.js';

const RETENTION_MS = 2 * 365 * 24 * 60 * 60 * 1000; // 2 years
const BATCH_SIZE = 500;

// auditLogs is an accountability trail (who touched which student record,
// when), not Student Data itself - but it isn't exempt from data
// minimization once a retention period is actually chosen. 2 years matches
// the existing account-inactivity purge window, so there's one retention
// number in the Privacy Policy instead of two.
export const purgeOldAuditLogs = onSchedule(
  { schedule: 'every 24 hours', region: REGION, timeoutSeconds: 540 },
  async () => {
    const db = getFirestore();
    const cutoff = Timestamp.fromMillis(Date.now() - RETENTION_MS);
    let purged = 0;

    while (true) {
      const snap = await db
        .collection('auditLogs')
        .where('timestamp', '<=', cutoff)
        .limit(BATCH_SIZE)
        .get();

      if (snap.empty) break;

      const batch = db.batch();
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      purged += snap.size;

      if (snap.size < BATCH_SIZE) break;
    }

    logger.info(`auditLogs retention sweep complete: purged ${purged} entries older than 2 years`);
  }
);
