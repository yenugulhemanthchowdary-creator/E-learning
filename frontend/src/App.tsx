import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Footer } from "./components/Footer";
import { AuthSidebarLayout } from "./components/AuthSidebarLayout";
import { LoadingScreen } from "./components/LoadingScreen";
import { Navbar } from "./components/Navbar";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { PageTransition } from "./components/PageTransition";
import { useAuth } from "./hooks/useAuth";
import { DashboardPage } from "./pages/DashboardPage";
import { HomePage } from "./pages/Home";
import { LoginPage } from "./pages/Login";
import { MyCoursesPage } from "./pages/MyCourses";
import { NotFoundPage } from "./pages/NotFound";
import { QuizPage } from "./pages/QuizPage";
import { RegisterPage } from "./pages/Register";
import { CoursesPage } from "./pages/CoursesPage";
import { CourseDetailPage } from "./pages/CourseDetail";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  if (!ready) {
    return (
      <div className="ui-panel mx-auto w-[min(1120px,95%)] rounded-2xl p-8 text-center text-slate-300">
        Restoring your session...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function ForgotPasswordPage() {
  return (
    <section className="mx-auto grid min-h-[70vh] w-[min(520px,95%)] place-items-center px-4 py-12">
      <div className="glass-card w-full rounded-3xl p-6 text-center sm:p-8">
        <p className="ui-kicker text-sm uppercase tracking-[0.24em]">Account Access</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Forgot your password?</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Password reset is not wired up yet in this build. If you are testing the app, use your existing
          account or return to the login page.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a href="/login" className="ui-btn-primary rounded-xl px-5 py-3 font-semibold">
            Back to login
          </a>
          <a href="/register" className="ui-btn-secondary rounded-xl px-5 py-3 font-semibold text-slate-100">
            Create account
          </a>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, ready } = useAuth();
  const isLoginRoute = location.pathname === "/login";
  const isLandingRoute = location.pathname === "/";
  const isDashboardShellRoute =
    location.pathname === "/dashboard" ||
    location.pathname === "/ai-tutor" ||
    location.pathname === "/my-courses" ||
    location.pathname === "/courses" ||
    location.pathname === "/quiz";
  const [showLoader, setShowLoader] = useState(() => !sessionStorage.getItem("eduai-loaded"));
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem("eduai-onboarding-complete"),
  );

  useEffect(() => {
    if (!showLoader) {
      return;
    }
    const timer = setTimeout(() => {
      setShowLoader(false);
      sessionStorage.setItem("eduai-loaded", "1");
    }, 1250);
    return () => clearTimeout(timer);
  }, [showLoader]);

  useEffect(() => {
    const pathname = location.pathname;
    let title = "EduAI";

    if (pathname === "/") {
      title = "EduAI | Home";
    } else if (pathname === "/courses") {
      title = "EduAI | Courses";
    } else if (pathname.startsWith("/courses/")) {
      title = "EduAI | Course Details";
    } else if (pathname === "/quiz") {
      title = "EduAI | Quiz";
    } else if (pathname === "/dashboard") {
      title = "EduAI | Dashboard";
    } else if (pathname === "/ai-tutor") {
      title = "EduAI | AI Tutor";
    } else if (pathname === "/my-courses") {
      title = "EduAI | My Courses";
    } else if (pathname === "/login") {
      title = "EduAI | Login";
    } else if (pathname === "/forgot-password") {
      title = "EduAI | Forgot Password";
    } else if (pathname === "/register") {
      title = "EduAI | Register";
    } else {
      title = "EduAI | Page Not Found";
    }

    document.title = title;
  }, [location.pathname]);

  const handleCompleteOnboarding = (topics: string[]) => {
    localStorage.setItem("eduai-onboarding-complete", "1");
    localStorage.setItem("eduai-onboarding-topics", JSON.stringify(topics));
    setShowOnboarding(false);
    navigate("/login");
  };

  return (
    <>
      <AnimatePresence>{showLoader && <LoadingScreen />}</AnimatePresence>
      <AnimatePresence>
        {!showLoader && showOnboarding && <OnboardingFlow onComplete={handleCompleteOnboarding} />}
      </AnimatePresence>
      <div className="relative min-h-screen overflow-x-hidden pb-6">
        <div
          className={`pointer-events-none fixed inset-0 -z-10 ${isDashboardShellRoute || isLandingRoute ? "bg-[#0a0a0f]" : "mesh-bg opacity-90"}`}
        />
        {!isLoginRoute && !isDashboardShellRoute && !isLandingRoute && <Navbar />}
        <main className={isLoginRoute || isDashboardShellRoute ? "" : "pt-6"}>
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Routes location={location}>
                <Route
                  path="/"
                  element={
                    ready ? (
                      user ? (
                        <Navigate to="/dashboard" replace />
                      ) : (
                        <HomePage />
                      )
                    ) : (
                      <div className="ui-panel mx-auto w-[min(1120px,95%)] rounded-2xl p-8 text-center text-slate-300">
                        Restoring your session...
                      </div>
                    )
                  }
                />
                <Route
                  path="/courses"
                  element={
                    <AuthSidebarLayout>
                      <CoursesPage />
                    </AuthSidebarLayout>
                  }
                />
                <Route path="/courses/:id" element={<CourseDetailPage />} />
                <Route
                  path="/quiz"
                  element={
                    <AuthSidebarLayout>
                      <QuizPage />
                    </AuthSidebarLayout>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <DashboardPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/ai-tutor"
                  element={
                    <PrivateRoute>
                      <DashboardPage initialTab="ai" />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/my-courses"
                  element={
                    <PrivateRoute>
                      <AuthSidebarLayout>
                        <MyCoursesPage />
                      </AuthSidebarLayout>
                    </PrivateRoute>
                  }
                />
                <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </PageTransition>
          </AnimatePresence>
        </main>
        {!isLoginRoute && !isDashboardShellRoute && !isLandingRoute && <Footer />}
      </div>
    </>
  );
}
