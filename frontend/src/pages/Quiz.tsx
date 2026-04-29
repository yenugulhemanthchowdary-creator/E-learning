import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  createCompetition,
  getCompetitionLeaderboard,
  getCompetitionQuestion,
  joinCompetition,
  listCompetitions,
  startCompetition,
  submitCompetitionAnswer,
  type CompetitionCreatePayload,
} from "../api/competitions";
import { getQuizQuestions, submitQuizAnswer } from "../api/quiz";
import { QuizCard } from "../components/QuizCard";
import { useToast } from "../components/ToastProvider";
import { useAuth } from "../hooks/useAuth";
import type { CompetitionQuestion, Difficulty, QuizCompetition, QuizQuestion } from "../types";

export function QuizPage() {
  const { user, token } = useAuth();
  const { pushToast } = useToast();
  const [mode, setMode] = useState<"practice" | "competition">("practice");

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

  const [competitions, setCompetitions] = useState<QuizCompetition[]>([]);
  const [competitionLoading, setCompetitionLoading] = useState(false);
  const [competitionError, setCompetitionError] = useState<string | null>(null);
  const [activeCompetition, setActiveCompetition] = useState<QuizCompetition | null>(null);
  const [competitionQuestion, setCompetitionQuestion] = useState<CompetitionQuestion | null>(null);
  const [competitionQuestionIndex, setCompetitionQuestionIndex] = useState(1);
  const [competitionSelected, setCompetitionSelected] = useState<string | null>(null);
  const [competitionScore, setCompetitionScore] = useState(0);
  const [competitionCompleted, setCompetitionCompleted] = useState(false);
  const [questionStartedAt, setQuestionStartedAt] = useState<number>(Date.now());
  const [leaderboard, setLeaderboard] = useState<Array<{ rank: number; displayName: string; score: number }>>([]);
  const [joinCodes, setJoinCodes] = useState<Record<number, string>>({});

  const [createPayload, setCreatePayload] = useState<CompetitionCreatePayload>({
    title: "Friday Coding Cup",
    topic: "React",
    difficulty: "intermediate",
    question_count: 10,
    seconds_per_question: 20,
    max_participants: 50,
    is_public: true,
  });

  const current = questions[index];

  const refreshCompetitions = async () => {
    if (!token) return;
    setCompetitionLoading(true);
    setCompetitionError(null);
    try {
      const data = await listCompetitions(token);
      setCompetitions(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load competitions";
      setCompetitionError(message);
    } finally {
      setCompetitionLoading(false);
    }
  };

  useEffect(() => {
    if (mode !== "competition" || !token) return;
    void refreshCompetitions();
  }, [mode, token]);

  useEffect(() => {
    if (!topic || !difficulty || mode !== "practice") return;
    setLoading(true);
    setError(null);
    getQuizQuestions(topic, difficulty)
      .then((items) => {
        setQuestions(items);
        setIndex(0);
        setScore(0);
        setStreak(0);
        setSelected(null);
        setTimeLeft(20);
      })
      .catch((err) => {
        setQuestions([]);
        setError(err instanceof Error ? err.message : "Failed to load quiz questions");
      })
      .finally(() => setLoading(false));
  }, [topic, difficulty, mode]);

  useEffect(() => {
    if (!current || mode !== "practice") return;
    if (timeLeft <= 0) {
      setIndex((i) => i + 1);
      setTimeLeft(20);
      setSelected(null);
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, current, mode]);

  useEffect(() => {
    if (!token || !activeCompetition) return;
    if (activeCompetition.status !== "live") return;
    if (competitionCompleted) return;

    let cancelled = false;
    getCompetitionQuestion(token, activeCompetition.id, competitionQuestionIndex)
      .then((question) => {
        if (cancelled) return;
        setCompetitionQuestion(question);
        setCompetitionSelected(null);
        setQuestionStartedAt(Date.now());
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Failed to load competition question";
        setCompetitionError(message);
      });

    return () => {
      cancelled = true;
    };
  }, [activeCompetition, competitionQuestionIndex, competitionCompleted, token]);

  useEffect(() => {
    if (!token || !activeCompetition) return;
    let timer: ReturnType<typeof setInterval> | null = null;

    const loadLeaderboard = async () => {
      try {
        const rows = await getCompetitionLeaderboard(token, activeCompetition.id);
        setLeaderboard(rows.map((row) => ({ rank: row.rank, displayName: row.displayName, score: row.score })));
      } catch {
        // Avoid interrupting gameplay if leaderboard refresh fails.
      }
    };

    void loadLeaderboard();
    timer = setInterval(() => {
      void loadLeaderboard();
    }, 5000);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeCompetition, token]);

  const progress = useMemo(() => ((index + 1) / 10) * 100, [index]);

  const selectPracticeAnswer = async (option: string) => {
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

  const handleCreateCompetition = async () => {
    if (!token) {
      pushToast("Login required to create competitions", "warning");
      return;
    }

    try {
      const created = await createCompetition(token, createPayload);
      setActiveCompetition(created);
      setCompetitionQuestionIndex(1);
      setCompetitionScore(0);
      setCompetitionCompleted(false);
      pushToast(`Competition created. Join code: ${created.joinCode}`, "success");
      await refreshCompetitions();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create competition";
      setCompetitionError(message);
    }
  };

  const handleJoinCompetition = async (competition: QuizCompetition) => {
    if (!token) {
      pushToast("Login required to join competitions", "warning");
      return;
    }

    try {
      const joined = await joinCompetition(token, competition.id, joinCodes[competition.id]);
      setActiveCompetition(joined);
      setCompetitionQuestionIndex(1);
      setCompetitionScore(0);
      setCompetitionCompleted(false);
      pushToast("Joined competition", "success");
      await refreshCompetitions();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to join competition";
      setCompetitionError(message);
    }
  };

  const handleStartCompetition = async () => {
    if (!token || !activeCompetition) return;

    try {
      const started = await startCompetition(token, activeCompetition.id);
      setActiveCompetition(started);
      setCompetitionQuestionIndex(1);
      setCompetitionQuestion(null);
      setCompetitionCompleted(false);
      pushToast("Competition started", "success");
      await refreshCompetitions();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start competition";
      setCompetitionError(message);
    }
  };

  const handleSubmitCompetition = async (option: string) => {
    if (!token || !activeCompetition || !competitionQuestion || competitionSelected) return;

    setCompetitionSelected(option);
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - questionStartedAt) / 1000));

    try {
      const result = await submitCompetitionAnswer(
        token,
        activeCompetition.id,
        competitionQuestion.questionIndex,
        option,
        elapsedSeconds,
      );
      setCompetitionScore(result.totalScore);

      if (result.competitionCompleted) {
        setCompetitionCompleted(true);
        pushToast("Competition completed", "success");
      } else {
        setTimeout(() => {
          setCompetitionQuestionIndex(result.nextQuestionIndex);
          setCompetitionSelected(null);
        }, 600);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit answer";
      setCompetitionError(message);
      setCompetitionSelected(null);
    }
  };

  const renderPractice = () => {
    if (!topic) {
      return (
        <section className="mx-auto w-[min(1120px,95%)]">
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
              <button key={item} className="ui-btn-secondary rounded-xl px-4 py-6 capitalize" onClick={() => setDifficulty(item)}>
                {item}
              </button>
            ))}
          </div>
        </section>
      );
    }

    if (loading) return <section className="ui-panel mx-auto w-[min(720px,95%)] rounded-xl p-6">Loading quiz...</section>;
    if (error) return <section className="mx-auto w-[min(720px,95%)] rounded-xl border border-rose-400/30 bg-rose-500/10 p-6 text-rose-200">{error}</section>;
    if (questions.length === 0 || !current) return <section className="ui-panel mx-auto w-[min(720px,95%)] rounded-xl p-6">No quiz questions available.</section>;

    if (index >= questions.length) {
      const percent = Math.round((score / (questions.length * 10)) * 100);
      return (
        <section className="ui-panel mx-auto w-[min(720px,95%)] rounded-2xl p-6 text-center">
          <h1 className="text-3xl font-bold">Score: {percent}%</h1>
          <p className="mt-2 text-slate-300">Areas to improve: advanced event loops and state optimization.</p>
          <button className="ui-btn-primary mt-5 rounded-lg px-4 py-2 font-semibold">Share score</button>
        </section>
      );
    }

    return (
      <section className="mx-auto w-[min(820px,95%)] space-y-4">
        <div className="h-2 rounded-full bg-slate-700/50"><div className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-700" style={{ width: `${(timeLeft / 20) * 100}%` }} /></div>
        <div className="flex items-center justify-between text-sm"><p>Question {index + 1}/10</p><p>Score {score}</p></div>
        {streak >= 2 && <p className="text-orange-300">🔥 x{streak} Streak!</p>}
        <AnimatePresence mode="wait">
          <motion.article key={current.id} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="ui-panel rounded-2xl p-5">
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
                      void selectPracticeAnswer(option);
                    }}
                    className={`rounded-lg border px-3 py-2 text-left transition ${
                      hiddenByHint
                        ? "blur-sm opacity-40"
                        : isSelected && isCorrect
                          ? "border-emerald-400 bg-emerald-400/20"
                          : isSelected && !isCorrect
                            ? "border-red-400 bg-red-400/20"
                            : "border-slate-600/70 bg-slate-800/60"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            <button onClick={() => setShowHint(true)} className="mt-3 text-sm text-primary-300">Hint (-5 points)</button>
          </motion.article>
        </AnimatePresence>
        <div className="flex gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className={`h-2 w-2 rounded-full ${i <= index ? "bg-primary-300" : "bg-slate-500/40"}`} />
          ))}
        </div>
        <div className="h-2 rounded-full bg-slate-700/50"><div className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-700" style={{ width: `${progress}%` }} /></div>
      </section>
    );
  };

  const renderCompetition = () => {
    if (!token || !user) {
      return (
        <section className="ui-panel mx-auto w-[min(820px,95%)] rounded-2xl p-6 text-center">
          <h2 className="text-2xl font-semibold">Competition Mode</h2>
          <p className="mt-2 text-slate-300">Please login to create or join real-time competitions.</p>
        </section>
      );
    }

    return (
      <section className="mx-auto w-[min(1120px,95%)] space-y-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <article className="ui-panel rounded-2xl p-5">
            <h2 className="text-xl font-semibold">Create Competition</h2>
            <p className="mt-1 text-sm text-slate-300">Customize settings for real-world quiz events.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input className="ui-input rounded-lg px-3 py-2" placeholder="Title" value={createPayload.title} onChange={(event) => setCreatePayload((previous) => ({ ...previous, title: event.target.value }))} />
              <input className="ui-input rounded-lg px-3 py-2" placeholder="Topic" value={createPayload.topic} onChange={(event) => setCreatePayload((previous) => ({ ...previous, topic: event.target.value }))} />
              <select className="ui-input rounded-lg px-3 py-2 capitalize" value={createPayload.difficulty} onChange={(event) => setCreatePayload((previous) => ({ ...previous, difficulty: event.target.value as Difficulty }))}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <input className="ui-input rounded-lg px-3 py-2" type="number" min={5} max={30} value={createPayload.question_count} onChange={(event) => setCreatePayload((previous) => ({ ...previous, question_count: Number(event.target.value) || 10 }))} />
              <input className="ui-input rounded-lg px-3 py-2" type="number" min={10} max={90} value={createPayload.seconds_per_question} onChange={(event) => setCreatePayload((previous) => ({ ...previous, seconds_per_question: Number(event.target.value) || 20 }))} />
              <input className="ui-input rounded-lg px-3 py-2" type="number" min={2} max={500} value={createPayload.max_participants} onChange={(event) => setCreatePayload((previous) => ({ ...previous, max_participants: Number(event.target.value) || 50 }))} />
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" checked={createPayload.is_public} onChange={(event) => setCreatePayload((previous) => ({ ...previous, is_public: event.target.checked }))} />
              Public competition
            </label>
            <button className="ui-btn-primary mt-4 rounded-lg px-4 py-2 font-semibold" onClick={() => { void handleCreateCompetition(); }}>
              Create Competition
            </button>
          </article>

          <article className="ui-panel rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Discover Competitions</h2>
              <button className="ui-btn-secondary rounded-md px-3 py-1.5 text-sm" onClick={() => { void refreshCompetitions(); }}>
                Refresh
              </button>
            </div>
            {competitionLoading ? (
              <p className="mt-4 text-sm text-slate-300">Loading competitions...</p>
            ) : competitions.length === 0 ? (
              <p className="mt-4 text-sm text-slate-300">No public competitions available.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {competitions.slice(0, 6).map((competition) => (
                  <div key={competition.id} className="ui-panel rounded-xl p-3">
                    <p className="font-medium">{competition.title}</p>
                    <p className="mt-1 text-xs text-slate-400">{competition.topic} • {competition.difficulty} • {competition.status}</p>
                    <p className="mt-1 text-xs text-slate-400">Participants: {competition.participantCount}/{competition.maxParticipants}</p>
                    {!competition.isPublic && (
                      <input
                        className="ui-input mt-2 w-full rounded-md px-2 py-1.5 text-sm"
                        placeholder="Join code"
                        value={joinCodes[competition.id] ?? ""}
                        onChange={(event) => setJoinCodes((previous) => ({ ...previous, [competition.id]: event.target.value }))}
                      />
                    )}
                    <button className="ui-btn-secondary mt-2 rounded-md px-3 py-1.5 text-sm" onClick={() => { void handleJoinCompetition(competition); }}>
                      Join
                    </button>
                  </div>
                ))}
              </div>
            )}
          </article>
        </div>

        {activeCompetition && (
          <article className="ui-panel rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold">{activeCompetition.title}</h3>
                <p className="mt-1 text-sm text-slate-300">
                  {activeCompetition.topic} • {activeCompetition.difficulty} • {activeCompetition.status}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Join code: {activeCompetition.joinCode} • {activeCompetition.participantCount}/{activeCompetition.maxParticipants}
                </p>
              </div>
              {activeCompetition.createdBy === user.id && activeCompetition.status === "open" && (
                <button className="ui-btn-primary rounded-lg px-4 py-2 font-semibold" onClick={() => { void handleStartCompetition(); }}>
                  Start Competition
                </button>
              )}
            </div>

            {activeCompetition.status === "live" && competitionQuestion && !competitionCompleted && (
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <p>Question {competitionQuestion.questionIndex}/{competitionQuestion.totalQuestions}</p>
                  <p>Score {competitionScore}</p>
                </div>
                <div className="ui-panel rounded-xl p-4">
                  <h4 className="text-lg font-semibold">{competitionQuestion.prompt}</h4>
                  <div className="mt-3 grid gap-2">
                    {competitionQuestion.options.map((option) => (
                      <button
                        key={option}
                        className={`rounded-lg border px-3 py-2 text-left transition ${competitionSelected === option ? "border-primary-400 bg-primary-500/20" : "border-slate-600/70 bg-slate-800/60"}`}
                        onClick={() => {
                          void handleSubmitCompetition(option);
                        }}
                        disabled={Boolean(competitionSelected)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-slate-400">Hint: {competitionQuestion.hint}</p>
                </div>
              </div>
            )}

            {competitionCompleted && (
              <div className="mt-4 rounded-xl border border-emerald-400/40 bg-emerald-500/10 p-4">
                <p className="font-semibold text-emerald-200">Competition completed. Final score: {competitionScore}</p>
              </div>
            )}

            <div className="mt-5">
              <h4 className="font-semibold">Leaderboard</h4>
              <div className="mt-2 space-y-2">
                {leaderboard.length === 0 ? (
                  <p className="text-sm text-slate-300">No leaderboard data yet.</p>
                ) : (
                  leaderboard.map((entry) => (
                    <div key={`${entry.rank}-${entry.displayName}`} className="ui-panel flex items-center justify-between rounded-lg px-3 py-2 text-sm">
                      <p>#{entry.rank} {entry.displayName}</p>
                      <p>{entry.score} pts</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </article>
        )}

        {competitionError && (
          <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{competitionError}</p>
        )}
      </section>
    );
  };

  return (
    <>
      <Helmet><title>EduAI | Quiz Competition</title></Helmet>
      <section className="mx-auto w-[min(1120px,95%)] space-y-5">
        <div className="ui-panel flex flex-wrap items-center gap-2 rounded-2xl p-2">
          <button
            className={`rounded-lg px-4 py-2 text-sm font-medium ${mode === "practice" ? "ui-btn-primary" : "ui-btn-secondary"}`}
            onClick={() => setMode("practice")}
          >
            Practice Quiz
          </button>
          <button
            className={`rounded-lg px-4 py-2 text-sm font-medium ${mode === "competition" ? "ui-btn-primary" : "ui-btn-secondary"}`}
            onClick={() => setMode("competition")}
          >
            Competition Mode
          </button>
        </div>
      </section>
      {mode === "practice" ? renderPractice() : renderCompetition()}
    </>
  );
}
