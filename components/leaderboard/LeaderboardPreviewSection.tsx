"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, GraduationCap, Trophy } from "lucide-react"

const E = [0.22, 1, 0.36, 1] as const

const PREVIEW_ENTRIES = [
  { rank: 1, name: "A. Chen", school: "Harvard Business", tier: "emerald", score: "9.4", movement: "up", delta: 2 },
  { rank: 2, name: "M. Patel", school: "Wharton", tier: "emerald", score: "9.1", movement: "same", delta: 0 },
  { rank: 3, name: "J. Williams", school: "Booth", tier: "gold", score: "8.7", movement: "up", delta: 5 },
  { rank: 4, name: "S. Kim", school: "Kellogg", tier: "gold", score: "8.4", movement: "down", delta: 1 },
  { rank: 5, name: "R. Torres", school: "Tuck", tier: "gold", score: "8.2", movement: "up", delta: 3 },
  { rank: 6, name: "L. Johnson", school: "Ross", tier: "silver", score: "7.9", movement: "up", delta: 7 },
  { rank: 7, name: "N. Singh", school: "Sloan", tier: "silver", score: "7.6", movement: "new", delta: 0 },
]

// rgba fallbacks for style attributes — oklch doesn't parse in all browsers' style prop
const TIER_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  emerald: { color: "#4ade80",      bg: "rgba(74,222,128,0.12)",  border: "rgba(74,222,128,0.28)" },
  gold:    { color: "#eab308",      bg: "rgba(234,179,8,0.12)",   border: "rgba(234,179,8,0.28)" },
  silver:  { color: "#94a3b8",      bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.28)" },
  bronze:  { color: "#cd7f32",      bg: "rgba(205,127,50,0.12)",  border: "rgba(205,127,50,0.28)" },
}

const RANK_COLORS: Record<number, string> = {
  1: "#eab308",
  2: "#94a3b8",
  3: "#cd7f32",
}

