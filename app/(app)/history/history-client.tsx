"use client"

import { useState } from "react"
import Link from "next/link"
import { History } from "lucide-react"

type SessionRow = {
  id: string
  firmStyle: string
  interviewType: string
  status: string
  createdAt: string
  score: number | null
}

const MODE_LABELS: Record<string, string> = {
  case: "Case",
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

function scoreColor(s: number) {
  return s >= 7.5 ? "text-[oklch(0.62_0.15_158)]" : s >= 5 ? "text-[oklch(0.72_0.15_78)]" : "text-[oklch(0.60_0.18_22)]"
}

export default function HistoryClient({ sessions }: { sessions: SessionRow[] }) {
  const [mode, setMode] = useState("all")
  const [search, setSearch] = useState("")

  const filtered = sessions.filter((s) => {
    if (mode !== "all" && s.interviewType !== mode) return false
    if (search) {
      const q = search.toLowerCase()
      if (!s.firmStyle.includes(q) && !s.interviewType.includes(q) && !s.id.slice(0, 8).includes(q)) return false
    }
    return true
  })

  const modes = [...new Set(sessions.map((s) => s.interviewType))]

  return (
    <div className="min-h-screen bg-bg">
      <nav className="border-b border-border-subtle bg-surface sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-brand" />
            <span className="text-ink font-semibold text-sm">Session History</span>
          </div>
          <Link href="/dashboard" className="text-ink-muted text-xs hover:text-ink transition-colors">← Dashboard</Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-ink text-xl font-bold mb-1">Interview History</h1>
          <p className="text-ink-muted text-sm">{sessions.length} total session{sessions.length !== 1 ? "s" : ""}.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <input
            type="text"
            placeholder="Search by firm, mode, ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-border-subtle bg-surface text-ink text-xs placeholder:text-ink-faint focus:outline-none focus:border-brand-muted w-48"
          />
          <div className="flex gap-1">
            {["all", ...modes].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer capitalize ${
                  mode === m
                    ? "bg-brand-subtle text-brand border border-brand-muted"
                    : "border border-border-subtle text-ink-muted hover:border-border-strong"
                }`}
              >
                {m === "all" ? "All modes" : (MODE_LABELS[m] ?? m)}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-surface border border-border-subtle rounded-xl p-8 text-center">
            <p className="text-ink-faint text-sm">No sessions match your filters.</p>
          </div>
        ) : (
          <div className="bg-surface border border-border-subtle rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left text-ink-faint text-xs font-medium px-4 py-3">Date</th>
                  <th className="text-left text-ink-faint text-xs font-medium px-4 py-3">Mode</th>
                  <th className="text-left text-ink-faint text-xs font-medium px-4 py-3">Firm</th>
                  <th className="text-left text-ink-faint text-xs font-medium px-4 py-3">Status</th>
                  <th className="text-right text-ink-faint text-xs font-medium px-4 py-3">Score</th>
                  <th className="text-right text-ink-faint text-xs font-medium px-4 py-3">Results</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id} className={`border-b border-border-subtle last:border-0 hover:bg-surface-raised transition-colors ${i % 2 === 0 ? "" : "bg-surface-raised/50"}`}>
                    <td className="px-4 py-3 text-ink-muted text-xs tabular-nums">
                      {new Date(s.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-ink text-xs">{MODE_LABELS[s.interviewType] ?? s.interviewType}</td>
                    <td className="px-4 py-3 text-ink-muted text-xs uppercase">{FIRM_LABELS[s.firmStyle] ?? s.firmStyle}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${
                        s.status === "evaluated"
                          ? "border-[oklch(0.28_0.08_158)] text-[oklch(0.62_0.15_158)] bg-[oklch(0.12_0.04_158)]"
                          : s.status === "ended"
                          ? "border-[oklch(0.30_0.08_78)] text-[oklch(0.72_0.15_78)] bg-[oklch(0.14_0.04_78)]"
                          : "border-border-subtle text-ink-faint"
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {s.score !== null ? (
                        <span className={`text-sm font-semibold tabular-nums ${scoreColor(s.score)}`}>{s.score.toFixed(1)}</span>
                      ) : (
                        <span className="text-ink-faint text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/feedback/${s.id}`} className="text-brand text-xs hover:text-brand-hover transition-colors">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
