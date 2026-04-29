import { motion } from "framer-motion";

export function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-[#0b1220]"
    >
      <div className="w-72 space-y-4 text-center">
        <h1 className="text-3xl font-bold text-primary-300">EduAI</h1>
        <div className="h-2 overflow-hidden rounded-full bg-slate-700/50">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-700"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.2 }}
          />
        </div>
      </div>
    </motion.div>
  );
}
