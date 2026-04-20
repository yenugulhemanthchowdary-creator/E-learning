import { ApiError, apiRequest } from "./client";
function mapCourse(course) {
    return {
        id: String(course.id),
        title: course.title,
        description: course.description,
        instructor: course.instructor,
        thumbnail: course.thumbnail,
        rating: course.rating,
        duration: course.duration,
        difficulty: course.difficulty,
        category: course.category,
        price: course.price,
        progress: course.progress,
        aiRecommended: course.ai_recommended,
        students: course.students,
        createdAt: course.created_at,
    };
}
export async function getCourses() {
    const response = await apiRequest("/api/courses");
    return response.map(mapCourse);
}
export async function getCourseById(id) {
    try {
        const response = await apiRequest(`/api/courses/${id}`);
        return mapCourse(response);
    }
    catch (error) {
        if (error instanceof ApiError && error.status === 404) {
            return null;
        }
        throw error;
    }
}
export async function enrollInCourse(token, courseId) {
    await apiRequest(`/api/courses/${courseId}/enroll`, {
        method: "POST",
        token,
    });
}
export async function updateCourseProgress(token, courseId, progress) {
    await apiRequest(`/api/courses/${courseId}/progress`, {
        method: "PATCH",
        token,
        body: { progress },
    });
}
export async function getMyCourses(token) {
    const response = await apiRequest("/api/student/courses/me", { token });
    return response.map(mapCourse);
}
