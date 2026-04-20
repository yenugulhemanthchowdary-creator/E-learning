import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { getMyCourses } from "../api/courses";
import { useAuth } from "../hooks/useAuth";
import type { Course } from "../types";

type SortMode = "highest-progress" | "lowest-progress" | "recent";

export function MyCoursesPage() {
  const { token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>("highest-progress");

  useEffect(() => {
    if (!token) {
      setCourses([]);
      setLoading(false);
      return;
    }

    getMyCourses(token)
      .then((items) => setCourses(items))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, [token]);

  const sortedCourses = useMemo(() => {
    const clone = [...courses];
    if (sortMode === "lowest-progress") {
      clone.sort((a, b) => a.progress - b.progress);
    } else if (sortMode === "recent") {
      clone.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      clone.sort((a, b) => b.progress - a.progress);
    }
    return clone;
  }, [courses, sortMode]);

  return (
    <section className="mx-auto w-[min(1120px,95%)] space-y-5">
      <Helmet>
        <title>EduAI | My Courses</title>
      </Helmet>

      <header className="glass-card p-5">
        <h1 className="text-2xl font-semibold">My Courses</h1>
        <p className="mt-1 text-sm text-slate-300">Track your enrolled courses and resume quickly.</p>
      </header>

      <div className="flex justify-end">
        <select
          value={sortMode}
          onChange={(event) => setSortMode(event.target.value as SortMode)}
          className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm"
        >
          <option value="highest-progress">Highest Progress</option>
          <option value="lowest-progress">Lowest Progress</option>
          <option value="recent">Recently Added</option>
        </select>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-48 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : sortedCourses.length === 0 ? (
        <div className="glass-card p-5 text-sm text-slate-300">
          No enrolled courses yet. Open any course and click <span className="font-semibold text-cyan-300">Enroll</span>.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sortedCourses.map((course) => (
            <article key={course.id} className="glass-card overflow-hidden p-3">
              <img src={course.thumbnail} alt={course.title} className="h-36 w-full rounded-xl object-cover" />
              <h2 className="mt-3 font-semibold">{course.title}</h2>
              <p className="mt-1 text-sm text-slate-300">{course.instructor}</p>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span>{course.progress}% complete</span>
                <Link to={`/courses/${course.id}`} className="rounded-md border border-cyan-300/40 px-3 py-1 text-cyan-200">
                  Resume
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