export function LeaderboardPreviewSection() {
  return (
    <section
      style={{
        background: "#060F07",
        padding: "100px 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle grid texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.025,
          backgroundImage:
            "linear-gradient(rgba(74,222,128,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(74,222,128,.5) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      />
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          right: "-5%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle,rgba(74,222,128,.06),transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="leaderboard-preview-grid"
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "0 24px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 64,
          alignItems: "center",
        }}
      >
        {/* Copy side */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: E }}
        >
          {/* Label */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              background: "rgba(74,222,128,.09)",
              border: "1px solid rgba(74,222,128,.2)",
              borderRadius: 100,
              padding: "5px 13px",
              marginBottom: 28,
            }}
          >
            <Trophy size={11} style={{ color: "#4ADE80", flexShrink: 0 }} />
            <span
              style={{
                color: "#86EFAC",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: ".1em",
                textTransform: "uppercase",
              }}
            >
              Campus Leaderboard
            </span>
          </div>

          <h2
            style={{
              fontSize: "clamp(32px,4vw,52px)",
              lineHeight: 1.08,
              color: "#FAFAF9",
              marginBottom: 20,
              letterSpacing: "-1px",
              textWrap: "balance",
            }}
          >
            See where you{" "}
            <span style={{ color: "#4ADE80" }}>rank on campus.</span>
          </h2>

          <p
            style={{
              fontSize: 16,
              color: "#A7C4AB",
              lineHeight: 1.75,
              marginBottom: 32,
              maxWidth: "44ch",
            }}
          >
            Top candidates don&apos;t just practice — they measure. CaseForge ranks you against peers
            at your school, by firm readiness, and by improvement speed. Not by interview count.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 36 }}>
            {[
              "Ranked by skill quality, not volume",
              "College-specific rankings for fair competition",
              "Weekly improvement tracking and movement",
            ].map((point) => (
              <div key={point} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#4ADE80",
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: "#A7C4AB", fontSize: 14 }}>{point}</span>
              </div>
            ))}
          </div>

          <Link
            href="/sign-in"
            style={{
              display: "inline-block",
              background: "#4ADE80",
              color: "#071A0A",
              fontWeight: 700,
              fontSize: 15,
              padding: "13px 26px",
              borderRadius: 10,
              textDecoration: "none",
            }}
          >
            Climb the leaderboard →
          </Link>
        </motion.div>

        {/* Leaderboard preview card */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: E, delay: 0.15 }}
        >
          <div
            style={{
              background: "rgba(10,22,12,0.95)",
              border: "1px solid rgba(74,222,128,.12)",
              borderRadius: 16,
              overflow: "hidden",
              backdropFilter: "blur(12px)",
            }}
          >
            {/* Card header */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid rgba(74,222,128,.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Trophy size={14} style={{ color: "#4ADE80" }} />
                <span style={{ color: "#FAFAF9", fontSize: 13, fontWeight: 600 }}>
                  Top Candidates
                </span>
              </div>
              <span
                style={{
                  fontSize: 11,
                  color: "#86EFAC",
                  background: "rgba(74,222,128,.09)",
                  border: "1px solid rgba(74,222,128,.2)",
                  borderRadius: 100,
                  padding: "3px 10px",
                }}
              >
                Live
              </span>
            </div>

            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "36px 1fr 80px 60px",
                gap: 8,
                padding: "10px 20px",
                borderBottom: "1px solid rgba(255,255,255,.05)",
              }}
            >
              {["#", "Candidate", "Score", ""].map((h) => (
                <span key={h} style={{ fontSize: 10, color: "rgba(255,255,255,.3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em" }}>
                  {h}
                </span>
              ))}
            </div>

            {/* Entries */}
            {PREVIEW_ENTRIES.map((entry, i) => {
              const tierStyle = TIER_STYLES[entry.tier] ?? { color: "#94a3b8", bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.28)" }
              const rankColor = RANK_COLORS[entry.rank]
              const isBlurred = i >= 5
              return (
                <motion.div
                  key={entry.rank}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.05 * i, ease: E }}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "36px 1fr 80px 60px",
                    gap: 8,
                    padding: "11px 20px",
                    borderBottom: "1px solid rgba(255,255,255,.04)",
                    filter: isBlurred ? "blur(4px)" : "none",
                    userSelect: isBlurred ? "none" : "auto",
                    transition: "background 0.15s",
                  }}
                >
                  {/* Rank */}
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: rankColor ?? "rgba(255,255,255,.4)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {entry.rank}
                  </span>

                  {/* Name + school */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "#FAFAF9", fontSize: 13, fontWeight: 600 }}>
                        {entry.name}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: tierStyle.color,
                          background: tierStyle.bg,
                          padding: "2px 7px",
                          borderRadius: 100,
                          border: `1px solid ${tierStyle.border}`,
                        }}
                      >
                        {entry.tier.charAt(0).toUpperCase() + entry.tier.slice(1)}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                      <GraduationCap size={10} style={{ color: "rgba(255,255,255,.3)" }} />
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,.35)" }}>
                        {entry.school}
                      </span>
                    </div>
                  </div>

                  {/* Score */}
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#4ADE80",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {entry.score}
                  </span>

                  {/* Movement */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                    {entry.movement === "up" && (
                      <span style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 11, fontWeight: 600, color: "#4ADE80" }}>
                        <TrendingUp size={11} />
                        {entry.delta}
                      </span>
                    )}
                    {entry.movement === "down" && (
                      <span style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 11, fontWeight: 600, color: "#f97316" }}>
                        <TrendingDown size={11} />
                        {entry.delta}
                      </span>
                    )}
                    {entry.movement === "same" && (
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>—</span>
                    )}
                    {entry.movement === "new" && (
                      <span style={{ fontSize: 10, fontWeight: 600, color: "#4ade80", background: "rgba(74,222,128,0.1)", padding: "2px 6px", borderRadius: 100 }}>NEW</span>
                    )}
                  </div>
                </motion.div>
              )
            })}

            {/* CTA footer */}
            <div
              style={{
                padding: "14px 20px",
                borderTop: "1px solid rgba(74,222,128,.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.35)" }}>
                Showing top 7 — sign up to see your rank
              </span>
              <Link
                href="/sign-in"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#4ADE80",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                See where you rank →
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .leaderboard-preview-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}
