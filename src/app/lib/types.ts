import type { Timestamp } from 'firebase/firestore';

export interface Student {
  id: string;
  /** Firebase Auth uid of the owning teacher; every doc is scoped to one teacher. */
  teacherId: string;
  /** External identifier for SIS / data-upload matching (e.g. school student number) */
  studentCode?: string;
  name: string;
  grade: string;
  /** Which of the teacher's Schools this student belongs to - see School. Absent for teachers who never set up multiple schools. */
  schoolId?: string;
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
  /** Which of the teacher's Schools this class belongs to - see School. Absent for teachers who never set up multiple schools. */
  schoolId?: string;
  /**
   * Explicit roster: exactly these Student ids belong to this class, and no
   * others - set via the "Manage Roster" dialog. Absent (or an empty array)
   * means this class has no explicit roster yet, and falls back to the
   * original behavior of matching every non-archived student at this
   * class's grade (and school, if set). That fallback is what makes this
   * purely additive: a teacher who never opens "Manage Roster" sees no
   * change at all. Explicit rosters exist for the case an implicit grade
   * match can't express - e.g. two different pull-out groups drawn from the
   * same grade at the same school, which would otherwise show the exact
   * same students in both.
   */
  studentIds?: string[];
  createdAt: string;
  /** Stamped by schoolYearLockdownSweep only - see Student.schoolYearEndDate. */
  schoolYearEndDate?: Timestamp;
  /** Stamped by schoolYearLockdownSweep only, 60 days after schoolYearEndDate (or immediately via a manual archive action). */
  archived?: boolean;
}

export type PerformanceLevel = 'needs-support' | 'still-learning' | 'meets-expectations' | 'exceeds-expectations';

export interface Observation {
  id: string;
  teacherId: string;
  studentId: string;
  type: 'text' | 'audio' | 'image';
  content: string;
  timestamp: string;
  tags: string[];
  subject?: string;
  performanceLevel?: PerformanceLevel;
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

// Rubric and Strand share the same optional scoping: `grade`/`schoolId`
// pin an entry to one specific (subject, grade, school) combination - e.g.
// a Grade 6 "Simple Machines" strand distinct from a Grade 8 "Cellular
// Processes" one under the same "Science" subject. Absent means the entry
// applies everywhere that subject is taught, which is both the default for
// a teacher who only ever teaches a subject at one grade/school (nothing to
// scope) and how every entry created before this feature already behaves -
// so existing data keeps showing up exactly where it always did.
export interface Rubric {
  id: string;
  teacherId: string;
  subject: string;
  grade?: string;
  schoolId?: string;
  label: string;
  createdAt: string;
}

// Teacher-editable curriculum strands, shown in the "Curriculum Strand"
// picker when recording an observation. Same shape/ownership/scoping as Rubric.
export interface Strand {
  id: string;
  teacherId: string;
  subject: string;
  grade?: string;
  schoolId?: string;
  label: string;
  createdAt: string;
}

// An itinerant/multi-school teacher's separate schools - a lightweight
// sub-structure so classes and student rosters (SchoolClass.schoolId /
// Student.schoolId) can be kept apart per school, instead of the single
// TeacherProfile.schoolName shown in the header. Teachers who work at one
// school never create any of these, and nothing else in the app changes.
export interface School {
  id: string;
  teacherId: string;
  name: string;
  createdAt: string;
}

export interface TeacherProfile {
  /** Shown in greetings (e.g. "Welcome, Sarah!") instead of the account's raw email. */
  displayName?: string;
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
