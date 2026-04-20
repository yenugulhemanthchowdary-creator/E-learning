import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { getMyCourses } from "../api/courses";
import { useAuth } from "../hooks/useAuth";
export function MyCoursesPage() {
    const { token } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortMode, setSortMode] = useState("highest-progress");
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
        }
        else if (sortMode === "recent") {
            clone.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        else {
            clone.sort((a, b) => b.progress - a.progress);
        }
        return clone;
    }, [courses, sortMode]);
    return (_jsxs("section", { className: "mx-auto w-[min(1120px,95%)] space-y-5", children: [_jsx(Helmet, { children: _jsx("title", { children: "EduAI | My Courses" }) }), _jsxs("header", { className: "glass-card p-5", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "My Courses" }), _jsx("p", { className: "mt-1 text-sm text-slate-300", children: "Track your enrolled courses and resume quickly." })] }), _jsx("div", { className: "flex justify-end", children: _jsxs("select", { value: sortMode, onChange: (event) => setSortMode(event.target.value), className: "rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm", children: [_jsx("option", { value: "highest-progress", children: "Highest Progress" }), _jsx("option", { value: "lowest-progress", children: "Lowest Progress" }), _jsx("option", { value: "recent", children: "Recently Added" })] }) }), loading ? (_jsx("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: Array.from({ length: 3 }).map((_, index) => (_jsx("div", { className: "h-48 animate-pulse rounded-2xl bg-white/5" }, index))) })) : sortedCourses.length === 0 ? (_jsxs("div", { className: "glass-card p-5 text-sm text-slate-300", children: ["No enrolled courses yet. Open any course and click ", _jsx("span", { className: "font-semibold text-cyan-300", children: "Enroll" }), "."] })) : (_jsx("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: sortedCourses.map((course) => (_jsxs("article", { className: "glass-card overflow-hidden p-3", children: [_jsx("img", { src: course.thumbnail, alt: course.title, className: "h-36 w-full rounded-xl object-cover" }), _jsx("h2", { className: "mt-3 font-semibold", children: course.title }), _jsx("p", { className: "mt-1 text-sm text-slate-300", children: course.instructor }), _jsx("div", { className: "mt-3 h-2 rounded-full bg-white/10", children: _jsx("div", { className: "h-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500", style: { width: `${course.progress}%` } }) }), _jsxs("div", { className: "mt-3 flex items-center justify-between text-sm", children: [_jsxs("span", { children: [course.progress, "% complete"] }), _jsx(Link, { to: `/courses/${course.id}`, className: "rounded-md border border-cyan-300/40 px-3 py-1 text-cyan-200", children: "Resume" })] })] }, course.id))) }))] }));
}
