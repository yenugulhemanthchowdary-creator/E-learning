import { useMemo } from "react";
export function useProgress(courses) {
    return useMemo(() => {
        const average = courses.length
            ? Math.round(courses.reduce((sum, course) => sum + course.progress, 0) / courses.length)
            : 0;
        const completed = courses.filter((course) => course.progress >= 100).length;
        const inProgress = courses.filter((course) => course.progress > 0 && course.progress < 100).length;
        return { average, completed, inProgress };
    }, [courses]);
}
