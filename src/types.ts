export enum Role {
  STUDENT = 'student',
  TEACHER = 'teacher'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number; // Index in options array
  points: number;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  subject: string;
  durationMinutes: number;
  totalPoints: number;
  questions: Question[];
  creatorId: string;
  createdAt: string;
}

export interface AnswerSelection {
  questionId: string;
  selectedOptionIndex: number;
}

export interface Submission {
  id: string;
  examId: string;
  examTitle: string;
  subject: string;
  studentId: string;
  studentName: string;
  answers: AnswerSelection[];
  score: number;
  totalPoints: number;
  passed: boolean;
  percentage: number;
  submittedAt: string;
  tabLeavesWarningCount: number; // Mock cheating prevention tracker
}

export interface ExamStats {
  examId: string;
  examTitle: string;
  subject: string;
  averageScore: number;
  averagePercentage: number;
  passedCount: number;
  failedCount: number;
  totalSubmissions: number;
}
