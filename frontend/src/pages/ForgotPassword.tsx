import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export function ForgotPasswordPage() {
  return (
    <section className="mx-auto grid min-h-[70vh] w-[min(520px,95%)] place-items-center px-4 py-12">
      <Helmet>
        <title>EduAI | Forgot Password</title>
      </Helmet>

      <div className="glass-card w-full rounded-3xl p-6 text-center sm:p-8">
        <p className="ui-kicker text-sm uppercase tracking-[0.24em]">Account Access</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Forgot your password?</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Password reset is not wired up yet in this build. If you are testing the app, use your existing
          account or return to the login page.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/login" className="ui-btn-primary rounded-xl px-5 py-3 font-semibold">
            Back to login
          </Link>
          <Link to="/register" className="ui-btn-secondary rounded-xl px-5 py-3 font-semibold text-slate-100">
            Create account
          </Link>
        </div>
      </div>
    </section>
  );
}
