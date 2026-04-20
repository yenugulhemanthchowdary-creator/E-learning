import { jsx as _jsx } from "react/jsx-runtime";
import { motion } from "framer-motion";
export function PageTransition({ children }) {
    return (_jsx(motion.div, { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 12 }, transition: { duration: 0.35 }, children: children }));
}
