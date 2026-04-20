import { useEffect, useState } from "react";
import { getCourses } from "../api/courses";
import type { Course } from "../types";

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCourses().then((data) => {
      setCourses(data);
      setLoading(false);
    });
  }, []);

  return { courses, loading };
}
