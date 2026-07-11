"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PlayCircle } from "lucide-react"
import { motion } from "framer-motion"
import { FadeUp, StaggerList, StaggerItem } from "@/components/motion"

const FIRM_OPTIONS = [
  { value: "mbb", label: "MBB", description: "McKinsey, BCG, Bain — hypothesis-driven, rigorous" },
  { value: "big4", label: "Big Four", description: "Deloitte, PwC, EY, KPMG — broader, practical focus" },
  { value: "boutique", label: "Boutique", description: "Boutique strategy — creative, deep-dive" },
  { value: "generic", label: "General", description: "Standard consulting interview practice" },
]

const TYPE_OPTIONS = [
  {
    value: "case",
    label: "Full Case Interview",
    description: "Structured business problem — structure, analysis, synthesis, recommendation",
    duration: "30–40 min",
    difficulty: "Medium–Hard",
    emphasis: "Structure, Judgment, Synthesis",
  },
  {
    value: "market_sizing",
    label: "Market Sizing",
    description: "Top-down estimation with quantitative reasoning and clear assumptions",
    duration: "15–20 min",
    difficulty: "Medium",
    emphasis: "Math, Structure, Assumptions",
  },
  {
    value: "behavioral",
    label: "Behavioral / Fit",
    description: "Personal experience and leadership questions — STAR structure",
    duration: "20–30 min",
    difficulty: "Easy–Medium",
    emphasis: "Communication, Confidence",
  },
  {
    value: "case_math",
    label: "Case Math Drill",
    description: "Focused quantitative problems — mental math, unit economics, break-even",
    duration: "10–15 min",
    difficulty: "Medium",
    emphasis: "Quantitative, Process Clarity",
  },
  {
    value: "pressure_round",
    label: "Pressure Round",
    description: "Partner-style final round — every answer challenged, time pressure applied",
    duration: "20–30 min",
    difficulty: "Hard",
    emphasis: "Composure, Decisiveness, Pushback Handling",
  },
]

function RadioCard({
  selected,
  onClick,
  label,
  description,
  duration,
  difficulty,
  emphasis,
}: {
  selected: boolean
  onClick: () => void
  label: string
  description: string
  duration?: string
  difficulty?: string
  emphasis?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border text-left transition-colors cursor-pointer w-full ${
        selected
          ? "border-brand bg-brand-subtle"
          : "border-border-subtle bg-surface hover:border-border-strong"
      }`}
    >
      <span
        className={`mt-1 w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${
          selected ? "border-brand" : "border-border-strong"
        }`}
      >
        {selected && <span className="w-2 h-2 rounded-full bg-brand" />}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-semibold ${selected ? "text-ink" : "text-ink-muted"}`}>{label}</p>
          {difficulty && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                difficulty.includes("Hard")
                  ? "bg-[oklch(0.18_0.05_22)] text-[oklch(0.60_0.18_22)]"
                  : difficulty.includes("Medium")
                  ? "bg-[oklch(0.18_0.05_78)] text-[oklch(0.72_0.15_78)]"
                  : "bg-brand-subtle text-brand"
              }`}
            >
              {difficulty}
            </span>
          )}
        </div>
        <p className="text-xs text-ink-faint mt-0.5 mb-1.5">{description}</p>
        {(duration || emphasis) && (
          <div className="flex gap-3 text-ink-faint text-xs">
            {duration && <span>⏱ {duration}</span>}
            {emphasis && <span className="truncate">Focus: {emphasis}</span>}
          </div>
        )}
      </div>
    </button>
  )
}

export default function NewInterviewPage() {
  const router = useRouter()
  const [firmStyle, setFirmStyle] = useState("mbb")
  const [interviewType, setInterviewType] = useState("case")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleStart() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firmStyle, interviewType }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      sessionStorage.setItem(`interview_${data.sessionId}`, JSON.stringify({ openingMessage: data.openingMessage }))
      router.push(`/interview/${data.sessionId}`)
    } catch {
      setError("Could not start interview. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg px-4 py-12">
      <div className="max-w-lg mx-auto">
        <FadeUp className="mb-8">
          <h1 className="text-ink text-2xl font-bold mb-1">Start a mock interview</h1>
          <p className="text-ink-muted text-sm">Choose your firm style and interview type. The AI interviewer will adapt its persona and rigor accordingly.</p>
        </FadeUp>

        <div className="space-y-6">
          <FadeUp delay={0.05}>
            <p className="text-ink text-sm font-semibold mb-3">Firm style</p>
            <StaggerList className="space-y-2">
              {FIRM_OPTIONS.map((opt) => (
                <StaggerItem key={opt.value}>
                  <RadioCard selected={firmStyle === opt.value} onClick={() => setFirmStyle(opt.value)} label={opt.label} description={opt.description} />
                </StaggerItem>
              ))}
            </StaggerList>
          </FadeUp>

          <FadeUp delay={0.1}>
            <p className="text-ink text-sm font-semibold mb-3">Interview type</p>
            <StaggerList className="space-y-2">
              {TYPE_OPTIONS.map((opt) => (
                <StaggerItem key={opt.value}>
                  <RadioCard
                    selected={interviewType === opt.value}
                    onClick={() => setInterviewType(opt.value)}
                    label={opt.label}
                    description={opt.description}
                    duration={opt.duration}
                    difficulty={opt.difficulty}
                    emphasis={opt.emphasis}
                  />
                </StaggerItem>
              ))}
            </StaggerList>
          </FadeUp>

          {error && <p className="text-[oklch(0.60_0.18_22)] text-sm">{error}</p>}

          <FadeUp delay={0.15}>
            <motion.button
              type="button"
              onClick={handleStart}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand hover:bg-brand-hover text-[oklch(0.10_0.012_148)] text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" />
              {loading ? "Starting interview…" : "Begin interview"}
            </motion.button>
          </FadeUp>
        </div>
      </div>
    </div>
  )
}
