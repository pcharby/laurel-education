export interface Student {
  id: string;
  /** External identifier for SIS / data-upload matching (e.g. school student number) */
  studentCode?: string;
  name: string;
  grade: string;
  createdAt: string;
}

export interface Observation {
  id: string;
  studentId: string;
  type: 'text' | 'audio' | 'image';
  content: string;
  timestamp: string;
  tags: string[];
  subject?: string;
}

export interface Evaluation {
  id: string;
  studentId: string;
  generatedText: string;
  strengths: string[];
  areasForImprovement: string[];
  date: string;
}
