import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
export function LoadingScreen() {
    return (_jsx(motion.div, { initial: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 z-50 grid place-items-center bg-[#0A0A0F]", children: _jsxs("div", { className: "w-72 space-y-4 text-center", children: [_jsx("h1", { className: "text-3xl font-bold text-cyan-300", children: "EduAI" }), _jsx("div", { className: "h-2 overflow-hidden rounded-full bg-white/15", children: _jsx(motion.div, { className: "h-full bg-gradient-to-r from-cyan-400 to-violet-500", initial: { width: "0%" }, animate: { width: "100%" }, transition: { duration: 1.2 } }) })] }) }));
}
