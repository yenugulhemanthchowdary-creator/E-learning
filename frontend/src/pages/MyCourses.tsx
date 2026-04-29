import { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, GraduationCap } from "lucide-react";
import { getMyCourses } from "../api/courses";
import { useAuth } from "../hooks/useAuth";
import type { Course } from "../types";

type SortMode = "highest-progress" | "lowest-progress" | "recent";

export function MyCoursesPage() {
  const { token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("highest-progress");

  const loadCourses = useCallback(() => {
    if (!token) {
      setCourses([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    getMyCourses(token)
      .then((items) => setCourses(items))
      .catch((fetchError) => {
        setCourses([]);
        const message = fetchError instanceof Error ? fetchError.message : "Failed to load enrolled courses";
        setError(message);
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

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
    <section
      className="relative mx-auto w-[min(1120px,95%)] space-y-6 overflow-hidden rounded-[32px] px-4 py-6 sm:px-6"
      style={{ background: "#0a0a0f", fontFamily: "'DM Sans', sans-serif" }}
    >
      <Helmet>
        <title>EduAI | My Courses</title>
      </Helmet>

      <div className="pointer-events-none absolute -left-24 -top-28 h-72 w-72 rounded-full bg-[#7c3aed]/25 blur-3xl" />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;700&display=swap');
      `}</style>

      <header className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl" style={{ fontFamily: "'Syne', sans-serif" }}>
            My Courses
          </h1>
          <p className="mt-2 text-sm text-slate-300 sm:text-base">
            Track your enrolled courses and resume quickly
          </p>
        </div>

        <div className="flex justify-start lg:justify-end">
          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as SortMode)}
            aria-label="Sort enrolled courses"
            className="w-full rounded-xl border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/30 lg:w-56"
          >
            <option value="highest-progress">Highest Progress</option>
            <option value="lowest-progress">Lowest Progress</option>
            <option value="recent">Recently Added</option>
          </select>
        </div>
      </header>


      {error && (
        <div className="relative z-10 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-5 text-sm text-rose-100">
          <p className="text-base font-medium text-white">We couldn’t load your courses.</p>
          <p className="mt-2">{error}</p>
          <button
            type="button"
            onClick={loadCourses}
            className="mt-4 rounded-lg bg-[#7c3aed] px-4 py-2 font-semibold text-white transition hover:bg-[#6d28d9]"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="relative z-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-3 rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.04)] p-3">
              <div className="h-40 animate-pulse rounded-xl bg-slate-800/70" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-slate-700/70" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-slate-700/70" />
              <div className="h-2 w-full animate-pulse rounded bg-slate-700/70" />
            </div>
          ))}
        </div>
      ) : sortedCourses.length === 0 ? (
        <div className="relative z-10 flex justify-center">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.04)] p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#7c3aed]/35 bg-[#7c3aed]/15 text-[#c4b5fd]">
              <GraduationCap className="h-7 w-7" aria-hidden="true" />
            </div>
            <h2 className="mt-5 text-3xl font-semibold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
              No courses yet
            </h2>
            <p className="mt-2 text-sm text-slate-300 sm:text-base">
              Enroll in a course to start your learning journey
            </p>
            <Link
              to="/courses"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#7c3aed] px-5 py-3 font-semibold text-white transition hover:bg-[#6d28d9]"
            >
              Browse Courses
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="relative z-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {sortedCourses.map((course) => (
            <article
              key={course.id}
              className="overflow-hidden rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.04)] p-3 shadow-[0_10px_40px_rgba(0,0,0,0.25)] transition hover:-translate-y-1 hover:border-[#7c3aed]/35"
            >
              <img src={course.thumbnail} alt={course.title} className="h-40 w-full rounded-xl object-cover" />
              <h2 className="mt-3 text-xl font-semibold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                {course.title}
              </h2>
              <p className="mt-1 text-sm text-slate-400">{course.instructor}</p>
              <div className="mt-4 h-2 rounded-full bg-slate-800/80">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#a855f7]"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
                <span>{course.progress}% complete</span>
                <Link
                  to={`/courses/${course.id}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#7c3aed] px-3.5 py-2 font-semibold text-white transition hover:bg-[#6d28d9]"
                >
                  Continue
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
