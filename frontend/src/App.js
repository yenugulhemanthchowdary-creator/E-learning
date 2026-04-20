import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
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
function PrivateRoute({ children }) {
    const { user, ready } = useAuth();
    if (!ready) {
        return (_jsx("div", { className: "mx-auto w-[min(1120px,95%)] rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-slate-300", children: "Restoring your session..." }));
    }
    if (!user) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    return _jsx(_Fragment, { children: children });
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
    return (_jsxs(_Fragment, { children: [_jsx(AnimatePresence, { children: showLoader && _jsx(LoadingScreen, {}) }), _jsxs("div", { className: "relative min-h-screen overflow-x-hidden pb-6", children: [_jsx("div", { className: "pointer-events-none fixed inset-0 -z-10 mesh-bg" }), _jsx(Navbar, {}), _jsx("main", { className: "pt-6", children: _jsx(AnimatePresence, { mode: "wait", children: _jsx(PageTransition, { children: _jsxs(Routes, { location: location, children: [_jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/courses", element: _jsx(CoursesPage, {}) }), _jsx(Route, { path: "/courses/:id", element: _jsx(CourseDetailPage, {}) }), _jsx(Route, { path: "/quiz", element: _jsx(QuizPage, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(PrivateRoute, { children: _jsx(DashboardPage, {}) }) }), _jsx(Route, { path: "/my-courses", element: _jsx(PrivateRoute, { children: _jsx(MyCoursesPage, {}) }) }), _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/register", element: _jsx(RegisterPage, {}) }), _jsx(Route, { path: "*", element: _jsx(NotFoundPage, {}) })] }) }, location.pathname) }) }), _jsx(Footer, {})] })] }));
}
