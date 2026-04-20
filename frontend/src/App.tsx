import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Footer } from "./components/Footer";
import { LoadingScreen } from "./components/LoadingScreen";
import { Navbar } from "./components/Navbar";
import { PageTransition } from "./components/PageTransition";
import { useAuth } from "./hooks/useAuth";
import { CourseDetailPage } from "./pages/CourseDetail";
import { CoursesPage } from "./pages/CoursesPage";
import { DashboardPage } from "./pages/Dashboard";
import { HomePage } from "./pages/Home";
import { LoginPage } from "./pages/Login";
import { MyCoursesPage } from "./pages/MyCourses";
import { NotFoundPage } from "./pages/NotFound";
import { QuizPage } from "./pages/Quiz";
import { RegisterPage } from "./pages/Register";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  if (!ready) {
    return (
      <div className="mx-auto w-[min(1120px,95%)] rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-slate-300">
        Restoring your session...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const location = useLocation();
  const [showLoader, setShowLoader] = useState(() => !sessionStorage.getItem("eduai-loaded"));

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

  return (
    <>
      <AnimatePresence>{showLoader && <LoadingScreen />}</AnimatePresence>
      <div className="relative min-h-screen overflow-x-hidden pb-6">
        <div className="pointer-events-none fixed inset-0 -z-10 mesh-bg" />
        <Navbar />
        <main className="pt-6">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Routes location={location}>
                <Route path="/" element={<HomePage />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/courses/:id" element={<CourseDetailPage />} />
                <Route path="/quiz" element={<QuizPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <DashboardPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/my-courses"
                  element={
                    <PrivateRoute>
                      <MyCoursesPage />
                    </PrivateRoute>
                  }
                />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </PageTransition>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </>
  );
}
