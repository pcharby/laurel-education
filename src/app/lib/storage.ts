import { Student, Observation, Evaluation, BugReport, SchoolClass, TeacherProfile, CurriculumResource, Rubric, Strand, School } from './types';
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
  deleteField,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { getSchoolYearLockStatus } from './schoolYearLock';
import { compareClasses } from './sortClasses';
import { compareStudentsByFirstName } from './sortStudents';

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

// Students - teachers don't carry a roster between school years (see
// schoolYearLockdownSweep), so getStudents() only returns the current,
// non-archived roster by default. A few callers deliberately need the full
// set regardless of archive status (looking up one specific student by ID,
// or wiping an account entirely), so they go through fetchAllStudents
// directly instead of the filtered getStudents(). Sorted centrally here by
// first name (same reasoning as compareClasses for getClasses()) so every
// picker gets a consistent, scannable order automatically.
const fetchAllStudents = async (): Promise<Student[]> => {
  const q = query(collection(db, 'students'), where('teacherId', '==', getTeacherId()));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ ...(d.data() as Student), id: d.id })).sort(compareStudentsByFirstName);
};

export const getStudents = async (): Promise<Student[]> => {
  const students = await fetchAllStudents();
  return students.filter(s => !s.archived);
};

export const getArchivedStudents = async (): Promise<Student[]> => {
  const students = await fetchAllStudents();
  return students.filter(s => s.archived === true);
};

// Returns the new document's real Firestore id (addDoc assigns it - the
// `id` field on the input is discarded on write, same as every other
// caller's `id` field here today). Callers that need to reference the
// student immediately after creating it (e.g. checking it into a class
// roster) use this instead of re-fetching and matching by name.
export const saveStudent = async (student: Omit<Student, 'teacherId'>): Promise<string> => {
  const ref = await addDoc(collection(db, 'students'), { ...student, teacherId: getTeacherId() });
  return ref.id;
};

export const getStudentById = async (id: string): Promise<Student | undefined> => {
  const students = await fetchAllStudents();
  return students.find(s => s.id === id);
};

// Deleting the student is enough - a Cloud Function trigger
// (cascadeDeleteStudentData) removes their observations and evaluations
// server-side so they don't become orphaned, unreachable records.
export const deleteStudent = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'students', id));
};

// Classes - sorted centrally here (subject, then grade, then section) so
// every consumer gets a consistent, predictable order automatically rather
// than each screen needing to remember to sort Firestore's unordered
// results itself.
export const getClasses = async (): Promise<SchoolClass[]> => {
  const q = query(collection(db, 'classes'), where('teacherId', '==', getTeacherId()));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ ...(d.data() as SchoolClass), id: d.id })).sort(compareClasses);
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

// A plain updateClass(id, { studentIds: [] }) can't distinguish "explicitly
// no students" from "never configured" once read back (both are falsy), so
// resetting a class to automatic grade-matching has to actually remove the
// field via deleteField() - same reasoning as clearSchoolYearEndDate.
export const clearClassRoster = async (id: string): Promise<void> => {
  await updateDoc(doc(db, 'classes', id), { studentIds: deleteField() });
};

// Schools - a lightweight sub-structure for itinerant/multi-school teachers
// so classes and student rosters can be scoped per school (SchoolClass.
// schoolId / Student.schoolId). Not gated by isTeacherLocked(): which
// schools a teacher works at is organizational structure, not a piece of
// this year's classroom content, so it stays editable through a lockdown
// the same way TeacherProfile does.
export const getSchools = async (): Promise<School[]> => {
  const q = query(collection(db, 'schools'), where('teacherId', '==', getTeacherId()));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ ...(d.data() as School), id: d.id })).sort((a, b) => a.name.localeCompare(b.name));
};

export const addSchool = async (name: string): Promise<void> => {
  await addDoc(collection(db, 'schools'), {
    name,
    teacherId: getTeacherId(),
    createdAt: new Date().toISOString(),
  });
};

