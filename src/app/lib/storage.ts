import { Student, Observation, Evaluation, BugReport, SchoolClass, TeacherProfile, CurriculumResource, Rubric } from './types';
import { auth, db, storage, functions } from '../../firebase';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  getDoc,
  setDoc,
  doc,
  query,
  where,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';

const getTeacherId = (): string => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not signed in');
  return uid;
};

// Firestore rejects explicit `undefined` field values (unlike `null`), so
// optional fields left blank by a form (e.g. { schedule: undefined }) need
// to be dropped before addDoc/updateDoc, not just typed as optional.
const stripUndefined = <T extends object>(obj: T): T =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;

// Students
export const getStudents = async (): Promise<Student[]> => {
  const q = query(collection(db, 'students'), where('teacherId', '==', getTeacherId()));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ ...(d.data() as Student), id: d.id }));
};

export const saveStudent = async (student: Omit<Student, 'teacherId'>): Promise<void> => {
  await addDoc(collection(db, 'students'), { ...student, teacherId: getTeacherId() });
};

export const getStudentById = async (id: string): Promise<Student | undefined> => {
  const students = await getStudents();
  return students.find(s => s.id === id);
};

// Deleting the student is enough - a Cloud Function trigger
// (cascadeDeleteStudentData) removes their observations and evaluations
// server-side so they don't become orphaned, unreachable records.
export const deleteStudent = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'students', id));
};

// Classes
export const getClasses = async (): Promise<SchoolClass[]> => {
  const q = query(collection(db, 'classes'), where('teacherId', '==', getTeacherId()));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ ...(d.data() as SchoolClass), id: d.id }));
};

export const saveClass = async (schoolClass: Omit<SchoolClass, 'id' | 'teacherId'>): Promise<void> => {
  await addDoc(collection(db, 'classes'), stripUndefined({ ...schoolClass, teacherId: getTeacherId() }));
};

export const updateClass = async (
  id: string,
  updates: Partial<Omit<SchoolClass, 'id' | 'teacherId' | 'createdAt'>>
): Promise<void> => {
  await updateDoc(doc(db, 'classes', id), stripUndefined(updates));
};

export const deleteClass = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'classes', id));
};

// Rubrics - private per-teacher labels used when recording observations,
// distinct from curriculumResources (which are shared across teachers).
export const getRubrics = async (subject: string): Promise<Rubric[]> => {
  const q = query(
    collection(db, 'rubrics'),
    where('teacherId', '==', getTeacherId()),
    where('subject', '==', subject)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ ...(d.data() as Rubric), id: d.id }));
};

export const addRubric = async (subject: string, label: string): Promise<void> => {
  await addDoc(collection(db, 'rubrics'), {
    subject,
    label,
    teacherId: getTeacherId(),
    createdAt: new Date().toISOString(),
  });
};

export const deleteRubric = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'rubrics', id));
};

// Observations
export const getObservations = async (): Promise<Observation[]> => {
  const q = query(collection(db, 'observations'), where('teacherId', '==', getTeacherId()));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ ...(d.data() as Observation), id: d.id }));
};

const MAX_OBSERVATION_MEDIA_BYTES = 20 * 1024 * 1024;
const ALLOWED_OBSERVATION_MEDIA_TYPES: Record<string, string[]> = {
  audio: ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/wav', 'audio/mpeg'],
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
};

