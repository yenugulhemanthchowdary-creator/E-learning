import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Flame } from "lucide-react";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Bar, BarChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getMyCourses } from "../api/courses";
import { getLeaderboard, getMyDashboard } from "../api/dashboard";
import { useAuth } from "../hooks/useAuth";
const weekly = [
    { day: "Mon", minutes: 45 },
    { day: "Tue", minutes: 70 },
    { day: "Wed", minutes: 55 },
    { day: "Thu", minutes: 65 },
    { day: "Fri", minutes: 82 },
    { day: "Sat", minutes: 40 },
    { day: "Sun", minutes: 50 },
];
const radar = [
    { skill: "Python", value: 82 },
    { skill: "React", value: 76 },
    { skill: "AI", value: 71 },
    { skill: "SQL", value: 68 },
    { skill: "Design", value: 57 },
];
export function DashboardPage() {
    const { user, token } = useAuth();
    const [dashboard, setDashboard] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [myCourses, setMyCourses] = useState([]);
    useEffect(() => {
        if (!token)
            return;
        getMyDashboard(token).then(setDashboard).catch(() => setDashboard(null));
        getLeaderboard().then((items) => setLeaderboard(items.slice(0, 5))).catch(() => setLeaderboard([]));
        getMyCourses(token).then((items) => setMyCourses(items.slice(0, 3))).catch(() => setMyCourses([]));
    }, [token]);
    return (_jsxs("div", { className: "mx-auto w-[min(1120px,95%)] space-y-5", children: [_jsx(Helmet, { children: _jsx("title", { children: "EduAI | Dashboard" }) }), _jsxs("section", { className: "glass-card flex items-center justify-between p-6", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-semibold", children: ["Welcome back, ", user?.fullName ?? "Student", "!"] }), _jsxs("p", { className: "mt-1 text-slate-300", children: ["Day ", dashboard?.streak_days ?? 0, " streak. Keep your momentum alive."] })] }), _jsx(Flame, { className: "h-11 w-11 animate-pulse text-orange-400" })] }), _jsxs("section", { className: "grid gap-4 lg:grid-cols-3", children: [_jsxs("article", { className: "glass-card p-4 lg:col-span-2", children: [_jsx("h2", { className: "mb-3 font-semibold", children: "Weekly Activity" }), _jsx("div", { className: "h-64", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: weekly, children: [_jsx(XAxis, { dataKey: "day", stroke: "#cbd5e1" }), _jsx(YAxis, { stroke: "#cbd5e1" }), _jsx(Tooltip, {}), _jsx(Bar, { dataKey: "minutes", fill: "#00D4FF", radius: [6, 6, 0, 0] })] }) }) })] }), _jsxs("article", { className: "glass-card p-4", children: [_jsx("h2", { className: "mb-3 font-semibold", children: "Leaderboard" }), _jsx("ul", { className: "space-y-2 text-sm", children: leaderboard.map((entry, index) => (_jsxs("li", { children: [index + 1, ". ", entry.display_name, " (", entry.score, ")"] }, entry.student_id))) })] }), _jsxs("article", { className: "glass-card p-4", children: [_jsx("h2", { className: "mb-3 font-semibold", children: "Skill Radar" }), _jsx("div", { className: "h-64", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(RadarChart, { data: radar, children: [_jsx(PolarGrid, { stroke: "#475569" }), _jsx(PolarAngleAxis, { dataKey: "skill", stroke: "#e2e8f0" }), _jsx(PolarRadiusAxis, { stroke: "#64748b" }), _jsx(Radar, { dataKey: "value", stroke: "#7B2FFF", fill: "#00D4FF", fillOpacity: 0.45 })] }) }) })] }), _jsxs("article", { className: "glass-card p-4 lg:col-span-2", children: [_jsx("h2", { className: "mb-3 font-semibold", children: "Continue Learning" }), _jsx("div", { className: "grid gap-3 md:grid-cols-3", children: myCourses.length === 0 ? (_jsx("div", { className: "rounded-xl border border-white/15 bg-white/5 p-3 text-sm text-slate-300", children: "Enroll in a course to see your progress here." })) : (myCourses.map((course) => (_jsxs("div", { className: "rounded-xl border border-white/15 bg-white/5 p-3", children: [_jsx("p", { className: "font-medium", children: course.title }), _jsx("div", { className: "mt-2 h-2 rounded-full bg-white/10", children: _jsx("div", { className: "h-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500", style: { width: `${course.progress}%` } }) })] }, course.id)))) })] })] }), _jsxs("section", { className: "glass-card p-4", children: [_jsx("h2", { className: "font-semibold", children: "AI Recommendation" }), _jsxs("p", { className: "mt-2 text-slate-300", children: ["Based on your progress (", dashboard?.progress_percent ?? 0, "%), try: Advanced ML"] }), _jsxs("p", { className: "mt-2 text-xs text-slate-400", children: ["Badges: ", (dashboard?.badges ?? ["New Explorer"]).join(", ")] })] })] }));
}
