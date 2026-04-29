import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../components/ToastProvider";

const schema = z
  .object({
    fullName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    phone: z.string().min(7).max(20).optional().or(z.literal("")),
    bio: z.string().max(200).optional().or(z.literal("")),
    learningGoals: z.string().max(200).optional().or(z.literal("")),
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
      await signup(data.fullName, data.email, data.password, {
        phone: data.phone || undefined,
        bio: data.bio || undefined,
        learningGoals: data.learningGoals
          ? data.learningGoals
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
      });
      pushToast("Account created", "success");
      navigate("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Account creation failed";
      pushToast(message, "error");
    }
  };

  return (
    <div className="ui-panel mx-auto w-[min(520px,95%)] rounded-3xl p-6">
      <Helmet><title>EduAI | Register</title></Helmet>
      <h1 className="mb-4 text-2xl font-semibold">Create Account</h1>
      <p className="mb-4 text-sm text-slate-300">
        Create a learner account to access the dashboard, course progress tracking, and quiz history.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="space-y-1">
          <input
            {...register("fullName")}
            placeholder="Full Name"
            aria-label="Full name"
            aria-invalid={Boolean(errors.fullName)}
            disabled={isSubmitting}
            className="ui-input w-full rounded-lg px-3 py-2"
          />
          {errors.fullName && <p className="text-sm text-red-300">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-1">
          <input
            {...register("email")}
            placeholder="Email"
            aria-label="Email address"
            aria-invalid={Boolean(errors.email)}
            disabled={isSubmitting}
            className="ui-input w-full rounded-lg px-3 py-2"
          />
          {errors.email && <p className="text-sm text-red-300">{errors.email.message}</p>}
        </div>

        <div className="space-y-1">
          <input
            type="password"
            {...register("password")}
            placeholder="Password"
            aria-label="Password"
            aria-invalid={Boolean(errors.password)}
            disabled={isSubmitting}
            className="ui-input w-full rounded-lg px-3 py-2"
          />
          {errors.password && <p className="text-sm text-red-300">{errors.password.message}</p>}
        </div>

        <div className="space-y-1">
          <input
            {...register("phone")}
            placeholder="Phone (optional)"
            aria-label="Phone number"
            aria-invalid={Boolean(errors.phone)}
            disabled={isSubmitting}
            className="ui-input w-full rounded-lg px-3 py-2"
          />
          {errors.phone && <p className="text-sm text-red-300">{errors.phone.message}</p>}
        </div>

        <div className="space-y-1">
          <input
            {...register("bio")}
            placeholder="Short bio (optional)"
            aria-label="Short bio"
            aria-invalid={Boolean(errors.bio)}
            disabled={isSubmitting}
            className="ui-input w-full rounded-lg px-3 py-2"
          />
          {errors.bio && <p className="text-sm text-red-300">{errors.bio.message}</p>}
        </div>

        <div className="space-y-1">
          <input
            {...register("learningGoals")}
            placeholder="Learning goals, comma separated"
            aria-label="Learning goals"
            aria-invalid={Boolean(errors.learningGoals)}
            disabled={isSubmitting}
            className="ui-input w-full rounded-lg px-3 py-2"
          />
          {errors.learningGoals && <p className="text-sm text-red-300">{errors.learningGoals.message}</p>}
        </div>

        <div className="h-2 rounded-full bg-slate-700/40"><div className="h-2 rounded-full bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700" style={{ width: `${strength}%` }} /></div>

        <div className="space-y-1">
          <input
            type="password"
            {...register("confirmPassword")}
            placeholder="Confirm Password"
            aria-label="Confirm password"
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby="confirm-password-help"
            disabled={isSubmitting}
            className="ui-input w-full rounded-lg px-3 py-2"
          />
          <p id="confirm-password-help" className="text-xs text-slate-400">
            Re-enter the same password to confirm your account.
          </p>
          {errors.confirmPassword && <p className="text-sm text-red-300">{errors.confirmPassword.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              {...register("terms")}
              aria-label="Accept terms and conditions"
              disabled={isSubmitting}
            />
            I accept terms
          </label>
          {errors.terms && <p className="text-sm text-red-300">{errors.terms.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          aria-label={isSubmitting ? "Creating account, please wait" : "Create account"}
          className="ui-btn-primary w-full rounded-lg px-4 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}
