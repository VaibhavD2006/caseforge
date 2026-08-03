"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { AppNav } from "@/components/app-nav"
import { Settings, Check, Trophy } from "lucide-react"

const FIRM_OPTIONS = [
  { value: "mbb", label: "MBB (McKinsey, BCG, Bain)" },
  { value: "big4", label: "Big Four (Deloitte, PwC, EY, KPMG)" },
  { value: "boutique", label: "Boutique Strategy" },
  { value: "generic", label: "General Consulting" },
]

const EXPERIENCE_OPTIONS = [
  { value: "undergrad", label: "Undergraduate" },
  { value: "mba", label: "MBA / Graduate" },
  { value: "professional", label: "Experienced Professional" },
  { value: "career_switcher", label: "Career Switcher" },
]

type Props = {
  profile: {
    targetFirms: string[]
    experienceLevel: string
    interviewDate: string
  }
  user: {
    name: string
    email: string
    image: string | null
  }
  leaderboard: {
    isOptedIn: boolean
    displayName: string
    schoolName: string
    showSchool: boolean
    showExactScore: boolean
  }
}

export default function SettingsClient({ profile, user, leaderboard }: Props) {
  const [targetFirms, setTargetFirms] = useState<string[]>(profile.targetFirms)
  const [experienceLevel, setExperienceLevel] = useState(profile.experienceLevel)
  const [interviewDate, setInterviewDate] = useState(profile.interviewDate)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [lbOptedIn, setLbOptedIn] = useState(leaderboard.isOptedIn)
  const [lbDisplayName, setLbDisplayName] = useState(leaderboard.displayName)
  const [lbSchoolName, setLbSchoolName] = useState(leaderboard.schoolName)
  const [lbShowSchool, setLbShowSchool] = useState(leaderboard.showSchool)
  const [lbShowExactScore, setLbShowExactScore] = useState(leaderboard.showExactScore)
  const [lbSaving, setLbSaving] = useState(false)
  const [lbSaved, setLbSaved] = useState(false)

  async function handleLbSave() {
    setLbSaving(true)
    setLbSaved(false)
    try {
      await fetch("/api/leaderboard/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isOptedIn: lbOptedIn,
          displayName: lbDisplayName || null,
          schoolName: lbSchoolName || null,
          showSchool: lbShowSchool,
          showExactScore: lbShowExactScore,
        }),
      })
      setLbSaved(true)
      setTimeout(() => setLbSaved(false), 3000)
    } finally {
      setLbSaving(false)
    }
  }

  function toggleFirm(value: string) {
    setTargetFirms((prev) =>
      prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value]
    )
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetFirms,
          experienceLevel: experienceLevel || null,
          interviewDate: interviewDate || null,
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <AppNav />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        {/* Account */}
        <div className="bg-surface border border-border-subtle rounded-xl p-5">
          <p className="text-ink text-sm font-semibold mb-4">Account</p>
          <div className="flex items-center gap-3">
            {user.image ? (
              <Image src={user.image} alt={user.name || "Profile"} width={40} height={40} className="rounded-full" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-brand-subtle border border-border-subtle flex items-center justify-center">
                <span className="text-brand text-sm font-bold">{(user.name?.[0] ?? "?").toUpperCase()}</span>
              </div>
            )}
            <div>
              <p className="text-ink text-sm font-medium">{user.name || "No name"}</p>
              <p className="text-ink-muted text-xs">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Target Firms */}
        <div className="bg-surface border border-border-subtle rounded-xl p-5">
          <p className="text-ink text-sm font-semibold mb-1">Target Firms</p>
          <p className="text-ink-muted text-xs mb-4">
            Select all firm types you&apos;re targeting. This affects readiness scoring and recommendations.
          </p>
          <div className="space-y-2">
            {FIRM_OPTIONS.map((opt) => {
              const selected = targetFirms.includes(opt.value)
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleFirm(opt.value)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors cursor-pointer ${
                    selected
                      ? "border-brand bg-brand-subtle"
                      : "border-border-subtle bg-surface hover:border-border-strong"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      selected ? "border-brand bg-brand" : "border-border-strong"
                    }`}
                  >
                    {selected && <Check className="w-3 h-3 text-[oklch(0.10_0.012_148)]" />}
                  </div>
                  <span className={`text-sm ${selected ? "text-ink font-medium" : "text-ink-muted"}`}>
                    {opt.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Experience Level */}
        <div className="bg-surface border border-border-subtle rounded-xl p-5">
          <p className="text-ink text-sm font-semibold mb-1">Experience Level</p>
          <p className="text-ink-muted text-xs mb-4">
            Used to calibrate scoring expectations and drill recommendations.
          </p>
          <div className="space-y-2">
            {EXPERIENCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setExperienceLevel(opt.value)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors cursor-pointer ${
                  experienceLevel === opt.value
                    ? "border-brand bg-brand-subtle"
                    : "border-border-subtle bg-surface hover:border-border-strong"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                    experienceLevel === opt.value ? "border-brand" : "border-border-strong"
                  }`}
                >
                  {experienceLevel === opt.value && (
                    <span className="w-2 h-2 rounded-full bg-brand" />
                  )}
                </span>
                <span
                  className={`text-sm ${
                    experienceLevel === opt.value ? "text-ink font-medium" : "text-ink-muted"
                  }`}
                >
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Interview Date */}
        <div className="bg-surface border border-border-subtle rounded-xl p-5">
          <p className="text-ink text-sm font-semibold mb-1">Target Interview Date</p>
          <p className="text-ink-muted text-xs mb-3">
            Optional. Helps surface urgency in goal recommendations.
          </p>
          <input
            type="date"
            value={interviewDate}
            onChange={(e) => setInterviewDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border-strong bg-surface-raised text-ink text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
          />
        </div>

        {/* Save */}
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand hover:bg-brand-hover text-[oklch(0.10_0.012_148)] text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Saving…" : saved ? "✓ Saved" : "Save changes"}
        </button>

        {/* Leaderboard */}
        <div className="bg-surface border border-border-subtle rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-brand" />
            <p className="text-ink text-sm font-semibold">Leaderboard</p>
          </div>
          <p className="text-ink-muted text-xs mb-4">
            Opt in to appear on the campus leaderboard. Your rank is based on skill quality and improvement — not session count.
          </p>

          {/* Opt-in toggle */}
          <div className="flex items-center justify-between mb-4 p-3 rounded-lg border border-border-subtle">
            <span className="text-ink-muted text-sm">Appear on leaderboard</span>
            <button
              type="button"
              onClick={() => setLbOptedIn((v) => !v)}
              className={`relative w-10 h-5 rounded-full transition-colors ${lbOptedIn ? "bg-brand" : "bg-border-strong"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${lbOptedIn ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
          </div>

          {lbOptedIn && (
            <div className="space-y-3">
              <div>
                <label className="text-ink-muted text-xs mb-1 block">Display name (alias)</label>
                <input
                  type="text"
                  value={lbDisplayName}
                  onChange={(e) => setLbDisplayName(e.target.value)}
                  placeholder="e.g. A. Chen or leave blank for anonymous"
                  className="w-full px-3 py-2 rounded-lg border border-border-strong bg-surface-raised text-ink text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
                />
              </div>
              <div>
                <label className="text-ink-muted text-xs mb-1 block">School / University</label>
                <input
                  type="text"
                  value={lbSchoolName}
                  onChange={(e) => setLbSchoolName(e.target.value)}
                  placeholder="e.g. Harvard Business School"
                  className="w-full px-3 py-2 rounded-lg border border-border-strong bg-surface-raised text-ink text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
                />
              </div>

              <div className="space-y-2 pt-1">
                {[
                  { label: "Show school name publicly", value: lbShowSchool, set: setLbShowSchool },
                  { label: "Show exact score (vs. tier only)", value: lbShowExactScore, set: setLbShowExactScore },
                ].map(({ label, value, set }) => (
                  <div key={label} className="flex items-center justify-between p-3 rounded-lg border border-border-subtle">
                    <span className="text-ink-muted text-sm">{label}</span>
                    <button
                      type="button"
                      onClick={() => set((v) => !v)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${value ? "bg-brand" : "bg-border-strong"}`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${value ? "translate-x-5" : "translate-x-0"}`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => void handleLbSave()}
            disabled={lbSaving}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-surface border border-border-strong hover:border-brand text-ink text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
          >
            {lbSaving ? "Saving…" : lbSaved ? "✓ Saved" : "Save leaderboard settings"}
          </button>
        </div>
      </main>
    </div>
  )
}
