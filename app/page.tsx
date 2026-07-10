import Link from "next/link"
import { DM_Serif_Display } from "next/font/google"
import { LandingNav } from "./landing-nav"
import { FaqAccordion } from "./faq-accordion"

const serif = DM_Serif_Display({ subsets: ["latin"], weight: "400" })

const FIRMS = ["McKinsey", "BCG", "Bain", "Deloitte", "Oliver Wyman", "LEK", "Kearney", "Roland Berger"]

const PROBLEMS = [
  {
    icon: "⏱",
    title: "No real feedback loop",
    body: "Generic prep books tell you what a good case looks like. They can't tell you why your answer missed the mark.",
  },
  {
    icon: "🎭",
    title: "Partner prep is scarce",
    body: "Mock interviews with experienced coaches cost $200–$400/hr and book up weeks out. Most candidates get one, maybe two.",
  },
  {
    icon: "📉",
    title: "You don't know what you don't know",
    body: "Structural gaps compound silently. You walk into final rounds with the same blind spots you started with.",
  },
]

const CAPABILITIES = [
  { wide: true,  dark: true,  label: "AI Interviewer",     title: "A partner-level interviewer, always available", body: "Adaptive prompts that mirror real BCG/McKinsey case styles. Pushes back when your logic slips." },
  { wide: false, dark: false, label: "Instant Scoring",    title: "Scored on 7 dimensions",                       body: "Structure, synthesis, numerics, communication — each one graded and explained." },
  { wide: false, dark: false, label: "Weakness Tags",      title: "Pattern recognition across sessions",          body: "We track where you slip across 20+ sessions, not just the last one." },
  { wide: false, dark: true,  label: "Case Library",       title: "100+ cases across industries",                 body: "Retail, healthcare, M&A, operations. Difficulty scales as you improve." },
  { wide: true,  dark: true,  label: "Readiness Dashboard",title: "Know when you're actually ready",              body: "Track your readiness score toward interview-ready threshold. No guessing." },
]

const STEPS = [
  { n: "01", title: "Set up your profile",   body: "Tell us your target firms, timeline, and background. We calibrate difficulty from day one." },
  { n: "02", title: "Pick a case",           body: "Choose from 100+ real-world scenarios or let the system assign one matched to your gaps." },
  { n: "03", title: "Interview live",        body: "Talk through your case in real time. The AI follows your logic, asks clarifying questions, presses you." },
  { n: "04", title: "Review your scorecard", body: "Dimension-by-dimension feedback arrives within seconds. No waiting, no vague notes." },
]

const METRICS = [
  { value: "7",    label: "dimensions scored per session" },
  { value: "100+", label: "case scenarios available" },
  { value: "20+",  label: "weakness tags tracked" },
  { value: "48h",  label: "from signup to first session" },
]

