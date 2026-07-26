"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { DM_Serif_Display } from "next/font/google"
import { FaqAccordion } from "./faq-accordion"
import { LandingNav } from "./landing-nav"
import { LeaderboardPreviewSection } from "@/components/leaderboard/LeaderboardPreviewSection"

const serif = DM_Serif_Display({ subsets: ["latin"], weight: "400" })

const E = [0.22, 1, 0.36, 1] as const // ease-out-quint

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
}

const fadeUpItem = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: E } },
}

const FIRMS = ["McKinsey", "BCG", "Bain", "Deloitte", "Oliver Wyman", "LEK", "Kearney", "Roland Berger"]

const PROBLEMS = [
  {
    title: "No real feedback loop",
    body: "Prep books describe a strong case answer. They cannot tell you where your logic broke down or why you missed the mark.",
  },
  {
    title: "Partner prep is scarce",
    body: "Mock interviews with experienced coaches cost $200–$400 per hour and book weeks in advance. Most candidates get one or two.",
  },
  {
    title: "Blind spots compound silently",
    body: "Structural gaps grow without correction. Candidates walk into final rounds with the same weaknesses they started with.",
  },
]

const CAPABILITIES = [
  {
    wide: true,
    dark: true,
    label: "AI Interviewer",
    title: "A partner-level interviewer, always available",
    body: "Adaptive prompts that mirror real BCG and McKinsey case styles. Pushes back when your logic slips or your structure is too broad.",
  },
  {
    wide: false,
    dark: false,
    label: "Instant Scoring",
    title: "Scored on 7 dimensions",
    body: "Structure, synthesis, numerics, communication — each graded and explained after every session.",
  },
  {
    wide: false,
    dark: false,
    label: "Weakness Tags",
    title: "Pattern recognition across sessions",
    body: "We track where you slip across 20+ sessions. One miss is noise; a pattern is a problem worth fixing.",
  },
  {
    wide: false,
    dark: true,
    label: "Case Library",
    title: "100+ cases across industries",
    body: "Retail, healthcare, M&A, operations. Difficulty scales as your scores improve.",
  },
  {
    wide: true,
    dark: false,
    label: "Readiness Dashboard",
    title: "Know when you are actually ready",
    body: "Track your readiness score toward a verified interview-ready threshold. No guessing, no false confidence.",
  },
]

const STEPS = [
  {
    n: "1",
    title: "Set up your profile",
    body: "Target firms, timeline, background. We calibrate difficulty from day one.",
  },
  {
    n: "2",
    title: "Pick a case",
    body: "Choose from 100+ scenarios or let the system assign one matched to your current gaps.",
  },
  {
    n: "3",
    title: "Interview live",
    body: "Talk through your case in real time. The AI follows your logic, asks follow-ups, and presses you when needed.",
  },
  {
    n: "4",
    title: "Review your scorecard",
    body: "Dimension-by-dimension feedback arrives in seconds. No waiting, no vague notes.",
  },
]

const SCORES: [string, number][] = [
  ["Structure", 8.2],
  ["Hypothesis", 7.5],
  ["Numerics", 6.8],
  ["Synthesis", 7.9],
  ["Communication", 8.5],
]

export function LandingPage() {
  return (
    <>
      <style>{`
        @keyframes lp-float {
          0%,100% { transform: translateY(0px) }
          50%      { transform: translateY(-14px) }
        }
        @keyframes lp-pulse {
          0%,100% { opacity:.35; transform:scale(1) }
          50%      { opacity:.8;  transform:scale(1.08) }
        }
        .lp-float { animation: lp-float 7s ease-in-out infinite }
        .lp-pulse { animation: lp-pulse 5s ease-in-out infinite }

        .cap-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px }
        .cap-wide  { grid-column:span 2 }
        .cap-narrow { grid-column:span 1 }

        @media (max-width:767px) {
          .cap-grid { grid-template-columns:1fr }
          .cap-wide,.cap-narrow { grid-column:span 1 }
        }
        @media (min-width:768px) and (max-width:1023px) {
          .cap-grid { grid-template-columns:repeat(2,1fr) }
          .cap-wide { grid-column:span 2 }
        }

        @keyframes lp-badge-shimmer {
          0%,100% { background-position:0% 50% }
          50%      { background-position:100% 50% }
        }
        @keyframes lp-dot-live {
          0%,100% { opacity:1; transform:scale(1) }
          50%      { opacity:.45; transform:scale(1.6) }
        }
        .lp-badge {
          background: linear-gradient(
            120deg,
            rgba(74,222,128,.05) 0%,
            rgba(74,222,128,.18) 30%,
            rgba(52,211,153,.26) 55%,
            rgba(74,222,128,.05) 100%
          );
          background-size:280% 280%;
          animation:lp-badge-shimmer 5s ease infinite;
        }
        .lp-dot-live { animation:lp-dot-live 2s ease-in-out infinite }

        @media (prefers-reduced-motion:reduce) {
          .lp-float,.lp-pulse,.lp-badge,.lp-dot-live { animation:none }
          .lp-badge { background:rgba(74,222,128,.10) }
        }
      `}</style>

      <LandingNav />
      <HeroSection />
      <TrustStrip />
      <ProblemSection />
      <SolutionSection />
      <CapabilitiesSection />
      <HowItWorksSection />
      <LeaderboardPreviewSection />
      <CTASection />
      <FAQSection />
      <SiteFooter />
    </>
  )
}

