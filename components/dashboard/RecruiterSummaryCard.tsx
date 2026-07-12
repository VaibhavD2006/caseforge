"use client"

import { MessageSquareQuote } from "lucide-react"

type Props = { summary: string | null }

export function RecruiterSummaryCard({ summary }: Props) {
  return (
    <div className="bg-surface border border-border-subtle rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquareQuote className="w-4 h-4 text-brand" />
        <p className="text-ink text-sm font-semibold">Evaluator Note</p>
        <span className="text-ink-faint text-xs ml-auto">Latest session</span>
      </div>
      {summary ? (
        <blockquote className="text-ink-muted text-sm leading-relaxed italic border-l-2 border-brand-muted pl-3">
          {summary}
        </blockquote>
      ) : (
        <p className="text-ink-faint text-sm">
          Complete and evaluate an interview to see your recruiter-style feedback note here.
        </p>
      )}
    </div>
  )
}
