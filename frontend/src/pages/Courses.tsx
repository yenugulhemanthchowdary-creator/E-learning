import { Play, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { getCourses } from "../api/courses";
import type { Course, Difficulty } from "../types";

const difficultyClass: Record<Difficulty, string> = {
  beginner: "border border-emerald-400/40 bg-emerald-500/15 text-emerald-200",
  intermediate: "border border-amber-400/45 bg-amber-500/15 text-amber-200",
  advanced: "border border-rose-400/45 bg-rose-500/15 text-rose-200",
};

const filters: Array<"all" | Difficulty> = ["all", "beginner", "intermediate", "advanced"];

function formatDifficulty(value: Difficulty): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<"all" | Difficulty>("all");
  const [demoOpen, setDemoOpen] = useState(false);

  const loadCourses = useCallback(() => {
    setLoading(true);
    setError(null);
    getCourses()
      .then((data) => setCourses(data))
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Failed to load courses";
        setError(message);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesDifficulty = difficultyFilter === "all" ? true : course.difficulty === difficultyFilter;

      const matchesQuery =
        normalizedQuery.length === 0
          ? true
          : [course.title, course.category, course.instructor, course.description]
              .join(" ")
              .toLowerCase()
              .includes(normalizedQuery);

      return matchesDifficulty && matchesQuery;
    });
  }, [courses, difficultyFilter, query]);

  return (
    <section
      className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-[32px] px-4 py-10 sm:px-6 lg:px-8"
      style={{ background: "#0a0a0f", fontFamily: "'DM Sans', sans-serif" }}
    >
      <Helmet>
        <title>EduAI | Course Catalog</title>
        <meta
          name="description"
          content="Browse AI-assisted courses across programming, data, design, and product skills."
        />
      </Helmet>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;700&display=swap');
      `}</style>

      <div className="pointer-events-none absolute -left-28 -top-28 h-80 w-80 rounded-full bg-[#7c3aed]/25 blur-3xl" />

      <div className="relative z-10 mb-8 grid gap-4 rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.04)] p-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#a78bfa]">COURSE CATALOG</p>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-5xl" style={{ fontFamily: "'Syne', sans-serif" }}>
            Market-ready learning paths for college demos and company pilots
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-300 sm:text-base">
            Explore guided content, adaptive quizzes, and skill-focused tracks designed to show
            both student value and product depth.
          </p>
          <button
            type="button"
            onClick={() => setDemoOpen(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#7c3aed] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6d28d9]"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            Watch Demo
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <div className="rounded-2xl border border-white/10 bg-[#7c3aed]/15 p-4">
            <p className="text-sm text-slate-300">Courses</p>
            <p className="mt-2 text-2xl font-semibold text-white">{courses.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#7c3aed]/15 p-4">
            <p className="text-sm text-slate-300">AI Recommended</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {courses.filter((course) => course.aiRecommended).length}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#7c3aed]/15 p-4">
            <p className="text-sm text-slate-300">Learners Reached</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {courses.reduce((total, course) => total + course.students, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 mb-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.04)] p-4 md:flex-row md:items-center md:justify-between">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by title, category, instructor, or topic"
          className="w-full rounded-xl border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/30 md:max-w-xl"
        />
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setDifficultyFilter(filter)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                difficultyFilter === filter
                  ? "bg-[#7c3aed] text-white shadow-[0_8px_24px_rgba(124,58,237,0.45)]"
                  : "border border-white/10 bg-[rgba(255,255,255,0.04)] text-slate-300 hover:bg-white/10"
              }`}
            >
              {filter === "all" ? "All Levels" : formatDifficulty(filter)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="relative z-10 mb-5 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-4 text-sm text-rose-200">
          <p>{error}</p>
          <button
            type="button"
            onClick={loadCourses}
            className="mt-3 rounded-lg border border-rose-300/40 px-4 py-2 font-medium text-rose-100 transition hover:bg-rose-500/10"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="relative z-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-80 animate-pulse rounded-2xl border border-white/10 bg-slate-900/60" />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="relative z-10 rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.04)] p-6 text-sm text-slate-300">
          <p className="text-base font-medium text-white">No courses found</p>
          <p className="mt-2">Try a different keyword or reset the current filters.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setDifficultyFilter("all");
            }}
            className="mt-4 rounded-lg bg-[#7c3aed] px-4 py-2 font-semibold text-white transition hover:bg-[#6d28d9]"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="relative z-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => (
            <article
              key={course.id}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#7c3aed]/35"
            >
              <div className="relative">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#c4b5fd]/50 bg-[#7c3aed]/50 backdrop-blur">
                    <Play className="h-6 w-6 text-white" aria-hidden="true" />
                  </span>
                </div>
                {course.aiRecommended && (
                  <span className="absolute left-4 top-4 rounded-full bg-[#7c3aed] px-3 py-1 text-xs font-semibold text-white">
                    AI Recommended
                  </span>
                )}
              </div>

              <div className="p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${difficultyClass[course.difficulty]}`}
                  >
                    {formatDifficulty(course.difficulty)}
                  </span>
                  <span className="text-xs text-slate-400">{course.duration}</span>
                </div>

                <h2 className="text-lg font-semibold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {course.title}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm text-slate-300">{course.description}</p>

                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3 text-sm">
                  <div>
                    <p className="font-medium text-[#c4b5fd]">{course.instructor}</p>
                    <p className="text-slate-400">{course.category}</p>
                  </div>
                  <Link
                    to={`/courses/${course.id}`}
                    className="rounded-lg border border-white/10 bg-[rgba(255,255,255,0.04)] px-3 py-2 font-medium text-slate-100 transition hover:border-[#7c3aed]/40 hover:bg-[#7c3aed]"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {demoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl rounded-2xl border border-white/10 bg-[#11111a] p-4 sm:p-6">
            <button
              type="button"
              onClick={() => setDemoOpen(false)}
              aria-label="Close demo modal"
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <h3 className="mb-4 text-2xl font-semibold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
              EduAI Platform Demo
            </h3>
            <iframe
              width="100%"
              height="400"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              frameBorder="0"
              allowFullScreen
              title="EduAI Demo Video"
            />
          </div>
        </div>
      )}
    </section>
  );
}
