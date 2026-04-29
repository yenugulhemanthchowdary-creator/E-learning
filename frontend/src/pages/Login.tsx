import { Helmet } from "react-helmet-async";
import { useState, type CSSProperties, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../components/ToastProvider";

type LoginErrors = {
  email?: string;
  password?: string;
};

function validateLogin(email: string, password: string): LoginErrors {
  const nextErrors: LoginErrors = {};

  if (!email.trim()) {
    nextErrors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    nextErrors.email = "Enter a valid email address.";
  }

  if (!password) {
    nextErrors.password = "Password is required.";
  } else if (password.length < 8) {
    nextErrors.password = "Password must be at least 8 characters.";
  }

  return nextErrors;
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { pushToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({
    email: false,
    password: false,
  });

  const updateErrors = (nextEmail: string, nextPassword: string) => {
    const nextErrors = validateLogin(nextEmail, nextPassword);
    setErrors(nextErrors);
    return nextErrors;
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setTouched({ email: true, password: true });

    const nextErrors = validateLogin(email, password);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      pushToast("Login successful", "success");
      navigate("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      pushToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <Helmet>
        <title>EduAI | Login</title>
      </Helmet>

      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={styles.blob3} />

      <div style={styles.leftPanel}>
        <div style={styles.brand}>
          <div style={styles.logoIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#a78bfa" strokeWidth="2" strokeLinejoin="round" />
              <path d="M2 17l10 5 10-5" stroke="#a78bfa" strokeWidth="2" strokeLinejoin="round" />
              <path d="M2 12l10 5 10-5" stroke="#7c3aed" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={styles.brandName}>EduAI</span>
        </div>

        <div>
          <p style={styles.heroTag}>ONLINE LEARNING</p>
          <h1 style={styles.heroHeading}>Sharpen Your Skills With AI-Powered Courses</h1>
          <p style={styles.heroSub}>Track progress, earn badges, and learn at your own pace.</p>
        </div>

        <div style={styles.statsRow}>
          {[
            ["12K+", "Students"],
            ["300+", "Courses"],
            ["98%", "Satisfaction"],
          ].map(([num, label]) => (
            <div key={label} style={styles.statCard}>
              <span style={styles.statNum}>{num}</span>
              <span style={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.rightPanel}>
        <div style={styles.card}>
          <div style={styles.cardGlow} />
          <h2 style={styles.cardTitle}>Welcome Back</h2>
          <p style={styles.cardSub}>Sign in to continue your learning journey</p>

          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <div style={styles.inputWrap}>
                <svg style={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M2 8l10 6 10-6" stroke="currentColor" strokeWidth="2" />
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    const nextEmail = e.target.value;
                    setEmail(nextEmail);
                    if (touched.email) {
                      updateErrors(nextEmail, password);
                    }
                  }}
                  onBlur={() => {
                    setTouched((previous) => ({ ...previous, email: true }));
                    updateErrors(email, password);
                  }}
                  placeholder="you@example.com"
                  style={{
                    ...styles.input,
                    border: touched.email && errors.email ? "1px solid rgba(248,113,113,0.65)" : styles.input.border,
                    opacity: loading ? 0.7 : 1,
                  }}
                  aria-invalid={Boolean(touched.email && errors.email)}
                  aria-describedby={errors.email ? "login-email-error" : undefined}
                  required
                  disabled={loading}
                />
              </div>
              {touched.email && errors.email && (
                <p id="login-email-error" style={styles.errorText}>
                  {errors.email}
                </p>
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrap}>
                <svg style={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="2" />
                </svg>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    const nextPassword = e.target.value;
                    setPassword(nextPassword);
                    if (touched.password) {
                      updateErrors(email, nextPassword);
                    }
                  }}
                  onBlur={() => {
                    setTouched((previous) => ({ ...previous, password: true }));
                    updateErrors(email, password);
                  }}
                  placeholder="********"
                  style={{
                    ...styles.input,
                    border: touched.password && errors.password ? "1px solid rgba(248,113,113,0.65)" : styles.input.border,
                    opacity: loading ? 0.7 : 1,
                  }}
                  aria-invalid={Boolean(touched.password && errors.password)}
                  aria-describedby={errors.password ? "login-password-error" : undefined}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={styles.eyeBtn}
                  aria-label={showPass ? "Hide password" : "Show password"}
                  disabled={loading}
                >
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" stroke="currentColor" strokeWidth="2" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" stroke="currentColor" strokeWidth="2" />
                      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  )}
                </button>
              </div>
              {touched.password && errors.password && (
                <p id="login-password-error" style={styles.errorText}>
                  {errors.password}
                </p>
              )}
            </div>

            <div style={styles.forgotRow}>
              <label style={styles.rememberLabel}>
                <input type="checkbox" style={{ accentColor: "#7c3aed" }} defaultChecked disabled={loading} />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" style={styles.forgotLink}>
                Forgot password?
              </Link>
            </div>

            <button type="submit" style={{ ...styles.loginBtn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
              {loading ? (
                <span style={styles.spinner} />
              ) : (
                <>
                  <span>Sign In</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p style={styles.signupText}>
            New here? <Link to="/register" style={styles.signupLink}>Create account</Link>
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#0a0a0f",
    display: "flex",
    fontFamily: "'DM Sans', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  blob1: {
    position: "absolute",
    top: "-120px",
    left: "-100px",
    width: "480px",
    height: "480px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  blob2: {
    position: "absolute",
    bottom: "-80px",
    left: "30%",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  blob3: {
    position: "absolute",
    top: "20%",
    right: "5%",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  leftPanel: {
    flex: 1,
    padding: "48px 52px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "40px",
    position: "relative",
    zIndex: 1,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "rgba(124,58,237,0.15)",
    border: "1px solid rgba(124,58,237,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "22px",
    fontWeight: 700,
    color: "#f5f3ff",
    letterSpacing: "-0.5px",
  },
  heroTag: {
    fontSize: "11px",
    fontWeight: 500,
    letterSpacing: "3px",
    color: "#7c3aed",
    marginBottom: "12px",
  },
  heroHeading: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "38px",
    fontWeight: 800,
    color: "#f5f3ff",
    lineHeight: 1.15,
    margin: "0 0 16px",
    letterSpacing: "-1px",
  },
  heroSub: {
    fontSize: "15px",
    color: "#9ca3af",
    lineHeight: 1.6,
    margin: 0,
  },
  statsRow: {
    display: "flex",
    gap: "16px",
  },
  statCard: {
    flex: 1,
    background: "rgba(124,58,237,0.08)",
    border: "1px solid rgba(124,58,237,0.15)",
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  statNum: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "22px",
    fontWeight: 700,
    color: "#a78bfa",
  },
  statLabel: {
    fontSize: "12px",
    color: "#6b7280",
  },
  rightPanel: {
    width: "440px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 32px",
    position: "relative",
    zIndex: 1,
  },
  card: {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "36px 32px",
    position: "relative",
    backdropFilter: "blur(12px)",
  },
  cardGlow: {
    position: "absolute",
    top: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "60%",
    height: "1px",
    background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.6), transparent)",
  },
  cardTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "26px",
    fontWeight: 700,
    color: "#f5f3ff",
    margin: "0 0 6px",
    letterSpacing: "-0.5px",
  },
  cardSub: {
    fontSize: "13px",
    color: "#6b7280",
    margin: "0 0 28px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },
  label: {
    fontSize: "12px",
    fontWeight: 500,
    color: "#9ca3af",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  inputWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "12px",
    color: "#6b7280",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    padding: "11px 40px",
    fontSize: "14px",
    color: "#f5f3ff",
    outline: "none",
    transition: "border 0.2s",
    boxSizing: "border-box",
  },
  errorText: {
    margin: 0,
    fontSize: "12px",
    color: "#fca5a5",
    lineHeight: 1.4,
  },
  eyeBtn: {
    position: "absolute",
    right: "12px",
    background: "none",
    border: "none",
    color: "#6b7280",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
  },
  forgotRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: "13px",
    color: "#6b7280",
  },
  rememberLabel: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
  },
  forgotLink: {
    color: "#a78bfa",
    textDecoration: "none",
    fontSize: "13px",
  },
  loginBtn: {
    width: "100%",
    background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
    border: "none",
    borderRadius: "10px",
    padding: "13px",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "opacity 0.2s, transform 0.1s",
    letterSpacing: "0.3px",
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    display: "inline-block",
  },
  signupText: {
    textAlign: "center",
    fontSize: "13px",
    color: "#6b7280",
    margin: "20px 0 0",
  },
  signupLink: {
    color: "#a78bfa",
    textDecoration: "none",
    fontWeight: 500,
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    margin: "20px 0",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "rgba(255,255,255,0.07)",
  },
  dividerText: {
    fontSize: "12px",
    color: "#4b5563",
    whiteSpace: "nowrap",
  },
  socialRow: {
    display: "flex",
    gap: "10px",
  },
  socialBtn: {
    flex: 1,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    padding: "10px",
    color: "#9ca3af",
    fontSize: "13px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "background 0.2s, border 0.2s",
  },
};
