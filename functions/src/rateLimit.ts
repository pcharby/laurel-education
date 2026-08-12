import './admin.js';
import { getFirestore } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v2/https';

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_CALLS_PER_WINDOW = 20;

interface RateLimitDoc {
  windowStart: number;
  count: number;
}

/**
 * Throws HttpsError('resource-exhausted') if uid has exceeded MAX_CALLS_PER_WINDOW
 * calls to `action` within the last hour. Otherwise records this call.
 */
export async function enforceRateLimit(uid: string, action: string): Promise<void> {
  const db = getFirestore();
  const ref = db.collection('rateLimits').doc(`${uid}_${action}`);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const now = Date.now();
    const data = snap.exists ? (snap.data() as RateLimitDoc) : null;

    if (!data || now - data.windowStart > WINDOW_MS) {
      tx.set(ref, { windowStart: now, count: 1 });
      return;
    }

    if (data.count >= MAX_CALLS_PER_WINDOW) {
      throw new HttpsError(
        'resource-exhausted',
        'Too many requests. Please wait a while before generating more evaluations.'
      );
    }

    tx.update(ref, { count: data.count + 1 });
  });
}
