"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Clock, Send, ChevronDown, ChevronUp } from "lucide-react"

type DrillProps = {
  id: string
  title: string
  prompt: string
  skillFocus: string
  difficulty: string
  estimatedMinutes: number
  expectedTraits: string[]
}

type PastAttempt = {
  score: number
  feedback: string
  improvementNote: string
  completedAt: Date
}

type Result = {
  score: number
  feedback: string
  improvementNote: string
}

const DIFF_COLORS: Record<string, string> = {
  easy: "text-[oklch(0.62_0.15_158)] bg-[oklch(0.14_0.05_158)] border-[oklch(0.28_0.08_158)]",
  medium: "text-[oklch(0.72_0.15_78)] bg-[oklch(0.16_0.05_78)] border-[oklch(0.30_0.08_78)]",
  hard: "text-[oklch(0.60_0.18_22)] bg-[oklch(0.16_0.05_22)] border-[oklch(0.28_0.08_22)]",
}

function scoreColor(s: number) {
  return s >= 7.5 ? "text-[oklch(0.62_0.15_158)]" : s >= 5 ? "text-[oklch(0.72_0.15_78)]" : "text-[oklch(0.60_0.18_22)]"
}

function Timer({ estimatedMinutes }: { estimatedMinutes: number }) {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [])
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0")
  const ss = String(seconds % 60).padStart(2, "0")
  const over = seconds > estimatedMinutes * 60
  return (
    <div className={`flex items-center gap-1 text-xs font-mono ${over ? "text-[oklch(0.60_0.18_22)]" : "text-ink-muted"}`}>
      <Clock className="w-3 h-3" />
      {mm}:{ss}
    </div>
  )
}

export default function DrillAttemptClient({ drill, pastAttempts }: { drill: DrillProps; pastAttempts: PastAttempt[] }) {
  const [response, setResponse] = useState("")
  const [result, setResult] = useState<Result | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPast, setShowPast] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function handleSubmit() {
    if (!response.trim() || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/drills/${drill.id}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: response.trim() }),
      })
      if (!res.ok) throw new Error()
      const data: Result = await res.json()
      setResult(data)
    } catch {
      setError("Evaluation failed. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Nav */}
      <nav className="border-b border-border-subtle bg-surface sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
          <Link href="/drills" className="text-ink-muted text-xs hover:text-ink transition-colors">← Drill Library</Link>
          <Timer estimatedMinutes={drill.estimatedMinutes} />
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Drill brief */}
          <div>
            <div className="bg-surface border border-border-subtle rounded-xl p-5 mb-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h1 className="text-ink text-base font-bold leading-snug">{drill.title}</h1>
                <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${DIFF_COLORS[drill.difficulty] ?? ""}`}>
                  {drill.difficulty}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-4 text-ink-faint text-xs">
                <span className="capitalize">{drill.skillFocus.replace("_", " ")}</span>
                <span>·</span>
                <span>{drill.estimatedMinutes} min</span>
              </div>
              <p className="text-ink text-sm leading-relaxed whitespace-pre-wrap">{drill.prompt}</p>
            </div>

            {drill.expectedTraits.length > 0 && (
              <div className="bg-brand-subtle border border-brand-muted rounded-xl p-4">
                <p className="text-brand text-xs font-semibold uppercase tracking-wider mb-2">Strong answers include</p>
                <ul className="space-y-1">
                  {drill.expectedTraits.map((t, i) => (
                    <li key={i} className="text-ink-muted text-xs flex gap-2">
                      <span className="text-brand flex-shrink-0">·</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {pastAttempts.length > 0 && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setShowPast((v) => !v)}
                  className="flex items-center gap-1 text-ink-muted text-xs hover:text-ink transition-colors cursor-pointer"
                >
                  {showPast ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {showPast ? "Hide" : "Show"} past attempts ({pastAttempts.length})
                </button>
                {showPast && (
                  <div className="mt-2 space-y-2">
                    {pastAttempts.map((a, i) => (
                      <div key={i} className="bg-surface border border-border-subtle rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-semibold ${scoreColor(a.score)}`}>{a.score}/10</span>
                          <span className="text-ink-faint text-xs">{new Date(a.completedAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-ink-muted text-xs leading-relaxed">{a.feedback}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Response area */}
          <div>
            {!result ? (
              <div className="bg-surface border border-border-subtle rounded-xl p-5">
                <p className="text-ink text-sm font-semibold mb-3">Your response</p>
                <textarea
                  ref={textareaRef}
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Type your structured response here…"
                  rows={12}
                  className="w-full resize-none rounded-lg border border-border-subtle bg-surface-raised text-ink text-sm px-3 py-2.5 placeholder:text-ink-faint focus:outline-none focus:border-brand-muted focus:ring-1 focus:ring-brand-muted transition-colors"
                />
                {error && <p className="text-[oklch(0.60_0.18_22)] text-xs mt-2">{error}</p>}
                <button
                  type="button"
                  onClick={() => void handleSubmit()}
                  disabled={!response.trim() || submitting}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand hover:bg-brand-hover text-[oklch(0.10_0.012_148)] text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? "Evaluating…" : "Submit for feedback"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-surface border border-border-subtle rounded-xl p-5 text-center">
                  <p className="text-ink-muted text-xs uppercase tracking-wider mb-2">Score</p>
                  <p className={`text-5xl font-bold tabular-nums mb-1 ${scoreColor(result.score)}`}>{result.score}</p>
                  <p className="text-ink-faint text-xs">out of 10</p>
                </div>

                <div className="bg-surface border border-border-subtle rounded-xl p-5">
                  <p className="text-ink text-sm font-semibold mb-2">Feedback</p>
                  <p className="text-ink-muted text-sm leading-relaxed">{result.feedback}</p>
                </div>

                <div className="bg-brand-subtle border border-brand-muted rounded-xl p-4">
                  <p className="text-brand text-xs font-semibold uppercase tracking-wider mb-1">Next time</p>
                  <p className="text-ink-muted text-sm leading-relaxed">{result.improvementNote}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setResult(null); setResponse("") }}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-border-subtle text-ink-muted text-sm hover:border-border-strong hover:text-ink transition-colors cursor-pointer"
                  >
                    Try again
                  </button>
                  <Link href="/drills" className="flex-1 py-2.5 px-4 rounded-xl bg-brand hover:bg-brand-hover text-[oklch(0.10_0.012_148)] text-sm font-semibold text-center transition-colors cursor-pointer">
                    More drills
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
