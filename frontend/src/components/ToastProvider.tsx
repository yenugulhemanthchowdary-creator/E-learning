import { createContext, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  pushToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const value = useMemo(
    () => ({
      pushToast: (message: string, type: ToastType = "info") => {
        const id = crypto.randomUUID();
        setToasts((previous) => [...previous, { id, type, message }]);
        setTimeout(() => setToasts((previous) => previous.filter((toast) => toast.id !== id)), 3000);
      },
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-20 z-[60] space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              className={`rounded-lg border px-4 py-2 text-sm backdrop-blur-md ${
                toast.type === "success"
                  ? "border-emerald-400/30 bg-emerald-400/10"
                  : toast.type === "error"
                    ? "border-red-400/30 bg-red-400/10"
                    : toast.type === "warning"
                      ? "border-amber-400/30 bg-amber-400/10"
                      : "border-primary-400/35 bg-primary-500/12"
              }`}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
