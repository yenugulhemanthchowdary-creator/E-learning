import { motion } from "framer-motion";

type OnboardingFlowProps = {
  onComplete: (topics: string[]) => void;
};

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const handleContinue = () => {
    onComplete(["Python", "React", "SQL", "ML"]);
  };

  return (
    <div className="fixed inset-0 z-[90] overflow-hidden">
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f1f3d] via-[#1a3a6e] to-[#0e4d6b] px-6 py-10"
      >
        <div className="pointer-events-none absolute -right-24 -top-36 h-[500px] w-[500px] rounded-full bg-[rgba(55,138,221,0.12)]" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-[300px] w-[300px] rounded-full bg-[rgba(29,158,117,0.1)]" />

        <p className="relative mb-8 text-[13px] font-medium uppercase tracking-[2px] text-[#5DCAA5]">EduLearn</p>
        <h1 className="relative mb-4 text-center text-4xl font-bold leading-tight text-white sm:text-5xl">
          Learn smarter with <span className="text-[#5DCAA5]">AI-powered</span>
          <br />
          education
        </h1>
        <p className="relative mb-10 max-w-[420px] text-center text-[15px] leading-7 text-white/70">
          Courses, quizzes, and an AI tutor, all in one place. Built for the next generation of learners.
        </p>

        <div className="relative mb-10 flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-4 py-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[rgba(93,202,165,0.2)] text-xs">📚</span>
            <span className="text-[13px] font-medium text-white/85">100+ Courses</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-4 py-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[rgba(93,202,165,0.2)] text-xs">🧠</span>
            <span className="text-[13px] font-medium text-white/85">AI Quiz Engine</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-4 py-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[rgba(93,202,165,0.2)] text-xs">💬</span>
            <span className="text-[13px] font-medium text-white/85">AI Tutor Chat</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleContinue}
          className="relative rounded-lg bg-[#1D9E75] px-9 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#0F6E56]"
        >
          Get Started →
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="relative mt-3 rounded-lg border border-white/25 px-5 py-2.5 text-[13px] text-white/70 transition hover:border-white/45 hover:text-white"
        >
          Already have an account? Log in
        </button>
      </motion.section>
    </div>
  );
}