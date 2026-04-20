import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-14 border-t border-transparent bg-[#090A10] pb-10 pt-8 [border-image:linear-gradient(to_right,#00D4FF,#7B2FFF)_1]">
      <div className="mx-auto grid w-[min(1120px,95%)] gap-6 md:grid-cols-4">
        <div>
          <h3 className="text-xl font-semibold text-cyan-300">EduAI</h3>
          <p className="mt-2 text-sm text-slate-300">
            Adaptive learning powered by AI, built for college showcases and company-ready demos.
          </p>
        </div>
        <div className="space-y-2 text-sm text-slate-300">
          <p className="font-semibold text-white">Quick Links</p>
          <Link to="/">Home</Link>
          <br />
          <Link to="/courses">Courses</Link>
          <br />
          <Link to="/dashboard">Dashboard</Link>
        </div>
        <div className="space-y-2 text-sm text-slate-300">
          <p className="font-semibold text-white">Platform Highlights</p>
          <p>Adaptive quiz engine</p>
          <p>AI learning path generator</p>
          <p>Progress analytics dashboard</p>
        </div>
        <div>
          <p className="font-semibold text-white">Built For Demo Readiness</p>
          <p className="mt-2 text-sm text-slate-300">
            The current build runs on React + FastAPI with a local SQLite setup for quick evaluation.
          </p>
        </div>
      </div>
    </footer>
  );
}
