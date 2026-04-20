import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
const words = ["Learn", "Smarter"];
const subtitle = "AI-powered learning paths that adapt to every student";
export function HeroSection() {
    const [typed, setTyped] = useState("");
    const [count, setCount] = useState({ students: 0, courses: 0, completion: 0 });
    useEffect(() => {
        let index = 0;
        const id = setInterval(() => {
            setTyped(subtitle.slice(0, index));
            index += 1;
            if (index > subtitle.length) {
                clearInterval(id);
            }
        }, 40);
        return () => clearInterval(id);
    }, []);
    useEffect(() => {
        const end = { students: 50000, courses: 200, completion: 98 };
        const id = setInterval(() => {
            setCount((previous) => ({
                students: Math.min(end.students, previous.students + 1000),
                courses: Math.min(end.courses, previous.courses + 6),
                completion: Math.min(end.completion, previous.completion + 2),
            }));
        }, 60);
        return () => clearInterval(id);
    }, []);
    const floatingCards = useMemo(() => ["Python Pro", "React Lab", "AI Bootcamp"], []);
    return (_jsxs("section", { className: "relative min-h-[86vh] overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0F]/80 px-6 py-20 backdrop-blur-xl", children: [_jsxs("div", { className: "pointer-events-none absolute inset-0", children: [_jsx("div", { className: "mesh-bg absolute inset-0" }), _jsx("div", { className: "particle-layer absolute inset-0" })] }), _jsxs("div", { className: "relative z-10 mx-auto max-w-4xl text-center", children: [_jsx("h1", { className: "text-5xl font-bold leading-tight md:text-7xl", children: words.map((word, index) => (_jsx(motion.span, { initial: { y: 30, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { delay: index * 0.2, duration: 0.6 }, className: "mr-4 inline-block bg-gradient-to-r from-cyan-300 to-violet-400 bg-clip-text text-transparent", children: word }, word))) }), _jsx("p", { className: "mx-auto mt-4 h-8 max-w-xl text-lg text-slate-200 md:text-xl", children: typed }), _jsxs("div", { className: "mt-8 flex flex-wrap items-center justify-center gap-3", children: [_jsx(Link, { to: "/register", className: "rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-6 py-3 font-semibold text-black shadow-[0_0_30px_rgba(0,212,255,0.35)]", children: "Start Learning Free" }), _jsx(Link, { to: "/courses", className: "rounded-xl border border-cyan-300/50 px-6 py-3 font-semibold text-cyan-200", children: "Explore Catalog" })] }), _jsxs("div", { className: "mt-10 grid gap-3 sm:grid-cols-3", children: [_jsxs("div", { className: "glass-card p-3", children: [_jsxs("p", { className: "text-2xl font-bold", children: [Math.floor(count.students / 1000), "K+"] }), _jsx("p", { className: "text-sm text-slate-300", children: "Students" })] }), _jsxs("div", { className: "glass-card p-3", children: [_jsxs("p", { className: "text-2xl font-bold", children: [count.courses, "+"] }), _jsx("p", { className: "text-sm text-slate-300", children: "Courses" })] }), _jsxs("div", { className: "glass-card p-3", children: [_jsxs("p", { className: "text-2xl font-bold", children: [count.completion, "%"] }), _jsx("p", { className: "text-sm text-slate-300", children: "Completion Rate" })] })] })] }), floatingCards.map((label, index) => (_jsx("div", { className: `orbit-card orbit-${index + 1}`, children: _jsx("span", { children: label }) }, label)))] }));
}
