export interface User {
  id: string;
  email: string;
  fullName: string;
}

export interface Question {
  id: string;
  question_text: string;
  options: string[];
}

export interface ExamResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  timeTaken: number;
  attemptId?: string;
  completedAt?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}