"use client"

import { TierBadge } from "./TierBadge"
import { RankMovementPill } from "./RankMovementPill"
import { GraduationCap } from "lucide-react"

type Movement = { delta: number; direction: "up" | "down" | "same" | "new" }

type LeaderboardEntry = {
  userId: string
  displayName: string
  schoolName: string | null
  showSchool: boolean
  showExactScore: boolean
  tier: "bronze" | "silver" | "gold" | "emerald"
  leaderboardScore: number
  rank: number
  movement: Movement
  eligibleSessionCount: number
}

type Props = {
  entries: LeaderboardEntry[]
  currentUserId?: string | null
}

const RANK_COLORS: Record<number, string> = {
  1: "text-[oklch(0.78_0.15_85)]",
  2: "text-[oklch(0.72_0.04_265)]",
  3: "text-[oklch(0.65_0.12_55)]",
}

export function LeaderboardTable({ entries, currentUserId }: Props) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-ink-muted text-sm">No ranked candidates yet.</p>
        <p className="text-ink-faint text-xs mt-1">Complete 3+ evaluated sessions and opt in to appear.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-subtle">
            <th className="text-left text-ink-faint text-xs font-medium uppercase tracking-wider pb-3 pl-2 w-12">#</th>
            <th className="text-left text-ink-faint text-xs font-medium uppercase tracking-wider pb-3">Candidate</th>
            <th className="text-left text-ink-faint text-xs font-medium uppercase tracking-wider pb-3 hidden sm:table-cell">Tier</th>
            <th className="text-right text-ink-faint text-xs font-medium uppercase tracking-wider pb-3">Score</th>
            <th className="text-right text-ink-faint text-xs font-medium uppercase tracking-wider pb-3 hidden sm:table-cell">Sessions</th>
            <th className="text-right text-ink-faint text-xs font-medium uppercase tracking-wider pb-3 pr-2">Move</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {entries.map((entry) => {
            const isCurrentUser = entry.userId === currentUserId
            const rankColor = RANK_COLORS[entry.rank] ?? "text-ink-muted"
            const score = entry.showExactScore
              ? entry.leaderboardScore.toFixed(2)
              : entry.leaderboardScore.toFixed(1)
            return (
              <tr
                key={entry.userId}
                className={`transition-colors ${
                  isCurrentUser
                    ? "bg-[oklch(0.14_0.05_148)] border-l-2 border-l-brand"
                    : "hover:bg-surface"
                }`}
              >
                <td className={`py-3 pl-2 font-bold tabular-nums ${rankColor}`}>
                  {entry.rank}
                </td>
                <td className="py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className={`font-semibold ${isCurrentUser ? "text-brand" : "text-ink"}`}>
                      {entry.displayName}
                      {isCurrentUser && <span className="text-[10px] text-brand ml-1.5 font-normal">You</span>}
                    </span>
                    {entry.showSchool && entry.schoolName && (
                      <span className="text-ink-faint text-xs flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" />
                        {entry.schoolName}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 hidden sm:table-cell">
                  <TierBadge tier={entry.tier} />
                </td>
                <td className="py-3 text-right font-bold tabular-nums text-ink">
                  {score}
                </td>
                <td className="py-3 text-right text-ink-muted text-xs hidden sm:table-cell">
                  {entry.eligibleSessionCount}
                </td>
                <td className="py-3 pr-2 text-right">
                  <RankMovementPill movement={entry.movement} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
