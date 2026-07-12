"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, ChevronRight, Brain, Target, TrendingUp } from "lucide-react"

const TOTAL_STEPS = 6

const FIRM_OPTIONS = [
  { value: "mbb", label: "MBB", description: "McKinsey, BCG, Bain — rigorous hypothesis-driven cases" },
  { value: "big4", label: "Big Four", description: "Deloitte, PwC, EY, KPMG — practical business cases" },
  { value: "boutique", label: "Boutique", description: "Specialized strategy firms — deep analytical focus" },
  { value: "generic", label: "General Consulting", description: "Broad consulting practice — variety of formats" },
]

const EXPERIENCE_OPTIONS = [
  { value: "undergrad", label: "Undergraduate", description: "First-time case interviewer, limited work experience" },
  { value: "mba", label: "MBA / Graduate", description: "Business school student with some prior experience" },
  { value: "professional", label: "Experienced Professional", description: "2+ years work experience, switching into consulting" },
  { value: "career_switcher", label: "Career Switcher", description: "Coming from a different industry or function" },
]

const QUANT_QUESTIONS = [
  { question: "What is 15% of 240?", answer: 36 },
  { question: "If revenue grows from $80M to $100M, what is the % growth?", answer: 25 },
  { question: "A product costs $60 and sells for $90. What is the margin %?", answer: 33 },
]

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-ink-muted text-xs">Step {step} of {TOTAL_STEPS}</span>
        <span className="text-brand text-xs font-medium">{Math.round((step / TOTAL_STEPS) * 100)}%</span>
      </div>
      <div className="h-1 bg-border-subtle rounded-full">
        <div
          className="h-1 bg-brand rounded-full transition-all duration-500"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>
    </div>
  )
}

