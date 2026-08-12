import './admin.js';
import { onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { REGION } from './region.js';

// Deleting a student must not leave their observations/evaluations behind as
// orphaned records with no way to reach or delete them from the app - nor
// leave any audio/photo attachments behind in Storage once the Firestore
// record pointing to them is gone. Runs server-side so it completes even if
// the client that triggered the delete disconnects immediately after.
export const cascadeDeleteStudentData = onDocumentDeleted(
  { document: 'students/{studentId}', region: REGION },
  async (event) => {
    const studentId = event.params.studentId;
    const teacherId = event.data?.data()?.teacherId as string | undefined;
    if (!teacherId) return;

    const db = getFirestore();
    const bucket = getStorage().bucket();

    for (const collectionName of ['observations', 'evaluations'] as const) {
      const snap = await db
        .collection(collectionName)
        .where('teacherId', '==', teacherId)
        .where('studentId', '==', studentId)
        .get();

      if (snap.empty) continue;

      await Promise.all(
        snap.docs.map(async (d) => {
          const storagePath = d.data().storagePath as string | undefined;
          if (storagePath) {
            try {
              await bucket.file(storagePath).delete({ ignoreNotFound: true });
            } catch (err) {
              console.error(`Failed to delete Storage object ${storagePath} for ${collectionName}/${d.id}`, err);
            }
          }
        })
      );

      const batch = db.batch();
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  }
);
