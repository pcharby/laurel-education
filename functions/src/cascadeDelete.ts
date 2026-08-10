import './admin.js';
import { onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { REGION } from './region.js';

// Deleting a student must not leave their observations/evaluations behind as
// orphaned records with no way to reach or delete them from the app. Runs
// server-side so it completes even if the client that triggered the delete
// disconnects immediately after.
export const cascadeDeleteStudentData = onDocumentDeleted(
  { document: 'students/{studentId}', region: REGION },
  async (event) => {
    const studentId = event.params.studentId;
    const teacherId = event.data?.data()?.teacherId as string | undefined;
    if (!teacherId) return;

    const db = getFirestore();

    for (const collectionName of ['observations', 'evaluations'] as const) {
      const snap = await db
        .collection(collectionName)
        .where('teacherId', '==', teacherId)
        .where('studentId', '==', studentId)
        .get();

      if (snap.empty) continue;

      const batch = db.batch();
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  }
);
