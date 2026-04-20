import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
const ToastContext = createContext(undefined);
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const value = useMemo(() => ({
        pushToast: (message, type = "info") => {
            const id = crypto.randomUUID();
            setToasts((previous) => [...previous, { id, type, message }]);
            setTimeout(() => setToasts((previous) => previous.filter((toast) => toast.id !== id)), 3000);
        },
    }), []);
    return (_jsxs(ToastContext.Provider, { value: value, children: [children, _jsx("div", { className: "fixed right-4 top-20 z-[60] space-y-2", children: _jsx(AnimatePresence, { children: toasts.map((toast) => (_jsx(motion.div, { initial: { opacity: 0, x: 30 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 30 }, className: `rounded-lg border px-4 py-2 text-sm backdrop-blur-md ${toast.type === "success"
                            ? "border-emerald-400/30 bg-emerald-400/10"
                            : toast.type === "error"
                                ? "border-red-400/30 bg-red-400/10"
                                : toast.type === "warning"
                                    ? "border-amber-400/30 bg-amber-400/10"
                                    : "border-cyan-400/30 bg-cyan-400/10"}`, children: toast.message }, toast.id))) }) })] }));
}
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }
    return context;
}