/* ── Hero ─────────────────────────────────────────────────────────────── */

function HeroSection() {
  return (
    <section
      style={{
        background: "#071A0A",
        minHeight: "100svh",
        position: "relative",
        overflow: "hidden",
        paddingTop: 64,
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Grid texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.032,
          backgroundImage:
            "linear-gradient(rgba(74,222,128,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(74,222,128,.5) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      />
      {/* Glow blobs */}
      <div
        className="lp-pulse"
        style={{
          position: "absolute",
          top: "6%",
          left: "2%",
          width: "min(520px,44vw)",
          height: "min(520px,44vw)",
          borderRadius: "50%",
          background: "radial-gradient(circle,rgba(74,222,128,.09),transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        className="lp-pulse"
        style={{
          position: "absolute",
          bottom: "10%",
          right: "2%",
          width: "min(380px,32vw)",
          height: "min(380px,32vw)",
          borderRadius: "50%",
          background: "radial-gradient(circle,rgba(34,211,238,.055),transparent 70%)",
          pointerEvents: "none",
          animationDelay: "2.5s",
        }}
      />

      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center py-20 lg:py-28">
        {/* Copy */}
        <div>
          <motion.div
            className="lp-badge"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: E, delay: 0.05 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              border: "1px solid rgba(74,222,128,.28)",
              borderRadius: 100,
              padding: "6px 14px",
              marginBottom: 28,
            }}
          >
            <span
              className="lp-dot-live"
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#4ADE80",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                color: "#86EFAC",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: ".01em",
              }}
            >
              250+ students practicing right now
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: E, delay: 0.15 }}
            className={serif.className}
            style={{
              fontSize: "clamp(44px,5.5vw,76px)",
              lineHeight: 1.03,
              color: "#FAFAF9",
              marginBottom: 22,
              letterSpacing: "-1.5px",
              textWrap: "balance",
            }}
          >
            Crack the case.<br />
            <span style={{ color: "#4ADE80" }}>Every session.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: E, delay: 0.28 }}
            style={{
              fontSize: "clamp(16px,1.8vw,19px)",
              color: "#FAFAF9",
              fontWeight: 500,
              lineHeight: 1.4,
              marginBottom: 14,
              letterSpacing: "-0.3px",
            }}
          >
            See where you rank on campus.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: E, delay: 0.38 }}
            style={{
              fontSize: "clamp(14px,1.5vw,16px)",
              color: "#A7C4AB",
              lineHeight: 1.78,
              marginBottom: 36,
              maxWidth: "44ch",
            }}
          >
            Live mock interviews, instant 7-dimension scoring, and a campus leaderboard that shows exactly where you stand before recruiting season.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: E, delay: 0.45 }}
            className="flex flex-wrap gap-3"
          >
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.12 }}
            >
              <Link
                href="/sign-in"
                style={{
                  background: "#4ADE80",
                  color: "#071A0A",
                  fontWeight: 700,
                  fontSize: 15,
                  padding: "13px 26px",
                  borderRadius: 10,
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Start practicing free →
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.12 }}
            >
              <a
                href="#how-it-works"
                style={{
                  border: "1px solid rgba(74,222,128,.25)",
                  color: "#86EFAC",
                  fontSize: 15,
                  padding: "13px 26px",
                  borderRadius: 10,
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                See how it works
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Hero leaderboard card */}
        <motion.div
          initial={{ opacity: 0, x: 30, y: 8 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.75, ease: E, delay: 0.25 }}
          className="flex justify-center lg:justify-end"
        >
          <div className="lp-float w-full max-w-[420px]">
            <HeroLeaderboardCard />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

const HERO_BOARD = [
  { rank: 1, name: "A. Chen",     school: "Harvard Business", score: "9.4", up: true,  delta: 2, tier: "Emerald", tierColor: "#4ade80" },
  { rank: 2, name: "M. Patel",    school: "Wharton",          score: "9.1", up: false, delta: 0, tier: "Emerald", tierColor: "#4ade80" },
  { rank: 3, name: "J. Williams", school: "Booth",            score: "8.7", up: true,  delta: 5, tier: "Gold",    tierColor: "#eab308" },
  { rank: 4, name: "S. Kim",      school: "Kellogg",          score: "8.4", up: false, delta: 1, tier: "Gold",    tierColor: "#eab308" },
  { rank: 5, name: "R. Torres",   school: "Tuck",             score: "8.2", up: true,  delta: 3, tier: "Gold",    tierColor: "#eab308" },
  { rank: 6, name: "You?",        school: "Sign up to rank",  score: "—",   up: false, delta: 0, tier: "",        tierColor: "" },
]

const RANK_GOLD: Record<number, string> = { 1: "#eab308", 2: "#94a3b8", 3: "#cd7f32" }

function HeroLeaderboardCard() {
  return (
    <div
      style={{
        background: "#0A1A0C",
        border: "1px solid rgba(74,222,128,.18)",
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: "0 40px 80px rgba(0,0,0,.55), 0 0 60px rgba(74,222,128,.07)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px",
          borderBottom: "1px solid rgba(74,222,128,.10)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontSize: 13 }}>🏆</span>
          <span style={{ color: "#FAFAF9", fontSize: 13, fontWeight: 600 }}>Campus Leaderboard</span>
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            color: "#4ADE80",
            background: "rgba(74,222,128,.09)",
            border: "1px solid rgba(74,222,128,.2)",
            borderRadius: 100,
            padding: "3px 9px",
          }}
        >
          Live
        </span>
      </div>

      {/* Column headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "28px 1fr 52px 36px",
          gap: 6,
          padding: "8px 18px",
          borderBottom: "1px solid rgba(255,255,255,.04)",
        }}
      >
        {["#", "Candidate", "Score", ""].map((h) => (
          <span key={h} style={{ fontSize: 9, color: "rgba(255,255,255,.28)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em" }}>
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      {HERO_BOARD.map((entry, i) => {
        const isYou = entry.rank === 6
        const rankColor = RANK_GOLD[entry.rank] ?? "rgba(255,255,255,.35)"
        return (
          <motion.div
            key={entry.rank}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.5 + i * 0.07, ease: E }}
            style={{
              display: "grid",
              gridTemplateColumns: "28px 1fr 52px 36px",
              gap: 6,
              padding: "10px 18px",
              borderBottom: "1px solid rgba(255,255,255,.04)",
              background: isYou ? "rgba(74,222,128,.05)" : undefined,
            }}
          >
            {/* Rank */}
            <span style={{ fontSize: 12, fontWeight: 700, color: rankColor, fontVariantNumeric: "tabular-nums" }}>
              {entry.rank}
            </span>

            {/* Name + school */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: isYou ? "#4ADE80" : "#FAFAF9", fontSize: 12, fontWeight: isYou ? 700 : 600 }}>
                  {entry.name}
                </span>
                {entry.tier && (
                  <span style={{ fontSize: 9, fontWeight: 700, color: entry.tierColor, background: `${entry.tierColor}1a`, border: `1px solid ${entry.tierColor}44`, borderRadius: 100, padding: "1px 6px" }}>
                    {entry.tier}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 10, color: isYou ? "rgba(74,222,128,.6)" : "rgba(255,255,255,.3)" }}>
                {entry.school}
              </span>
            </div>

            {/* Score */}
            <span style={{ fontSize: 13, fontWeight: 700, color: isYou ? "rgba(255,255,255,.3)" : "#4ADE80", fontVariantNumeric: "tabular-nums", textAlign: "right" }}>
              {entry.score}
            </span>

            {/* Movement */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
              {entry.delta > 0 && (
                <span style={{ fontSize: 10, fontWeight: 600, color: entry.up ? "#4ade80" : "#f97316" }}>
                  {entry.up ? "↑" : "↓"}{entry.delta}
                </span>
              )}
              {entry.delta === 0 && entry.tier && (
                <span style={{ fontSize: 10, color: "rgba(255,255,255,.25)" }}>—</span>
              )}
            </div>
          </motion.div>
        )
      })}

      {/* Footer CTA */}
      <div
        style={{
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid rgba(74,222,128,.10)",
        }}
      >
        <span style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>Where do you land?</span>
        <Link
          href="/sign-in"
          style={{ fontSize: 11, fontWeight: 700, color: "#4ADE80", textDecoration: "none" }}
        >
          Claim your rank →
        </Link>
      </div>
    </div>
  )
}