export default function LandingPage() {
  return (
    <>
      <style>{`
        @keyframes cf-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
        @keyframes cf-pulse { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:.9;transform:scale(1.12)} }
        @keyframes cf-shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .cf-float { animation: cf-float 6s ease-in-out infinite }
        .cf-pulse { animation: cf-pulse 4s ease-in-out infinite }
        .cf-shimmer-text {
          background: linear-gradient(90deg,#4ADE80,#86EFAC,#4ADE80);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: cf-shimmer 3s linear infinite;
        }
        .cf-metric {
          background: linear-gradient(135deg,#4ADE80,#22D3EE);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .cf-card-hover { transition: transform .2s ease, box-shadow .2s ease }
        .cf-card-hover:hover { transform: translateY(-3px); box-shadow: 0 20px 40px rgba(0,0,0,.25) }
      `}</style>

      <LandingNav />

      {/* HERO */}
      <section style={{ background: "#071A0A", minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", paddingTop: 80 }}>
        <div style={{ position: "absolute", inset: 0, opacity: .04, backgroundImage: "linear-gradient(rgba(74,222,128,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(74,222,128,.5) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="cf-pulse" style={{ position: "absolute", top: "15%", left: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(74,222,128,.12),transparent 70%)", pointerEvents: "none" }} />
        <div className="cf-pulse" style={{ position: "absolute", bottom: "20%", right: "8%", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle,rgba(34,211,238,.08),transparent 70%)", pointerEvents: "none", animationDelay: "2s" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center", position: "relative", zIndex: 1, width: "100%" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(74,222,128,.1)", border: "1px solid rgba(74,222,128,.25)", borderRadius: 100, padding: "6px 14px", marginBottom: 32 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ADE80", display: "inline-block" }} />
              <span style={{ color: "#86EFAC", fontSize: 12, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase" }}>AI-powered case interview prep</span>
            </div>
            <h1 className={serif.className} style={{ fontSize: "clamp(44px,5vw,72px)", lineHeight: 1.05, color: "#FAFAF9", marginBottom: 24, letterSpacing: "-1px" }}>
              Crack the case.<br />
              <span className="cf-shimmer-text">Every session.</span>
            </h1>
            <p style={{ fontSize: 18, color: "#A7C4AB", lineHeight: 1.7, marginBottom: 40, maxWidth: 480 }}>
              CaseForge AI runs live mock interviews, scores your performance on 7 dimensions, and tracks your progress until you hit interview-ready. Built for MBB and T2 strategy candidates.
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <Link href="/sign-in" style={{ background: "#4ADE80", color: "#071A0A", fontWeight: 700, fontSize: 16, padding: "14px 32px", borderRadius: 10, textDecoration: "none", display: "inline-block" }}>
                Start practicing free →
              </Link>
              <a href="#how-it-works" style={{ border: "1px solid rgba(74,222,128,.3)", color: "#86EFAC", fontSize: 16, padding: "14px 32px", borderRadius: 10, textDecoration: "none", display: "inline-block" }}>
                See how it works
              </a>
            </div>
          </div>

          <div className="cf-float">
            <div style={{ background: "#0B1F0E", border: "1px solid rgba(74,222,128,.2)", borderRadius: 16, padding: 24, boxShadow: "0 40px 80px rgba(0,0,0,.6), 0 0 60px rgba(74,222,128,.08)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e" }} />
                <span style={{ color: "#4ADE80", fontSize: 12, marginLeft: 8, opacity: .7 }}>Session Scorecard</span>
              </div>
              <div style={{ color: "#FAFAF9", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Profitability Case — McKinsey style</div>
              {([["Structure", 8.2], ["Hypothesis Quality", 7.5], ["Numerics", 6.8], ["Synthesis", 7.9], ["Communication", 8.5]] as [string, number][]).map(([dim, score]) => (
                <div key={dim} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ color: "#A7C4AB", fontSize: 11 }}>{dim}</span>
                    <span style={{ color: "#4ADE80", fontSize: 11, fontWeight: 700 }}>{score}/10</span>
                  </div>
                  <div style={{ height: 4, background: "rgba(74,222,128,.12)", borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${score * 10}%`, background: "linear-gradient(90deg,#16A34A,#4ADE80)", borderRadius: 2 }} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 16, background: "rgba(74,222,128,.08)", borderRadius: 8, padding: "10px 14px", border: "1px solid rgba(74,222,128,.15)" }}>
                <div style={{ color: "#86EFAC", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>AI Feedback</div>
                <div style={{ color: "#A7C4AB", fontSize: 11, lineHeight: 1.5 }}>Strong structure. Push harder on quantifying the revenue impact before pivoting to cost.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section style={{ background: "#FAFAF9", padding: "28px 24px", borderBottom: "1px solid #E5E7EB" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          <p style={{ color: "#6B7280", fontSize: 12, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 20 }}>
            Trusted by candidates targeting
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 32px" }}>
            {FIRMS.map((f) => (
              <span key={f} style={{ color: "#374151", fontSize: 15, fontWeight: 600, opacity: .6 }}>{f}</span>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section style={{ background: "#071A0A", padding: "100px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 100, padding: "6px 14px", marginBottom: 20 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
              <span style={{ color: "#FCA5A5", fontSize: 12, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase" }}>The problem</span>
            </div>
            <h2 className={serif.className} style={{ fontSize: "clamp(36px,4vw,56px)", color: "#FAFAF9", letterSpacing: "-.5px", lineHeight: 1.1 }}>
              Why most candidates<br />fail their first round
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
            {PROBLEMS.map((p) => (
              <div key={p.title} className="cf-card-hover" style={{ background: "#0B1F0E", border: "1px solid rgba(74,222,128,.1)", borderRadius: 16, padding: 32 }}>
                <div style={{ fontSize: 32, marginBottom: 20 }}>{p.icon}</div>
                <h3 style={{ color: "#FAFAF9", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{p.title}</h3>
                <p style={{ color: "#7A9F7E", fontSize: 15, lineHeight: 1.7 }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section style={{ background: "#FAFAF9", padding: "100px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(22,163,74,.1)", border: "1px solid rgba(22,163,74,.2)", borderRadius: 100, padding: "6px 14px", marginBottom: 24 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16A34A", display: "inline-block" }} />
              <span style={{ color: "#15803D", fontSize: 12, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase" }}>The solution</span>
            </div>
            <h2 className={serif.className} style={{ fontSize: "clamp(34px,3.5vw,52px)", color: "#111827", letterSpacing: "-.5px", lineHeight: 1.12, marginBottom: 24 }}>
              Unlimited practice.<br />Instant, honest feedback.
            </h2>
            <p style={{ color: "#4B5563", fontSize: 17, lineHeight: 1.75, marginBottom: 32 }}>
              CaseForge runs a full interview — question, follow-ups, pressure testing — then grades your response the same way a McKinsey partner would. Seven dimensions. Written commentary. Done in seconds.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {["No scheduling. Practice any time, any day.", "Quantitative scores you can track across 20+ sessions.", "Identify and close gaps before your final round."].map((point) => (
                <div key={point} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ color: "#16A34A", fontWeight: 700, marginTop: 1 }}>✓</span>
                  <span style={{ color: "#374151", fontSize: 15 }}>{point}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: "#0B1F0E", borderRadius: 20, padding: 28, border: "1px solid rgba(74,222,128,.15)", boxShadow: "0 24px 60px rgba(0,0,0,.15)" }}>
            <div style={{ color: "#86EFAC", fontSize: 12, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 20, opacity: .8 }}>Readiness Dashboard</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              {([["Avg Score","7.4 / 10"],["Sessions","12"],["Tier","Silver"],["Status","Approaching Ready"]] as [string,string][]).map(([k,v]) => (
                <div key={k} style={{ background: "rgba(74,222,128,.06)", borderRadius: 10, padding: "12px 16px", border: "1px solid rgba(74,222,128,.1)" }}>
                  <div style={{ color: "#7A9F7E", fontSize: 11, marginBottom: 4 }}>{k}</div>
                  <div style={{ color: "#FAFAF9", fontSize: 16, fontWeight: 700 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "#7A9F7E", fontSize: 12 }}>Readiness progress</span>
                <span style={{ color: "#4ADE80", fontSize: 12, fontWeight: 700 }}>74%</span>
              </div>
              <div style={{ height: 6, background: "rgba(74,222,128,.12)", borderRadius: 3 }}>
                <div style={{ height: "100%", width: "74%", background: "linear-gradient(90deg,#16A34A,#4ADE80)", borderRadius: 3 }} />
              </div>
            </div>
            <div style={{ color: "#7A9F7E", fontSize: 11, marginTop: 4 }}>~4 more sessions to interview-ready</div>
          </div>
        </div>
      </section>

      {/* CAPABILITIES */}
      <section style={{ background: "#071A0A", padding: "100px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(74,222,128,.08)", border: "1px solid rgba(74,222,128,.2)", borderRadius: 100, padding: "6px 14px", marginBottom: 20 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ADE80", display: "inline-block" }} />
              <span style={{ color: "#86EFAC", fontSize: 12, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase" }}>Platform capabilities</span>
            </div>
            <h2 className={serif.className} style={{ fontSize: "clamp(36px,4vw,56px)", color: "#FAFAF9", letterSpacing: "-.5px" }}>
              Everything you need to get the offer
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {CAPABILITIES.map((c) => (
              <div
                key={c.label}
                className="cf-card-hover"
                style={{
                  gridColumn: c.wide ? "span 2" : "span 1",
                  background: c.dark ? "#0B1F0E" : "rgba(74,222,128,.06)",
                  border: `1px solid ${c.dark ? "rgba(74,222,128,.15)" : "rgba(74,222,128,.1)"}`,
                  borderRadius: 16, padding: 28,
                }}
              >
                <div style={{ color: "#4ADE80", fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 12 }}>{c.label}</div>
                <h3 style={{ color: "#FAFAF9", fontSize: 20, fontWeight: 700, marginBottom: 10, lineHeight: 1.25 }}>{c.title}</h3>
                <p style={{ color: "#7A9F7E", fontSize: 14, lineHeight: 1.7 }}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ background: "#F6F7F3", padding: "100px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(22,163,74,.08)", border: "1px solid rgba(22,163,74,.2)", borderRadius: 100, padding: "6px 14px", marginBottom: 20 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16A34A", display: "inline-block" }} />
              <span style={{ color: "#15803D", fontSize: 12, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase" }}>How it works</span>
            </div>
            <h2 className={serif.className} style={{ fontSize: "clamp(36px,4vw,56px)", color: "#111827", letterSpacing: "-.5px" }}>
              From signup to offer-ready<br />in four steps
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 32 }}>
            {STEPS.map((s) => (
              <div key={s.n}>
                <div style={{ color: "#4ADE80", fontSize: 48, fontWeight: 800, fontFamily: "monospace", lineHeight: 1, marginBottom: 20, opacity: .6 }}>{s.n}</div>
                <h3 style={{ color: "#111827", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{s.title}</h3>
                <p style={{ color: "#4B5563", fontSize: 15, lineHeight: 1.7 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* METRICS */}
      <section style={{ background: "#FAFAF9", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 24 }}>
            {METRICS.map((m) => (
              <div key={m.value} style={{ textAlign: "center", padding: 32, background: "#FFFFFF", borderRadius: 16, border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
                <div className={`cf-metric ${serif.className}`} style={{ fontSize: 52, fontWeight: 700, lineHeight: 1, marginBottom: 8 }}>{m.value}</div>
                <div style={{ color: "#6B7280", fontSize: 14 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "#071A0A", padding: "100px 24px", position: "relative", overflow: "hidden" }}>
        <div className="cf-pulse" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center,rgba(74,222,128,.08),transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <h2 className={serif.className} style={{ fontSize: "clamp(40px,5vw,68px)", color: "#FAFAF9", letterSpacing: "-.8px", lineHeight: 1.05, marginBottom: 24 }}>
            Your next case interview<br />
            <span className="cf-shimmer-text">starts here.</span>
          </h2>
          <p style={{ color: "#7A9F7E", fontSize: 18, lineHeight: 1.7, marginBottom: 40 }}>
            Join candidates preparing for McKinsey, BCG, Bain, and beyond. Free to start, no credit card required.
          </p>
          <Link href="/sign-in" style={{ display: "inline-block", background: "#4ADE80", color: "#071A0A", fontWeight: 800, fontSize: 18, padding: "16px 44px", borderRadius: 12, textDecoration: "none", letterSpacing: "-.2px" }}>
            Start practicing for free →
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ background: "#FAFAF9", padding: "100px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(22,163,74,.08)", border: "1px solid rgba(22,163,74,.2)", borderRadius: 100, padding: "6px 14px", marginBottom: 20 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16A34A", display: "inline-block" }} />
              <span style={{ color: "#15803D", fontSize: 12, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase" }}>FAQ</span>
            </div>
            <h2 className={serif.className} style={{ fontSize: "clamp(34px,4vw,52px)", color: "#111827", letterSpacing: "-.5px" }}>
              Common questions
            </h2>
          </div>
          <FaqAccordion />
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#071A0A", borderTop: "1px solid rgba(74,222,128,.1)", padding: "48px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <span className={serif.className} style={{ fontSize: 20, color: "#4ADE80" }}>CaseForge</span>
          <div style={{ display: "flex", gap: 24 }}>
            <a href="#how-it-works" style={{ color: "#7A9F7E", fontSize: 13, textDecoration: "none" }}>How it works</a>
            <a href="#faq" style={{ color: "#7A9F7E", fontSize: 13, textDecoration: "none" }}>FAQ</a>
            <Link href="/sign-in" style={{ color: "#7A9F7E", fontSize: 13, textDecoration: "none" }}>Sign in</Link>
          </div>
          <span style={{ color: "#3D5C41", fontSize: 12 }}>© {new Date().getFullYear()} CaseForge AI</span>
        </div>
      </footer>
    </>
  )
}
