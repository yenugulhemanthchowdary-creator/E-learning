import { useEffect, useState } from "react";
import { getCourses } from "../api/courses";
export function useCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        getCourses().then((data) => {
            setCourses(data);
            setLoading(false);
        });
    }, []);
    return { courses, loading };
}
