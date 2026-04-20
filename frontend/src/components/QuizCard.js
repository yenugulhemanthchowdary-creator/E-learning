import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
export function QuizCard({ title, description, onClick }) {
    return (_jsxs(motion.button, { whileHover: { scale: 1.03 }, whileTap: { scale: 0.98 }, onClick: onClick, className: "rounded-xl border border-white/20 bg-white/5 p-5 text-left backdrop-blur-xl", children: [_jsx("h3", { className: "font-semibold text-cyan-300", children: title }), _jsx("p", { className: "mt-1 text-sm text-slate-300", children: description })] }));
}
