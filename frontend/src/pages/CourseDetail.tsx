
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { enrollInCourse, getCourseById, updateCourseProgress } from "../api/courses";
import { useToast } from "../components/ToastProvider";
import { useAuth } from "../hooks/useAuth";
import type { Course } from "../types";


export function CourseDetailPage() {
  const { token } = useAuth();
  const { pushToast } = useToast();
  const { id = "" } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setCourse(null);
    getCourseById(id)
      .then((data) => {
        if (!data) {
          setError("Course not found.");
        } else {
          setCourse(data);
        }
      })
      .catch(() => {
        setError("Failed to load course. Please try again later.");
      });
  }, [id]);

  if (error) {
    return (
      <div className="mx-auto w-[min(1120px,95%)] rounded-xl bg-white/5 p-8 text-center text-red-400">
        {error}
      </div>
    );
  }

  if (!course) {
    return <div className="mx-auto w-[min(1120px,95%)] rounded-xl bg-white/5 p-8">Loading course...</div>;
  }

  const onEnroll = async () => {
    if (!token) {
      pushToast("Please login to enroll", "warning");
      return;
    }
    setSaving(true);
    try {
      await enrollInCourse(token, course.id);
      pushToast("Enrolled successfully", "success");
    } catch {
      pushToast("Enrollment failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const onProgressUpdate = async (nextProgress: number) => {
    if (!token) {
      pushToast("Please login to update progress", "warning");
      return;
    }
    setSaving(true);
    try {
      await updateCourseProgress(token, course.id, nextProgress);
      setCourse((previous) => (previous ? { ...previous, progress: nextProgress } : previous));
      pushToast("Progress updated", "success");
    } catch {
      pushToast("Update progress failed", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-[min(1120px,95%)] space-y-6">
      <Helmet>
        <title>EduAI | {course.title}</title>
        <meta name="description" content={course.description} />
      </Helmet>
      <img src={course.thumbnail} alt={course.title} className="h-72 w-full rounded-3xl object-cover" />
      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <section className="glass-card p-6">
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">
            <span>{course.category}</span>
            <span>{course.difficulty}</span>
            <span>{course.duration}</span>
          </div>
          <h1 className="mt-4 text-3xl font-semibold">{course.title}</h1>
          <p className="mt-3 text-slate-300">{course.description}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Instructor</p>
              <p className="mt-2 font-medium text-white">{course.instructor}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Rating</p>
              <p className="mt-2 font-medium text-white">{course.rating.toFixed(1)} / 5</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Learners</p>
              <p className="mt-2 font-medium text-white">{course.students.toLocaleString()}</p>
            </div>
          </div>
        </section>

        <aside className="glass-card p-6">
          <p className="text-sm text-slate-400">Enrollment Progress</p>
          <p className="mt-2 text-4xl font-semibold text-white">{course.progress}%</p>
          <div className="mt-4 h-2 rounded-full bg-white/10">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
              style={{ width: `${course.progress}%` }}
            />
          </div>
          <p className="mt-4 text-sm text-slate-300">
            This course includes guided labs, adaptive assessments, and AI-backed practice support.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Price</p>
              <p className="mt-2 text-2xl font-semibold text-white">Rs. {course.price}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">AI Recommendation</p>
              <p className="mt-2 font-medium text-white">
                {course.aiRecommended ? "Yes, based on learner momentum" : "Available in the broader catalog"}
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                void onEnroll();
              }}
              disabled={saving}
              className="rounded-lg bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-2 font-semibold text-black disabled:opacity-60"
            >
              Enroll now
            </button>
            <button
              type="button"
              onClick={() => {
                void onProgressUpdate(Math.min(100, course.progress + 25));
              }}
              disabled={saving}
              className="rounded-lg border border-white/20 px-4 py-2 disabled:opacity-60"
            >
              Mark +25%
            </button>
          </div>
        </aside>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold">What students get</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            Weekly checkpoints and guided milestones for steady progress.
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            Adaptive quiz practice to reinforce concepts as difficulty changes.
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            AI-generated learning recommendations for faster skill growth.
          </div>
        </div>
      </div>
    </div>
  );
}
