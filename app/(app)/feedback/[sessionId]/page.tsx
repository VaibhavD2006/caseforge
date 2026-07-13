"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ChevronDown, ChevronUp, MessageSquareQuote, Zap, PlayCircle, FileText } from "lucide-react"
import { motion } from "framer-motion"
import { FadeUp, StaggerList, StaggerItem } from "@/components/motion"
import { FIRM_CONFIGS, DEFAULT_WEIGHTS, type FirmId } from "@/config/firms/firm-styles"

const DIMENSION_META: Record<string, { label: string; rubric: string }> = {
  structure:             { label: "Structure",             rubric: "Clear MECE framework, logical issue tree, upfront roadmap before diving into analysis." },
  framing:              { label: "Framing",               rubric: "Restates business objective precisely, asks one sharp clarifying question, sets up the right problem to solve." },
  hypothesis:           { label: "Hypothesis",            rubric: "Early hypothesis formation, willingness to commit and update with data, hypothesis-driven navigation." },
  quantitative:         { label: "Quantitative",          rubric: "Correct math setup, clean arithmetic, verbalized reasoning, stated assumptions before calculating." },
  business_judgment:    { label: "Business Judgment",     rubric: "Realistic assumptions, industry awareness, sense of magnitude, practical commercial recommendations." },
  creativity:           { label: "Creativity",            rubric: "Non-obvious structuring, unexpected angles, insight beyond the standard framework." },
  synthesis:            { label: "Synthesis",             rubric: "Connecting data points to insights, so-what thinking, concise summaries that lead with conclusions." },
  recommendation_quality: { label: "Recommendation",     rubric: "Specific, actionable recommendation with primary rationale, acknowledges the biggest risk, clear on next steps." },
  communication:        { label: "Communication",         rubric: "Clarity, conciseness, structured verbal delivery, appropriate pace and signposting." },
  confidence:           { label: "Confidence",            rubric: "Composure under pressure, decisive tone, recovery from mistakes, defends position with evidence." },
  presence:             { label: "Presence",              rubric: "Executive bearing, sentence-level assertiveness, replaces hedging language with direct claims." },
}

type DimensionScore = {
  score: number
  rationale: string
  evidenceSnippets: string[]
}

type Scorecard = {
  overallScore: string
  dimensionScores: Record<string, DimensionScore>
  topStrengths: string[]
  topWeaknesses: string[]
  weaknessTagKeys: string[]
  nextActions: string[]
  reliabilityFlag: boolean
  evaluatorModel: string
  recruiterSummary?: string | null
  improvementReport?: string | null
}

function scoreColor(s: number) {
  return s >= 7.5 ? "text-[oklch(0.62_0.15_158)]" : s >= 5 ? "text-[oklch(0.72_0.15_78)]" : "text-[oklch(0.60_0.18_22)]"
}
function barColor(s: number) {
  return s >= 7.5 ? "bg-[oklch(0.62_0.15_158)]" : s >= 5 ? "bg-[oklch(0.72_0.15_78)]" : "bg-[oklch(0.60_0.18_22)]"
}

