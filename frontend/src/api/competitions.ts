import { apiRequest } from "./client";
import type {
  CompetitionLeaderboardEntry,
  CompetitionQuestion,
  CompetitionStatus,
  CompetitionSubmitResult,
  Difficulty,
  QuizCompetition,
} from "../types";

interface BackendCompetition {
  id: number;
  title: string;
  topic: string;
  difficulty: Difficulty;
  question_count: number;
  seconds_per_question: number;
  max_participants: number;
  is_public: boolean;
  status: CompetitionStatus;
  join_code: string;
  created_by: number;
  participant_count: number;
}

interface BackendCompetitionQuestion {
  question_index: number;
  total_questions: number;
  prompt: string;
  options: string[];
  hint: string;
  difficulty: Difficulty;
  topic: string;
  seconds_per_question: number;
}

interface BackendCompetitionSubmitResult {
  correct: boolean;
  score_delta: number;
  total_score: number;
  next_question_index: number;
  competition_completed: boolean;
}

interface BackendCompetitionLeaderboardEntry {
  user_id: number;
  display_name: string;
  score: number;
  answered_questions: number;
  rank: number;
}

export interface CompetitionCreatePayload {
  title: string;
  topic: string;
  difficulty: Difficulty;
  question_count: number;
  seconds_per_question: number;
  max_participants: number;
  is_public: boolean;
}

function mapCompetition(item: BackendCompetition): QuizCompetition {
  return {
    id: item.id,
    title: item.title,
    topic: item.topic,
    difficulty: item.difficulty,
    questionCount: item.question_count,
    secondsPerQuestion: item.seconds_per_question,
    maxParticipants: item.max_participants,
    isPublic: item.is_public,
    status: item.status,
    joinCode: item.join_code,
    createdBy: item.created_by,
    participantCount: item.participant_count,
  };
}

function mapCompetitionQuestion(item: BackendCompetitionQuestion): CompetitionQuestion {
  return {
    questionIndex: item.question_index,
    totalQuestions: item.total_questions,
    prompt: item.prompt,
    options: item.options,
    hint: item.hint,
    difficulty: item.difficulty,
    topic: item.topic,
    secondsPerQuestion: item.seconds_per_question,
  };
}

function mapCompetitionSubmit(item: BackendCompetitionSubmitResult): CompetitionSubmitResult {
  return {
    correct: item.correct,
    scoreDelta: item.score_delta,
    totalScore: item.total_score,
    nextQuestionIndex: item.next_question_index,
    competitionCompleted: item.competition_completed,
  };
}

function mapLeaderboardEntry(item: BackendCompetitionLeaderboardEntry): CompetitionLeaderboardEntry {
  return {
    userId: item.user_id,
    displayName: item.display_name,
    score: item.score,
    answeredQuestions: item.answered_questions,
    rank: item.rank,
  };
}

export async function createCompetition(token: string, payload: CompetitionCreatePayload): Promise<QuizCompetition> {
  const response = await apiRequest<BackendCompetition>("/api/quiz/competitions", {
    method: "POST",
    token,
    body: payload,
  });
  return mapCompetition(response);
}

export async function listCompetitions(token: string, status?: CompetitionStatus): Promise<QuizCompetition[]> {
  const suffix = status ? `?status_filter=${encodeURIComponent(status)}` : "";
  const response = await apiRequest<BackendCompetition[]>(`/api/quiz/competitions${suffix}`, {
    token,
  });
  return response.map(mapCompetition);
}

export async function joinCompetition(token: string, competitionId: number, joinCode?: string): Promise<QuizCompetition> {
  const response = await apiRequest<BackendCompetition>(`/api/quiz/competitions/${competitionId}/join`, {
    method: "POST",
    token,
    body: { join_code: joinCode ?? null },
  });
  return mapCompetition(response);
}

export async function startCompetition(token: string, competitionId: number): Promise<QuizCompetition> {
  const response = await apiRequest<BackendCompetition>(`/api/quiz/competitions/${competitionId}/start`, {
    method: "POST",
    token,
  });
  return mapCompetition(response);
}

export async function getCompetitionQuestion(
  token: string,
  competitionId: number,
  questionIndex: number,
): Promise<CompetitionQuestion> {
  const response = await apiRequest<BackendCompetitionQuestion>(
    `/api/quiz/competitions/${competitionId}/questions/${questionIndex}`,
    { token },
  );
  return mapCompetitionQuestion(response);
}

export async function submitCompetitionAnswer(
  token: string,
  competitionId: number,
  questionIndex: number,
  selectedAnswer: string,
  timeTakenSeconds: number,
): Promise<CompetitionSubmitResult> {
  const response = await apiRequest<BackendCompetitionSubmitResult>(`/api/quiz/competitions/${competitionId}/submit`, {
    method: "POST",
    token,
    body: {
      question_index: questionIndex,
      selected_answer: selectedAnswer,
      time_taken_seconds: timeTakenSeconds,
    },
  });
  return mapCompetitionSubmit(response);
}

export async function getCompetitionLeaderboard(token: string, competitionId: number): Promise<CompetitionLeaderboardEntry[]> {
  const response = await apiRequest<BackendCompetitionLeaderboardEntry[]>(
    `/api/quiz/competitions/${competitionId}/leaderboard`,
    { token },
  );
  return response.map(mapLeaderboardEntry);
}
