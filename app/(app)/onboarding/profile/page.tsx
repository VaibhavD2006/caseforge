"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const FIRM_OPTIONS = [
  { value: "MBB", label: "MBB (McKinsey, BCG, Bain)" },
  { value: "Big Four", label: "Big Four (Deloitte, PwC, EY, KPMG)" },
  { value: "Boutique", label: "Boutique Strategy" },
  { value: "In-house", label: "In-house / Corporate Strategy" },
]

const ROLE_OPTIONS = [
  "Business Analyst",
  "Associate / Consultant",
  "Senior Associate",
  "Engagement Manager",
  "Other",
]

const EXPERIENCE_OPTIONS = [
  { value: "undergrad", label: "Undergraduate" },
  { value: "mba", label: "MBA / Graduate" },
  { value: "professional", label: "Experienced Professional" },
  { value: "career_switcher", label: "Career Switcher" },
]

export default function OnboardingProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [targetFirms, setTargetFirms] = useState<string[]>([])
  const [targetRole, setTargetRole] = useState("")
  const [experienceLevel, setExperienceLevel] = useState("")
  const [interviewDate, setInterviewDate] = useState("")

  function toggleFirm(value: string) {
    setTargetFirms((prev) =>
      prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetFirms,
          targetRole: targetRole || null,
          experienceLevel: experienceLevel || null,
          interviewDate: interviewDate || null,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to save profile")
      }

      router.push("/onboarding/screener")
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-start justify-center pt-16 pb-16 px-4 bg-[oklch(0.11_0.012_258)]">
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded bg-[oklch(0.62_0.19_258)] flex items-center justify-center">
              <span className="text-white text-xs font-bold">CF</span>
            </div>
            <span className="text-[oklch(0.62_0.010_258)] text-sm">
              CaseForge AI
            </span>
          </div>
          <h1 className="text-[oklch(0.93_0.005_258)] text-2xl font-semibold mb-1">
            Set up your profile
          </h1>
          <p className="text-[oklch(0.62_0.010_258)] text-sm">
            This helps us tailor interviews and track progress toward your
            target firms.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Target Firms */}
          <div>
            <p className="text-[oklch(0.93_0.005_258)] text-sm font-medium mb-3">
              Target firms{" "}
              <span className="text-[oklch(0.62_0.010_258)] font-normal">
                (select all that apply)
              </span>
            </p>
            <div className="grid grid-cols-1 gap-2">
              {FIRM_OPTIONS.map((firm) => {
                const selected = targetFirms.includes(firm.value)
                return (
                  <button
                    key={firm.value}
                    type="button"
                    onClick={() => toggleFirm(firm.value)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-md border text-left text-sm transition-colors duration-150 cursor-pointer ${
                      selected
                        ? "border-[oklch(0.62_0.19_258)] bg-[oklch(0.20_0.05_258)] text-[oklch(0.93_0.005_258)]"
                        : "border-[oklch(0.25_0.015_258)] bg-[oklch(0.15_0.013_258)] text-[oklch(0.62_0.010_258)] hover:border-[oklch(0.35_0.018_258)] hover:text-[oklch(0.93_0.005_258)]"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${
                        selected
                          ? "border-[oklch(0.62_0.19_258)] bg-[oklch(0.62_0.19_258)]"
                          : "border-[oklch(0.35_0.018_258)]"
                      }`}
                    >
                      {selected && (
                        <svg
                          width="10"
                          height="8"
                          viewBox="0 0 10 8"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M1 4L3.5 6.5L9 1"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                    {firm.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Target Role */}
          <div>
            <label
              htmlFor="targetRole"
              className="block text-[oklch(0.93_0.005_258)] text-sm font-medium mb-2"
            >
              Target role
            </label>
            <select
              id="targetRole"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full px-3 py-2.5 rounded-md border border-[oklch(0.25_0.015_258)] bg-[oklch(0.15_0.013_258)] text-[oklch(0.93_0.005_258)] text-sm focus:outline-none focus:border-[oklch(0.62_0.19_258)] focus:ring-1 focus:ring-[oklch(0.62_0.19_258)] transition-colors cursor-pointer"
            >
              <option value="">Select a role</option>
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Experience Level */}
          <div>
            <p className="text-[oklch(0.93_0.005_258)] text-sm font-medium mb-3">
              Experience level
            </p>
            <div className="grid grid-cols-2 gap-2">
              {EXPERIENCE_OPTIONS.map((opt) => {
                const selected = experienceLevel === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setExperienceLevel(opt.value)}
                    className={`px-4 py-2.5 rounded-md border text-sm text-left transition-colors duration-150 cursor-pointer ${
                      selected
                        ? "border-[oklch(0.62_0.19_258)] bg-[oklch(0.20_0.05_258)] text-[oklch(0.93_0.005_258)]"
                        : "border-[oklch(0.25_0.015_258)] bg-[oklch(0.15_0.013_258)] text-[oklch(0.62_0.010_258)] hover:border-[oklch(0.35_0.018_258)] hover:text-[oklch(0.93_0.005_258)]"
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Interview Date */}
          <div>
            <label
              htmlFor="interviewDate"
              className="block text-[oklch(0.93_0.005_258)] text-sm font-medium mb-2"
            >
              Interview date{" "}
              <span className="text-[oklch(0.62_0.010_258)] font-normal">
                (optional)
              </span>
            </label>
            <input
              id="interviewDate"
              type="date"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-md border border-[oklch(0.25_0.015_258)] bg-[oklch(0.15_0.013_258)] text-[oklch(0.93_0.005_258)] text-sm focus:outline-none focus:border-[oklch(0.62_0.19_258)] focus:ring-1 focus:ring-[oklch(0.62_0.19_258)] transition-colors"
            />
          </div>

          {error && (
            <p className="text-[oklch(0.60_0.18_22)] text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-md bg-[oklch(0.62_0.19_258)] hover:bg-[oklch(0.67_0.19_258)] text-white text-sm font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Saving..." : "Continue to dashboard"}
          </button>
        </form>
      </div>
    </div>
  )
}
