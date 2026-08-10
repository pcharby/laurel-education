export interface Student {
  id: string;
  /** Firebase Auth uid of the owning teacher; every doc is scoped to one teacher. */
  teacherId: string;
  /** External identifier for SIS / data-upload matching (e.g. school student number) */
  studentCode?: string;
  name: string;
  grade: string;
  createdAt: string;
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