/* ── Trust Strip ──────────────────────────────────────────────────────── */

function TrustStrip() {
  return (
    <div style={{ background: "#FAFAF9", padding: "20px 24px", borderBottom: "1px solid #E5E7EB" }}>
      <p
        style={{
          color: "#9CA3AF",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: ".1em",
          textTransform: "uppercase",
          textAlign: "center",
          marginBottom: 12,
        }}
      >
        Trusted by candidates targeting
      </p>
      <div className="flex flex-wrap justify-center gap-x-7 gap-y-2 max-w-[1200px] mx-auto">
        {FIRMS.map((f) => (
          <span key={f} style={{ color: "#374151", fontSize: 13, fontWeight: 600, opacity: 0.5 }}>
            {f}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ── Problem ──────────────────────────────────────────────────────────── */

function ProblemSection() {
  return (
    <section style={{ background: "#071A0A", padding: "clamp(72px,9vw,120px) 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <motion.h2
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.65, ease: E }}
          className={serif.className}
          style={{
            fontSize: "clamp(34px,4.2vw,58px)",
            color: "#FAFAF9",
            letterSpacing: "-.6px",
            lineHeight: 1.1,
            marginBottom: 52,
            textWrap: "balance",
          }}
        >
          Why most candidates<br />fail their first round
        </motion.h2>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {PROBLEMS.map((p) => (
            <motion.div
              key={p.title}
              variants={fadeUpItem}
              whileHover={{ y: -5, transition: { duration: 0.2, ease: "easeOut" } }}
              style={{
                background: "#0B1F0E",
                border: "1px solid rgba(74,222,128,.1)",
                borderRadius: 16,
                padding: "28px 24px",
              }}
            >
              <h3
                style={{ color: "#FAFAF9", fontSize: 18, fontWeight: 700, marginBottom: 12, lineHeight: 1.3 }}
              >
                {p.title}
              </h3>
              <p style={{ color: "#7A9F7E", fontSize: 14, lineHeight: 1.8 }}>{p.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ── Solution ─────────────────────────────────────────────────────────── */

function SolutionSection() {
  return (
    <section style={{ background: "#FAFAF9", padding: "clamp(72px,9vw,120px) 24px" }}>
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: E }}
        >
          <h2
            className={serif.className}
            style={{
              fontSize: "clamp(32px,3.6vw,54px)",
              color: "#111827",
              letterSpacing: "-.5px",
              lineHeight: 1.1,
              marginBottom: 20,
              textWrap: "balance",
            }}
          >
            Unlimited practice.<br />Honest feedback, instantly.
          </h2>
          <p
            style={{
              color: "#4B5563",
              fontSize: "clamp(14px,1.4vw,16px)",
              lineHeight: 1.82,
              marginBottom: 28,
              maxWidth: "52ch",
            }}
          >
            CaseForge runs a full interview — question, follow-ups, pressure testing — then grades your response the way a
            McKinsey partner would. Seven dimensions. Written commentary. Done in seconds.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {[
              "No scheduling. Practice any time, any day.",
              "Quantitative scores tracked across 20+ sessions.",
              "Identify and close gaps before your final round.",
            ].map((point) => (
              <div key={point} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                <span style={{ color: "#16A34A", fontWeight: 800, marginTop: 1, flexShrink: 0, fontSize: 14 }}>✓</span>
                <span style={{ color: "#374151", fontSize: 14, lineHeight: 1.65 }}>{point}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: E, delay: 0.1 }}
          style={{
            background: "#0B1F0E",
            borderRadius: 20,
            padding: "26px 22px",
            border: "1px solid rgba(74,222,128,.13)",
            boxShadow: "0 24px 60px rgba(0,0,0,.13)",
          }}
        >
          <div
            style={{
              color: "#86EFAC",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              marginBottom: 18,
              opacity: 0.8,
            }}
          >
            Readiness Dashboard
          </div>
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            {(
              [
                ["Avg Score", "7.4 / 10"],
                ["Sessions", "12"],
                ["Tier", "Silver"],
                ["Status", "On Track"],
              ] as [string, string][]
            ).map(([k, v]) => (
              <div
                key={k}
                style={{
                  background: "rgba(74,222,128,.055)",
                  borderRadius: 10,
                  padding: "11px 13px",
                  border: "1px solid rgba(74,222,128,.08)",
                }}
              >
                <div style={{ color: "#7A9F7E", fontSize: 10, marginBottom: 4 }}>{k}</div>
                <div style={{ color: "#FAFAF9", fontSize: 15, fontWeight: 700 }}>{v}</div>
              </div>
            ))}
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ color: "#7A9F7E", fontSize: 11 }}>Readiness progress</span>
              <span style={{ color: "#4ADE80", fontSize: 11, fontWeight: 700 }}>74%</span>
            </div>
            <div style={{ height: 5, background: "rgba(74,222,128,.09)", borderRadius: 3, overflow: "hidden" }}>
              <motion.div
                initial={{ width: "0%" }}
                whileInView={{ width: "74%" }}
                viewport={{ once: true }}
                transition={{ duration: 1.1, ease: E, delay: 0.25 }}
                style={{ height: "100%", background: "linear-gradient(90deg,#16A34A,#4ADE80)", borderRadius: 3 }}
              />
            </div>
            <div style={{ color: "#7A9F7E", fontSize: 11, marginTop: 5 }}>~4 more sessions to interview-ready</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ── Capabilities ─────────────────────────────────────────────────────── */

function CapabilitiesSection() {
  return (
    <section style={{ background: "#071A0A", padding: "clamp(72px,9vw,120px) 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <motion.h2
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.65, ease: E }}
          className={serif.className}
          style={{
            fontSize: "clamp(34px,4.2vw,58px)",
            color: "#FAFAF9",
            letterSpacing: "-.6px",
            lineHeight: 1.1,
            marginBottom: 48,
            textWrap: "balance",
          }}
        >
          Everything you need<br />to get the offer
        </motion.h2>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
          className="cap-grid"
        >
          {CAPABILITIES.map((c) => (
            <motion.div
              key={c.label}
              variants={fadeUpItem}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={c.wide ? "cap-wide" : "cap-narrow"}
              style={{
                background: c.dark ? "#0B1F0E" : "rgba(74,222,128,.04)",
                border: `1px solid ${c.dark ? "rgba(74,222,128,.13)" : "rgba(74,222,128,.09)"}`,
                borderRadius: 14,
                padding: "24px 20px",
              }}
            >
              <div
                style={{
                  color: "#4ADE80",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  marginBottom: 10,
                  opacity: 0.65,
                }}
              >
                {c.label}
              </div>
              <h3
                style={{ color: "#FAFAF9", fontSize: 17, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}
              >
                {c.title}
              </h3>
              <p style={{ color: "#7A9F7E", fontSize: 13.5, lineHeight: 1.72 }}>{c.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ── How It Works ─────────────────────────────────────────────────────── */

function HowItWorksSection() {
  return (
    <section id="how-it-works" style={{ background: "#F4F5F0", padding: "clamp(72px,9vw,120px) 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <motion.h2
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.65, ease: E }}
          className={serif.className}
          style={{
            fontSize: "clamp(34px,4.2vw,58px)",
            color: "#111827",
            letterSpacing: "-.6px",
            lineHeight: 1.1,
            marginBottom: 52,
            textWrap: "balance",
          }}
        >
          From signup to offer-ready<br />in four steps
        </motion.h2>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-20"
        >
          {STEPS.map((s) => (
            <motion.div key={s.n} variants={fadeUpItem}>
              <div
                style={{
                  color: "#4ADE80",
                  fontSize: 44,
                  fontWeight: 800,
                  fontFamily: "monospace",
                  lineHeight: 1,
                  marginBottom: 18,
                  opacity: 0.4,
                }}
              >
                {s.n}
              </div>
              <h3
                style={{ color: "#111827", fontSize: 17, fontWeight: 700, marginBottom: 10, lineHeight: 1.3 }}
              >
                {s.title}
              </h3>
              <p style={{ color: "#4B5563", fontSize: 14, lineHeight: 1.78 }}>{s.body}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats bar — avoids the hero-metric-template pattern by living in context */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: E }}
          className="grid grid-cols-2 lg:grid-cols-4 rounded-2xl overflow-hidden"
          style={{ border: "1px solid #E5E7EB", background: "#E5E7EB", gap: 1 }}
        >
          {(
            [
              ["7", "dimensions scored"],
              ["100+", "case scenarios"],
              ["20+", "weakness tags tracked"],
              ["48h", "from signup to first session"],
            ] as [string, string][]
          ).map(([v, l], i) => (
            <motion.div
              key={v}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: E, delay: i * 0.07 }}
              style={{ background: "#FFFFFF", padding: "clamp(20px,3vw,32px) 20px", textAlign: "center" }}
            >
              <div
                className={serif.className}
                style={{ fontSize: "clamp(30px,3.8vw,50px)", color: "#16A34A", lineHeight: 1, marginBottom: 6 }}
              >
                {v}
              </div>
              <div style={{ color: "#6B7280", fontSize: 12, lineHeight: 1.45 }}>{l}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ── CTA ──────────────────────────────────────────────────────────────── */

function CTASection() {
  return (
    <section
      style={{
        background: "#071A0A",
        padding: "clamp(88px,10vw,136px) 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        className="lp-pulse"
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 50%,rgba(74,222,128,.065),transparent 68%)",
          pointerEvents: "none",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.75, ease: E }}
        className="relative z-10 max-w-[620px] mx-auto text-center"
      >
        <h2
          className={serif.className}
          style={{
            fontSize: "clamp(40px,5.5vw,74px)",
            color: "#FAFAF9",
            letterSpacing: "-.9px",
            lineHeight: 1.04,
            marginBottom: 20,
            textWrap: "balance",
          }}
        >
          Your next case interview<br />
          <span style={{ color: "#4ADE80" }}>starts here.</span>
        </h2>
        <p
          style={{
            color: "#7A9F7E",
            fontSize: "clamp(14px,1.6vw,17px)",
            lineHeight: 1.75,
            marginBottom: 36,
            maxWidth: "44ch",
            margin: "0 auto 36px",
          }}
        >
          Join candidates preparing for McKinsey, BCG, Bain, and beyond. Free to start, no credit card required.
        </p>
        <motion.div
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.12 }}
          style={{ display: "inline-block" }}
        >
          <Link
            href="/sign-in"
            style={{
              display: "inline-block",
              background: "#4ADE80",
              color: "#071A0A",
              fontWeight: 800,
              fontSize: "clamp(14px,1.5vw,16px)",
              padding: "15px 40px",
              borderRadius: 12,
              textDecoration: "none",
              letterSpacing: "-.1px",
            }}
          >
            Start practicing for free →
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ── FAQ ──────────────────────────────────────────────────────────────── */

function FAQSection() {
  return (
    <section id="faq" style={{ background: "#FAFAF9", padding: "clamp(72px,9vw,120px) 24px" }}>
      <div className="max-w-[720px] mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.65, ease: E }}
          className={serif.className}
          style={{
            fontSize: "clamp(32px,3.8vw,52px)",
            color: "#111827",
            letterSpacing: "-.5px",
            marginBottom: 36,
            textWrap: "balance",
          }}
        >
          Common questions
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: E, delay: 0.1 }}
        >
          <FaqAccordion />
        </motion.div>
      </div>
    </section>
  )
}

/* ── Footer ───────────────────────────────────────────────────────────── */

function SiteFooter() {
  return (
    <footer
      style={{ background: "#071A0A", borderTop: "1px solid rgba(74,222,128,.08)", padding: "42px 24px" }}
    >
      <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-5">
        <span className={serif.className} style={{ fontSize: 20, color: "#4ADE80" }}>
          CaseForge
        </span>
        <div className="flex gap-6">
          <a href="#how-it-works" style={{ color: "#7A9F7E", fontSize: 13, textDecoration: "none" }}>
            How it works
          </a>
          <a href="#faq" style={{ color: "#7A9F7E", fontSize: 13, textDecoration: "none" }}>
            FAQ
          </a>
          <Link href="/sign-in" style={{ color: "#7A9F7E", fontSize: 13, textDecoration: "none" }}>
            Sign in
          </Link>
        </div>
        <span style={{ color: "#3D5C41", fontSize: 12 }}>© {new Date().getFullYear()} CaseForge AI</span>
      </div>
    </footer>
  )
}
