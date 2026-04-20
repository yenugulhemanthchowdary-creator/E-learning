import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useMemo, useReducer } from "react";
import { getQuizQuestions } from "../api/quiz";
import type { QuizQuestion } from "../types";

type Difficulty = "beginner" | "intermediate" | "advanced";

interface AdaptiveQuizProps {
  topic: string;
}

interface QuizState {
  difficulty: Difficulty;
  score: number;
  streak: number;
  correctStreak: number;
  wrongStreak: number;
  currentIndex: number;
  questions: QuizQuestion[];
  selectedOption: string | null;
  hint: string | null;
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: QuizQuestion[] }
  | { type: "FETCH_ERROR"; payload: string }
  | { type: "SELECT_OPTION"; payload: string }
  | { type: "SUBMIT_ANSWER" }
  | { type: "NEXT_QUESTION" };

const initialState: QuizState = {
  difficulty: "beginner",
  score: 0,
  streak: 0,
  correctStreak: 0,
  wrongStreak: 0,
  currentIndex: 0,
  questions: [],
  selectedOption: null,
  hint: null,
  loading: false,
  error: null,
};

const difficultyOrder: Difficulty[] = ["beginner", "intermediate", "advanced"];

function adjustDifficulty(current: Difficulty, move: "up" | "down"): Difficulty {
  const currentIndex = difficultyOrder.indexOf(current);
  if (move === "up") {
    return difficultyOrder[Math.min(currentIndex + 1, difficultyOrder.length - 1)];
  }
  return difficultyOrder[Math.max(currentIndex - 1, 0)];
}

function reducer(state: QuizState, action: Action): QuizState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        questions: action.payload,
        currentIndex: 0,
        selectedOption: null,
        hint: null,
      };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "SELECT_OPTION":
      return { ...state, selectedOption: action.payload };
    case "SUBMIT_ANSWER": {
      const current = state.questions[state.currentIndex];
      if (!current || !state.selectedOption) {
        return state;
      }

      const isCorrect = state.selectedOption === current.answer;
      const correctStreak = isCorrect ? state.correctStreak + 1 : 0;
      const wrongStreak = isCorrect ? 0 : state.wrongStreak + 1;
      let difficulty = state.difficulty;

      if (correctStreak >= 3) {
        difficulty = adjustDifficulty(difficulty, "up");
      }
      if (wrongStreak >= 2) {
        difficulty = adjustDifficulty(difficulty, "down");
      }

      return {
        ...state,
        score: isCorrect ? state.score + 10 : state.score,
        streak: isCorrect ? state.streak + 1 : 0,
        correctStreak: correctStreak >= 3 ? 0 : correctStreak,
        wrongStreak: wrongStreak >= 2 ? 0 : wrongStreak,
        difficulty,
        hint: isCorrect ? null : current.hint,
      };
    }
    case "NEXT_QUESTION":
      return {
        ...state,
        currentIndex: (state.currentIndex + 1) % Math.max(state.questions.length, 1),
        selectedOption: null,
        hint: null,
      };
    default:
      return state;
  }
}

export function AdaptiveQuiz({ topic }: AdaptiveQuizProps) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const fetchQuestions = async () => {
      dispatch({ type: "FETCH_START" });
      try {
        const payload = await getQuizQuestions(topic, state.difficulty);
        dispatch({ type: "FETCH_SUCCESS", payload });
      } catch (error) {
        dispatch({
          type: "FETCH_ERROR",
          payload: error instanceof Error ? error.message : "Unknown quiz error",
        });
      }
    };

    fetchQuestions();
  }, [topic, state.difficulty]);

  const currentQuestion = useMemo(
    () => state.questions[state.currentIndex],
    [state.questions, state.currentIndex],
  );

  if (state.loading) {
    return <div className="rounded-xl bg-panel p-5">Loading adaptive quiz...</div>;
  }

  if (state.error) {
    return <div className="rounded-xl bg-red-900/40 p-5 text-red-200">{state.error}</div>;
  }

  if (!currentQuestion) {
    return <div className="rounded-xl bg-panel p-5">No quiz questions found.</div>;
  }

  const progress = ((state.currentIndex + 1) / Math.max(state.questions.length, 1)) * 100;

  return (
    <div className="space-y-4 rounded-2xl border border-slate-700 bg-panel p-6 shadow-lg">
      <div className="flex items-center justify-between text-sm">
        <span className="rounded-full bg-slate-800 px-3 py-1 capitalize text-accent">
          {state.difficulty}
        </span>
        <span>Score: {state.score}</span>
        <span>Streak: {state.streak}</span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -25 }}
          transition={{ duration: 0.25 }}
          className="space-y-3"
        >
          <h3 className="text-lg font-semibold">{currentQuestion.prompt}</h3>
          <div className="grid gap-2">
            {currentQuestion.options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => dispatch({ type: "SELECT_OPTION", payload: option })}
                className={`rounded-lg border px-4 py-2 text-left transition ${
                  state.selectedOption === option
                    ? "border-accent bg-accent/20"
                    : "border-slate-700 bg-slate-900/60 hover:border-slate-500"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {state.hint && <div className="rounded-lg bg-amber-900/40 p-3 text-amber-200">Hint: {state.hint}</div>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => dispatch({ type: "SUBMIT_ANSWER" })}
          disabled={!state.selectedOption}
          className="rounded-lg bg-accent px-4 py-2 font-medium text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Submit
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: "NEXT_QUESTION" })}
          className="rounded-lg border border-slate-600 px-4 py-2"
        >
          Next
        </button>
      </div>
    </div>
  );
}
