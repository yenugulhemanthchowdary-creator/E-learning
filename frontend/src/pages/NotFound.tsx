import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="mx-auto grid min-h-[70vh] w-[min(640px,95%)] place-items-center px-4 py-12 text-center">
      <div className="glass-card w-full rounded-3xl p-8 sm:p-10">
        <p className="ui-kicker text-sm uppercase tracking-[0.24em]">Page Not Found</p>
        <h1 className="mt-3 text-7xl font-bold text-white">404</h1>
        <p className="mt-4 text-slate-300">The page you requested does not exist.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/" className="ui-btn-primary rounded-lg px-4 py-2 font-semibold">
            Go Home
          </Link>
          <Link to="/courses" className="ui-btn-secondary rounded-lg px-4 py-2 font-semibold text-slate-100">
            Browse Courses
          </Link>
        </div>
      </div>
    </section>
  );
}
