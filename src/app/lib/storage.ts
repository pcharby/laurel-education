import { Student, Observation, Evaluation } from './types';
import { db } from '../../firebase';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from 'firebase/firestore';

// Students
export const getStudents = async (): Promise<Student[]> => {
  const snapshot = await getDocs(collection(db, 'students'));
  return snapshot.docs.map(d => ({ ...(d.data() as Student), id: d.id }));
};

export const saveStudent = async (student: Student): Promise<void> => {
  await addDoc(collection(db, 'students'), student);
};

export const getStudentById = async (id: string): Promise<Student | undefined> => {
  const students = await getStudents();
  return students.find(s => s.id === id);
};

// Observations
export const getObservations = async (): Promise<Observation[]> => {
  const snapshot = await getDocs(collection(db, 'observations'));
  return snapshot.docs.map(d => ({ ...(d.data() as Observation), id: d.id }));
};

export const saveObservation = async (observation: Observation): Promise<void> => {
  await addDoc(collection(db, 'observations'), observation);
};

export const getObservationsByStudent = async (studentId: string): Promise<Observation[]> => {
  const q = query(collection(db, 'observations'), where('studentId', '==', studentId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ ...(d.data() as Observation), id: d.id }));
};

export const deleteObservation = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'observations', id));
};

// Evaluations
export const getEvaluations = async (): Promise<Evaluation[]> => {
  const snapshot = await getDocs(collection(db, 'evaluations'));
  return snapshot.docs.map(d => ({ ...(d.data() as Evaluation), id: d.id }));
};

export const saveEvaluation = async (evaluation: Evaluation): Promise<void> => {
  await addDoc(collection(db, 'evaluations'), evaluation);
};

export const getEvaluationsByStudent = async (studentId: string): Promise<Evaluation[]> => {
  const q = query(collection(db, 'evaluations'), where('studentId', '==', studentId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ ...(d.data() as Evaluation), id: d.id }));
};