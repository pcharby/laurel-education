import './admin.js';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { REGION } from './region.js';

interface AuditableData {
  teacherId?: string;
  studentId?: string;
}

// Records who touched which student record and when. The actor is the
// document's own teacherId field rather than a separately-passed identity:
// firestore.rules already guarantees a write can only ever carry the
// authenticated caller's own uid as teacherId, so the field IS the actor.
// Deliberately does not duplicate observation/evaluation content here -
// this is an accountability trail, not a second copy of student data.
function auditTriggerFor(collectionName: 'students' | 'observations' | 'evaluations') {
  return onDocumentWritten({ document: `${collectionName}/{docId}`, region: REGION }, async (event) => {
    const before = event.data?.before;
    const after = event.data?.after;
    const action = !before?.exists ? 'created' : !after?.exists ? 'deleted' : 'updated';
    const data = (after?.exists ? after.data() : before?.data()) as AuditableData | undefined;

    if (!data?.teacherId) return; // malformed/legacy doc with no owner - nothing to attribute

    await getFirestore()
      .collection('auditLogs')
      .add({
        collection: collectionName,
        documentId: event.params.docId,
        action,
        teacherId: data.teacherId,
        studentId: data.studentId ?? (collectionName === 'students' ? event.params.docId : null),
        timestamp: FieldValue.serverTimestamp(),
      });
  });
}

export const auditStudents = auditTriggerFor('students');
export const auditObservations = auditTriggerFor('observations');
export const auditEvaluations = auditTriggerFor('evaluations');
