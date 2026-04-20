import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { enrollInCourse, getCourseById, updateCourseProgress } from "../api/courses";
import { useToast } from "../components/ToastProvider";
import { useAuth } from "../hooks/useAuth";
export function CourseDetailPage() {
    const { token } = useAuth();
    const { pushToast } = useToast();
    const { id = "" } = useParams();
    const [course, setCourse] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        setError(null);
        setCourse(null);
        getCourseById(id)
            .then((data) => {
            if (!data) {
                setError("Course not found.");
            }
            else {
                setCourse(data);
            }
        })
            .catch(() => {
            setError("Failed to load course. Please try again later.");
        });
    }, [id]);
    if (error) {
        return (_jsx("div", { className: "mx-auto w-[min(1120px,95%)] rounded-xl bg-white/5 p-8 text-center text-red-400", children: error }));
    }
    if (!course) {
        return _jsx("div", { className: "mx-auto w-[min(1120px,95%)] rounded-xl bg-white/5 p-8", children: "Loading course..." });
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
        }
        catch {
            pushToast("Enrollment failed", "error");
        }
        finally {
            setSaving(false);
        }
    };
    const onProgressUpdate = async (nextProgress) => {
        if (!token) {
            pushToast("Please login to update progress", "warning");
            return;
        }
        setSaving(true);
        try {
            await updateCourseProgress(token, course.id, nextProgress);
            setCourse((previous) => (previous ? { ...previous, progress: nextProgress } : previous));
            pushToast("Progress updated", "success");
        }
        catch {
            pushToast("Update progress failed", "error");
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsxs("div", { className: "mx-auto w-[min(1120px,95%)] space-y-6", children: [_jsxs(Helmet, { children: [_jsxs("title", { children: ["EduAI | ", course.title] }), _jsx("meta", { name: "description", content: course.description })] }), _jsx("img", { src: course.thumbnail, alt: course.title, className: "h-72 w-full rounded-3xl object-cover" }), _jsxs("div", { className: "grid gap-5 lg:grid-cols-[1.35fr_0.65fr]", children: [_jsxs("section", { className: "glass-card p-6", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-cyan-300", children: [_jsx("span", { children: course.category }), _jsx("span", { children: course.difficulty }), _jsx("span", { children: course.duration })] }), _jsx("h1", { className: "mt-4 text-3xl font-semibold", children: course.title }), _jsx("p", { className: "mt-3 text-slate-300", children: course.description }), _jsxs("div", { className: "mt-5 grid gap-3 sm:grid-cols-3", children: [_jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [_jsx("p", { className: "text-sm text-slate-400", children: "Instructor" }), _jsx("p", { className: "mt-2 font-medium text-white", children: course.instructor })] }), _jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [_jsx("p", { className: "text-sm text-slate-400", children: "Rating" }), _jsxs("p", { className: "mt-2 font-medium text-white", children: [course.rating.toFixed(1), " / 5"] })] }), _jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [_jsx("p", { className: "text-sm text-slate-400", children: "Learners" }), _jsx("p", { className: "mt-2 font-medium text-white", children: course.students.toLocaleString() })] })] })] }), _jsxs("aside", { className: "glass-card p-6", children: [_jsx("p", { className: "text-sm text-slate-400", children: "Enrollment Progress" }), _jsxs("p", { className: "mt-2 text-4xl font-semibold text-white", children: [course.progress, "%"] }), _jsx("div", { className: "mt-4 h-2 rounded-full bg-white/10", children: _jsx("div", { className: "h-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500", style: { width: `${course.progress}%` } }) }), _jsx("p", { className: "mt-4 text-sm text-slate-300", children: "This course includes guided labs, adaptive assessments, and AI-backed practice support." }), _jsxs("div", { className: "mt-5 flex flex-col gap-2", children: [_jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [_jsx("p", { className: "text-sm text-slate-400", children: "Price" }), _jsxs("p", { className: "mt-2 text-2xl font-semibold text-white", children: ["Rs. ", course.price] })] }), _jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4", children: [_jsx("p", { className: "text-sm text-slate-400", children: "AI Recommendation" }), _jsx("p", { className: "mt-2 font-medium text-white", children: course.aiRecommended ? "Yes, based on learner momentum" : "Available in the broader catalog" })] })] }), _jsxs("div", { className: "mt-5 flex flex-wrap gap-2", children: [_jsx("button", { type: "button", onClick: () => {
                                            void onEnroll();
                                        }, disabled: saving, className: "rounded-lg bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-2 font-semibold text-black disabled:opacity-60", children: "Enroll now" }), _jsx("button", { type: "button", onClick: () => {
                                            void onProgressUpdate(Math.min(100, course.progress + 25));
                                        }, disabled: saving, className: "rounded-lg border border-white/20 px-4 py-2 disabled:opacity-60", children: "Mark +25%" })] })] })] }), _jsxs("div", { className: "glass-card p-6", children: [_jsx("h2", { className: "text-xl font-semibold", children: "What students get" }), _jsxs("div", { className: "mt-4 grid gap-3 md:grid-cols-3", children: [_jsx("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300", children: "Weekly checkpoints and guided milestones for steady progress." }), _jsx("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300", children: "Adaptive quiz practice to reinforce concepts as difficulty changes." }), _jsx("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300", children: "AI-generated learning recommendations for faster skill growth." })] })] })] }));
}