// A media file is only present for audio/image observations. The doc ID is
// generated up front (mirrors uploadCurriculumFile) so the Storage path and
// Firestore record share it, and customMetadata.uploadedBy tags the object
// for storage.rules to check on read/delete - same pattern as curriculum
// files, except read is restricted to the owning teacher here since
// observations are private per-teacher, not a shared library.
export const saveObservation = async (
  observation: Omit<Observation, 'teacherId'>,
  mediaFile?: File
): Promise<void> => {
  const teacherId = getTeacherId();

  if (!mediaFile) {
    await addDoc(collection(db, 'observations'), stripUndefined({ ...observation, teacherId }));
    return;
  }

  const allowedTypes = ALLOWED_OBSERVATION_MEDIA_TYPES[observation.type] ?? [];
  if (mediaFile.size > MAX_OBSERVATION_MEDIA_BYTES) {
    throw new Error('File is too large (20MB max).');
  }
  if (!allowedTypes.includes(mediaFile.type)) {
    throw new Error('Unsupported file type for this observation.');
  }

  const docRef = doc(collection(db, 'observations'));
  const storagePath = `observations/${docRef.id}/${mediaFile.name}`;
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, mediaFile, {
    contentType: mediaFile.type,
    customMetadata: { uploadedBy: teacherId },
  });
  const mediaUrl = await getDownloadURL(storageRef);

  await setDoc(docRef, stripUndefined({ ...observation, mediaUrl, storagePath, teacherId }));
};

export const getObservationsByStudent = async (studentId: string): Promise<Observation[]> => {
  const q = query(
    collection(db, 'observations'),
    where('teacherId', '==', getTeacherId()),
    where('studentId', '==', studentId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ ...(d.data() as Observation), id: d.id }));
};

export const deleteObservation = async (observation: Pick<Observation, 'id' | 'storagePath'>): Promise<void> => {
  if (observation.storagePath) {
    await deleteObject(ref(storage, observation.storagePath));
  }
  await deleteDoc(doc(db, 'observations', observation.id));
};

// Evaluations
export const getEvaluations = async (): Promise<Evaluation[]> => {
  const q = query(collection(db, 'evaluations'), where('teacherId', '==', getTeacherId()));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ ...(d.data() as Evaluation), id: d.id }));
};

export const saveEvaluation = async (evaluation: Omit<Evaluation, 'teacherId'>): Promise<void> => {
  await addDoc(collection(db, 'evaluations'), { ...evaluation, teacherId: getTeacherId() });
};

export const getEvaluationsByStudent = async (studentId: string): Promise<Evaluation[]> => {
  const q = query(
    collection(db, 'evaluations'),
    where('teacherId', '==', getTeacherId()),
    where('studentId', '==', studentId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ ...(d.data() as Evaluation), id: d.id }));
};

// Bug/feedback reports. Write-only from the client by design - a teacher
// can't read back their own or others' submitted reports; they're reviewed
// directly in the Firestore console. Not included in deleteAllMyData, same
// as auditLogs/rateLimits: operational data, not the teacher's own content.
export const submitBugReport = async (
  report: Pick<BugReport, 'category' | 'description'>
): Promise<void> => {
  await addDoc(collection(db, 'bugReports'), {
    ...report,
    teacherId: getTeacherId(),
    teacherEmail: auth.currentUser?.email ?? null,
    userAgent: navigator.userAgent,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    createdAt: new Date().toISOString(),
    status: 'new',
  });
};

// Teacher profile - doc ID is the teacher's own uid (1:1), so this reads/
// writes a single doc directly rather than querying a collection.
export const getTeacherProfile = async (): Promise<TeacherProfile | null> => {
  const snap = await getDoc(doc(db, 'teacherProfiles', getTeacherId()));
  return snap.exists() ? (snap.data() as TeacherProfile) : null;
};

export const saveTeacherProfile = async (
  updates: Partial<Pick<TeacherProfile, 'jurisdiction' | 'schoolName'>>
): Promise<void> => {
  await setDoc(
    doc(db, 'teacherProfiles', getTeacherId()),
    stripUndefined({ ...updates, updatedAt: new Date().toISOString() }),
    { merge: true }
  );
};

// Curriculum resources: a shared, cross-teacher library, not scoped to the
// signed-in teacher - see the CurriculumResource type and firestore.rules.
export const getCurriculumResources = async (
  jurisdiction: string,
  grade: string,
  subject: string
): Promise<CurriculumResource[]> => {
  const q = query(
    collection(db, 'curriculumResources'),
    where('jurisdiction', '==', jurisdiction),
    where('grade', '==', grade),
    where('subject', '==', subject)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ ...(d.data() as CurriculumResource), id: d.id }));
};

