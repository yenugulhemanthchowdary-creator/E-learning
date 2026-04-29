import { useEffect, useRef, useState } from "react";
import { ApiError, apiRequest } from "../api/client";

const SYSTEM_PROMPT =
  "You are EduAI, a helpful learning assistant for students. Keep answers concise and educational.";

type ChatRole = "assistant" | "user";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

type GroqChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

type HttpError = Error & { status?: number };

type TutorChatResponse = {
  answer: string;
};

export function ChatBox() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi! I am your AI Tutor. Ask me about Python, React, SQL, or Machine Learning.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!scrollRef.current) {
      return;
    }
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const groqModel = "llama-3.1-8b-instant";

  const requestTutorAnswer = async (apiKey: string, question: string): Promise<string> => {
    try {
      const payload = await apiRequest<TutorChatResponse>("/api/tutor/chat", {
        method: "POST",
        body: { message: question, api_key: apiKey, model: groqModel },
      });
      return payload.answer?.trim() || "I could not generate a response. Please try again.";
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 404)) {
        throw error;
      }
    }

    if (!apiKey) {
      throw new Error(
        "Backend is missing `/api/tutor/chat` and no API key is set. Add `VITE_GROQ_API_KEY` in `frontend/.env` or set `GROQ_API_KEY` in `backend/.env`, then restart the servers.",
      );
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: groqModel,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: question },
        ],
        max_completion_tokens: 512,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const parsed = (() => {
        try {
          const json = JSON.parse(errorText) as { error?: { message?: string } };
          return json?.error?.message || errorText;
        } catch {
          return errorText;
        }
      })();

      const error = new Error(parsed || "Groq request failed.") as HttpError;
      error.status = response.status;
      throw error;
    }

    const data: GroqChatCompletionResponse = await response.json();
    const answer = data?.choices?.[0]?.message?.content?.trim();
    return answer || "I could not generate a response. Please try again.";
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) {
      return;
    }

    const apiKey = (import.meta.env.VITE_GROQ_API_KEY || "").trim();
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const answer = await requestTutorAnswer(apiKey, trimmed);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: answer || "I could not generate a response. Please try again.",
        },
      ]);
    } catch (error) {
      let message = "I hit a connection issue while contacting the AI tutor. Please try again.";
      const status =
        typeof error === "object" && error !== null && "status" in error
          ? (error as { status?: unknown }).status
          : undefined;
      if (status === 429) {
        message = "Groq rate/quota limit reached (429). Wait 1-2 minutes or use an API key with available quota.";
      } else if (error instanceof ApiError) {
        message = error.message;
      } else if (error instanceof Error && error.message.trim()) {
        message = error.message;
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: message,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="glass-card p-4">
      <h2 className="font-semibold">AI Tutor Chat</h2>
      <p className="mt-1 text-sm text-slate-300">Ask learning questions and get concise guidance.</p>

      <div
        ref={scrollRef}
        className="mt-4 h-80 overflow-y-auto rounded-2xl border border-slate-700/60 bg-slate-900/60 p-3"
      >
        <div className="space-y-3">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "bg-cyan-400 text-slate-950"
                    : "border border-slate-700 bg-slate-800 text-slate-100"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300">
                Tutor is typing...
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Ask a question..."
          className="flex-1 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-300"
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition enabled:hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </section>
  );
}
