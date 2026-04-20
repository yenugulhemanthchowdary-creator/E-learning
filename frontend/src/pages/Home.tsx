import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { HeroSection } from "../components/Hero";
import { LearningPathGenerator } from "../components/LearningPathGenerator";
import { LiveCodeSandbox } from "../components/LiveCodeSandbox";
import { StudentAnalyticsDashboard } from "../components/StudentAnalyticsDashboard";
import type { DashboardData } from "../types";

const dashboardPreview: DashboardData = {
  weeklyActivity: [
    { day: "Mon", minutes: 45 },
    { day: "Tue", minutes: 65 },
    { day: "Wed", minutes: 52 },
    { day: "Thu", minutes: 74 },
    { day: "Fri", minutes: 88 },
    { day: "Sat", minutes: 40 },
    { day: "Sun", minutes: 55 },
  ],
  topicMastery: [
    { topic: "Python", mastery: 84 },
    { topic: "React", mastery: 78 },
    { topic: "SQL", mastery: 71 },
    { topic: "AI", mastery: 67 },
  ],
  streak: 9,
  badges: [
    { id: "b1", title: "Quiz Starter", description: "Completed 5 adaptive quiz rounds" },
    { id: "b2", title: "Streak Builder", description: "Maintained a 3+ day learning streak" },
    { id: "b3", title: "Project Finisher", description: "Finished a guided practice milestone" },
    { id: "b4", title: "Fast Learner", description: "Moved up difficulty with high accuracy" },
  ],
  recommendedTopics: ["State management", "Prompt engineering", "SQL joins"],
};

const featureCards = [
  {
    title: "Adaptive Assessments",
    description: "Quiz difficulty adjusts with performance so students stay challenged without getting stuck.",
  },
  {
    title: "AI Learning Plans",
    description: "Generate structured study paths instantly using built-in OpenAI-backed workflows with fallback demo support.",
  },
  {
    title: "Progress Visibility",
    description: "Track learning streaks, mastery, badges, and course momentum through a clear analytics surface.",
  },
];

export function HomePage() {
  return (
    <>
      <Helmet>
        <title>EduAI | Learn Smarter</title>
        <meta
          name="description"
          content="An AI-powered e-learning platform with adaptive quizzes, guided learning paths, and analytics."
        />
      </Helmet>

      <div className="mx-auto w-[min(1120px,95%)] space-y-12 pb-10">
        <HeroSection />

        <section className="grid gap-4 md:grid-cols-3">
          {featureCards.map((card) => (
            <article key={card.title} className="glass-card p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Capability</p>
              <h2 className="mt-3 text-2xl font-semibold">{card.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">{card.description}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="glass-card p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">AI Study Planner</p>
            <h2 className="mt-3 text-3xl font-semibold">Show personalized guidance in one click</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-300">
              Reviewers can test real product value immediately: topic selection, skill-level tuning,
              generated steps, resource ideas, and follow-up prompts.
            </p>
          </div>
          <LearningPathGenerator />
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <LiveCodeSandbox />
          <div className="glass-card p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">AI Coding Support</p>
            <h2 className="mt-3 text-3xl font-semibold">Turn practice into feedback, not just submission</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              The sandbox gives students a place to experiment while the backend returns concise
              improvement guidance. It is a strong feature for both classroom value and buyer demos.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">Use case</p>
                <p className="mt-2 font-medium text-white">Lab practice and code review training</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">Value</p>
                <p className="mt-2 font-medium text-white">Fast iteration without a human evaluator on every step</p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="glass-card p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Analytics Preview</p>
            <h2 className="mt-3 text-3xl font-semibold">Give institutions a dashboard they can understand</h2>
            <p className="mt-3 max-w-3xl text-sm text-slate-300">
              This preview highlights the reporting story behind the platform: engagement, mastery,
              streaks, badges, and recommended topics.
            </p>
          </div>
          <StudentAnalyticsDashboard data={dashboardPreview} />
        </section>

        <section className="glass-card flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Demo Ready</p>
            <h2 className="mt-2 text-2xl font-semibold">Use this build for submission, review, and pitching</h2>
            <p className="mt-2 text-sm text-slate-300">
              The current setup is optimized for quick local launch with backend-powered auth, courses,
              quiz flows, and AI feature fallbacks.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/register"
              className="rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-3 font-semibold text-black"
            >
              Create account
            </Link>
            <Link
              to="/courses"
              className="rounded-xl border border-white/20 px-5 py-3 font-semibold text-white"
            >
              Browse catalog
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
