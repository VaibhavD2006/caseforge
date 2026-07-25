"use client"

import Link from "next/link"
import { Trophy, TrendingUp } from "lucide-react"
import { RankMovementPill } from "./RankMovementPill"

type Movement = { delta: number; direction: "up" | "down" | "same" | "new" }

type Props = {
  rank: number | null
  percentile: number | null
  leaderboardScore: number
  eligibleSessionCount: number
  isEligible: boolean
  movement: Movement
  nextRankScore: number | null
  minSessions?: number
}

export function UserRankSummary({
  rank,
  percentile,
  leaderboardScore,
  eligibleSessionCount,
  isEligible,
  movement,
  nextRankScore,
  minSessions = 3,
}: Props) {
  if (!isEligible) {
    const needed = Math.max(0, minSessions - eligibleSessionCount)
    return (
      <div className="bg-surface border border-border-subtle rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-4 h-4 text-ink-faint" />
          <p className="text-ink text-sm font-semibold">Your Rank</p>
        </div>
        <p className="text-ink-muted text-sm">
          Complete {needed} more evaluated session{needed !== 1 ? "s" : ""} to appear on the leaderboard.
        </p>
        <Link href="/interview/new" className="text-brand text-xs mt-2 block hover:text-brand-hover transition-colors">
          Start an interview →
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-[oklch(0.12_0.04_148)] border border-[oklch(0.25_0.08_148)] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-brand" />
          <p className="text-brand text-sm font-semibold">Your Rank</p>
        </div>
        <RankMovementPill movement={movement} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-ink-faint text-xs mb-0.5">Rank</p>
          <p className="text-ink text-2xl font-bold tabular-nums">
            {rank !== null ? `#${rank}` : "—"}
          </p>
        </div>
        <div>
          <p className="text-ink-faint text-xs mb-0.5">Percentile</p>
          <p className="text-ink text-2xl font-bold tabular-nums">
            {percentile !== null ? `${percentile}%` : "—"}
          </p>
        </div>
        <div>
          <p className="text-ink-faint text-xs mb-0.5">Score</p>
          <p className="text-brand text-2xl font-bold tabular-nums">
            {leaderboardScore.toFixed(1)}
          </p>
        </div>
      </div>

      {nextRankScore !== null && rank !== null && rank > 1 && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-ink-muted">
          <TrendingUp className="w-3 h-3 text-brand" />
          <span>
            Score <span className="text-brand font-semibold">{nextRankScore.toFixed(1)}</span> to reach #{rank - 1}
          </span>
        </div>
      )}
    </div>
  )
}
