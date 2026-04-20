import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { getQuizQuestions, submitQuizAnswer } from "../api/quiz";
import { QuizCard } from "../components/QuizCard";
import { useAuth } from "../hooks/useAuth";
export function QuizPage() {
    const { user, token } = useAuth();
    const [topic, setTopic] = useState(null);
    const [difficulty, setDifficulty] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [index, setIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [timeLeft, setTimeLeft] = useState(20);
    const [selected, setSelected] = useState(null);
    const [showHint, setShowHint] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const current = questions[index];
    useEffect(() => {
        if (!topic || !difficulty)
            return;
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
        if (!current)
            return;
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
        return (_jsxs("section", { className: "mx-auto w-[min(1120px,95%)]", children: [_jsx(Helmet, { children: _jsx("title", { children: "EduAI | Quiz" }) }), _jsx("h1", { className: "mb-4 text-2xl font-semibold", children: "Choose Topic" }), _jsx("div", { className: "grid gap-3 md:grid-cols-3", children: ["Python", "React", "AI"].map((item) => (_jsx(QuizCard, { title: item, description: "10 adaptive questions", onClick: () => setTopic(item) }, item))) })] }));
    }
    if (!difficulty) {
        return (_jsxs("section", { className: "mx-auto w-[min(720px,95%)]", children: [_jsx("h1", { className: "mb-4 text-2xl font-semibold", children: "Choose Difficulty" }), _jsx("div", { className: "grid gap-3 sm:grid-cols-3", children: ["beginner", "intermediate", "advanced"].map((item) => (_jsx("button", { className: "rounded-xl border border-white/15 bg-white/5 px-4 py-6 capitalize", onClick: () => setDifficulty(item), children: item }, item))) })] }));
    }
    if (loading) {
        return _jsx("section", { className: "mx-auto w-[min(720px,95%)] rounded-xl bg-white/5 p-6", children: "Loading quiz..." });
    }
    if (error) {
        return (_jsx("section", { className: "mx-auto w-[min(720px,95%)] rounded-xl border border-rose-400/30 bg-rose-500/10 p-6 text-rose-200", children: error }));
    }
    if (questions.length === 0 || !current) {
        return _jsx("section", { className: "mx-auto w-[min(720px,95%)] rounded-xl bg-white/5 p-6", children: "No quiz questions available." });
    }
    if (index >= questions.length) {
        const percent = Math.round((score / (questions.length * 10)) * 100);
        return (_jsxs("section", { className: "mx-auto w-[min(720px,95%)] rounded-2xl border border-white/10 bg-white/5 p-6 text-center", children: [_jsxs("h1", { className: "text-3xl font-bold", children: ["Score: ", percent, "%"] }), _jsx("p", { className: "mt-2 text-slate-300", children: "Areas to improve: advanced event loops and state optimization." }), _jsx("button", { className: "mt-5 rounded-lg bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-2 font-semibold text-black", children: "Share score" })] }));
    }
    const selectAnswer = async (option) => {
        if (selected)
            return;
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
            }
            catch {
                // Keep local fallback behavior if API call fails.
            }
        }
        if (correct) {
            setScore((s) => s + scoreDelta);
            setStreak((s) => s + 1);
        }
        else {
            setStreak(0);
        }
        setTimeout(() => {
            setIndex((i) => i + 1);
            setSelected(null);
            setShowHint(false);
            setTimeLeft(20);
        }, 650);
    };
    return (_jsxs("section", { className: "mx-auto w-[min(820px,95%)] space-y-4", children: [_jsx("div", { className: "h-2 rounded-full bg-white/10", children: _jsx("div", { className: "h-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500", style: { width: `${(timeLeft / 20) * 100}%` } }) }), _jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsxs("p", { children: ["Question ", index + 1, "/10"] }), _jsxs("p", { children: ["Score ", score] })] }), streak >= 2 && _jsxs("p", { className: "text-orange-300", children: ["\uD83D\uDD25 x", streak, " Streak!"] }), _jsx(AnimatePresence, { mode: "wait", children: _jsxs(motion.article, { initial: { x: 20, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -20, opacity: 0 }, className: "rounded-2xl border border-white/15 bg-white/5 p-5", children: [_jsx("h2", { className: "text-xl font-semibold", children: current.prompt }), _jsx("div", { className: "mt-4 grid gap-2", children: current.options.map((option) => {
                                const isCorrect = option === current.answer;
                                const isSelected = option === selected;
                                const hiddenByHint = showHint && !isCorrect && option !== selected;
                                return (_jsx("button", { onClick: () => {
                                        void selectAnswer(option);
                                    }, className: `rounded-lg border px-3 py-2 text-left transition ${hiddenByHint
                                        ? "blur-sm opacity-40"
                                        : isSelected && isCorrect
                                            ? "border-emerald-400 bg-emerald-400/20"
                                            : isSelected && !isCorrect
                                                ? "border-red-400 bg-red-400/20"
                                                : "border-white/15 bg-white/5"}`, children: option }, option));
                            }) }), _jsx("button", { onClick: () => setShowHint(true), className: "mt-3 text-sm text-cyan-300", children: "Hint (-5 points)" })] }, current.id) }), _jsx("div", { className: "flex gap-2", children: Array.from({ length: 10 }).map((_, i) => (_jsx("span", { className: `h-2 w-2 rounded-full ${i <= index ? "bg-cyan-300" : "bg-white/20"}` }, i))) }), _jsx("div", { className: "h-2 rounded-full bg-white/10", children: _jsx("div", { className: "h-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500", style: { width: `${progress}%` } }) })] }));
}
