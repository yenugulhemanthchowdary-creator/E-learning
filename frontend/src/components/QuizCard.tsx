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
      className="ui-panel rounded-xl p-5 text-left"
    >
      <h3 className="font-semibold text-primary-300">{title}</h3>
      <p className="mt-1 text-sm text-slate-300">{description}</p>
    </motion.button>
  );
}