export const updateSchool = async (id: string, name: string): Promise<void> => {
  await updateDoc(doc(db, 'schools', id), { name });
};

export const deleteSchool = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'schools', id));
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

export const addRubric = async (subject: string, label: string, grade?: string, schoolId?: string): Promise<void> => {
  await addDoc(collection(db, 'rubrics'), stripUndefined({
    subject,
    grade,
    schoolId,
    label,
    teacherId: getTeacherId(),
    createdAt: new Date().toISOString(),
  }));
};

export const deleteRubric = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'rubrics', id));
};

// Curriculum strands - same shape/ownership as Rubrics above, shown in the
// "Curriculum Strand" picker when recording an observation.
export const getStrands = async (subject: string): Promise<Strand[]> => {
  const q = query(
    collection(db, 'strands'),
    where('teacherId', '==', getTeacherId()),
    where('subject', '==', subject)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ ...(d.data() as Strand), id: d.id }));
};

export const addStrand = async (subject: string, label: string, grade?: string, schoolId?: string): Promise<void> => {
  await addDoc(collection(db, 'strands'), stripUndefined({
    subject,
    grade,
    schoolId,
    label,
    teacherId: getTeacherId(),
    createdAt: new Date().toISOString(),
  }));
};

export const deleteStrand = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'strands', id));
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

  // storage.rules can't mirror firestore.rules' isTeacherLocked() check (a
  // documented, tested limitation of cross-service get() lookups from
  // Storage rules in this project - see the curriculum upload rules
  // comment), so a locked teacher could otherwise still upload straight to
  // Storage even though the matching Firestore write below will be
  // rejected. Checked here instead: the resulting orphaned Storage object
  // if this check were skipped would be inert (never rendered, since
  // nothing points to it without the Firestore doc), but there's no reason
  // to let the upload happen at all if the write is guaranteed to fail.
  const lockStatus = getSchoolYearLockStatus(await getTeacherProfile());
  if (lockStatus.status === 'locked') {
    throw new Error('Your school year is locked. Update the end date in Settings to add new observations.');
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
  updates: Partial<Pick<TeacherProfile, 'displayName' | 'jurisdiction' | 'schoolName' | 'schoolYearEndDate'>>
): Promise<void> => {
  await setDoc(
    doc(db, 'teacherProfiles', getTeacherId()),
    stripUndefined({ ...updates, updatedAt: new Date().toISOString() }),
    { merge: true }
  );
};

// setDoc with a plain merge can't remove a field, only overwrite or leave it
// untouched - deleteField() is the sentinel Firestore requires to actually
// clear schoolYearEndDate rather than storing an explicit null (the field is
// typed optional/absent, and firestore.rules' isTeacherLocked() already
// treats "absent" as its permanent no-op state - no need to distinguish a
// stored null from absent anywhere else in the app).
export const clearSchoolYearEndDate = async (): Promise<void> => {
  await updateDoc(doc(db, 'teacherProfiles', getTeacherId()), {
    schoolYearEndDate: deleteField(),
    updatedAt: new Date().toISOString(),
  });
};

// Archiving requires a Cloud Function since the archived/schoolYearEndDate
// stamp on each class/student is meant to be Cloud-Function-only - lets a
// teacher skip ARCHIVE_GRACE_MS entirely and archive their just-ended year
// the moment they're ready to set up a new one, rather than waiting on the
// scheduled sweep. Returns how many records were archived, in case the UI
// wants to report it (e.g. "0" if there was nothing left to do).
const callArchiveMyPreviousYear = httpsCallable<void, { archivedCount: number }>(functions, 'archiveMyPreviousYear');

export const archiveMyPreviousYear = async (): Promise<{ archivedCount: number }> => {
  const result = await callArchiveMyPreviousYear();
  return result.data;
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

  const students = await fetchAllStudents();
  await Promise.all(students.map(s => deleteDoc(doc(db, 'students', s.id))));

  for (const collectionName of ['observations', 'evaluations', 'classes', 'rubrics', 'strands', 'schools'] as const) {
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
