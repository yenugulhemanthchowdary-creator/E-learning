import {
  BarChart3,
  Bell,
  BookOpen,
  Flame,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Radar,
  Sparkles,
  Star,
  Sun,
  Trophy,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar as RadarShape,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getMyCourses } from "../api/courses";
import { ChatBox } from "../components/ChatBox";
import { getLeaderboard, getMyDashboard, type LeaderboardEntry, type StudentDashboardResponse } from "../api/dashboard";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import type { Course } from "../types";

type DashboardPageProps = {
  initialTab?: "home" | "ai";
};

const sidebarLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/my-courses", label: "My Courses", icon: BookOpen },
  { to: "/courses", label: "Courses", icon: GraduationCap },
  { to: "/quiz", label: "Quiz", icon: Sparkles },
  { to: "/ai-tutor", label: "AI Tutor", icon: Radar },
];

const weekly = [
  { day: "Mon", minutes: 45 },
  { day: "Tue", minutes: 70 },
  { day: "Wed", minutes: 55 },
  { day: "Thu", minutes: 65 },
  { day: "Fri", minutes: 82 },
  { day: "Sat", minutes: 40 },
  { day: "Sun", minutes: 50 },
];

const radar = [
  { skill: "Python", value: 82 },
  { skill: "React", value: 76 },
  { skill: "AI", value: 71 },
  { skill: "SQL", value: 68 },
  { skill: "Design", value: 57 },
];

function getMedalStyle(rank: number): string {
  if (rank === 1) return "border-amber-300/40 bg-amber-500/15 text-amber-200";
  if (rank === 2) return "border-slate-300/35 bg-slate-400/15 text-slate-200";
  if (rank === 3) return "border-orange-300/35 bg-orange-500/15 text-orange-200";
  return "border-white/10 bg-white/5 text-slate-200";
}

function getMedalLabel(rank: number): string {
  if (rank === 1) return "Gold";
  if (rank === 2) return "Silver";
  if (rank === 3) return "Bronze";
  return `#${rank}`;
}

function shellCardClassName(extra = ""): string {
  return `rounded-3xl border border-white/8 bg-[rgba(255,255,255,0.04)] ${extra}`;
}

