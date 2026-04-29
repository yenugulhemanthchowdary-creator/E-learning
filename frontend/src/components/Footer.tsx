import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-14 border-t border-white/10 bg-[#0d0d14] pb-10 pt-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=DM+Sans:wght@400;500;700&display=swap');`}</style>
      <div className="mx-auto grid w-[min(1120px,95%)] gap-8 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>EduAI</h3>
          <p className="mt-2 text-sm text-slate-400">
            Adaptive learning powered by AI, built for college showcases and company-ready demos.
          </p>
        </div>
        <div className="space-y-2 text-sm text-slate-400">
          <p className="font-semibold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>Quick Links</p>
          <div className="flex flex-col gap-2">
            <Link to="/" className="transition-colors hover:text-[#c4b5fd]">Home</Link>
            <Link to="/courses" className="transition-colors hover:text-[#c4b5fd]">Courses</Link>
            <Link to="/dashboard" className="transition-colors hover:text-[#c4b5fd]">Dashboard</Link>
          </div>
        </div>
        <div className="space-y-2 text-sm text-slate-400">
          <p className="font-semibold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>Platform Highlights</p>
          <p>Adaptive quiz engine</p>
          <p>AI learning path generator</p>
          <p>Progress analytics dashboard</p>
        </div>
        <div className="space-y-2 text-sm text-slate-400">
          <p className="font-semibold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>Built For Demo Readiness</p>
          <p className="mt-2 text-sm text-slate-400">
            The current build runs on React + FastAPI with a local SQLite setup for quick evaluation.
          </p>
        </div>
      </div>
    </footer>
  );
}
