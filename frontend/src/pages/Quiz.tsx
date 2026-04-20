import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { getQuizQuestions, submitQuizAnswer } from "../api/quiz";
import { QuizCard } from "../components/QuizCard";
import { useAuth } from "../hooks/useAuth";
import type { Difficulty, QuizQuestion } from "../types";

export function QuizPage() {
  const { user, token } = useAuth();
  const [topic, setTopic] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [selected, setSelected] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = questions[index];

  useEffect(() => {
    if (!topic || !difficulty) return;
    setLoading(true);
    setError(null);
    getQuizQuestions(topic, difficulty)
      .then((items) => {
        setQuestions(items);
        setIndex(0);
        setScore(0);
        setStreak(0);
        setSelected(null);
      })
      .catch((err) => {
        setQuestions([]);
        setError(err instanceof Error ? err.message : "Failed to load quiz questions");
      })
      .finally(() => setLoading(false));
  }, [topic, difficulty]);

  useEffect(() => {
    if (!current) return;
    if (timeLeft <= 0) {
      setIndex((i) => i + 1);
      setTimeLeft(20);
      setSelected(null);
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, current]);

  const progress = useMemo(() => ((index + 1) / 10) * 100, [index]);

  if (!topic) {
    return (
      <section className="mx-auto w-[min(1120px,95%)]">
        <Helmet><title>EduAI | Quiz</title></Helmet>
        <h1 className="mb-4 text-2xl font-semibold">Choose Topic</h1>
        <div className="grid gap-3 md:grid-cols-3">
          {["Python", "React", "AI"].map((item) => (
            <QuizCard key={item} title={item} description="10 adaptive questions" onClick={() => setTopic(item)} />
          ))}
        </div>
      </section>
    );
  }

  if (!difficulty) {
    return (
      <section className="mx-auto w-[min(720px,95%)]">
        <h1 className="mb-4 text-2xl font-semibold">Choose Difficulty</h1>
        <div className="grid gap-3 sm:grid-cols-3">
          {(["beginner", "intermediate", "advanced"] as Difficulty[]).map((item) => (
            <button key={item} className="rounded-xl border border-white/15 bg-white/5 px-4 py-6 capitalize" onClick={() => setDifficulty(item)}>
              {item}
            </button>
          ))}
        </div>
      </section>
    );
  }

  if (loading) {
    return <section className="mx-auto w-[min(720px,95%)] rounded-xl bg-white/5 p-6">Loading quiz...</section>;
  }

  if (error) {
    return (
      <section className="mx-auto w-[min(720px,95%)] rounded-xl border border-rose-400/30 bg-rose-500/10 p-6 text-rose-200">
        {error}
      </section>
    );
  }

  if (questions.length === 0 || !current) {
    return <section className="mx-auto w-[min(720px,95%)] rounded-xl bg-white/5 p-6">No quiz questions available.</section>;
  }

  if (index >= questions.length) {
    const percent = Math.round((score / (questions.length * 10)) * 100);
    return (
      <section className="mx-auto w-[min(720px,95%)] rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
        <h1 className="text-3xl font-bold">Score: {percent}%</h1>
        <p className="mt-2 text-slate-300">Areas to improve: advanced event loops and state optimization.</p>
        <button className="mt-5 rounded-lg bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-2 font-semibold text-black">Share score</button>
      </section>
    );
  }

  const selectAnswer = async (option: string) => {
    if (selected) return;
    setSelected(option);

    let correct = option === current.answer;
    let scoreDelta = correct ? 10 : 0;

    if (token && user) {
      try {
        const result = await submitQuizAnswer(token, {
          student_id: Number(user.id),
          topic: current.topic,
          difficulty: current.difficulty,
          question_id: current.id,
          selected_answer: option,
        });
        correct = result.correct;
        scoreDelta = result.score_delta;
      } catch {
        // Keep local fallback behavior if API call fails.
      }
    }

    if (correct) {
      setScore((s) => s + scoreDelta);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      setIndex((i) => i + 1);
      setSelected(null);
      setShowHint(false);
      setTimeLeft(20);
    }, 650);
  };

  return (
    <section className="mx-auto w-[min(820px,95%)] space-y-4">
      <div className="h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" style={{ width: `${(timeLeft / 20) * 100}%` }} /></div>
      <div className="flex items-center justify-between text-sm"><p>Question {index + 1}/10</p><p>Score {score}</p></div>
      {streak >= 2 && <p className="text-orange-300">🔥 x{streak} Streak!</p>}
      <AnimatePresence mode="wait">
        <motion.article key={current.id} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="rounded-2xl border border-white/15 bg-white/5 p-5">
          <h2 className="text-xl font-semibold">{current.prompt}</h2>
          <div className="mt-4 grid gap-2">
            {current.options.map((option) => {
              const isCorrect = option === current.answer;
              const isSelected = option === selected;
              const hiddenByHint = showHint && !isCorrect && option !== selected;
              return (
                <button
                  key={option}
                  onClick={() => {
                    void selectAnswer(option);
                  }}
                  className={`rounded-lg border px-3 py-2 text-left transition ${
                    hiddenByHint
                      ? "blur-sm opacity-40"
                      : isSelected && isCorrect
                        ? "border-emerald-400 bg-emerald-400/20"
                        : isSelected && !isCorrect
                          ? "border-red-400 bg-red-400/20"
                          : "border-white/15 bg-white/5"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
          <button onClick={() => setShowHint(true)} className="mt-3 text-sm text-cyan-300">Hint (-5 points)</button>
        </motion.article>
      </AnimatePresence>
      <div className="flex gap-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className={`h-2 w-2 rounded-full ${i <= index ? "bg-cyan-300" : "bg-white/20"}`} />
        ))}
      </div>
      <div className="h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" style={{ width: `${progress}%` }} /></div>
    </section>
  );
}
