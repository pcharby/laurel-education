import { SchoolClass } from './types';

// Grades are stored as free-text strings ('K', '1', ... '12') since some
// jurisdictions use non-numeric grade labels - this only needs to rank the
// ones this app actually uses. 'K' sorts before every numeric grade;
// anything unrecognized sorts last rather than throwing, so a stray label
// doesn't break the whole list.
const gradeRank = (grade: string): number => {
  if (grade.trim().toUpperCase() === 'K') return -1;
  const n = parseInt(grade, 10);
  return Number.isNaN(n) ? Number.MAX_SAFE_INTEGER : n;
};

// Subject alphabetical first (so a multi-subject teacher sees their
// subjects grouped), grade ascending within a subject (so a high school
// teacher's sections read 9 -> 10 -> 11 -> 12 instead of Firestore's
// unordered return), then section name as the final tie-breaker for
// multiple same-grade sections of the same subject.
export const compareClasses = (a: SchoolClass, b: SchoolClass): number =>
  a.subject.localeCompare(b.subject)
  || gradeRank(a.grade) - gradeRank(b.grade)
  || (a.name ?? '').localeCompare(b.name ?? '');
