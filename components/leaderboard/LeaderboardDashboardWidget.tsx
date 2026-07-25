"use client"

import Link from "next/link"
import { Trophy, TrendingUp, TrendingDown } from "lucide-react"

type Movement = { delta: number; direction: "up" | "down" | "same" | "new" }

type Props = {
  rank: number | null
  percentile: number | null
  movement: Movement
  isEligible: boolean
  eligibleSessionCount: number
}

export function LeaderboardDashboardWidget({ rank, percentile, movement, isEligible, eligibleSessionCount }: Props) {
  return (
    <div className="bg-surface border border-border-subtle rounded-xl p-5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-4 h-4 text-brand" />
        <p className="text-ink text-sm font-semibold">Leaderboard</p>
      </div>

      {isEligible && rank !== null ? (
        <>
          <div className="flex items-end gap-3 mb-2">
            <div>
              <p className="text-ink-faint text-xs mb-0.5">Global Rank</p>
              <p className="text-ink text-3xl font-bold tabular-nums">#{rank}</p>
            </div>
            {percentile !== null && (
              <p className="text-ink-muted text-sm mb-1">Top {100 - percentile}%</p>
            )}
          </div>
          {movement.direction !== "same" && movement.direction !== "new" && (
            <div className={`flex items-center gap-1 text-xs mb-3 ${movement.direction === "up" ? "text-brand" : "text-[oklch(0.62_0.18_22)]"}`}>
              {movement.direction === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {movement.direction === "up" ? `Up ${movement.delta}` : `Down ${movement.delta}`} this week
            </div>
          )}
          {movement.direction === "new" && (
            <p className="text-brand text-xs mb-3">Just ranked!</p>
          )}
        </>
      ) : (
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-ink-muted text-sm">
            {eligibleSessionCount < 3
              ? `${3 - eligibleSessionCount} more session${3 - eligibleSessionCount !== 1 ? "s" : ""} to rank`
              : "Opt in to see your rank"}
          </p>
        </div>
      )}

      <Link href="/leaderboard" className="text-brand text-xs mt-auto pt-2 hover:text-brand-hover transition-colors">
        View leaderboard →
      </Link>
    </div>
  )
}
