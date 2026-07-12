"use client"

import { useState } from "react"
import Link from "next/link"
import { Zap, ChevronRight, Search } from "lucide-react"
import { motion } from "framer-motion"
import { FadeUp, StaggerList, StaggerItem } from "@/components/motion"

type Drill = {
  id: string
  title: string
  skillFocus: string
  difficulty: string
  estimatedMinutes: number
  timesAttempted: number
  userAttempts: number
}

const DIFF_COLORS: Record<string, string> = {
  easy: "text-[oklch(0.62_0.15_158)] bg-[oklch(0.14_0.05_158)] border-[oklch(0.28_0.08_158)]",
  medium: "text-[oklch(0.72_0.15_78)] bg-[oklch(0.16_0.05_78)] border-[oklch(0.30_0.08_78)]",
  hard: "text-[oklch(0.60_0.18_22)] bg-[oklch(0.16_0.05_22)] border-[oklch(0.28_0.08_22)]",
}

const SKILL_LABELS: Record<string, string> = {
  structure: "Structure",
  hypothesis: "Hypothesis",
  quantitative: "Quantitative",
  business_judgment: "Business Judgment",
  synthesis: "Synthesis",
  communication: "Communication",
  confidence: "Confidence",
}

const SKILLS = Object.keys(SKILL_LABELS)
const DIFFICULTIES = ["easy", "medium", "hard"]

export default function DrillsClient({ drills }: { drills: Drill[] }) {
  const [search, setSearch] = useState("")
  const [skill, setSkill] = useState("all")
  const [diff, setDiff] = useState("all")

  const filtered = drills.filter((d) => {
    if (skill !== "all" && d.skillFocus !== skill) return false
    if (diff !== "all" && d.difficulty !== diff) return false
    if (search && !d.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="min-h-screen bg-bg">
      {/* Top nav */}
      <nav className="border-b border-border-subtle bg-surface sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-brand flex items-center justify-center">
              <span className="text-[oklch(0.10_0.012_148)] text-[9px] font-bold">CF</span>
            </div>
            <span className="text-ink font-semibold text-sm">Drill Library</span>
          </div>
          <Link href="/dashboard" className="text-ink-muted text-xs hover:text-ink transition-colors">← Dashboard</Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <FadeUp className="mb-6">
          <h1 className="text-ink text-xl font-bold mb-1">Practice Drills</h1>
          <p className="text-ink-muted text-sm">{drills.length} drills across 7 skill dimensions.</p>
        </FadeUp>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faint" />
            <input
              type="text"
              placeholder="Search drills…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg border border-border-subtle bg-surface text-ink text-xs placeholder:text-ink-faint focus:outline-none focus:border-brand-muted w-44"
            />
          </div>

          <select
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-border-subtle bg-surface text-ink text-xs focus:outline-none focus:border-brand-muted cursor-pointer"
          >
            <option value="all">All skills</option>
            {SKILLS.map((s) => <option key={s} value={s}>{SKILL_LABELS[s]}</option>)}
          </select>

          <div className="flex items-center gap-1">
            {["all", ...DIFFICULTIES].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDiff(d)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer capitalize ${
                  diff === d
                    ? "bg-brand-subtle text-brand border border-brand-muted"
                    : "border border-border-subtle text-ink-muted hover:border-border-strong"
                }`}
              >
                {d === "all" ? "All levels" : d}
              </button>
            ))}
          </div>

          {(skill !== "all" || diff !== "all" || search) && (
            <button
              type="button"
              onClick={() => { setSkill("all"); setDiff("all"); setSearch("") }}
              className="text-ink-faint text-xs hover:text-ink transition-colors cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <p className="text-ink-faint text-sm">No drills match your filters.</p>
        ) : (
          <StaggerList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((d) => (
              <StaggerItem key={d.id}>
              <motion.div whileHover={{ y: -3, transition: { duration: 0.18 } }} whileTap={{ scale: 0.98 }}>
              <Link
                href={`/drills/${d.id}`}
                className="bg-surface border border-border-subtle rounded-xl p-4 hover:border-brand-muted transition-colors group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-ink text-sm font-medium leading-snug">{d.title}</p>
                    <ChevronRight className="w-4 h-4 text-ink-faint group-hover:text-brand flex-shrink-0 transition-colors mt-0.5" />
                  </div>
                  <p className="text-ink-faint text-xs capitalize mb-3">{SKILL_LABELS[d.skillFocus] ?? d.skillFocus}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${DIFF_COLORS[d.difficulty] ?? "text-ink-muted border-border-subtle"}`}>
                      {d.difficulty}
                    </span>
                    <span className="text-ink-faint text-xs">{d.estimatedMinutes}min</span>
                  </div>
                  <div className="flex items-center gap-1 text-ink-faint text-xs">
                    <Zap className="w-3 h-3" />
                    {d.userAttempts > 0 ? `${d.userAttempts}×` : "New"}
                  </div>
                </div>
              </Link>
              </motion.div>
              </StaggerItem>
            ))}
          </StaggerList>
        )}
      </main>
    </div>
  )
}