export default function ScreenerPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [targetFirm, setTargetFirm] = useState("")
  const [experienceLevel, setExperienceLevel] = useState("")
  const [behavioralRating, setBehavioralRating] = useState(0)
  const [quantAnswers, setQuantAnswers] = useState<string[]>(["", "", ""])
  const [baselineResponse, setBaselineResponse] = useState("")

  function computeQuantScore(): number {
    const correct = QUANT_QUESTIONS.filter((q, i) => {
      const ans = parseInt(quantAnswers[i]?.replace(/[^0-9]/g, "") ?? "")
      return Math.abs(ans - q.answer) <= 1
    }).length
    // Map 0/1/2/3 correct → 1/2/4/5
    return [1, 2, 4, 5][correct] ?? 1
  }

  function getPrepProfile() {
    const quantScore = computeQuantScore()
    const isQuantWeak = quantScore <= 2
    const isBehavioralWeak = behavioralRating <= 2

    const modeRec =
      isBehavioralWeak && !isQuantWeak
        ? "Behavioral / Fit"
        : isQuantWeak && !isBehavioralWeak
          ? "Market Sizing"
          : "Full Case"

    const weeks = experienceLevel === "undergrad" ? 6 : experienceLevel === "career_switcher" ? 8 : 4

    return { modeRec, weeks, isQuantWeak, isBehavioralWeak, quantScore }
  }

  async function handleFinish() {
    setSubmitting(true)
    const quantScore = computeQuantScore()

    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetFirms: [targetFirm],
          experienceLevel,
          behavioralConfidenceRating: behavioralRating,
          quantComfortRating: quantScore,
          screenerBaselineResponse: baselineResponse,
          screenerCompleted: true,
          screenerCompletedAt: new Date().toISOString(),
        }),
      })
      router.push("/dashboard")
    } catch {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-start justify-center pt-12 pb-16 px-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
            <span className="text-[oklch(0.10_0.012_148)] text-xs font-bold">CF</span>
          </div>
          <span className="text-ink-muted text-sm font-medium">CaseForge AI</span>
        </div>

        <ProgressBar step={step} />

        {/* Step 1: Target Firm */}
        {step === 1 && (
          <div>
            <h1 className="text-ink text-2xl font-semibold mb-1">Which firm type are you targeting?</h1>
            <p className="text-ink-muted text-sm mb-6">We'll calibrate the difficulty, style, and emphasis of your interviews.</p>
            <div className="space-y-3">
              {FIRM_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTargetFirm(opt.value)}
                  className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                    targetFirm === opt.value
                      ? "border-brand bg-brand-subtle"
                      : "border-border-subtle bg-surface hover:border-brand-muted"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                    targetFirm === opt.value ? "border-brand" : "border-border-strong"
                  }`}>
                    {targetFirm === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-brand" />}
                  </div>
                  <div>
                    <div className="text-ink text-sm font-semibold">{opt.label}</div>
                    <div className="text-ink-muted text-xs mt-0.5">{opt.description}</div>
                  </div>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!targetFirm}
              className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand hover:bg-brand-hover text-[oklch(0.10_0.012_148)] text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Experience Level */}
        {step === 2 && (
          <div>
            <h1 className="text-ink text-2xl font-semibold mb-1">What's your background?</h1>
            <p className="text-ink-muted text-sm mb-6">This helps us set the right baseline for your scoring and recommendations.</p>
            <div className="space-y-3">
              {EXPERIENCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setExperienceLevel(opt.value)}
                  className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                    experienceLevel === opt.value
                      ? "border-brand bg-brand-subtle"
                      : "border-border-subtle bg-surface hover:border-brand-muted"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                    experienceLevel === opt.value ? "border-brand" : "border-border-strong"
                  }`}>
                    {experienceLevel === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-brand" />}
                  </div>
                  <div>
                    <div className="text-ink text-sm font-semibold">{opt.label}</div>
                    <div className="text-ink-muted text-xs mt-0.5">{opt.description}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-border-subtle text-ink-muted text-sm hover:text-ink hover:border-border-strong transition-colors cursor-pointer">Back</button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!experienceLevel}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-brand hover:bg-brand-hover text-[oklch(0.10_0.012_148)] text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Behavioral Confidence */}
        {step === 3 && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-5 h-5 text-brand" />
              <h1 className="text-ink text-2xl font-semibold">How confident are you in behavioral interviews?</h1>
            </div>
            <p className="text-ink-muted text-sm mb-8">Rate your comfort with questions like "Tell me about a time you led a team."</p>
            <div className="space-y-3">
              {[
                { val: 1, label: "1 — Not confident at all", desc: "I struggle to structure my answers" },
                { val: 2, label: "2 — Somewhat uncomfortable", desc: "I can answer but answers feel generic" },
                { val: 3, label: "3 — Moderate confidence", desc: "I can structure using STAR, but need polish" },
                { val: 4, label: "4 — Fairly confident", desc: "My stories are clear and impactful" },
                { val: 5, label: "5 — Very confident", desc: "I can handle any behavioral question comfortably" },
              ].map(({ val, label, desc }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setBehavioralRating(val)}
                  className={`w-full flex items-center gap-4 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    behavioralRating === val
                      ? "border-brand bg-brand-subtle"
                      : "border-border-subtle bg-surface hover:border-brand-muted"
                  }`}
                >
                  <span className={`text-lg font-bold tabular-nums w-6 text-center flex-shrink-0 ${behavioralRating === val ? "text-brand" : "text-ink-faint"}`}>{val}</span>
                  <div>
                    <div className="text-ink text-sm font-medium">{label}</div>
                    <div className="text-ink-muted text-xs">{desc}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl border border-border-subtle text-ink-muted text-sm hover:text-ink transition-colors cursor-pointer">Back</button>
              <button
                type="button"
                onClick={() => setStep(4)}
                disabled={!behavioralRating}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-brand hover:bg-brand-hover text-[oklch(0.10_0.012_148)] text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Quant Comfort */}
        {step === 4 && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-brand" />
              <h1 className="text-ink text-2xl font-semibold">Quick quant check</h1>
            </div>
            <p className="text-ink-muted text-sm mb-6">Three quick mental math questions. No calculator needed — round answers are fine.</p>
            <div className="space-y-5">
              {QUANT_QUESTIONS.map((q, i) => (
                <div key={i} className="bg-surface border border-border-subtle rounded-xl p-4">
                  <p className="text-ink text-sm font-medium mb-3">{i + 1}. {q.question}</p>
                  <input
                    type="text"
                    value={quantAnswers[i]}
                    onChange={(e) => {
                      const updated = [...quantAnswers]
                      updated[i] = e.target.value
                      setQuantAnswers(updated)
                    }}
                    placeholder="Your answer..."
                    className="w-full px-3 py-2 rounded-lg border border-border-strong bg-surface-raised text-ink text-sm placeholder:text-ink-faint focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl border border-border-subtle text-ink-muted text-sm hover:text-ink transition-colors cursor-pointer">Back</button>
              <button
                type="button"
                onClick={() => setStep(5)}
                disabled={quantAnswers.some((a) => !a.trim())}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-brand hover:bg-brand-hover text-[oklch(0.10_0.012_148)] text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Baseline Structuring */}
        {step === 5 && (
          <div>
            <h1 className="text-ink text-2xl font-semibold mb-1">One quick structuring prompt</h1>
            <p className="text-ink-muted text-sm mb-6">In 2-3 sentences, how would you approach diagnosing a company's declining profitability? Don't over-think it — we're just establishing your baseline.</p>
            <div className="bg-surface border border-border-subtle rounded-xl p-4 mb-4">
              <p className="text-ink-muted text-xs mb-1">Your prompt</p>
              <p className="text-ink text-sm">"A retail chain's profits have dropped 20% in the past year despite flat revenue. Walk me through your initial approach to diagnosing the problem."</p>
            </div>
            <textarea
              value={baselineResponse}
              onChange={(e) => setBaselineResponse(e.target.value)}
              placeholder="I would start by..."
              rows={5}
              className="w-full px-3 py-3 rounded-xl border border-border-strong bg-surface text-ink text-sm placeholder:text-ink-faint focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors resize-none"
            />
            <p className="text-ink-faint text-xs mt-2">{baselineResponse.length} characters</p>
            <div className="mt-4 flex gap-3">
              <button type="button" onClick={() => setStep(4)} className="flex-1 py-3 rounded-xl border border-border-subtle text-ink-muted text-sm hover:text-ink transition-colors cursor-pointer">Back</button>
              <button
                type="button"
                onClick={() => setStep(6)}
                disabled={baselineResponse.trim().length < 20}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-brand hover:bg-brand-hover text-[oklch(0.10_0.012_148)] text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Prep Profile Result */}
        {step === 6 && (() => {
          const { modeRec, weeks, isQuantWeak, isBehavioralWeak } = getPrepProfile()
          const firmLabel = FIRM_OPTIONS.find((f) => f.value === targetFirm)?.label ?? targetFirm
          const expLabel = EXPERIENCE_OPTIONS.find((e) => e.value === experienceLevel)?.label ?? experienceLevel

          return (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-5 h-5 text-brand" />
                <h1 className="text-ink text-2xl font-semibold">Your prep profile is ready</h1>
              </div>
              <p className="text-ink-muted text-sm mb-6">Based on your answers, here's our recommended starting point.</p>

              <div className="space-y-3 mb-6">
                <div className="bg-surface border border-border-subtle rounded-xl p-4">
                  <div className="text-ink-muted text-xs mb-1">Target firm</div>
                  <div className="text-ink text-sm font-semibold">{firmLabel}</div>
                </div>
                <div className="bg-surface border border-border-subtle rounded-xl p-4">
                  <div className="text-ink-muted text-xs mb-1">Experience level</div>
                  <div className="text-ink text-sm font-semibold">{expLabel}</div>
                </div>
                <div className="bg-brand-subtle border border-brand-muted rounded-xl p-4">
                  <div className="text-brand text-xs font-medium mb-1">Recommended first interview mode</div>
                  <div className="text-ink text-sm font-semibold">{modeRec}</div>
                </div>
                <div className="bg-surface border border-border-subtle rounded-xl p-4">
                  <div className="text-ink-muted text-xs mb-1">Estimated prep timeline</div>
                  <div className="text-ink text-sm font-semibold">{weeks} weeks to interview-ready</div>
                </div>
              </div>

              {(isQuantWeak || isBehavioralWeak) && (
                <div className="bg-surface border border-border-subtle rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-brand" />
                    <span className="text-ink text-sm font-medium">Priority focus areas</span>
                  </div>
                  <ul className="space-y-1">
                    {isQuantWeak && <li className="text-ink-muted text-xs">→ Quantitative / mental math (start with Market Sizing drills)</li>}
                    {isBehavioralWeak && <li className="text-ink-muted text-xs">→ Behavioral / fit (practice STAR structure with Behavioral drills)</li>}
                  </ul>
                </div>
              )}

              <button
                type="button"
                onClick={() => void handleFinish()}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-brand hover:bg-brand-hover text-[oklch(0.10_0.012_148)] text-sm font-semibold transition-colors disabled:opacity-60 cursor-pointer"
              >
                {submitting ? "Setting up your dashboard..." : "Go to my dashboard"}
                {!submitting && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
