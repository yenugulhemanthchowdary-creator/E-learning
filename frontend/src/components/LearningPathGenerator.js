import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { apiRequest } from "../api/client";
export function LearningPathGenerator() {
    const [topic, setTopic] = useState("Python Async");
    const [skillLevel, setSkillLevel] = useState("beginner");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const generatePath = async () => {
        setLoading(true);
        setError(null);
        try {
            const payload = await apiRequest("/api/learning-path/generate", {
                method: "POST",
                body: { topic, skill_level: skillLevel },
            });
            setResult(payload);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Unknown learning path error");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("section", { id: "learning-path", className: "rounded-2xl border border-slate-700 bg-panel p-6", children: [_jsxs("div", { className: "mb-4 flex flex-wrap items-end gap-3", children: [_jsxs("div", { className: "min-w-60 flex-1", children: [_jsx("label", { className: "mb-1 block text-sm text-slate-300", children: "Topic" }), _jsx("input", { value: topic, onChange: (event) => setTopic(event.target.value), className: "w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2", placeholder: "Enter topic" })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm text-slate-300", children: "Skill level" }), _jsxs("select", { value: skillLevel, onChange: (event) => setSkillLevel(event.target.value), className: "rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 capitalize", children: [_jsx("option", { value: "beginner", children: "Beginner" }), _jsx("option", { value: "intermediate", children: "Intermediate" }), _jsx("option", { value: "advanced", children: "Advanced" })] })] }), _jsx("button", { type: "button", onClick: generatePath, disabled: loading || topic.trim().length === 0, className: "rounded-lg bg-accent px-4 py-2 font-semibold text-slate-900 disabled:opacity-60", children: loading ? "Generating..." : "Generate AI Path" })] }), error && _jsx("p", { className: "text-red-300", children: error }), result && (_jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [_jsxs("div", { className: "rounded-lg border border-slate-700 bg-slate-900/70 p-4", children: [_jsx("h3", { className: "font-semibold text-accent", children: "Step-by-step plan" }), _jsx("ol", { className: "mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-200", children: result.steps.map((step) => (_jsx("li", { children: step }, step))) }), _jsxs("p", { className: "mt-3 text-sm text-slate-300", children: ["Estimated time: ", result.estimated_time] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "rounded-lg border border-slate-700 bg-slate-900/70 p-4", children: [_jsx("h3", { className: "font-semibold text-accent", children: "Resources" }), _jsx("ul", { className: "mt-2 list-disc space-y-1 pl-5 text-sm text-slate-200", children: result.resources.map((item) => (_jsx("li", { children: item }, item))) })] }), _jsxs("div", { className: "rounded-lg border border-slate-700 bg-slate-900/70 p-4", children: [_jsx("h3", { className: "font-semibold text-accent", children: "Practice quiz prompts" }), _jsx("ul", { className: "mt-2 list-disc space-y-1 pl-5 text-sm text-slate-200", children: result.quiz_questions.map((item) => (_jsx("li", { children: item }, item))) })] })] })] }))] }));
}
