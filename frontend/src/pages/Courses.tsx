import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { getCourses } from "../api/courses";
import type { Course, Difficulty } from "../types";

const difficultyClass: Record<Difficulty, string> = {
  beginner: "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40",
  intermediate: "bg-amber-500/20 text-amber-300 border border-amber-400/40",
  advanced: "bg-rose-500/20 text-rose-300 border border-rose-400/40",
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

  useEffect(() => {
    getCourses()
      .then((data) => setCourses(data))
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Failed to load courses";
        setError(message);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesDifficulty =
        difficultyFilter === "all" ? true : course.difficulty === difficultyFilter;

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
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Helmet>
        <title>EduAI | Course Catalog</title>
        <meta
          name="description"
          content="Browse AI-assisted courses across programming, data, design, and product skills."
        />
      </Helmet>

      <div className="mb-8 grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Course Catalog</p>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            Market-ready learning paths for college demos and company pilots
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-300 sm:text-base">
            Explore guided content, adaptive quizzes, and skill-focused tracks designed to show
            both student value and product depth.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <p className="text-sm text-slate-400">Courses</p>
            <p className="mt-2 text-2xl font-semibold text-white">{courses.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <p className="text-sm text-slate-400">AI Recommended</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {courses.filter((course) => course.aiRecommended).length}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <p className="text-sm text-slate-400">Learners Reached</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {courses.reduce((total, course) => total + course.students, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/50 p-4 md:flex-row md:items-center md:justify-between">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by title, category, instructor, or topic"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 md:max-w-xl"
        />
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setDifficultyFilter(filter)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                difficultyFilter === filter
                  ? "bg-cyan-300 text-slate-950"
                  : "border border-white/10 bg-white/5 text-slate-300"
              }`}
            >
              {filter === "all" ? "All Levels" : formatDifficulty(filter)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-80 animate-pulse rounded-2xl border border-white/10 bg-slate-900/60" />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 text-sm text-slate-300">
          No courses matched this filter. Try a different keyword or difficulty.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => (
            <article
              key={course.id}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-lg shadow-cyan-900/10 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/40"
            >
              <div className="relative">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                {course.aiRecommended && (
                  <span className="absolute left-4 top-4 rounded-full bg-cyan-300 px-3 py-1 text-xs font-semibold text-slate-950">
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

                <h2 className="text-lg font-semibold text-white">{course.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-slate-300">{course.description}</p>

                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3 text-sm">
                  <div>
                    <p className="font-medium text-cyan-300">{course.instructor}</p>
                    <p className="text-slate-400">{course.category}</p>
                  </div>
                  <Link
                    to={`/courses/${course.id}`}
                    className="rounded-lg border border-cyan-300/40 px-3 py-2 font-medium text-cyan-200 transition hover:bg-cyan-300/10"
                  >
                    View details
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