export function DashboardPage({ initialTab = "home" }: DashboardPageProps) {
  const { user, token, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<StudentDashboardResponse | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const showTutorView = initialTab === "ai";

  useEffect(() => {
    if (!token) {
      setDashboard(null);
      setLeaderboard([]);
      setMyCourses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    Promise.all([getMyDashboard(token), getLeaderboard(), getMyCourses(token)])
      .then(([dashboardData, leaderboardData, coursesData]) => {
        setDashboard(dashboardData);
        setLeaderboard(leaderboardData.slice(0, 5));
        setMyCourses(coursesData.slice(0, 3));
      })
      .catch((fetchError) => {
        const message = fetchError instanceof Error ? fetchError.message : "Failed to load dashboard";
        setError(message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const statCards = useMemo(
    () => [
      {
        label: "Courses Enrolled",
        value: myCourses.length,
        icon: GraduationCap,
        accent: "from-[#7c3aed] to-[#8b5cf6]",
      },
      {
        label: "Quizzes Completed",
        value: dashboard?.badges.length ?? 0,
        icon: Sparkles,
        accent: "from-[#7c3aed] to-[#a855f7]",
      },
      {
        label: "Current Streak",
        value: dashboard?.streak_days ?? 0,
        icon: Flame,
        accent: "from-[#8b5cf6] to-[#c084fc]",
      },
      {
        label: "Total XP Points",
        value: ((dashboard?.progress_percent ?? 0) * 10).toLocaleString(),
        icon: Zap,
        accent: "from-[#6d28d9] to-[#7c3aed]",
      },
    ],
    [dashboard?.badges.length, dashboard?.progress_percent, dashboard?.streak_days, myCourses.length],
  );

  const rankedLeaderboard = useMemo(
    () =>
      leaderboard.slice(0, 5).map((entry, index) => ({
        ...entry,
        rank: index + 1,
      })),
    [leaderboard],
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const renderSidebar = (mobile = false) => (
    <aside
      className={`${mobile ? "w-full max-w-[320px]" : "hidden md:flex md:w-[240px]"} flex-col justify-between border-white/8 bg-[rgba(255,255,255,0.03)] ${mobile ? "rounded-3xl" : "min-h-screen border-r"}`}
    >
      <div className="flex h-full flex-col gap-6 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#7c3aed]/30 bg-[#7c3aed]/15 text-[#c4b5fd] shadow-[0_0_40px_rgba(124,58,237,0.35)]">
            <LayoutDashboard className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="font-heading text-lg font-semibold text-white">EduAI</p>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Student Hub</p>
          </div>
        </div>

        <nav className="space-y-2" aria-label="Dashboard navigation">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-[#7c3aed] text-white shadow-[0_10px_35px_rgba(124,58,237,0.35)]"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="rounded-3xl border border-white/8 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <img
                src={user?.avatar}
                alt={user?.fullName ?? "User avatar"}
                className="h-11 w-11 rounded-2xl object-cover ring-2 ring-[#7c3aed]/35"
              />
              <div className="min-w-0">
                <p className="truncate font-medium text-white">{user?.fullName ?? "Student"}</p>
                <p className="truncate text-sm text-slate-400">{user?.email ?? "Learner account"}</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            aria-label="Log out of account"
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-[#7c3aed]/35 hover:bg-[#7c3aed]/15 hover:text-white"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );

  const renderStats = () => (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <article key={stat.label} className={`${shellCardClassName("p-5")} shadow-[0_12px_45px_rgba(0,0,0,0.2)]`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-slate-400">{stat.label}</p>
                <p className="mt-3 font-heading text-3xl font-semibold text-white">{stat.value}</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.accent} text-white shadow-[0_0_30px_rgba(124,58,237,0.25)]`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );

  const renderOverview = () => (
    <>
      <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <article className="relative overflow-hidden rounded-[28px] border border-white/8 bg-gradient-to-br from-[#7c3aed] via-[#6d28d9] to-[#4c1d95] p-6 shadow-[0_24px_70px_rgba(124,58,237,0.35)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_42%)]" />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-heading text-3xl font-semibold text-white sm:text-4xl">
                Welcome back, {user?.fullName ?? "Student"}
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
                Your learning streak is strong. Keep building momentum with focused practice, guided lessons,
                and quick AI feedback.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white backdrop-blur">
              <Flame className="h-6 w-6 text-orange-300" aria-hidden="true" />
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/70">Current streak</p>
                <p className="font-heading text-2xl font-semibold">{dashboard?.streak_days ?? 0} days</p>
              </div>
            </div>
          </div>
        </article>

        <article className={`${shellCardClassName("p-5")} flex flex-col justify-between`}>
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Learning Summary</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Progress is tracking across quizzes, badge activity, and course completion. The overview stays
              dark, focused, and easy to scan.
            </p>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Badges</p>
              <p className="mt-2 font-heading text-2xl font-semibold text-white">{dashboard?.badges.length ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Progress</p>
              <p className="mt-2 font-heading text-2xl font-semibold text-white">{dashboard?.progress_percent ?? 0}%</p>
            </div>
          </div>
        </article>
      </section>

      {renderStats()}

      <section className="grid gap-5 xl:grid-cols-2">
        <article className={`${shellCardClassName("p-5")} min-h-[420px]`}>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Weekly Activity</p>
              <h2 className="mt-2 font-heading text-2xl font-semibold text-white">Your learning rhythm</h2>
            </div>
            <BarChart3 className="h-5 w-5 text-[#c084fc]" aria-hidden="true" />
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly}>
                <XAxis dataKey="day" stroke="#cbd5e1" tickLine={false} axisLine={false} />
                <YAxis stroke="#cbd5e1" tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(124,58,237,0.12)" }}
                  contentStyle={{
                    background: "#11111a",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 16,
                    color: "#fff",
                  }}
                />
                <Bar dataKey="minutes" fill="#7c3aed" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className={`${shellCardClassName("p-5")} min-h-[420px]`}>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Leaderboard</p>
              <h2 className="mt-2 font-heading text-2xl font-semibold text-white">Ranked cards</h2>
            </div>
            <Trophy className="h-5 w-5 text-[#c084fc]" aria-hidden="true" />
          </div>

          <div className="space-y-3">
            {rankedLeaderboard.length === 0 ? (
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4 text-sm text-slate-300">
                No leaderboard data yet. Check back after more learners join.
              </div>
            ) : (
              rankedLeaderboard.map((entry) => (
                <article
                  key={entry.student_id}
                  className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/5 p-4 transition hover:border-[#7c3aed]/35 hover:bg-white/[0.07]"
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-sm font-semibold ${getMedalStyle(entry.rank)}`}>
                    {getMedalLabel(entry.rank)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-white">{entry.display_name}</p>
                      {entry.rank <= 3 && <Star className="h-4 w-4 text-[#c084fc]" aria-hidden="true" />}
                    </div>
                    <p className="text-sm text-slate-400">{entry.streak} day streak</p>
                  </div>
                  <div className="text-right">
                    <p className="font-heading text-xl font-semibold text-white">{entry.score}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Points</p>
                  </div>
                </article>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className={`${shellCardClassName("p-5")} min-h-[420px]`}>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Skill Radar</p>
              <h2 className="mt-2 font-heading text-2xl font-semibold text-white">Core skill coverage</h2>
            </div>
            <Radar className="h-5 w-5 text-[#c084fc]" aria-hidden="true" />
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radar}>
                <PolarGrid stroke="rgba(255,255,255,0.12)" />
                <PolarAngleAxis dataKey="skill" stroke="#e2e8f0" />
                <PolarRadiusAxis stroke="#64748b" />
                <RadarShape dataKey="value" stroke="#c084fc" fill="#7c3aed" fillOpacity={0.32} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className={`${shellCardClassName("p-5")} min-h-[420px]`}>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Continue Learning</p>
              <h2 className="mt-2 font-heading text-2xl font-semibold text-white">Pick up where you left off</h2>
            </div>
            <BookOpen className="h-5 w-5 text-[#c084fc]" aria-hidden="true" />
          </div>

          {myCourses.length === 0 ? (
            <div className="rounded-2xl border border-white/8 bg-white/5 p-5 text-sm text-slate-300">
              <p className="text-base font-medium text-white">No active courses yet</p>
              <p className="mt-2">Browse the catalog and enroll to start tracking your progress here.</p>
              <Link to="/courses" className="mt-4 inline-flex rounded-xl bg-[#7c3aed] px-4 py-2 font-medium text-white transition hover:bg-[#6d28d9]">
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myCourses.map((course) => (
                <article key={course.id} className="rounded-2xl border border-white/8 bg-white/5 p-4 transition hover:border-[#7c3aed]/35 hover:bg-white/[0.07]">
                  <div className="flex items-start gap-4">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="h-16 w-16 rounded-2xl object-cover ring-1 ring-white/10"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-white">{course.title}</p>
                          <p className="text-sm text-slate-400">{course.instructor}</p>
                        </div>
                        <span className="rounded-full border border-[#7c3aed]/35 bg-[#7c3aed]/15 px-3 py-1 text-xs font-medium text-[#d8b4fe]">
                          {course.progress}%
                        </span>
                      </div>
                      <div className="mt-4 h-2 rounded-full bg-slate-800/80">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#c084fc]"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>
      </section>
    </>
  );

  const renderTutorView = () => (
    <article className={`${shellCardClassName("p-5")} min-h-[calc(100vh-180px)]`}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-slate-400">AI Tutor</p>
          <h2 className="mt-2 font-heading text-2xl font-semibold text-white">Ask questions, get guidance</h2>
        </div>
        <Sparkles className="h-5 w-5 text-[#c084fc]" aria-hidden="true" />
      </div>
      <ChatBox />
    </article>
  );

  const renderMobileSidebar = () => {
    if (!mobileSidebarOpen) {
      return null;
    }

    return (
      <div className="fixed inset-0 z-50 md:hidden">
        <button
          type="button"
          className="absolute inset-0 bg-black/65 backdrop-blur-sm"
          aria-label="Close navigation drawer"
          onClick={() => setMobileSidebarOpen(false)}
        />
        <div className="absolute left-4 top-4 bottom-4 w-[calc(100%-2rem)] max-w-[320px]">
          {renderSidebar(true)}
        </div>
      </div>
    );
  };

  if (loading && !showTutorView) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f] px-4 py-4 text-white sm:px-6 lg:px-0">
        <div className="pointer-events-none absolute left-[-90px] top-[-90px] h-[340px] w-[340px] rounded-full bg-[#7c3aed]/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-120px] right-[-80px] h-[360px] w-[360px] rounded-full bg-[#a855f7]/15 blur-3xl" />
        <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-[1400px] gap-0 overflow-hidden rounded-[32px] border border-white/8 bg-[rgba(255,255,255,0.03)] shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
          <aside className="hidden w-[240px] border-r border-white/8 bg-[rgba(255,255,255,0.03)] p-5 md:flex">
            <div className="h-full w-full space-y-4">
              <div className="h-12 w-28 animate-pulse rounded-2xl bg-white/8" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-12 animate-pulse rounded-2xl bg-white/5" />
                ))}
              </div>
            </div>
          </aside>
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="space-y-5">
              <div className="h-16 animate-pulse rounded-3xl bg-white/5" />
              <div className="grid gap-4 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-28 animate-pulse rounded-3xl bg-white/5" />
                ))}
              </div>
              <div className="grid gap-5 xl:grid-cols-2">
                <div className="h-[420px] animate-pulse rounded-3xl bg-white/5" />
                <div className="h-[420px] animate-pulse rounded-3xl bg-white/5" />
              </div>
              <div className="grid gap-5 xl:grid-cols-2">
                <div className="h-[420px] animate-pulse rounded-3xl bg-white/5" />
                <div className="h-[420px] animate-pulse rounded-3xl bg-white/5" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error && !showTutorView) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f] px-4 py-6 text-white sm:px-6 lg:px-0">
        <div className="pointer-events-none absolute left-[-90px] top-[-90px] h-[340px] w-[340px] rounded-full bg-[#7c3aed]/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-120px] right-[-80px] h-[360px] w-[360px] rounded-full bg-[#a855f7]/15 blur-3xl" />
        <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-[1400px] gap-0 overflow-hidden rounded-[32px] border border-white/8 bg-[rgba(255,255,255,0.03)] shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
          {renderSidebar()}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="rounded-3xl border border-white/8 bg-[rgba(255,255,255,0.04)] p-8 text-center">
              <p className="font-heading text-2xl font-semibold text-white">We couldn’t load your dashboard.</p>
              <p className="mt-3 text-sm text-slate-300">{error}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setLoading(true);
                    setError(null);
                    if (token) {
                      Promise.all([getMyDashboard(token), getLeaderboard(), getMyCourses(token)])
                        .then(([dashboardData, leaderboardData, coursesData]) => {
                          setDashboard(dashboardData);
                          setLeaderboard(leaderboardData.slice(0, 5));
                          setMyCourses(coursesData.slice(0, 3));
                        })
                        .catch((fetchError) => {
                          const message = fetchError instanceof Error ? fetchError.message : "Failed to load dashboard";
                          setError(message);
                        })
                        .finally(() => {
                          setLoading(false);
                        });
                    } else {
                      setLoading(false);
                    }
                  }}
                  className="rounded-xl bg-[#7c3aed] px-4 py-2 font-medium text-white transition hover:bg-[#6d28d9]"
                >
                  Retry
                </button>
                <Link to="/courses" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-medium text-slate-100 transition hover:bg-white/10">
                  Browse Courses
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{showTutorView ? "EduAI | AI Tutor" : "EduAI | Dashboard"}</title>
      </Helmet>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500;700&display=swap');
      `}</style>

      <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f] px-4 py-4 text-white sm:px-6 lg:px-0">
        <div className="pointer-events-none absolute left-[-90px] top-[-90px] h-[340px] w-[340px] rounded-full bg-[#7c3aed]/20 blur-3xl" />
        <div className="pointer-events-none absolute right-[-120px] top-[120px] h-[340px] w-[340px] rounded-full bg-[#a855f7]/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-120px] left-[20%] h-[380px] w-[380px] rounded-full bg-[#6d28d9]/12 blur-3xl" />

        {renderMobileSidebar()}

        <div className="relative mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-[1400px] gap-0 overflow-hidden rounded-[32px] border border-white/8 bg-[rgba(255,255,255,0.03)] shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
          {renderSidebar()}

          <main className="flex-1 overflow-hidden">
            <div className="flex min-h-[calc(100vh-2rem)] flex-col p-4 sm:p-6 lg:p-8">
              <header className="mb-6 flex items-center justify-between gap-4 rounded-3xl border border-white/8 bg-[rgba(255,255,255,0.04)] px-5 py-4 backdrop-blur">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMobileSidebarOpen(true)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/5 text-slate-100 transition hover:bg-white/10 md:hidden"
                    aria-label="Open navigation menu"
                  >
                    <Menu className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[#c4b5fd]">EduAI</p>
                    <h1 className="font-heading text-2xl font-semibold text-white sm:text-3xl">
                      {showTutorView ? "AI Tutor" : "Dashboard"}
                    </h1>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/5 text-slate-100 transition hover:bg-white/10"
                    aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
                  >
                    {theme === "dark" ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
                  </button>
                  <button
                    type="button"
                    className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/5 text-slate-100 transition hover:bg-white/10"
                    aria-label="View notifications"
                  >
                    <Bell className="h-5 w-5" aria-hidden="true" />
                    <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#c084fc]" aria-hidden="true" />
                  </button>
                </div>
              </header>

              <div className="flex-1 space-y-6 overflow-hidden">
                {showTutorView ? renderTutorView() : renderOverview()}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
