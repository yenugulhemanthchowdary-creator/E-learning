import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { HeroSection } from "../components/Hero";
import { LearningPathGenerator } from "../components/LearningPathGenerator";
import { LiveCodeSandbox } from "../components/LiveCodeSandbox";
import { StudentAnalyticsDashboard } from "../components/StudentAnalyticsDashboard";
const dashboardPreview = {
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
    return (_jsxs(_Fragment, { children: [_jsxs(Helmet, { children: [_jsx("title", { children: "EduAI | Learn Smarter" }), _jsx("meta", { name: "description", content: "An AI-powered e-learning platform with adaptive quizzes, guided learning paths, and analytics." })] }), _jsxs("div", { className: "mx-auto w-[min(1120px,95%)] space-y-12 pb-10", children: [_jsx(HeroSection, {}), _jsx("section", { className: "grid gap-4 md:grid-cols-3", children: featureCards.map((card) => (_jsxs("article", { className: "glass-card p-6", children: [_jsx("p", { className: "text-sm uppercase tracking-[0.24em] text-cyan-300", children: "Capability" }), _jsx("h2", { className: "mt-3 text-2xl font-semibold", children: card.title }), _jsx("p", { className: "mt-3 text-sm leading-6 text-slate-300", children: card.description })] }, card.title))) }), _jsxs("section", { className: "grid gap-6 lg:grid-cols-[1.05fr_0.95fr]", children: [_jsxs("div", { className: "glass-card p-6", children: [_jsx("p", { className: "text-sm uppercase tracking-[0.24em] text-cyan-300", children: "AI Study Planner" }), _jsx("h2", { className: "mt-3 text-3xl font-semibold", children: "Show personalized guidance in one click" }), _jsx("p", { className: "mt-3 max-w-2xl text-sm text-slate-300", children: "Reviewers can test real product value immediately: topic selection, skill-level tuning, generated steps, resource ideas, and follow-up prompts." })] }), _jsx(LearningPathGenerator, {})] }), _jsxs("section", { className: "grid gap-6 lg:grid-cols-[0.95fr_1.05fr]", children: [_jsx(LiveCodeSandbox, {}), _jsxs("div", { className: "glass-card p-6", children: [_jsx("p", { className: "text-sm uppercase tracking-[0.24em] text-cyan-300", children: "AI Coding Support" }), _jsx("h2", { className: "mt-3 text-3xl font-semibold", children: "Turn practice into feedback, not just submission" }), _jsx("p", { className: "mt-3 text-sm leading-6 text-slate-300", children: "The sandbox gives students a place to experiment while the backend returns concise improvement guidance. It is a strong feature for both classroom value and buyer demos." }), _jsxs("div", { className: "mt-5 grid gap-3 sm:grid-cols-2", children: [_jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [_jsx("p", { className: "text-sm text-slate-400", children: "Use case" }), _jsx("p", { className: "mt-2 font-medium text-white", children: "Lab practice and code review training" })] }), _jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [_jsx("p", { className: "text-sm text-slate-400", children: "Value" }), _jsx("p", { className: "mt-2 font-medium text-white", children: "Fast iteration without a human evaluator on every step" })] })] })] })] }), _jsxs("section", { className: "space-y-5", children: [_jsxs("div", { className: "glass-card p-6", children: [_jsx("p", { className: "text-sm uppercase tracking-[0.24em] text-cyan-300", children: "Analytics Preview" }), _jsx("h2", { className: "mt-3 text-3xl font-semibold", children: "Give institutions a dashboard they can understand" }), _jsx("p", { className: "mt-3 max-w-3xl text-sm text-slate-300", children: "This preview highlights the reporting story behind the platform: engagement, mastery, streaks, badges, and recommended topics." })] }), _jsx(StudentAnalyticsDashboard, { data: dashboardPreview })] }), _jsxs("section", { className: "glass-card flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm uppercase tracking-[0.24em] text-cyan-300", children: "Demo Ready" }), _jsx("h2", { className: "mt-2 text-2xl font-semibold", children: "Use this build for submission, review, and pitching" }), _jsx("p", { className: "mt-2 text-sm text-slate-300", children: "The current setup is optimized for quick local launch with backend-powered auth, courses, quiz flows, and AI feature fallbacks." })] }), _jsxs("div", { className: "flex flex-wrap gap-3", children: [_jsx(Link, { to: "/register", className: "rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-3 font-semibold text-black", children: "Create account" }), _jsx(Link, { to: "/courses", className: "rounded-xl border border-white/20 px-5 py-3 font-semibold text-white", children: "Browse catalog" })] })] })] })] }));
}