export const addCurriculumLink = async (
  resource: Pick<CurriculumResource, 'jurisdiction' | 'grade' | 'subject' | 'title' | 'externalUrl'>
): Promise<void> => {
  await addDoc(collection(db, 'curriculumResources'), stripUndefined({
    ...resource,
    type: 'link' as const,
    addedByTeacherId: getTeacherId(),
    createdAt: new Date().toISOString(),
  }));
};

const MAX_CURRICULUM_FILE_BYTES = 20 * 1024 * 1024;
const ALLOWED_CURRICULUM_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

// Curriculum uploads go straight from the client to Storage, so there's no
// Cloud Function in the path to rate-limit the way generateEvaluation is -
// this callable exists purely as a server-side gate a client can't bypass
// (rateLimits is Cloud-Functions-only per firestore.rules), checked before
// every upload the same way a real teacher would only trigger occasionally.
const callCheckCurriculumUploadRateLimit = httpsCallable(functions, 'checkCurriculumUploadRateLimit');

export const uploadCurriculumFile = async (
  file: File,
  meta: Pick<CurriculumResource, 'jurisdiction' | 'grade' | 'subject' | 'title'>
): Promise<void> => {
  if (file.size > MAX_CURRICULUM_FILE_BYTES) {
    throw new Error('File is too large (20MB max).');
  }
  if (!ALLOWED_CURRICULUM_FILE_TYPES.includes(file.type)) {
    throw new Error('Unsupported file type. Please upload a PDF, Word document, or text file.');
  }

  await callCheckCurriculumUploadRateLimit();

  // The doc ID is generated up front so the Storage path and the Firestore
  // record can reference the same ID. customMetadata.uploadedBy is what
  // storage.rules actually checks for delete permission (Storage-native,
  // not a firestore.get() cross-service lookup - that turned out not to
  // work as documented when tested live).
  const teacherId = getTeacherId();
  const docRef = doc(collection(db, 'curriculumResources'));
  const storagePath = `curriculum/${docRef.id}/${file.name}`;
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, file, {
    contentType: file.type,
    customMetadata: { uploadedBy: teacherId },
  });
  const fileUrl = await getDownloadURL(storageRef);

  await setDoc(docRef, stripUndefined({
    ...meta,
    type: 'file' as const,
    fileUrl,
    storagePath,
    addedByTeacherId: teacherId,
    createdAt: new Date().toISOString(),
  }));
};

export const deleteCurriculumResource = async (resource: CurriculumResource): Promise<void> => {
  if (resource.storagePath) {
    await deleteObject(ref(storage, resource.storagePath));
  }
  await deleteDoc(doc(db, 'curriculumResources', resource.id));
};

// Permanently deletes every student, observation, and evaluation owned by the
// signed-in teacher. Deleting each student triggers the server-side cascade
// (cascadeDeleteStudentData) for their observations/evaluations; the direct
// sweep below is a defensive backstop for anything that isn't reachable that
// way (e.g. an observation whose student was already removed).
export const deleteAllMyData = async (): Promise<void> => {
  const teacherId = getTeacherId();

  const students = await getStudents();
  await Promise.all(students.map(s => deleteDoc(doc(db, 'students', s.id))));

  for (const collectionName of ['observations', 'evaluations', 'classes', 'rubrics'] as const) {
    const q = query(collection(db, collectionName), where('teacherId', '==', teacherId));
    const snapshot = await getDocs(q);
    await Promise.all(snapshot.docs.map(async (d) => {
      const storagePath = collectionName === 'observations' ? (d.data() as Observation).storagePath : undefined;
      if (storagePath) {
        // Best-effort: a missing/already-deleted Storage object shouldn't
        // block the account-deletion sweep from finishing.
        await deleteObject(ref(storage, storagePath)).catch(() => {});
      }
      await deleteDoc(doc(db, collectionName, d.id));
    }));
  }
};
