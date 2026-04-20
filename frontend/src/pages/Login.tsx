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

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { pushToast } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { remember: true },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      pushToast("Login successful", "success");
      navigate("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      pushToast(message, "error");
    }
  };

  return (
    <div className="mx-auto grid w-[min(1120px,95%)] overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0F]/80 md:grid-cols-2">
      <Helmet><title>EduAI | Login</title></Helmet>
      <section className="relative hidden min-h-[520px] md:block">
        <div className="absolute inset-0 mesh-bg" />
        <div className="absolute inset-0 p-8 text-sm text-cyan-200">
          <p className="snippet">{"const learn = async () => await ai.path(student)"}</p>
          <p className="snippet mt-16">if (streak &gt; 5) unlock("Pro Badge")</p>
          <p className="snippet mt-16">quiz.adjustDifficulty(userAccuracy)</p>
        </div>
      </section>
      <section className="p-6 md:p-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl">
          <h1 className="text-2xl font-semibold">Welcome Back</h1>
          <p className="text-sm text-slate-300">
            Sign in with your EduAI account to continue with courses, quizzes, and analytics.
          </p>
          <div>
            <label className="text-sm">Email</label>
            <input {...register("email")} className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2" />
            {errors.email && <motion.p initial={{ x: -8 }} animate={{ x: 0 }} className="mt-1 text-xs text-red-300">{errors.email.message}</motion.p>}
          </div>
          <div>
            <label className="text-sm">Password</label>
            <input type="password" {...register("password")} className="mt-1 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2" />
            {errors.password && <motion.p initial={{ x: -8 }} animate={{ x: 0 }} className="mt-1 text-xs text-red-300">{errors.password.message}</motion.p>}
          </div>
          <div className="flex items-center justify-between text-sm text-slate-300">
            <label className="flex items-center gap-2"><input type="checkbox" {...register("remember")} /> Remember me</label>
            <span>Email and password authentication is enabled for the demo</span>
          </div>
          <button disabled={isSubmitting} className="w-full rounded-lg bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-2 font-semibold text-black">Login</button>
          <p className="text-sm text-slate-300">New here? <Link className="text-cyan-300" to="/register">Create account</Link></p>
        </form>
      </section>
    </div>
  );
}
