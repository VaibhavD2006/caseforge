"use client"

import { useState } from "react"
import Link from "next/link"
import { Trophy, Settings, Info } from "lucide-react"
import { FadeUp, StaggerList, StaggerItem } from "@/components/motion"
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable"
import { UserRankSummary } from "@/components/leaderboard/UserRankSummary"

type Movement = { delta: number; direction: "up" | "down" | "same" | "new" }

type LeaderboardEntry = {
  userId: string
  displayName: string
  schoolName: string | null
  showSchool: boolean
  showExactScore: boolean
  tier: string
  leaderboardScore: number
  rank: number
  movement: Movement
  eligibleSessionCount: number
}

type UserContext = {
  rank: number | null
  percentile: number | null
  leaderboardScore: number
  eligibleSessionCount: number
  isEligible: boolean
  movement: Movement
  nextRankScore: number | null
}

type Props = {
  board: LeaderboardEntry[]
  userContext: UserContext
  isOptedIn: boolean
  currentUserId: string
}

const TABS = [
  { id: "overall", label: "Overall" },
  { id: "improvers", label: "Biggest Improvers" },
] as const

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/interview/new", label: "Interview" },
  { href: "/drills", label: "Drills" },
  { href: "/goals", label: "Goals" },
  { href: "/analytics", label: "Analytics" },
  { href: "/history", label: "History" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/settings", label: "Settings" },
]

export default function LeaderboardClient({ board, userContext, isOptedIn, currentUserId }: Props) {
  const [activeTab, setActiveTab] = useState<"overall" | "improvers">("overall")
  const [showOptInBanner, setShowOptInBanner] = useState(!isOptedIn)

  // ponytail: simple proxy sort for improvers; replace with dedicated segment query when needed
  const displayBoard = activeTab === "overall"
    ? board
    : [...board].sort((a, b) => {
        const aImprove = a.movement.direction === "up" ? a.movement.delta : -a.movement.delta
        const bImprove = b.movement.direction === "up" ? b.movement.delta : -b.movement.delta
        return bImprove - aImprove
      })

  return (
    <div className="min-h-screen bg-bg">
      {/* Nav */}
      <nav className="border-b border-border-subtle bg-surface sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-brand flex items-center justify-center">
                <span className="text-[oklch(0.10_0.012_148)] text-[10px] font-bold">CF</span>
              </div>
              <span className="text-ink font-semibold text-sm">CaseForge</span>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm transition-colors ${
                    item.href === "/leaderboard"
                      ? "text-brand font-medium"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <Link
            href="/interview/new"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand hover:bg-brand-hover text-[oklch(0.10_0.012_148)] text-xs font-semibold transition-colors"
          >
            New Interview
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <FadeUp className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-5 h-5 text-brand" />
                <h1 className="text-ink text-2xl font-bold">Leaderboard</h1>
              </div>
              <p className="text-ink-muted text-sm max-w-lg">
                Ranked by skill quality, improvement velocity, and consistency — not session count.
                Minimum 3 evaluated sessions required to appear.
              </p>
            </div>
            <Link
              href="/settings"
              className="flex items-center gap-1.5 text-ink-muted hover:text-ink text-xs transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              Settings
            </Link>
          </div>
        </FadeUp>

        {/* Opt-in banner */}
        {showOptInBanner && (
          <FadeUp className="mb-6">
            <div className="bg-[oklch(0.14_0.05_148)] border border-[oklch(0.25_0.08_148)] rounded-xl p-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-ink text-sm font-medium mb-0.5">You&apos;re not on the leaderboard yet</p>
                  <p className="text-ink-muted text-xs">
                    Opt in from Settings to appear. You can use an alias and control what information is shown.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  href="/settings"
                  className="text-xs font-semibold text-brand hover:text-brand-hover transition-colors"
                >
                  Join leaderboard
                </Link>
                <button
                  onClick={() => setShowOptInBanner(false)}
                  className="text-ink-faint text-xs hover:text-ink-muted transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          </FadeUp>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main leaderboard */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 bg-surface border border-border-subtle rounded-lg mb-4 w-fit">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? "bg-brand text-[oklch(0.10_0.012_148)]"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="bg-surface border border-border-subtle rounded-xl p-4">
              <LeaderboardTable
                entries={displayBoard as Parameters<typeof LeaderboardTable>[0]["entries"]}
                currentUserId={currentUserId}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <UserRankSummary
              rank={userContext.rank}
              percentile={userContext.percentile}
              leaderboardScore={userContext.leaderboardScore}
              eligibleSessionCount={userContext.eligibleSessionCount}
              isEligible={userContext.isEligible}
              movement={userContext.movement}
              nextRankScore={userContext.nextRankScore}
            />

            {/* How scoring works */}
            <div className="bg-surface border border-border-subtle rounded-xl p-5">
              <p className="text-ink text-sm font-semibold mb-3">How ranking works</p>
              <div className="space-y-2.5">
                {[
                  { label: "Skill quality", pct: 65, desc: "Time-decay weighted avg score" },
                  { label: "Improvement", pct: 20, desc: "Score trend over last 10 sessions" },
                  { label: "Consistency", pct: 15, desc: "Low variance = higher score" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-ink-muted text-xs">{item.label}</span>
                      <span className="text-brand text-xs font-semibold">{item.pct}%</span>
                    </div>
                    <div className="h-1 bg-border-subtle rounded-full overflow-hidden">
                      <div className="h-1 bg-brand rounded-full" style={{ width: `${item.pct}%` }} />
                    </div>
                    <p className="text-ink-faint text-[10px] mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-border-subtle">
                <p className="text-ink-faint text-[10px] leading-relaxed">
                  Anti-gaming: max 3 sessions/day count · only evaluated sessions · 90-day score decay
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
