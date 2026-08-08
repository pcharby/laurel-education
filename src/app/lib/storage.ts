import { Student, Observation, Evaluation } from './types';
import { auth, db } from '../../firebase';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from 'firebase/firestore';

const getTeacherId = (): string => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not signed in');
  return uid;
};

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

// Observations
export const getObservations = async (): Promise<Observation[]> => {
  const q = query(collection(db, 'observations'), where('teacherId', '==', getTeacherId()));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ ...(d.data() as Observation), id: d.id }));
};

export const saveObservation = async (observation: Omit<Observation, 'teacherId'>): Promise<void> => {
  await addDoc(collection(db, 'observations'), { ...observation, teacherId: getTeacherId() });
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

export const deleteObservation = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'observations', id));
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
