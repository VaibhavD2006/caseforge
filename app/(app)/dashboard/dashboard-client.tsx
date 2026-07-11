"use client"

import Link from "next/link"
import { PlayCircle, BarChart2 } from "lucide-react"
import { motion } from "framer-motion"
import { FadeUp, StaggerList, StaggerItem } from "@/components/motion"
import { ReadinessCard } from "@/components/dashboard/ReadinessCard"
import { TrendChart } from "@/components/dashboard/TrendChart"
import { DimensionBreakdown } from "@/components/dashboard/DimensionBreakdown"
import { RecentInterviews } from "@/components/dashboard/RecentInterviews"
import { WeaknessCard } from "@/components/dashboard/WeaknessCard"
import { DrillsWidget } from "@/components/dashboard/DrillsWidget"
import { GoalsWidget } from "@/components/dashboard/GoalsWidget"
import { RecruiterSummaryCard } from "@/components/dashboard/RecruiterSummaryCard"
import { FirmReadinessWidget } from "@/components/dashboard/FirmReadinessWidget"

type Session = {
  id: string
  firmStyle: string
  interviewType: string
  status: string
  createdAt: Date
  score?: number | null
}

type Weakness = {
  id: string
  tagLabel: string
  dimension: string
  occurrenceCount: number
  isPersistent: boolean
}

type Goal = {
  id: string
  title: string
  goalType: string
  targetValue: string | null
  currentValue: string | null
  targetDate: string | null
  status: string
}

type Drill = {
  id: string
  title: string
  skillFocus: string
  difficulty: string
  estimatedMinutes: number
}

type Props = {
  userName: string | null
  sessions: Session[]
  weaknesses: Weakness[]
  avgScore: number
  evaluatedSessions: number
  avgDimensionScores: Record<string, number>
  readinessLevel: string
  tier: "bronze" | "silver" | "gold" | "emerald"
  latestRecruiterSummary: string | null
  trendData: { label: string; score: number }[]
  goals: Goal[]
  recommendedDrills: Drill[]
  targetFirms: string[]
}

const MODE_LABELS: Record<string, string> = {
  case: "Full Case",
  market_sizing: "Market Sizing",
  behavioral: "Behavioral",
  drill: "Drill",
  case_math: "Case Math",
  pressure_round: "Pressure Round",
}

