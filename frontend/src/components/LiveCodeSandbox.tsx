import { useState } from "react";
import { apiRequest } from "../api/client";

interface SandboxFeedbackResponse {
  feedback: string;
  suggestions: string[];
}

export function LiveCodeSandbox() {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("def solve(nums):\n    return sorted(nums)");
  const [feedback, setFeedback] = useState<SandboxFeedbackResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestFeedback = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await apiRequest<SandboxFeedbackResponse>("/api/code/feedback", {
        method: "POST",
        body: { language, code },
      });
      setFeedback(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown sandbox error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-700 bg-panel p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Live Code Sandbox</h2>
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          className="rounded-md border border-slate-600 bg-slate-900 px-3 py-1"
        >
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
        </select>
      </div>

      <textarea
        value={code}
        onChange={(event) => setCode(event.target.value)}
        className="min-h-52 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 font-mono text-sm text-slate-200"
      />

      <button
        type="button"
        onClick={requestFeedback}
        disabled={loading}
        className="mt-3 rounded-lg bg-accent px-4 py-2 font-medium text-slate-900 disabled:opacity-60"
      >
        {loading ? "Analyzing..." : "Get Real-Time AI Feedback"}
      </button>

      {error && <p className="mt-3 text-red-300">{error}</p>}

      {feedback && (
        <div className="mt-4 rounded-lg border border-slate-700 bg-slate-900/70 p-4">
          <h3 className="font-medium text-accent">AI Feedback</h3>
          <p className="mt-2 text-sm text-slate-200">{feedback.feedback}</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-300">
            {feedback.suggestions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
