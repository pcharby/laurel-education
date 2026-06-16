import { Student, Observation, Evaluation } from './types';

const STUDENTS_KEY = 'insighted_students';
const OBSERVATIONS_KEY = 'insighted_observations';
const EVALUATIONS_KEY = 'insighted_evaluations';

// Students
export const getStudents = (): Student[] => {
  const data = localStorage.getItem(STUDENTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveStudent = (student: Student): void => {
  const students = getStudents();
  students.push(student);
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
};

export const getStudentById = (id: string): Student | undefined => {
  return getStudents().find(s => s.id === id);
};

// Observations
export const getObservations = (): Observation[] => {
  const data = localStorage.getItem(OBSERVATIONS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveObservation = (observation: Observation): void => {
  const observations = getObservations();
  observations.push(observation);
  localStorage.setItem(OBSERVATIONS_KEY, JSON.stringify(observations));
};

export const getObservationsByStudent = (studentId: string): Observation[] => {
  return getObservations().filter(o => o.studentId === studentId);
};

export const deleteObservation = (id: string): void => {
  const observations = getObservations().filter(o => o.id !== id);
  localStorage.setItem(OBSERVATIONS_KEY, JSON.stringify(observations));
};

// Evaluations
export const getEvaluations = (): Evaluation[] => {
  const data = localStorage.getItem(EVALUATIONS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveEvaluation = (evaluation: Evaluation): void => {
  const evaluations = getEvaluations();
  evaluations.push(evaluation);
  localStorage.setItem(EVALUATIONS_KEY, JSON.stringify(evaluations));
};

export const getEvaluationsByStudent = (studentId: string): Evaluation[] => {
  return getEvaluations().filter(e => e.studentId === studentId);
};
