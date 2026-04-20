import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { apiRequest } from "../api/client";
export function LiveCodeSandbox() {
    const [language, setLanguage] = useState("python");
    const [code, setCode] = useState("def solve(nums):\n    return sorted(nums)");
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const requestFeedback = async () => {
        setLoading(true);
        setError(null);
        try {
            const payload = await apiRequest("/api/code/feedback", {
                method: "POST",
                body: { language, code },
            });
            setFeedback(payload);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Unknown sandbox error");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("section", { className: "rounded-2xl border border-slate-700 bg-panel p-6", children: [_jsxs("div", { className: "mb-3 flex items-center justify-between", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Live Code Sandbox" }), _jsxs("select", { value: language, onChange: (event) => setLanguage(event.target.value), className: "rounded-md border border-slate-600 bg-slate-900 px-3 py-1", children: [_jsx("option", { value: "python", children: "Python" }), _jsx("option", { value: "javascript", children: "JavaScript" }), _jsx("option", { value: "typescript", children: "TypeScript" })] })] }), _jsx("textarea", { value: code, onChange: (event) => setCode(event.target.value), className: "min-h-52 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 font-mono text-sm text-slate-200" }), _jsx("button", { type: "button", onClick: requestFeedback, disabled: loading, className: "mt-3 rounded-lg bg-accent px-4 py-2 font-medium text-slate-900 disabled:opacity-60", children: loading ? "Analyzing..." : "Get Real-Time AI Feedback" }), error && _jsx("p", { className: "mt-3 text-red-300", children: error }), feedback && (_jsxs("div", { className: "mt-4 rounded-lg border border-slate-700 bg-slate-900/70 p-4", children: [_jsx("h3", { className: "font-medium text-accent", children: "AI Feedback" }), _jsx("p", { className: "mt-2 text-sm text-slate-200", children: feedback.feedback }), _jsx("ul", { className: "mt-3 list-disc space-y-1 pl-5 text-sm text-slate-300", children: feedback.suggestions.map((item) => (_jsx("li", { children: item }, item))) })] }))] }));
}
