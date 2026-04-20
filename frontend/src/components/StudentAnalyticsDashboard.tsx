import { Flame } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardData } from "../types";

interface StudentAnalyticsDashboardProps {
  data: DashboardData;
}

export function StudentAnalyticsDashboard({ data }: StudentAnalyticsDashboardProps) {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <article className="rounded-2xl border border-slate-700 bg-panel p-5 lg:col-span-2">
        <h2 className="mb-4 text-xl font-semibold">Weekly Learning Activity</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" />
              <Tooltip />
              <Bar dataKey="minutes" fill="#34d399" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="rounded-2xl border border-slate-700 bg-panel p-5">
        <h2 className="mb-4 text-xl font-semibold">Current Streak</h2>
        <div className="flex items-center gap-3 text-4xl font-bold text-amber-400">
          <Flame className="h-10 w-10" />
          <span>{data.streak} days</span>
        </div>
      </article>

      <article className="rounded-2xl border border-slate-700 bg-panel p-5 lg:col-span-2">
        <h2 className="mb-4 text-xl font-semibold">Topic Mastery Heatmap</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {data.topicMastery.map((item) => (
            <div key={item.topic} className="rounded-xl border border-slate-700 p-3">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span>{item.topic}</span>
                <span>{item.mastery}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-emerald-400"
                  style={{ width: `${item.mastery}%`, opacity: 0.4 + item.mastery / 170 }}
                />
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-2xl border border-slate-700 bg-panel p-5">
        <h2 className="mb-4 text-xl font-semibold">Recommended Topics</h2>
        <ul className="space-y-2">
          {data.recommendedTopics.map((topic) => (
            <li key={topic} className="rounded-lg bg-slate-900/80 px-3 py-2">
              {topic}
            </li>
          ))}
        </ul>
      </article>

      <article className="rounded-2xl border border-slate-700 bg-panel p-5 lg:col-span-3">
        <h2 className="mb-4 text-xl font-semibold">Badges Earned</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {data.badges.map((badge) => (
            <div key={badge.id} className="rounded-xl border border-slate-600 bg-slate-900/70 p-4">
              <h3 className="font-medium text-accent">{badge.title}</h3>
              <p className="mt-1 text-sm text-slate-300">{badge.description}</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
