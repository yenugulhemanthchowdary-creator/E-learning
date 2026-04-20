import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../components/ToastProvider";
const schema = z.object({
    email: z.string().email("Valid email required"),
    password: z.string().min(6, "At least 6 characters"),
    remember: z.boolean().optional(),
});
export function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { pushToast } = useToast();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { remember: true },
    });
    const onSubmit = async (data) => {
        try {
            await login(data.email, data.password);
            pushToast("Login successful", "success");
            navigate("/dashboard");
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Login failed";
            pushToast(message, "error");
        }
    };
    return (_jsxs("div", { className: "mx-auto grid w-[min(1120px,95%)] overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0F]/80 md:grid-cols-2", children: [_jsx(Helmet, { children: _jsx("title", { children: "EduAI | Login" }) }), _jsxs("section", { className: "relative hidden min-h-[520px] md:block", children: [_jsx("div", { className: "absolute inset-0 mesh-bg" }), _jsxs("div", { className: "absolute inset-0 p-8 text-sm text-cyan-200", children: [_jsx("p", { className: "snippet", children: "const learn = async () => await ai.path(student)" }), _jsx("p", { className: "snippet mt-16", children: "if (streak > 5) unlock(\"Pro Badge\")" }), _jsx("p", { className: "snippet mt-16", children: "quiz.adjustDifficulty(userAccuracy)" })] })] }), _jsx("section", { className: "p-6 md:p-10", children: _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4 rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Welcome Back" }), _jsx("p", { className: "text-sm text-slate-300", children: "Sign in with your EduAI account to continue with courses, quizzes, and analytics." }), _jsxs("div", { children: [_jsx("label", { className: "text-sm", children: "Email" }), _jsx("input", { ...register("email"), className: "mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2" }), errors.email && _jsx(motion.p, { initial: { x: -8 }, animate: { x: 0 }, className: "mt-1 text-xs text-red-300", children: errors.email.message })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm", children: "Password" }), _jsx("input", { type: "password", ...register("password"), className: "mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2" }), errors.password && _jsx(motion.p, { initial: { x: -8 }, animate: { x: 0 }, className: "mt-1 text-xs text-red-300", children: errors.password.message })] }), _jsxs("div", { className: "flex items-center justify-between text-sm text-slate-300", children: [_jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", ...register("remember") }), " Remember me"] }), _jsx("span", { children: "Email and password authentication is enabled for the demo" })] }), _jsx("button", { disabled: isSubmitting, className: "w-full rounded-lg bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-2 font-semibold text-black", children: "Login" }), _jsxs("p", { className: "text-sm text-slate-300", children: ["New here? ", _jsx(Link, { className: "text-cyan-300", to: "/register", children: "Create account" })] })] }) })] }));
}
