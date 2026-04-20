import { apiRequest } from "./client";

export interface StudentDashboardResponse {
  student_id: number;
  progress_percent: number;
  streak_days: number;
  badges: string[];
}

export interface LeaderboardEntry {
  student_id: number;
  display_name: string;
  score: number;
  streak: number;
}

export async function getMyDashboard(token: string): Promise<StudentDashboardResponse> {
  return apiRequest<StudentDashboardResponse>("/api/student/dashboard/me", { token });
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  return apiRequest<LeaderboardEntry[]>("/api/leaderboard");
}
