import { useState } from "react";
import { apiRequest } from "../api/client";

type SkillLevel = "beginner" | "intermediate" | "advanced";

interface LearningPathResponse {
  steps: string[];
  estimated_time: string;
  resources: string[];
  quiz_questions: string[];
}

export function LearningPathGenerator() {
  const [topic, setTopic] = useState("Python Async");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("beginner");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LearningPathResponse | null>(null);

  const generatePath = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await apiRequest<LearningPathResponse>("/api/learning-path/generate", {
        method: "POST",
        body: { topic, skill_level: skillLevel },
      });
      setResult(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown learning path error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="learning-path" className="rounded-2xl border border-slate-700 bg-panel p-6">
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="min-w-60 flex-1">
          <label className="mb-1 block text-sm text-slate-300">Topic</label>
          <input
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2"
            placeholder="Enter topic"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Skill level</label>
          <select
            value={skillLevel}
            onChange={(event) => setSkillLevel(event.target.value as SkillLevel)}
            className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 capitalize"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <button
          type="button"
          onClick={generatePath}
          disabled={loading || topic.trim().length === 0}
          className="rounded-lg bg-accent px-4 py-2 font-semibold text-slate-900 disabled:opacity-60"
        >
          {loading ? "Generating..." : "Generate AI Path"}
        </button>
      </div>

      {error && <p className="text-red-300">{error}</p>}

      {result && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-4">
            <h3 className="font-semibold text-accent">Step-by-step plan</h3>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-200">
              {result.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p className="mt-3 text-sm text-slate-300">Estimated time: {result.estimated_time}</p>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-4">
              <h3 className="font-semibold text-accent">Resources</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-200">
                {result.resources.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-4">
              <h3 className="font-semibold text-accent">Practice quiz prompts</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-200">
                {result.quiz_questions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
