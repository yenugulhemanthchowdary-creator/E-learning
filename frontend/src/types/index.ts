export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface User {
  id: number;
  fullName: string;
  email: string;
  avatar: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail: string;
  rating: number;
  duration: string;
  difficulty: Difficulty;
  category: string;
  price: number;
  progress: number;
  aiRecommended: boolean;
  students: number;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  topic: string;
  difficulty: Difficulty;
  prompt: string;
  options: string[];
  answer: string;
  hint: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  earnedAt: string;
}

export interface ActivityPoint {
  day: string;
  minutes: number;
}

export interface DashboardStats {
  weeklyActivity: ActivityPoint[];
  skillRadar: Array<{ skill: string; value: number }>;
  badges: Badge[];
}

export interface DashboardData {
  weeklyActivity: ActivityPoint[];
  topicMastery: Array<{ topic: string; mastery: number }>;
  streak: number;
  badges: Array<{ id: string; title: string; description: string }>;
  recommendedTopics: string[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LearningPathResponse {
  steps: string[];
  estimated_time: string;
  resources: string[];
  quiz_questions: string[];
}
