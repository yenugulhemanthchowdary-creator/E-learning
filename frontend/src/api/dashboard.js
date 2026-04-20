import { apiRequest } from "./client";
export async function getMyDashboard(token) {
    return apiRequest("/api/student/dashboard/me", { token });
}
export async function getLeaderboard() {
    return apiRequest("/api/leaderboard");
}