export default function DashboardClient({
  userName,
  sessions,
  weaknesses,
  avgScore,
  evaluatedSessions,
  avgDimensionScores,
  readinessLevel,
  tier,
  latestRecruiterSummary,
  trendData,
  goals,
  recommendedDrills,
  targetFirms,
}: Props) {
  const firstName = userName?.split(" ")[0] ?? "there"

  const dimEntries = Object.entries(avgDimensionScores)
  const strongest = [...dimEntries].sort((a, b) => b[1] - a[1])[0]
  const weakest = [...dimEntries].sort((a, b) => a[1] - b[1])[0]

  const modeCounts: Record<string, number> = {}
  for (const s of sessions) {
    modeCounts[s.interviewType] = (modeCounts[s.interviewType] ?? 0) + 1
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Top nav */}
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
              {[
                { href: "/dashboard", label: "Dashboard" },
                { href: "/interview/new", label: "Interview" },
                { href: "/drills", label: "Drills" },
                { href: "/goals", label: "Goals" },
                { href: "/analytics", label: "Analytics" },
                { href: "/history", label: "History" },
                { href: "/settings", label: "Settings" },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="text-ink-muted text-sm hover:text-ink transition-colors">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <Link
            href="/interview/new"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand hover:bg-brand-hover text-[oklch(0.10_0.012_148)] text-xs font-semibold transition-colors"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            New Interview
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <FadeUp className="mb-8">
          <h1 className="text-ink text-2xl font-bold mb-1">Welcome back, {firstName}</h1>
          <p className="text-ink-muted text-sm">
            {evaluatedSessions === 0
              ? "Start your first interview to see your performance dashboard."
              : `${evaluatedSessions} session${evaluatedSessions !== 1 ? "s" : ""} evaluated — keep going.`}
          </p>
        </FadeUp>

        {/* Row 1: Hero metrics */}
        <StaggerList className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <StaggerItem>
            <ReadinessCard avgScore={avgScore} evaluatedSessions={evaluatedSessions} readinessLevel={readinessLevel} tier={tier} />
          </StaggerItem>

          <StaggerItem>
            <motion.div className="bg-surface border border-border-subtle rounded-xl p-5 h-full" whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
              <p className="text-ink-muted text-xs uppercase tracking-wider mb-2">Strongest Dimension</p>
              {strongest ? (
                <>
                  <p className="text-ink text-lg font-bold capitalize mb-0.5">{strongest[0].replace(/_/g, " ")}</p>
                  <p className="text-brand text-sm font-semibold">{strongest[1].toFixed(1)}/10</p>
                  <p className="text-ink-faint text-xs mt-2">Your most consistent area.</p>
                </>
              ) : (
                <p className="text-ink-faint text-sm mt-2">No data yet.</p>
              )}
            </motion.div>
          </StaggerItem>

          <StaggerItem>
            <motion.div className="bg-surface border border-border-subtle rounded-xl p-5 h-full" whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
              <p className="text-ink-muted text-xs uppercase tracking-wider mb-2">Focus Area</p>
              {weakest ? (
                <>
                  <p className="text-ink text-lg font-bold capitalize mb-0.5">{weakest[0].replace(/_/g, " ")}</p>
                  <p className="text-[oklch(0.60_0.18_22)] text-sm font-semibold">{weakest[1].toFixed(1)}/10</p>
                  <Link href="/drills" className="text-brand text-xs mt-2 block hover:text-brand-hover transition-colors">Practice drills →</Link>
                </>
              ) : (
                <p className="text-ink-faint text-sm mt-2">No data yet.</p>
              )}
            </motion.div>
          </StaggerItem>
        </StaggerList>

        {/* Row 2: Trend + Dimension breakdown */}
        <FadeUp delay={0.05} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <TrendChart data={trendData} />
          <DimensionBreakdown scores={avgDimensionScores} />
        </FadeUp>

        {/* Row 3: Firm Readiness */}
        <FadeUp delay={0.05} className="mb-4">
          <FirmReadinessWidget avgDimensions={avgDimensionScores} targetFirms={targetFirms} />
        </FadeUp>

        {/* Row 4: Activity widgets */}
        <StaggerList className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <StaggerItem><RecentInterviews sessions={sessions} /></StaggerItem>
          <StaggerItem><GoalsWidget goals={goals} /></StaggerItem>
          <StaggerItem><DrillsWidget drills={recommendedDrills} /></StaggerItem>
        </StaggerList>

        {/* Row 5: Weakness + Recruiter summary */}
        <FadeUp delay={0.05} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <WeaknessCard weaknesses={weaknesses} />
          <RecruiterSummaryCard summary={latestRecruiterSummary} />
        </FadeUp>

        {/* Row 6: Mode usage + CTA */}
        <FadeUp delay={0.1} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-surface border border-border-subtle rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-4 h-4 text-brand" />
              <p className="text-ink text-sm font-semibold">Practice Mix</p>
            </div>
            {Object.keys(modeCounts).length === 0 ? (
              <p className="text-ink-faint text-sm">No sessions yet.</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(modeCounts).map(([mode, count]) => (
                  <div key={mode} className="flex items-center justify-between">
                    <span className="text-ink-muted text-xs">{MODE_LABELS[mode] ?? mode}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-border-subtle rounded-full overflow-hidden">
                        <div className="h-1.5 bg-brand rounded-full" style={{ width: `${(count / sessions.length) * 100}%` }} />
                      </div>
                      <span className="text-ink-faint text-xs w-4 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-brand-subtle border border-brand-muted rounded-xl p-5 flex flex-col justify-between">
            <div>
              <p className="text-brand text-xs font-semibold uppercase tracking-wider mb-2">Ready to practice?</p>
              <p className="text-ink text-base font-semibold mb-1">
                {evaluatedSessions === 0 ? "Start your first mock interview" : "Keep building momentum"}
              </p>
              <p className="text-ink-muted text-sm">
                {evaluatedSessions === 0
                  ? "Pick a firm style and case type to begin."
                  : `${sessions.length} session${sessions.length !== 1 ? "s" : ""} completed total.`}
              </p>
            </div>
            <Link
              href="/interview/new"
              className="mt-4 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand hover:bg-brand-hover text-[oklch(0.10_0.012_148)] text-sm font-semibold transition-colors"
            >
              <PlayCircle className="w-4 h-4" />
              Start Interview
            </Link>
          </div>
        </FadeUp>
      </main>
    </div>
  )
}
