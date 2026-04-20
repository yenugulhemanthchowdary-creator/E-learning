import { apiRequest } from "./client";
export async function getQuizQuestions(topic, difficulty) {
    return apiRequest(`/api/quiz/${encodeURIComponent(topic)}/${difficulty}`);
}
export async function submitQuizAnswer(token, payload) {
    return apiRequest("/api/quiz/submit", {
        method: "POST",
        token,
        body: payload,
    });
}
