import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="mx-auto grid min-h-[60vh] w-[min(640px,95%)] place-items-center text-center">
      <div>
        <h1 className="glitch text-7xl font-bold" data-text="404">404</h1>
        <p className="mt-3 text-slate-300">The page you requested does not exist.</p>
        <Link to="/" className="mt-6 inline-block rounded-lg bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-2 font-semibold text-black">Go Home</Link>
      </div>
    </section>
  );
}
