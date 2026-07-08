"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

const DIMENSIONS = [
  { key: "structure", label: "Structure", weight: "20%" },
  { key: "hypothesis", label: "Hypothesis", weight: "15%" },
  { key: "quantitative", label: "Quantitative", weight: "15%" },
  { key: "business_judgment", label: "Business Judgment", weight: "20%" },
  { key: "synthesis", label: "Synthesis", weight: "15%" },
  { key: "communication", label: "Communication", weight: "10%" },
  { key: "confidence", label: "Confidence", weight: "5%" },
]

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
}

function ScoreBar({ score }: { score: number }) {
  const pct = (score / 10) * 100
  const color =
    score >= 7.5
      ? "bg-[oklch(0.62_0.15_158)]"
      : score >= 5
        ? "bg-[oklch(0.72_0.15_78)]"
        : "bg-[oklch(0.60_0.18_22)]"

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full bg-[oklch(0.25_0.015_258)]">
        <div
          className={`h-1.5 rounded-full ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[oklch(0.93_0.005_258)] text-sm font-medium tabular-nums w-6">
        {score}
      </span>
    </div>
  )
}

function DimensionCard({
  label,
  weight,
  data,
}: {
  label: string
  weight: string
  data: DimensionScore
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-lg border border-[oklch(0.25_0.015_258)] bg-[oklch(0.15_0.013_258)] p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-[oklch(0.93_0.005_258)] text-sm font-medium">
            {label}
          </div>
          <div className="text-[oklch(0.40_0.008_258)] text-xs mt-0.5">
            Weight: {weight}
          </div>
        </div>
        <div className="text-[oklch(0.93_0.005_258)] text-lg font-semibold tabular-nums">
          {data.score}
          <span className="text-[oklch(0.40_0.008_258)] text-sm font-normal">
            /10
          </span>
        </div>
      </div>

      <ScoreBar score={data.score} />

      <p className="text-[oklch(0.62_0.010_258)] text-sm mt-3 leading-relaxed">
        {data.rationale}
      </p>

      {data.evidenceSnippets && data.evidenceSnippets.length > 0 && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="text-[oklch(0.62_0.19_258)] text-xs hover:text-[oklch(0.67_0.19_258)] transition-colors cursor-pointer"
          >
            {expanded ? "Hide" : "Show"} evidence quotes
          </button>
          {expanded && (
            <div className="mt-2 space-y-2">
              {data.evidenceSnippets.map((snippet, i) => (
                <blockquote
                  key={i}
                  className="border-l-2 border-[oklch(0.35_0.018_258)] pl-3 text-xs text-[oklch(0.62_0.010_258)] italic"
                >
                  &ldquo;{snippet}&rdquo;
                </blockquote>
              ))}
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
  const [pollCount, setPollCount] = useState(0)

  useEffect(() => {
    if (scorecard) return

    const poll = async () => {
      try {
        const res = await fetch(`/api/evaluation/status/${sessionId}`)
        const data = await res.json()

        if (data.status === "evaluated" && data.scorecard) {
          setScorecard(data.scorecard)
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
    if (scorecard || pollCount === 0) return
    if (pollCount > 60) return

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/evaluation/status/${sessionId}`)
        const data = await res.json()

        if (data.status === "evaluated" && data.scorecard) {
          setScorecard(data.scorecard)
        } else {
          setPollCount((c) => c + 1)
        }
      } catch {
        setPollCount((c) => c + 1)
      }
    }, 3000)

    return () => clearTimeout(timeout)
  }, [pollCount, scorecard, sessionId])

  if (!scorecard) {
    return (
      <div className="min-h-screen bg-[oklch(0.11_0.012_258)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[oklch(0.62_0.19_258)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[oklch(0.93_0.005_258)] text-sm font-medium mb-1">
            Generating feedback
          </p>
          <p className="text-[oklch(0.40_0.008_258)] text-xs">
            {pollCount > 20
              ? "This is taking longer than usual..."
              : "Analyzing your interview across 7 dimensions"}
          </p>
          {pollCount > 40 && (
            <p className="text-[oklch(0.60_0.18_22)] text-xs mt-3">
              Make sure Ollama and Inngest dev server are running.
            </p>
          )}
        </div>
      </div>
    )
  }

  const overallScore = Number(scorecard.overallScore)

  return (
    <div className="min-h-screen bg-[oklch(0.11_0.012_258)] px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/dashboard"
              className="text-[oklch(0.62_0.010_258)] text-sm hover:text-[oklch(0.93_0.005_258)] transition-colors"
            >
              &larr; Back to dashboard
            </Link>
            {scorecard.reliabilityFlag && (
              <span className="text-xs px-2 py-0.5 rounded border border-[oklch(0.72_0.15_78)] text-[oklch(0.72_0.15_78)]">
                Low confidence
              </span>
            )}
          </div>

          <h1 className="text-[oklch(0.93_0.005_258)] text-2xl font-semibold mb-1">
            Interview feedback
          </h1>
          <p className="text-[oklch(0.62_0.010_258)] text-sm">
            Evaluated by {scorecard.evaluatorModel}
          </p>
        </div>

        {/* Overall Score */}
        <div className="rounded-lg border border-[oklch(0.25_0.015_258)] bg-[oklch(0.15_0.013_258)] p-6 mb-6 text-center">
          <div className="text-[oklch(0.40_0.008_258)] text-xs uppercase tracking-widest mb-1">
            Overall score
          </div>
          <div
            className={`text-5xl font-bold tabular-nums mb-2 ${
              overallScore >= 7.5
                ? "text-[oklch(0.62_0.15_158)]"
                : overallScore >= 5
                  ? "text-[oklch(0.72_0.15_78)]"
                  : "text-[oklch(0.60_0.18_22)]"
            }`}
          >
            {overallScore.toFixed(1)}
          </div>
          <div className="text-[oklch(0.40_0.008_258)] text-sm">out of 10</div>
        </div>

        {/* Strengths + Weaknesses */}
        {(scorecard.topStrengths.length > 0 ||
          scorecard.topWeaknesses.length > 0) && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {scorecard.topStrengths.length > 0 && (
              <div className="rounded-lg border border-[oklch(0.22_0.05_158)] bg-[oklch(0.14_0.04_158)] p-4">
                <div className="text-[oklch(0.62_0.15_158)] text-xs font-medium mb-2">
                  Strengths
                </div>
                <ul className="space-y-1.5">
                  {scorecard.topStrengths.map((s, i) => (
                    <li
                      key={i}
                      className="text-[oklch(0.93_0.005_258)] text-xs leading-relaxed"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {scorecard.topWeaknesses.length > 0 && (
              <div className="rounded-lg border border-[oklch(0.22_0.05_22)] bg-[oklch(0.14_0.04_22)] p-4">
                <div className="text-[oklch(0.60_0.18_22)] text-xs font-medium mb-2">
                  Weaknesses
                </div>
                <ul className="space-y-1.5">
                  {scorecard.topWeaknesses.map((w, i) => (
                    <li
                      key={i}
                      className="text-[oklch(0.93_0.005_258)] text-xs leading-relaxed"
                    >
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Dimension Cards */}
        <h2 className="text-[oklch(0.93_0.005_258)] text-sm font-medium mb-3">
          Dimension breakdown
        </h2>
        <div className="space-y-3 mb-6">
          {DIMENSIONS.map((dim) => {
            const data = scorecard.dimensionScores[dim.key]
            if (!data) return null
            return (
              <DimensionCard
                key={dim.key}
                label={dim.label}
                weight={dim.weight}
                data={data}
              />
            )
          })}
        </div>

        {/* Next Actions */}
        {scorecard.nextActions && scorecard.nextActions.length > 0 && (
          <div className="rounded-lg border border-[oklch(0.25_0.015_258)] bg-[oklch(0.15_0.013_258)] p-5 mb-6">
            <h2 className="text-[oklch(0.93_0.005_258)] text-sm font-medium mb-3">
              Recommended next steps
            </h2>
            <ol className="space-y-2">
              {scorecard.nextActions.map((action, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="text-[oklch(0.62_0.19_258)] font-medium flex-shrink-0">
                    {i + 1}.
                  </span>
                  <span className="text-[oklch(0.62_0.010_258)] leading-relaxed">
                    {action}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="/interview/new"
            className="flex-1 py-2.5 px-4 rounded-md bg-[oklch(0.62_0.19_258)] hover:bg-[oklch(0.67_0.19_258)] text-white text-sm font-medium text-center transition-colors duration-150 cursor-pointer"
          >
            Start another mock
          </Link>
          <Link
            href="/dashboard"
            className="flex-1 py-2.5 px-4 rounded-md border border-[oklch(0.25_0.015_258)] text-[oklch(0.62_0.010_258)] text-sm text-center hover:border-[oklch(0.35_0.018_258)] hover:text-[oklch(0.93_0.005_258)] transition-colors duration-150 cursor-pointer"
          >
            View dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
