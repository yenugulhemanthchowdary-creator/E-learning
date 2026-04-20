import { motion } from "framer-motion";

interface QuizCardProps {
  title: string;
  description: string;
  onClick: () => void;
}

export function QuizCard({ title, description, onClick }: QuizCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="rounded-xl border border-white/20 bg-white/5 p-5 text-left backdrop-blur-xl"
    >
      <h3 className="font-semibold text-cyan-300">{title}</h3>
      <p className="mt-1 text-sm text-slate-300">{description}</p>
    </motion.button>
  );
}
