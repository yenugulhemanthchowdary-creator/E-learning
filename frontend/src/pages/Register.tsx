import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../components/ToastProvider";
import { useMemo } from "react";

const schema = z
  .object({
    fullName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    terms: z.boolean().refine((value) => value, "Accept terms"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { register: signup } = useAuth();
  const { pushToast } = useToast();

  const { register, watch, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const password = watch("password", "");
  const strength = useMemo(() => {
    if (password.length < 6) return 25;
    if (password.length < 10) return 60;
    return 100;
  }, [password]);

  const onSubmit = async (data: FormData) => {
    try {
      await signup(data.fullName, data.email, data.password);
      pushToast("Account created", "success");
      navigate("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Account creation failed";
      pushToast(message, "error");
    }
  };

  return (
    <div className="mx-auto w-[min(520px,95%)] rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <Helmet><title>EduAI | Register</title></Helmet>
      <h1 className="mb-4 text-2xl font-semibold">Create Account</h1>
      <p className="mb-4 text-sm text-slate-300">
        Create a learner account to access the dashboard, course progress tracking, and quiz history.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <input {...register("fullName")} placeholder="Full Name" className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2" />
        <input {...register("email")} placeholder="Email" className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2" />
        <input type="password" {...register("password")} placeholder="Password" className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2" />
        <div className="h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-gradient-to-r from-red-400 via-amber-400 to-emerald-400" style={{ width: `${strength}%` }} /></div>
        <input type="password" {...register("confirmPassword")} placeholder="Confirm Password" className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("terms")} /> I accept terms</label>
        {(errors.fullName || errors.email || errors.password || errors.confirmPassword || errors.terms) && (
          <p className="text-sm text-red-300">{errors.fullName?.message || errors.email?.message || errors.password?.message || errors.confirmPassword?.message || errors.terms?.message}</p>
        )}
        <button disabled={isSubmitting} className="w-full rounded-lg bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-2 font-semibold text-black">Create Account</button>
      </form>
    </div>
  );
}
