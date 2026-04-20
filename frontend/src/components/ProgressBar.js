import { jsx as _jsx } from "react/jsx-runtime";
export function ProgressBar({ value }) {
    return (_jsx("div", { className: "h-2 w-full overflow-hidden rounded-full bg-white/10", children: _jsx("div", { className: "h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all duration-500", style: { width: `${Math.max(0, Math.min(100, value))}%` } }) }));
}
