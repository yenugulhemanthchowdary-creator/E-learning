import { ApiError, apiRequest } from "./client";
import type { Course, Difficulty } from "../types";

interface BackendCourse {
  id: number;
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
  ai_recommended: boolean;
  students: number;
  video_id: string;
  created_at: string;
}

function mapCourse(course: BackendCourse): Course {
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
    videoId: course.video_id,
    createdAt: course.created_at,
  };
}

export async function getCourses(): Promise<Course[]> {
  const response = await apiRequest<BackendCourse[]>("/api/courses");
  return response.map(mapCourse);
}

export async function getCourseById(id: string | number): Promise<Course | null> {
  try {
    const response = await apiRequest<BackendCourse>(`/api/courses/${id}`);
    return mapCourse(response);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function enrollInCourse(token: string, courseId: string): Promise<void> {
  await apiRequest(`/api/courses/${courseId}/enroll`, {
    method: "POST",
    token,
  });
}

export async function updateCourseProgress(token: string, courseId: string, progress: number): Promise<void> {
  await apiRequest(`/api/courses/${courseId}/progress`, {
    method: "PATCH",
    token,
    body: { progress },
  });
}

export async function getMyCourses(token: string): Promise<Course[]> {
  const response = await apiRequest<BackendCourse[]>("/api/student/courses/me", { token });
  return response.map(mapCourse);
}
