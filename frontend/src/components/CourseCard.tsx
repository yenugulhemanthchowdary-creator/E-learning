import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import type { Course } from "../types";
import { ProgressBar } from "./ProgressBar";

interface CourseCardProps {
  course: Course;
  actionLabel?: string;
  onAction?: (courseId: Course["id"]) => void;
  actionLoading?: boolean;
  isEnrolled?: boolean;
}

export function CourseCard({
  course,
  actionLabel,
  onAction,
  actionLoading = false,
  isEnrolled = false,
}: CourseCardProps) {
  return (
    <motion.article
      whileHover={{ y: -8, boxShadow: "0 0 28px rgba(0, 212, 255, 0.28)" }}
      className="group relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-3 backdrop-blur-xl"
    >
      {course.aiRecommended && (
        <span className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-2 py-1 text-xs font-semibold text-black">
          AI Recommended
        </span>
      )}
      {isEnrolled && (
        <span className="absolute left-3 top-3 rounded-full border border-emerald-300/40 bg-emerald-400/20 px-2 py-1 text-xs font-semibold text-emerald-200">
          Enrolled
        </span>
      )}
      <img src={course.thumbnail} alt={course.title} className="h-40 w-full rounded-xl object-cover" />
      <div className="mt-3 space-y-2">
        <h3 className="line-clamp-1 font-semibold">{course.title}</h3>
        <p className="text-sm text-slate-300">{course.instructor}</p>
        <div className="flex items-center gap-1 text-sm text-yellow-300">
          <Star size={14} fill="currentColor" /> {course.rating.toFixed(1)}
        </div>
        <ProgressBar value={course.progress} />
        <div className="flex items-center justify-between">
          <span className="font-medium text-cyan-300">${course.price}</span>
          {onAction && actionLabel ? (
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => onAction(course.id)}
              className="translate-y-3 rounded-md border border-cyan-400/50 px-3 py-1 text-sm opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100 disabled:opacity-50"
            >
              {actionLoading ? "Working..." : actionLabel}
            </button>
          ) : (
            <Link
              to={`/courses/${course.id}`}
              className="translate-y-3 rounded-md border border-cyan-400/50 px-3 py-1 text-sm opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100"
            >
              Enroll Now
            </Link>
          )}
        </div>
      </div>
    </motion.article>
  );
}

