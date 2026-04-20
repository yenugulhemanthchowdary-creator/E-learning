import { Flame } from "lucide-react";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Bar, BarChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getMyCourses } from "../api/courses";
import { getLeaderboard, getMyDashboard, type LeaderboardEntry, type StudentDashboardResponse } from "../api/dashboard";
import { useAuth } from "../hooks/useAuth";
import type { Course } from "../types";

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

export function DashboardPage() {
  const { user, token } = useAuth();
  const [dashboard, setDashboard] = useState<StudentDashboardResponse | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myCourses, setMyCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (!token) return;
    getMyDashboard(token).then(setDashboard).catch(() => setDashboard(null));
    getLeaderboard().then((items) => setLeaderboard(items.slice(0, 5))).catch(() => setLeaderboard([]));
    getMyCourses(token).then((items) => setMyCourses(items.slice(0, 3))).catch(() => setMyCourses([]));
  }, [token]);

  return (
    <div className="mx-auto w-[min(1120px,95%)] space-y-5">
      <Helmet><title>EduAI | Dashboard</title></Helmet>
      <section className="glass-card flex items-center justify-between p-6">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back, {user?.fullName ?? "Student"}!</h1>
          <p className="mt-1 text-slate-300">Day {dashboard?.streak_days ?? 0} streak. Keep your momentum alive.</p>
        </div>
        <Flame className="h-11 w-11 animate-pulse text-orange-400" />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="glass-card p-4 lg:col-span-2">
          <h2 className="mb-3 font-semibold">Weekly Activity</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly}>
                <XAxis dataKey="day" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip />
                <Bar dataKey="minutes" fill="#00D4FF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="glass-card p-4">
          <h2 className="mb-3 font-semibold">Leaderboard</h2>
          <ul className="space-y-2 text-sm">
            {leaderboard.map((entry, index) => (
              <li key={entry.student_id}>{index + 1}. {entry.display_name} ({entry.score})</li>
            ))}
          </ul>
        </article>

        <article className="glass-card p-4">
          <h2 className="mb-3 font-semibold">Skill Radar</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radar}>
                <PolarGrid stroke="#475569" />
                <PolarAngleAxis dataKey="skill" stroke="#e2e8f0" />
                <PolarRadiusAxis stroke="#64748b" />
                <Radar dataKey="value" stroke="#7B2FFF" fill="#00D4FF" fillOpacity={0.45} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="glass-card p-4 lg:col-span-2">
          <h2 className="mb-3 font-semibold">Continue Learning</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {myCourses.length === 0 ? (
              <div className="rounded-xl border border-white/15 bg-white/5 p-3 text-sm text-slate-300">
                Enroll in a course to see your progress here.
              </div>
            ) : (
              myCourses.map((course) => (
                <div key={course.id} className="rounded-xl border border-white/15 bg-white/5 p-3">
                  <p className="font-medium">{course.title}</p>
                  <div className="mt-2 h-2 rounded-full bg-white/10">
                    <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" style={{ width: `${course.progress}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="glass-card p-4">
        <h2 className="font-semibold">AI Recommendation</h2>
        <p className="mt-2 text-slate-300">Based on your progress ({dashboard?.progress_percent ?? 0}%), try: Advanced ML</p>
        <p className="mt-2 text-xs text-slate-400">Badges: {(dashboard?.badges ?? ["New Explorer"]).join(", ")}</p>
      </section>
    </div>
  );
}
