"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const FIRM_OPTIONS = [
  { value: "mbb", label: "MBB", description: "McKinsey, BCG, Bain — hypothesis-driven, rigorous" },
  { value: "big4", label: "Big Four", description: "Deloitte, PwC, EY, KPMG — broader, practical focus" },
  { value: "boutique", label: "Boutique", description: "Boutique strategy — creative, deep-dive" },
  { value: "generic", label: "General", description: "Standard consulting interview practice" },
]

const TYPE_OPTIONS = [
  { value: "case", label: "Case Interview", description: "Structured business problem with data analysis" },
  { value: "market_sizing", label: "Market Sizing", description: "Estimation exercise with quantitative reasoning" },
  { value: "behavioral", label: "Behavioral / Fit", description: "Personal experience and leadership questions" },
]

export default function NewInterviewPage() {
  const router = useRouter()
  const [firmStyle, setFirmStyle] = useState("mbb")
  const [interviewType, setInterviewType] = useState("case")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleStart() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firmStyle, interviewType }),
      })

      if (!res.ok) {
        throw new Error("Failed to start interview")
      }

      const data = await res.json()
      router.push(`/interview/${data.sessionId}`)
    } catch {
      setError("Could not start interview. Make sure Ollama is running locally.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[oklch(0.11_0.012_258)] px-4 py-12">
      <div className="max-w-lg mx-auto">
        <div className="mb-8">
          <h1 className="text-[oklch(0.93_0.005_258)] text-2xl font-semibold mb-1">
            Start a mock interview
          </h1>
          <p className="text-[oklch(0.62_0.010_258)] text-sm">
            Choose your firm style and interview type. The AI interviewer will
            adapt its persona and rigor accordingly.
          </p>
        </div>

        <div className="space-y-6">
          {/* Firm Style */}
          <div>
            <p className="text-[oklch(0.93_0.005_258)] text-sm font-medium mb-3">
              Firm style
            </p>
            <div className="grid grid-cols-1 gap-2">
              {FIRM_OPTIONS.map((opt) => {
                const selected = firmStyle === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFirmStyle(opt.value)}
                    className={`flex items-start gap-3 px-4 py-3 rounded-md border text-left transition-colors duration-150 cursor-pointer ${
                      selected
                        ? "border-[oklch(0.62_0.19_258)] bg-[oklch(0.20_0.05_258)]"
                        : "border-[oklch(0.25_0.015_258)] bg-[oklch(0.15_0.013_258)] hover:border-[oklch(0.35_0.018_258)]"
                    }`}
                  >
                    <span
                      className={`mt-0.5 w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${
                        selected
                          ? "border-[oklch(0.62_0.19_258)]"
                          : "border-[oklch(0.35_0.018_258)]"
                      }`}
                    >
                      {selected && (
                        <span className="w-2 h-2 rounded-full bg-[oklch(0.62_0.19_258)]" />
                      )}
                    </span>
                    <div>
                      <div className={`text-sm font-medium ${selected ? "text-[oklch(0.93_0.005_258)]" : "text-[oklch(0.62_0.010_258)]"}`}>
                        {opt.label}
                      </div>
                      <div className="text-xs text-[oklch(0.40_0.008_258)] mt-0.5">
                        {opt.description}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Interview Type */}
          <div>
            <p className="text-[oklch(0.93_0.005_258)] text-sm font-medium mb-3">
              Interview type
            </p>
            <div className="grid grid-cols-1 gap-2">
              {TYPE_OPTIONS.map((opt) => {
                const selected = interviewType === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setInterviewType(opt.value)}
                    className={`flex items-start gap-3 px-4 py-3 rounded-md border text-left transition-colors duration-150 cursor-pointer ${
                      selected
                        ? "border-[oklch(0.62_0.19_258)] bg-[oklch(0.20_0.05_258)]"
                        : "border-[oklch(0.25_0.015_258)] bg-[oklch(0.15_0.013_258)] hover:border-[oklch(0.35_0.018_258)]"
                    }`}
                  >
                    <span
                      className={`mt-0.5 w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${
                        selected
                          ? "border-[oklch(0.62_0.19_258)]"
                          : "border-[oklch(0.35_0.018_258)]"
                      }`}
                    >
                      {selected && (
                        <span className="w-2 h-2 rounded-full bg-[oklch(0.62_0.19_258)]" />
                      )}
                    </span>
                    <div>
                      <div className={`text-sm font-medium ${selected ? "text-[oklch(0.93_0.005_258)]" : "text-[oklch(0.62_0.010_258)]"}`}>
                        {opt.label}
                      </div>
                      <div className="text-xs text-[oklch(0.40_0.008_258)] mt-0.5">
                        {opt.description}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {error && (
            <p className="text-[oklch(0.60_0.18_22)] text-sm">{error}</p>
          )}

          <button
            type="button"
            onClick={handleStart}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-md bg-[oklch(0.62_0.19_258)] hover:bg-[oklch(0.67_0.19_258)] text-white text-sm font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Starting interview..." : "Begin interview"}
          </button>
        </div>
      </div>
    </div>
  )
}
