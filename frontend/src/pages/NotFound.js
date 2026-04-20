import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
export function NotFoundPage() {
    return (_jsx("section", { className: "mx-auto grid min-h-[60vh] w-[min(640px,95%)] place-items-center text-center", children: _jsxs("div", { children: [_jsx("h1", { className: "glitch text-7xl font-bold", "data-text": "404", children: "404" }), _jsx("p", { className: "mt-3 text-slate-300", children: "The page you requested does not exist." }), _jsx(Link, { to: "/", className: "mt-6 inline-block rounded-lg bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-2 font-semibold text-black", children: "Go Home" })] }) }));
}
