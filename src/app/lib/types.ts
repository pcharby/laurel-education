import type { Timestamp } from 'firebase/firestore';

export interface Student {
  id: string;
  /** Firebase Auth uid of the owning teacher; every doc is scoped to one teacher. */
  teacherId: string;
  /** External identifier for SIS / data-upload matching (e.g. school student number) */
  studentCode?: string;
  name: string;
  grade: string;
  createdAt: string;
  /**
   * Stamped by the schoolYearLockdownSweep Cloud Function only, never by the
   * client - the teacher's schoolYearEndDate at the moment this student was
   * locked, captured once so later changing the profile date doesn't affect
   * when this record archives. See SchoolClass.schoolYearEndDate.
   */
  schoolYearEndDate?: Timestamp;
  /** Stamped by schoolYearLockdownSweep only, 60 days after schoolYearEndDate (or immediately via a manual archive action). */
  archived?: boolean;
}

export interface SchoolClass {
  id: string;
  teacherId: string;
  subject: string;
  grade: string;
  /** Optional section/group label, e.g. "A" or "Advanced Group" - distinct from grade. */
  name?: string;
  schedule?: string;
  createdAt: string;
  /** Stamped by schoolYearLockdownSweep only - see Student.schoolYearEndDate. */
  schoolYearEndDate?: Timestamp;
  /** Stamped by schoolYearLockdownSweep only, 60 days after schoolYearEndDate (or immediately via a manual archive action). */
  archived?: boolean;
}

export interface Observation {
  id: string;
  teacherId: string;
  studentId: string;
  type: 'text' | 'audio' | 'image';
  content: string;
  timestamp: string;
  tags: string[];
  subject?: string;
  /** Set when type is 'audio' or 'image' and a recording/photo was captured. */
  mediaUrl?: string;
  storagePath?: string;
}

export interface Evaluation {
  id: string;
  teacherId: string;
  studentId: string;
  generatedText: string;
  strengths: string[];
  areasForImprovement: string[];
  date: string;
}

export interface BugReport {
  id: string;
  teacherId: string;
  teacherEmail: string | null;
  category: 'bug' | 'feature-request' | 'other';
  description: string;
  userAgent: string;
  viewport: string;
  createdAt: string;
  status: 'new' | 'reviewed' | 'resolved';
}

export interface Rubric {
  id: string;
  teacherId: string;
  subject: string;
  label: string;
  createdAt: string;
}

export interface TeacherProfile {
  jurisdiction?: string;
  schoolName?: string;
  /**
   * The teacher's chosen end-of-school-year date. Classes/students go
   * read-only 2 days after this date (enforced live in firestore.rules,
   * purely derived from this field - no separate lock flag) and archive 90
   * days after it (via schoolYearLockdownSweep). Absent = feature never
   * engaged, permanently a no-op.
   */
  schoolYearEndDate?: Timestamp;
  updatedAt: string;
}

// A shared, cross-teacher library entry - not scoped to one teacher. Any
// signed-in teacher can read entries matching their jurisdiction/grade/
// subject; only the teacher who added one can delete it. See firestore.rules.
export interface CurriculumResource {
  id: string;
  jurisdiction: string;
  grade: string;
  subject: string;
  title: string;
  type: 'file' | 'link';
  /** Set when type === 'file'. */
  fileUrl?: string;
  storagePath?: string;
  /** Set when type === 'link'. */
  externalUrl?: string;
  addedByTeacherId: string;
  createdAt: string;
}
