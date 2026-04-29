
import { useCallback, useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(true);

  const loadCourse = useCallback(() => {
    setError(null);
    setCourse(null);
    setLoading(true);
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
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  if (loading) {
    return (
      <div className="mx-auto w-[min(1120px,95%)] space-y-6">
        <div className="h-72 animate-pulse rounded-3xl bg-slate-800/70" />
        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="glass-card space-y-4 p-6">
            <div className="h-4 w-28 rounded bg-slate-700/70" />
            <div className="h-8 w-3/4 rounded bg-slate-700/70" />
            <div className="h-4 w-full rounded bg-slate-700/70" />
            <div className="h-4 w-5/6 rounded bg-slate-700/70" />
          </div>
          <div className="glass-card space-y-4 p-6">
            <div className="h-4 w-32 rounded bg-slate-700/70" />
            <div className="h-10 w-20 rounded bg-slate-700/70" />
            <div className="h-2 w-full rounded bg-slate-700/70" />
            <div className="h-20 rounded-2xl bg-slate-700/70" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ui-panel mx-auto w-[min(1120px,95%)] rounded-2xl p-8 text-center text-red-200">
        <p className="text-lg font-medium text-white">{error}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={loadCourse}
            className="ui-btn-primary rounded-lg px-4 py-2 font-semibold"
          >
            Retry
          </button>
          <a href="/courses" className="ui-btn-secondary rounded-lg px-4 py-2 text-slate-100">
            Browse Courses
          </a>
        </div>
      </div>
    );
  }

  if (!course) {
    return <div className="ui-panel mx-auto w-[min(1120px,95%)] rounded-xl p-8">Loading course...</div>;
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
      
      {/* YouTube Video Player */}
      <div className="rounded-3xl bg-slate-900/40 p-2">
        {course.videoId ? (
          <iframe
            width="100%"
            height="450"
            src={`https://www.youtube.com/embed/${course.videoId}?autoplay=0&rel=0`}
            title="Course Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ borderRadius: "12px" }}
          />
        ) : (
          <div className="h-72 w-full rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
            <img src={course.thumbnail} alt={course.title} className="h-full w-full rounded-2xl object-cover" />
          </div>
        )}
      </div>
      
      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <section className="glass-card p-6">
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-primary-300">
            <span>{course.category}</span>
            <span>{course.difficulty}</span>
            <span>{course.duration}</span>
          </div>
          <h1 className="mt-4 text-3xl font-semibold">{course.title}</h1>
          <p className="mt-3 text-slate-300">{course.description}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="ui-panel rounded-2xl p-4">
              <p className="text-sm text-slate-400">Instructor</p>
              <p className="mt-2 font-medium text-white">{course.instructor}</p>
            </div>
            <div className="ui-panel rounded-2xl p-4">
              <p className="text-sm text-slate-400">Rating</p>
              <p className="mt-2 font-medium text-white">{course.rating.toFixed(1)} / 5</p>
            </div>
            <div className="ui-panel rounded-2xl p-4">
              <p className="text-sm text-slate-400">Learners</p>
              <p className="mt-2 font-medium text-white">{course.students.toLocaleString()}</p>
            </div>
          </div>
        </section>

        <aside className="glass-card p-6">
          <p className="text-sm text-slate-400">Enrollment Progress</p>
          <p className="mt-2 text-4xl font-semibold text-white">{course.progress}%</p>
          <div className="mt-4 h-2 rounded-full bg-slate-700/50">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-700"
              style={{ width: `${course.progress}%` }}
            />
          </div>
          <p className="mt-4 text-sm text-slate-300">
            This course includes guided labs, adaptive assessments, and AI-backed practice support.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <div className="ui-panel rounded-2xl p-4">
              <p className="text-sm text-slate-400">Price</p>
              <p className="mt-2 text-2xl font-semibold text-white">Rs. {course.price}</p>
            </div>
            <div className="ui-panel rounded-2xl p-4">
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
              className="ui-btn-primary rounded-lg px-4 py-2 font-semibold"
            >
              Enroll now
            </button>
            <button
              type="button"
              onClick={() => {
                void onProgressUpdate(Math.min(100, course.progress + 25));
              }}
              disabled={saving}
              className="ui-btn-secondary rounded-lg px-4 py-2"
            >
              Mark +25%
            </button>
          </div>
        </aside>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold">What students get</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="ui-panel rounded-2xl p-4 text-sm text-slate-300">
            Weekly checkpoints and guided milestones for steady progress.
          </div>
          <div className="ui-panel rounded-2xl p-4 text-sm text-slate-300">
            Adaptive quiz practice to reinforce concepts as difficulty changes.
          </div>
          <div className="ui-panel rounded-2xl p-4 text-sm text-slate-300">
            AI-generated learning recommendations for faster skill growth.
          </div>
        </div>
      </div>
    </div>
  );
}