function ImprovementReport({ markdown }: { markdown: string }) {
  const sections = markdown.split(/^## /m).filter(Boolean)
  return (
    <div className="space-y-5">
      {sections.map((section, i) => {
        const nl = section.indexOf("\n")
        const heading = section.slice(0, nl).trim()
        const body = section.slice(nl + 1).trim()
        return (
          <div key={i}>
            <p className="text-ink text-sm font-semibold mb-2">{heading}</p>
            <div className="text-ink-muted text-sm leading-relaxed space-y-2">
              {body.split(/\n\n+/).map((para, j) => {
                if (para.startsWith("- ") || para.includes("\n- ")) {
                  const items = para.split("\n").filter((l) => l.startsWith("- ")).map((l) => l.slice(2))
                  return (
                    <ul key={j} className="space-y-1.5 list-none">
                      {items.map((item, k) => (
                        <li key={k} className="flex gap-2">
                          <span className="text-brand mt-0.5 flex-shrink-0">·</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )
                }
                return <p key={j}>{para}</p>
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function DimensionCard({
  dimKey,
  weight,
  data,
}: {
  dimKey: string
  weight: number
  data: DimensionScore
}) {
  const [open, setOpen] = useState(false)
  const meta = DIMENSION_META[dimKey] ?? { label: dimKey.replace(/_/g, " "), rubric: "" }
  return (
    <div className="rounded-xl border border-border-subtle bg-surface">
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-ink text-sm font-semibold">{meta.label}</p>
            <p className="text-ink-faint text-xs">Weight: {Math.round(weight * 100)}%</p>
          </div>
          <span className={`text-xl font-bold tabular-nums ${scoreColor(data.score)}`}>
            {data.score}<span className="text-ink-faint text-sm font-normal">/10</span>
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-border-subtle overflow-hidden mb-3">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${barColor(data.score)}`}
            style={{ width: `${(data.score / 10) * 100}%` }}
          />
        </div>
        <p className="text-ink-muted text-sm leading-relaxed">{data.rationale}</p>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1 text-brand text-xs mt-3 hover:text-brand-hover transition-colors cursor-pointer"
        >
          {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {open ? "Hide" : "Show"} rubric & evidence
        </button>
      </div>

      {open && (
        <div className="border-t border-border-subtle px-4 pb-4 pt-3 space-y-3">
          {meta.rubric && (
            <div>
              <p className="text-ink-muted text-xs font-semibold uppercase tracking-wider mb-1">What we looked for</p>
              <p className="text-ink-faint text-sm leading-relaxed">{meta.rubric}</p>
            </div>
          )}
          {data.evidenceSnippets?.length > 0 && (
            <div>
              <p className="text-ink-muted text-xs font-semibold uppercase tracking-wider mb-1.5">Evidence from session</p>
              <div className="space-y-2">
                {data.evidenceSnippets.map((s, i) => (
                  <blockquote key={i} className="border-l-2 border-brand-muted pl-3 text-xs text-ink-muted italic leading-relaxed">
                    &ldquo;{s}&rdquo;
                  </blockquote>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function FeedbackPage() {
  const params = useParams()
  const sessionId = params.sessionId as string
  const [scorecard, setScorecard] = useState<Scorecard | null>(null)
  const [firmId, setFirmId] = useState<FirmId | null>(null)
  const [pollCount, setPollCount] = useState(0)
  const [reportOpen, setReportOpen] = useState(false)

  useEffect(() => {
    if (scorecard) return
    const poll = async () => {
      try {
        const res = await fetch(`/api/evaluation/status/${sessionId}`)
        const data = await res.json()
        if (data.status === "evaluated" && data.scorecard) {
          setScorecard(data.scorecard)
          setFirmId(data.firmId ?? null)
        } else {
          setPollCount((c) => c + 1)
        }
      } catch {
        setPollCount((c) => c + 1)
      }
    }
    void poll()
  }, [sessionId, scorecard])

  useEffect(() => {
    if (scorecard || pollCount === 0 || pollCount > 60) return
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/evaluation/status/${sessionId}`)
        const data = await res.json()
        if (data.status === "evaluated" && data.scorecard) {
          setScorecard(data.scorecard)
          setFirmId(data.firmId ?? null)
        } else {
          setPollCount((c) => c + 1)
        }
      } catch {
        setPollCount((c) => c + 1)
      }
    }, 3000)
    return () => clearTimeout(t)
  }, [pollCount, scorecard, sessionId])

  if (!scorecard) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-ink text-sm font-medium mb-1">Generating feedback</p>
          <p className="text-ink-faint text-xs">
            {pollCount > 20 ? "This is taking longer than usual…" : "Analyzing your interview across 11 dimensions"}
          </p>
          {pollCount > 40 && (
            <p className="text-[oklch(0.60_0.18_22)] text-xs mt-3">Make sure Inngest dev server is running.</p>
          )}
        </div>
      </div>
    )
  }

  const firmConfig = firmId ? FIRM_CONFIGS[firmId] : null
  const weights = firmConfig?.scoringWeights ?? DEFAULT_WEIGHTS
  const overall = Number(scorecard.overallScore)

  // Build dimension list from actual scored dimensions, sorted by weight descending
  const dimEntries = Object.entries(scorecard.dimensionScores)
    .map(([key, data]) => ({ key, data, weight: weights[key as keyof typeof weights] ?? 0 }))
    .sort((a, b) => b.weight - a.weight)

  return (
    <div className="min-h-screen bg-bg px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard" className="text-ink-muted text-sm hover:text-ink transition-colors">
            ← Dashboard
          </Link>
          <div className="flex items-center gap-2">
            {firmConfig && (
              <span className="text-xs px-2 py-0.5 rounded border border-border-subtle text-ink-faint">
                {firmConfig.displayName}
              </span>
            )}
            {scorecard.reliabilityFlag && (
              <span className="text-xs px-2 py-0.5 rounded border border-[oklch(0.72_0.15_78)] text-[oklch(0.72_0.15_78)]">
                Low confidence
              </span>
            )}
          </div>
        </div>

        <h1 className="text-ink text-2xl font-bold mb-1">Interview feedback</h1>
        <p className="text-ink-muted text-sm mb-8">Evaluated by {scorecard.evaluatorModel}</p>

        {/* Overall score */}
        <FadeUp>
          <div className="rounded-xl border border-border-subtle bg-surface p-6 mb-4 text-center">
            <p className="text-ink-muted text-xs uppercase tracking-wider mb-2">Overall score</p>
            <p className={`text-6xl font-bold tabular-nums mb-1 ${scoreColor(overall)}`}>
              {overall.toFixed(1)}
            </p>
            <p className="text-ink-faint text-sm">out of 10</p>
          </div>
        </FadeUp>

        {/* Strengths + Weaknesses */}
        {(scorecard.topStrengths.length > 0 || scorecard.topWeaknesses.length > 0) && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {scorecard.topStrengths.length > 0 && (
              <div className="rounded-xl border border-[oklch(0.22_0.05_158)] bg-[oklch(0.12_0.04_158)] p-4">
                <p className="text-[oklch(0.62_0.15_158)] text-xs font-semibold uppercase tracking-wider mb-2">Strengths</p>
                <ul className="space-y-1.5">
                  {scorecard.topStrengths.map((s, i) => (
                    <li key={i} className="text-ink text-xs leading-relaxed">{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {scorecard.topWeaknesses.length > 0 && (
              <div className="rounded-xl border border-[oklch(0.22_0.05_22)] bg-[oklch(0.12_0.04_22)] p-4">
                <p className="text-[oklch(0.60_0.18_22)] text-xs font-semibold uppercase tracking-wider mb-2">Areas to improve</p>
                <ul className="space-y-1.5">
                  {scorecard.topWeaknesses.map((w, i) => (
                    <li key={i} className="text-ink text-xs leading-relaxed">{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Evaluator note */}
        {scorecard.recruiterSummary && (
          <div className="rounded-xl border border-border-subtle bg-surface p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquareQuote className="w-4 h-4 text-brand" />
              <p className="text-ink text-sm font-semibold">Evaluator note</p>
            </div>
            <blockquote className="text-ink-muted text-sm leading-relaxed italic border-l-2 border-brand-muted pl-3">
              {scorecard.recruiterSummary}
            </blockquote>
          </div>
        )}

        {/* Full improvement report */}
        {scorecard.improvementReport && (
          <div className="rounded-xl border border-border-subtle bg-surface mb-4 overflow-hidden">
            <button
              type="button"
              onClick={() => setReportOpen((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-raised transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand" />
                <p className="text-ink text-sm font-semibold">Full improvement report</p>
              </div>
              {reportOpen ? <ChevronUp className="w-4 h-4 text-ink-faint" /> : <ChevronDown className="w-4 h-4 text-ink-faint" />}
            </button>
            {reportOpen && (
              <div className="border-t border-border-subtle px-5 pb-5 pt-4">
                <ImprovementReport markdown={scorecard.improvementReport} />
              </div>
            )}
          </div>
        )}

        {/* Dimension breakdown */}
        <FadeUp delay={0.05}>
          <h2 className="text-ink text-sm font-semibold mb-3 mt-6">
            Dimension breakdown
            {firmConfig && (
              <span className="text-ink-faint font-normal ml-2">· weighted for {firmConfig.displayName}</span>
            )}
          </h2>
        </FadeUp>
        <StaggerList className="space-y-3 mb-6">
          {dimEntries.map((d) => (
            <StaggerItem key={d.key}>
              <DimensionCard dimKey={d.key} weight={d.weight} data={d.data} />
            </StaggerItem>
          ))}
        </StaggerList>

        {/* Next actions */}
        {scorecard.nextActions?.length > 0 && (
          <div className="rounded-xl border border-border-subtle bg-surface p-5 mb-6">
            <h2 className="text-ink text-sm font-semibold mb-3">Recommended next steps</h2>
            <ol className="space-y-2">
              {scorecard.nextActions.map((a, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="text-brand font-semibold flex-shrink-0">{i + 1}.</span>
                  <span className="text-ink-muted leading-relaxed">{a}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Drill suggestions */}
        {scorecard.weaknessTagKeys?.length > 0 && (
          <div className="rounded-xl border border-border-subtle bg-surface p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-brand" />
              <h2 className="text-ink text-sm font-semibold">Recommended drills</h2>
            </div>
            <p className="text-ink-muted text-xs mb-3">
              Based on your weakness tags:{" "}
              <span className="text-ink-faint">{scorecard.weaknessTagKeys.slice(0, 3).join(", ")}</span>
            </p>
            <Link
              href="/drills"
              className="inline-flex items-center gap-1.5 text-brand text-sm hover:text-brand-hover transition-colors"
            >
              Browse targeted drills →
            </Link>
          </div>
        )}

        {/* CTAs */}
        <FadeUp delay={0.1} className="flex gap-3">
          <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }}>
            <Link
              href="/interview/new"
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand hover:bg-brand-hover text-[oklch(0.10_0.012_148)] text-sm font-semibold transition-colors cursor-pointer w-full"
            >
              <PlayCircle className="w-4 h-4" />
              Start another
            </Link>
          </motion.div>
          <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }}>
            <Link
              href="/dashboard"
              className="block py-2.5 px-4 rounded-xl border border-border-subtle text-ink-muted text-sm text-center hover:border-border-strong hover:text-ink transition-colors cursor-pointer"
            >
              Dashboard
            </Link>
          </motion.div>
          <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }}>
            <Link
              href="/drills"
              className="block py-2.5 px-4 rounded-xl border border-border-subtle text-ink-muted text-sm text-center hover:border-border-strong hover:text-ink transition-colors cursor-pointer"
            >
              Drills
            </Link>
          </motion.div>
        </FadeUp>
      </div>
    </div>
  )
}
