"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

const MODE_LABELS: Record<string, string> = {
  case: "Full Case",
  market_sizing: "Market Sizing",
  behavioral: "Behavioral",
  drill: "Drill",
}

const FIRM_LABELS: Record<string, string> = {
  mbb: "MBB",
  big4: "Big Four",
  boutique: "Boutique",
  generic: "General",
}

type Session = {
  id: string
  firmStyle: string
  interviewType: string
  status: string
  createdAt: Date
  score?: number | null
}

type Props = { sessions: Session[] }

export function RecentInterviews({ sessions }: Props) {
  if (sessions.length === 0) {
    return (
      <div className="bg-surface border border-border-subtle rounded-xl p-5">
        <p className="text-ink text-sm font-semibold mb-3">Recent Sessions</p>
        <p className="text-ink-faint text-sm mb-4">No interviews yet.</p>
        <Link
          href="/interview/new"
          className="inline-flex items-center gap-1.5 text-brand text-sm font-medium hover:text-brand-hover transition-colors"
        >
          Start your first mock <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border-subtle rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-ink text-sm font-semibold">Recent Sessions</p>
        <Link href="/history" className="text-ink-muted text-xs hover:text-ink transition-colors">View all</Link>
      </div>
      <div className="space-y-2">
        {sessions.slice(0, 5).map((s) => (
          <div key={s.id} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-ink-faint text-xs bg-surface-raised px-1.5 py-0.5 rounded flex-shrink-0">
                {FIRM_LABELS[s.firmStyle] ?? s.firmStyle}
              </span>
              <span className="text-ink-muted text-xs truncate">{MODE_LABELS[s.interviewType] ?? s.interviewType}</span>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 ml-2">
              {s.score != null && (
                <span className={`text-xs font-semibold tabular-nums ${s.score >= 7.5 ? "text-[oklch(0.62_0.15_158)]" : s.score >= 5 ? "text-brand" : "text-[oklch(0.60_0.18_22)]"}`}>
                  {s.score.toFixed(1)}
                </span>
              )}
              {s.status === "evaluated" && (
                <Link href={`/feedback/${s.id}`} className="text-brand text-xs hover:text-brand-hover transition-colors">
                  View →
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-border-subtle">
        <Link
          href="/interview/new"
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-brand-subtle border border-brand-muted text-brand text-sm font-medium hover:bg-brand-muted transition-colors"
        >
          New interview <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
