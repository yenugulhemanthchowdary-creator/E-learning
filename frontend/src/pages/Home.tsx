import { Helmet } from "react-helmet-async";
import { type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";

const featurePills = [
  "Adaptive Quizzes",
  "AI Tutor",
  "Progress Tracking",
  "Skill Radar",
  "Leaderboard",
  "Certificates",
] as const;

const stats: Array<[string, string]> = [
  ["12K+", "Active Learners"],
  ["300+", "Courses"],
  ["98%", "Satisfaction"],
  ["AI", "Powered Tutor"],
];

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <Helmet>
        <title>EduAI | Home</title>
      </Helmet>

      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={styles.grid} />

      <nav style={styles.nav}>
        <div style={styles.navBrand}>
          <div style={styles.logoBox}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#a78bfa" strokeWidth="2" strokeLinejoin="round" />
              <path d="M2 17l10 5 10-5" stroke="#a78bfa" strokeWidth="2" strokeLinejoin="round" />
              <path d="M2 12l10 5 10-5" stroke="#7c3aed" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={styles.brandName}>EduAI</span>
        </div>
        <div style={styles.navLinks}>
          <button type="button" onClick={() => navigate("/login")} style={styles.navLogin}>
            Log in
          </button>
          <button type="button" onClick={() => navigate("/register")} style={styles.navSignup}>
            Get Started
          </button>
        </div>
      </nav>

      <main style={styles.hero}>
        <div style={styles.badge}>
          <span style={styles.badgeDot} />
          AI-Powered Learning Platform
        </div>

        <h1 style={styles.heading}>
          Learn Faster.
          <br />
          <span style={styles.headingAccent}>Think Smarter.</span>
        </h1>

        <p style={styles.sub}>
          Adaptive courses, AI tutoring, and real-time quizzes —
          <br />
          everything you need to master new skills and grow your career.
        </p>

        <div style={styles.ctaRow}>
          <button type="button" onClick={() => navigate("/register")} style={styles.ctaPrimary}>
            Start Learning Free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M12 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button type="button" onClick={() => navigate("/login")} style={styles.ctaSecondary}>
            Log In
          </button>
        </div>

        <p style={styles.trustLine}>
          No credit card required &nbsp;·&nbsp; Free forever plan &nbsp;·&nbsp; 12K+ learners
        </p>

        <div style={styles.statsRow}>
          {stats.map(([num, label]) => (
            <div key={label} style={styles.statCard}>
              <span style={styles.statNum}>{num}</span>
              <span style={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>

        <div style={styles.pillRow}>
          {featurePills.map((feature) => (
            <span key={feature} style={styles.pill}>
              {feature}
            </span>
          ))}
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%,100% { opacity:0.6; } 50% { opacity:1; }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#0a0a0f",
    fontFamily: "'DM Sans', sans-serif",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  blob1: {
    position: "absolute",
    top: "-160px",
    left: "-120px",
    width: "600px",
    height: "600px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  blob2: {
    position: "absolute",
    bottom: "-100px",
    right: "-80px",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  grid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)",
    backgroundSize: "48px 48px",
    pointerEvents: "none",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 48px",
    position: "relative",
    zIndex: 10,
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  navBrand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoBox: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    background: "rgba(124,58,237,0.15)",
    border: "1px solid rgba(124,58,237,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "20px",
    fontWeight: 700,
    color: "#f5f3ff",
    letterSpacing: "-0.5px",
  },
  navLinks: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  navLogin: {
    background: "none",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "8px",
    padding: "8px 20px",
    color: "#d1d5db",
    fontSize: "14px",
    cursor: "pointer",
    transition: "border 0.2s, color 0.2s",
  },
  navSignup: {
    background: "#7c3aed",
    border: "none",
    borderRadius: "8px",
    padding: "8px 20px",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  hero: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "80px 24px 60px",
    position: "relative",
    zIndex: 1,
    animation: "fadeUp 0.7s ease both",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(124,58,237,0.12)",
    border: "1px solid rgba(124,58,237,0.25)",
    borderRadius: "100px",
    padding: "6px 16px",
    fontSize: "12px",
    color: "#a78bfa",
    letterSpacing: "0.5px",
    marginBottom: "28px",
  },
  badgeDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#7c3aed",
    animation: "pulse 2s ease infinite",
    display: "inline-block",
  },
  heading: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "clamp(48px, 7vw, 88px)",
    fontWeight: 800,
    color: "#f5f3ff",
    lineHeight: 1.05,
    letterSpacing: "-2px",
    marginBottom: "24px",
  },
  headingAccent: {
    background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  sub: {
    fontSize: "17px",
    color: "#9ca3af",
    lineHeight: 1.7,
    maxWidth: "520px",
    marginBottom: "40px",
  },
  ctaRow: {
    display: "flex",
    gap: "14px",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  ctaPrimary: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
    border: "none",
    borderRadius: "12px",
    padding: "14px 28px",
    color: "#fff",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    letterSpacing: "0.2px",
  },
  ctaSecondary: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    padding: "14px 28px",
    color: "#d1d5db",
    fontSize: "15px",
    cursor: "pointer",
  },
  trustLine: {
    fontSize: "12px",
    color: "#4b5563",
    marginBottom: "56px",
  },
  statsRow: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: "40px",
  },
  statCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "14px",
    padding: "20px 28px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    minWidth: "120px",
  },
  statNum: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "26px",
    fontWeight: 700,
    color: "#a78bfa",
  },
  statLabel: {
    fontSize: "12px",
    color: "#6b7280",
  },
  pillRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  pill: {
    background: "rgba(124,58,237,0.08)",
    border: "1px solid rgba(124,58,237,0.18)",
    borderRadius: "100px",
    padding: "6px 16px",
    fontSize: "12px",
    color: "#a78bfa",
  },
};
