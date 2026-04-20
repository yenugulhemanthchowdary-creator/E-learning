import { apiRequest } from "./client";
import type { Difficulty, QuizQuestion } from "../types";

export interface QuizSubmitPayload {
  student_id: number;
  topic: string;
  difficulty: Difficulty;
  question_id: string;
  selected_answer: string;
}

export interface QuizSubmitResponse {
  correct: boolean;
  score_delta: number;
  next_difficulty: Difficulty;
}

export async function getQuizQuestions(topic: string, difficulty: Difficulty): Promise<QuizQuestion[]> {
  return apiRequest<QuizQuestion[]>(`/api/quiz/${encodeURIComponent(topic)}/${difficulty}`);
}

export async function submitQuizAnswer(token: string, payload: QuizSubmitPayload): Promise<QuizSubmitResponse> {
  return apiRequest<QuizSubmitResponse>("/api/quiz/submit", {
    method: "POST",
    token,
    body: payload,
  });
}
