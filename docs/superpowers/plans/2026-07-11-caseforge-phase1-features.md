# CaseForge AI — Phase 1 Feature Completion Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the Phase 1 product loop: DB seeding, two missing interview modes (case_math + pressure_round), firm readiness dashboard widget, and a settings/profile page.

**Architecture:** The app is ~85% built. The DB is the critical blocker (seed never run on production = no cases/drills/templates). New interview modes require prompt templates, seed data, and a UI update to the `/interview/new` page. The firm readiness widget is a new dashboard component computing per-firm score benchmarks from existing scorecard data.

**Tech Stack:** Next.js 16 App Router, TypeScript, Drizzle ORM + Postgres (Supabase), Google Gemini via `lib/ai/providers.ts`, Tailwind CSS v4 + OKLCH design tokens, Framer Motion, Recharts.

**Design tokens (must use):**
- `bg-bg`, `bg-surface`, `bg-surface-raised`, `bg-brand-subtle`
- `text-ink`, `text-ink-muted`, `text-ink-faint`, `text-brand`
- `border-border-subtle`, `border-brand-muted`
- `bg-brand hover:bg-brand-hover` for primary buttons
- Button text: `text-[oklch(0.10_0.012_148)]`

---

## Task 1: Run DB Migration + Seed (Manual — User Action)

**Files:** None to create. User must run these commands against Supabase.

- [ ] **Step 1: Apply the pending migration to Supabase**

```bash
pnpm db:migrate
```

Expected output: migration `0001_busy_bloodstorm.sql` applied.

- [ ] **Step 2: Seed the database**

```bash
pnpm db:seed
```

Expected output:
```
✓ Rubric config seeded
✓ 12 interview templates seeded
✓ 20 cases seeded
✓ 19 prompt templates seeded
✓ 25 drills seeded
Seeding complete.
```

- [ ] **Step 3: Verify via Supabase dashboard**
- Open Supabase → Table Editor → `case_library` → should have 20 rows
- `drills` → should have 25 rows
- `prompt_templates` → should have 19 rows

---

## Task 2: Add Case Math + Pressure Round Interview Modes

**Files:**
- Modify: `app/(app)/interview/new/page.tsx`
- Modify: `db/seed/index.ts` (add prompt templates for new modes)
- Modify: `lib/ai/interview.ts` (handle new interviewType values)
- Modify: `lib/db/schema.ts` (add `case_math` and `pressure_round` to `interviewType` enum if needed)

### Step 2a: Check schema enum

- [ ] **Read the schema to verify enum values**

Open `lib/db/schema.ts` and find `interviewType`. Current values should be: `case`, `market_sizing`, `behavioral`, `drill`.

We need to add: `case_math`, `pressure_round`.

- [ ] **Add new enum values to schema**

In `lib/db/schema.ts`, find and update the `interviewType` pgEnum:

```typescript
// Before:
export const interviewType = pgEnum("interview_type", ["case", "market_sizing", "behavioral", "drill"])

// After:
export const interviewType = pgEnum("interview_type", ["case", "market_sizing", "behavioral", "drill", "case_math", "pressure_round"])
```

- [ ] **Generate and apply migration**

```bash
pnpm db:generate
pnpm db:migrate
```

Expected: new migration file created and applied.

### Step 2b: Add prompt templates for new modes

- [ ] **Add prompt templates to seed file**

In `db/seed/index.ts`, inside the `interviewerPrompts` array, add these two entries before the `await db.insert(promptTemplates)` call:

```typescript
{
  name: "interviewer_mbb_case_math_v1",
  type: "interviewer_system" as const,
  content: `You are a McKinsey-style case interviewer running a CASE MATH drill.

Your sole focus is quantitative reasoning. Present one focused math problem at a time.
Format: Give a clear setup with numbers, ask for a calculation, then evaluate their approach.

Rules:
- Ask them to walk through their math step-by-step out loud
- Challenge sloppy estimation ("why did you assume 10%?")
- Push for a sanity check after every answer ("does that number feel right?")
- If they get the right answer with bad process, ask them to re-explain their method
- Keep each problem to 3-4 minutes max, then move to a new one
- After 3 problems, give a brief summary of their quantitative strengths and gaps

Opening: "I'm going to run you through three quantitative problems. Walk me through your math out loud as you go — I care as much about your process as your answer. Ready?"`,
},
{
  name: "interviewer_mbb_pressure_round_v1",
  type: "interviewer_system" as const,
  content: `You are a senior McKinsey partner running a high-pressure final round interview.

Your job is to stress-test the candidate's composure, decisiveness, and ability to think under fire.

Rules:
- Push back on every recommendation, even correct ones ("but why wouldn't the competitor just copy that?")
- Ask for specificity relentlessly ("what exactly do you mean by 'improve margins'?")
- Interrupt if they are rambling more than 30 seconds without a clear point
- Set artificial time pressure ("you have 60 seconds to give me your recommendation")
- If they back down too easily from correct reasoning, push harder ("I'm not convinced — defend it")
- Reward candidates who push back respectfully with logic, not ones who capitulate

Tone: Direct, demanding, respectful but not warm. This is a final-round pressure test.

Opening: "I've read your slides. I have 20 minutes. Walk me through your recommendation — and I'll push back on everything."`,
},
```

- [ ] **Re-run seed to add new templates**

```bash
pnpm db:seed
```

(The `onConflictDoNothing()` means existing data is safe.)

### Step 2c: Update interview new page

- [ ] **Replace `TYPE_OPTIONS` and add new modes in `app/(app)/interview/new/page.tsx`**

Replace the `TYPE_OPTIONS` array with:

```typescript
const TYPE_OPTIONS = [
  {
    value: "case",
    label: "Full Case Interview",
    description: "Structured business problem — structure, analysis, synthesis, recommendation",
    duration: "30–40 min",
    difficulty: "Medium–Hard",
    emphasis: "Structure, Judgment, Synthesis",
  },
  {
    value: "market_sizing",
    label: "Market Sizing",
    description: "Top-down estimation with quantitative reasoning and clear assumptions",
    duration: "15–20 min",
    difficulty: "Medium",
    emphasis: "Math, Structure, Assumptions",
  },
  {
    value: "behavioral",
    label: "Behavioral / Fit",
    description: "Personal experience and leadership questions — STAR structure",
    duration: "20–30 min",
    difficulty: "Easy–Medium",
    emphasis: "Communication, Confidence",
  },
  {
    value: "case_math",
    label: "Case Math Drill",
    description: "Focused quantitative problems — mental math, unit economics, break-even",
    duration: "10–15 min",
    difficulty: "Medium",
    emphasis: "Quantitative, Process Clarity",
  },
  {
    value: "pressure_round",
    label: "Pressure Round",
    description: "Partner-style final round — every answer challenged, time pressure applied",
    duration: "20–30 min",
    difficulty: "Hard",
    emphasis: "Composure, Decisiveness, Pushback Handling",
  },
]
```

- [ ] **Update `RadioCard` to show duration/emphasis metadata**

Replace the `RadioCard` component in `app/(app)/interview/new/page.tsx`:

```typescript
function RadioCard({ selected, onClick, label, description, duration, difficulty, emphasis }: {
  selected: boolean
  onClick: () => void
  label: string
  description: string
  duration?: string
  difficulty?: string
  emphasis?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border text-left transition-colors cursor-pointer w-full ${
        selected
          ? "border-brand bg-brand-subtle"
          : "border-border-subtle bg-surface hover:border-border-strong"
      }`}
    >
      <span className={`mt-1 w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${
        selected ? "border-brand" : "border-border-strong"
      }`}>
        {selected && <span className="w-2 h-2 rounded-full bg-brand" />}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-semibold ${selected ? "text-ink" : "text-ink-muted"}`}>{label}</p>
          {difficulty && (
            <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
              difficulty.includes("Hard") ? "bg-[oklch(0.18_0.05_22)] text-[oklch(0.60_0.18_22)]" :
              difficulty.includes("Medium") ? "bg-[oklch(0.18_0.05_78)] text-[oklch(0.72_0.15_78)]" :
              "bg-brand-subtle text-brand"
            }`}>{difficulty}</span>
          )}
        </div>
        <p className="text-xs text-ink-faint mt-0.5 mb-1.5">{description}</p>
        {(duration || emphasis) && (
          <div className="flex gap-3 text-ink-faint text-xs">
            {duration && <span>⏱ {duration}</span>}
            {emphasis && <span className="truncate">Focus: {emphasis}</span>}
          </div>
        )}
      </div>
    </button>
  )
}
```

- [ ] **Update the RadioCard usage in TYPE_OPTIONS rendering**

In the JSX where TYPE_OPTIONS maps to RadioCards, spread the extra props:

```typescript
{TYPE_OPTIONS.map((opt) => (
  <StaggerItem key={opt.value}>
    <RadioCard
      selected={interviewType === opt.value}
      onClick={() => setInterviewType(opt.value)}
      label={opt.label}
      description={opt.description}
      duration={opt.duration}
      difficulty={opt.difficulty}
      emphasis={opt.emphasis}
    />
  </StaggerItem>
))}
```

### Step 2d: Wire new modes in the AI interview handler

- [ ] **Update `lib/ai/interview.ts` to handle new prompt refs**

In `lib/ai/interview.ts`, find the function that looks up the system prompt for an interview (likely looking up `promptTemplates` by `systemPromptRef`). The seed now includes `interviewer_mbb_case_math_v1` and `interviewer_mbb_pressure_round_v1`.

Ensure the template lookup covers the new `interviewType` values. Find where the `systemPromptRef` is determined from the template and add fallback handling:

```typescript
// If no template found for the combination, fall back to generic case prompt
const fallbackPromptName = `interviewer_generic_case_v1`
```

- [ ] **Verify `POST /api/interview/start` accepts new interviewType values**

Open `app/api/interview/start/route.ts`. The body parsing should accept any string for `interviewType`. If it validates against an enum, add `case_math` and `pressure_round` to the allowed list.

- [ ] **Commit**

```bash
git add lib/db/schema.ts db/seed/index.ts app/(app)/interview/new/page.tsx lib/ai/interview.ts
git commit -m "feat: add case_math and pressure_round interview modes"
```

---

## Task 3: Firm Readiness Dashboard Widget

**Files:**
- Create: `components/dashboard/FirmReadinessWidget.tsx`
- Modify: `app/(app)/dashboard/dashboard-client.tsx` (add widget to layout)
- Modify: `app/(app)/dashboard/page.tsx` (pass firm data)

### Step 3a: Create the component

- [ ] **Create `components/dashboard/FirmReadinessWidget.tsx`**

```typescript
"use client"

const FIRM_BENCHMARKS: Record<string, { label: string; minScore: number; dimensions: string[] }> = {
  mbb: {
    label: "MBB",
    minScore: 7.5,
    dimensions: ["structure", "hypothesis", "synthesis", "business_judgment"],
  },
  big4: {
    label: "Big Four",
    minScore: 6.5,
    dimensions: ["structure", "communication", "business_judgment"],
  },
  boutique: {
    label: "Boutique",
    minScore: 7.0,
    dimensions: ["hypothesis", "synthesis", "quantitative"],
  },
  generic: {
    label: "General",
    minScore: 6.0,
    dimensions: ["structure", "communication"],
  },
}

type Props = {
  avgDimensions: Record<string, number>
  targetFirms: string[]
}

function firmReadiness(firmKey: string, avgDimensions: Record<string, number>): { pct: number; label: string; color: string } {
  const bench = FIRM_BENCHMARKS[firmKey]
  if (!bench) return { pct: 0, label: "No data", color: "text-ink-faint" }

  const relevantScores = bench.dimensions
    .map((d) => avgDimensions[d] ?? 0)
    .filter((s) => s > 0)

  if (relevantScores.length === 0) return { pct: 0, label: "No data", color: "text-ink-faint" }

  const avg = relevantScores.reduce((a, b) => a + b, 0) / relevantScores.length
  const pct = Math.round(Math.min(100, (avg / bench.minScore) * 100))

  const label = pct >= 100 ? "Ready" : pct >= 75 ? "Approaching" : pct >= 50 ? "Developing" : "Early Stage"
  const color = pct >= 100 ? "text-[oklch(0.72_0.16_160)]" : pct >= 75 ? "text-brand" : pct >= 50 ? "text-[oklch(0.72_0.15_78)]" : "text-ink-muted"

  return { pct, label, color }
}

export function FirmReadinessWidget({ avgDimensions, targetFirms }: Props) {
  const firms = targetFirms.length > 0 ? targetFirms : ["mbb", "big4", "boutique", "generic"]
  const displayFirms = firms.slice(0, 4)

  return (
    <div className="bg-surface border border-border-subtle rounded-xl p-5">
      <p className="text-ink-muted text-xs uppercase tracking-wider mb-4">Firm Readiness</p>
      <div className="space-y-3">
        {displayFirms.map((firmKey) => {
          const bench = FIRM_BENCHMARKS[firmKey.toLowerCase()] ?? FIRM_BENCHMARKS.generic
          const { pct, label, color } = firmReadiness(firmKey.toLowerCase(), avgDimensions)
          return (
            <div key={firmKey}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-ink text-sm font-medium">{bench?.label ?? firmKey}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${color}`}>{label}</span>
                  <span className="text-ink-faint text-xs">{pct}%</span>
                </div>
              </div>
              <div className="h-1.5 bg-border-subtle rounded-full overflow-hidden">
                <div
                  className="h-1.5 rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: pct >= 100
                      ? "oklch(0.72 0.16 160)"
                      : pct >= 75
                      ? "oklch(0.72 0.20 148)"
                      : pct >= 50
                      ? "oklch(0.72 0.15 78)"
                      : "oklch(0.32 0.10 148)",
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

### Step 3b: Wire into dashboard

- [ ] **Add `avgDimensions` and `targetFirms` to the dashboard data in `app/(app)/dashboard/page.tsx`**

In the `getDashboardData` function, the scorecards are already fetched. Add dimension averaging (same logic as analytics page):

```typescript
// Add to getDashboardData return value:
const dimSums: Record<string, number> = {}
const dimCounts: Record<string, number> = {}
for (const sc of userScorecards) {
  const dims = sc.dimensionScores as Record<string, { score: number }> | null
  if (!dims) continue
  for (const [d, v] of Object.entries(dims)) {
    dimSums[d] = (dimSums[d] ?? 0) + v.score
    dimCounts[d] = (dimCounts[d] ?? 0) + 1
  }
}
const avgDimensions = Object.fromEntries(
  Object.keys(dimSums).map((d) => [d, (dimSums[d] ?? 0) / (dimCounts[d] ?? 1)])
)

// Also fetch profile for targetFirms:
const profile = await getOrCreateProfile(userId)
const targetFirms = (profile.targetFirms as string[]) ?? []
```

Return `avgDimensions` and `targetFirms` from `getDashboardData`.

- [ ] **Import and render `FirmReadinessWidget` in `app/(app)/dashboard/dashboard-client.tsx`**

Add import at top:
```typescript
import { FirmReadinessWidget } from "@/components/dashboard/FirmReadinessWidget"
```

In the dashboard grid layout, add the widget in the same row as `ReadinessCard` or create a new row. Find the section with `<ReadinessCard .../>` and add after it:

```typescript
<FirmReadinessWidget avgDimensions={avgDimensions} targetFirms={targetFirms} />
```

Pass the `avgDimensions` and `targetFirms` props through from the page.

- [ ] **Update `DashboardClientProps` type to include the new props**

In `dashboard-client.tsx`, add to the props type:
```typescript
avgDimensions: Record<string, number>
targetFirms: string[]
```

- [ ] **Commit**

```bash
git add components/dashboard/FirmReadinessWidget.tsx app/(app)/dashboard/page.tsx app/(app)/dashboard/dashboard-client.tsx
git commit -m "feat: add firm readiness widget to dashboard"
```

---

## Task 4: Settings / Profile Page

**Files:**
- Create: `app/(app)/settings/page.tsx`
- Modify: `app/(app)/layout.tsx` (add Settings link to nav)

### Step 4a: Create settings page

- [ ] **Create `app/(app)/settings/page.tsx`**

```typescript
import { requireAuth } from "@/lib/auth/session"
import { getOrCreateProfile } from "@/lib/db/queries/profile"
import SettingsClient from "./settings-client"

export default async function SettingsPage() {
  const session = await requireAuth()
  const profile = await getOrCreateProfile(session.user.id!)

  return (
    <SettingsClient
      profile={{
        targetFirms: (profile.targetFirms as string[]) ?? [],
        targetRole: profile.targetRole ?? "",
        experienceLevel: profile.experienceLevel ?? "",
        interviewDate: profile.interviewDate ? new Date(profile.interviewDate).toISOString().split("T")[0] : "",
      }}
      user={{
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        image: session.user.image ?? null,
      }}
    />
  )
}
```

- [ ] **Create `app/(app)/settings/settings-client.tsx`**

```typescript
"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Settings, CheckCircle } from "lucide-react"

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
    targetRole: string
    experienceLevel: string
    interviewDate: string
  }
  user: {
    name: string
    email: string
    image: string | null
  }
}

export default function SettingsClient({ profile, user }: Props) {
  const [targetFirms, setTargetFirms] = useState<string[]>(profile.targetFirms)
  const [experienceLevel, setExperienceLevel] = useState(profile.experienceLevel)
  const [interviewDate, setInterviewDate] = useState(profile.interviewDate)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

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
      <nav className="border-b border-border-subtle bg-surface sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-brand" />
            <span className="text-ink font-semibold text-sm">Settings</span>
          </div>
          <Link href="/dashboard" className="text-ink-muted text-xs hover:text-ink transition-colors">← Dashboard</Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Account */}
        <div className="bg-surface border border-border-subtle rounded-xl p-5">
          <p className="text-ink text-sm font-semibold mb-4">Account</p>
          <div className="flex items-center gap-3">
            {user.image ? (
              <Image src={user.image} alt={user.name} width={40} height={40} className="rounded-full" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-brand-subtle border border-brand-muted flex items-center justify-center">
                <span className="text-brand text-sm font-bold">{user.name?.[0] ?? "?"}</span>
              </div>
            )}
            <div>
              <p className="text-ink text-sm font-medium">{user.name}</p>
              <p className="text-ink-muted text-xs">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Target Firms */}
        <div className="bg-surface border border-border-subtle rounded-xl p-5">
          <p className="text-ink text-sm font-semibold mb-1">Target Firms</p>
          <p className="text-ink-muted text-xs mb-4">Select all firm types you're targeting. Affects readiness scoring and recommendations.</p>
          <div className="space-y-2">
            {FIRM_OPTIONS.map((opt) => {
              const selected = targetFirms.includes(opt.value)
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleFirm(opt.value)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors cursor-pointer ${
                    selected ? "border-brand bg-brand-subtle" : "border-border-subtle bg-surface hover:border-border-strong"
                  }`}
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    selected ? "border-brand bg-brand" : "border-border-strong"
                  }`}>
                    {selected && <CheckCircle className="w-3 h-3 text-[oklch(0.10_0.012_148)]" />}
                  </div>
                  <span className={`text-sm ${selected ? "text-ink font-medium" : "text-ink-muted"}`}>{opt.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Experience Level */}
        <div className="bg-surface border border-border-subtle rounded-xl p-5">
          <p className="text-ink text-sm font-semibold mb-1">Experience Level</p>
          <p className="text-ink-muted text-xs mb-4">Used to calibrate scoring expectations and drill recommendations.</p>
          <div className="space-y-2">
            {EXPERIENCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setExperienceLevel(opt.value)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors cursor-pointer ${
                  experienceLevel === opt.value ? "border-brand bg-brand-subtle" : "border-border-subtle bg-surface hover:border-border-strong"
                }`}
              >
                <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                  experienceLevel === opt.value ? "border-brand" : "border-border-strong"
                }`}>
                  {experienceLevel === opt.value && <span className="w-2 h-2 rounded-full bg-brand" />}
                </span>
                <span className={`text-sm ${experienceLevel === opt.value ? "text-ink font-medium" : "text-ink-muted"}`}>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Interview Date */}
        <div className="bg-surface border border-border-subtle rounded-xl p-5">
          <p className="text-ink text-sm font-semibold mb-1">Target Interview Date</p>
          <p className="text-ink-muted text-xs mb-3">Optional. Helps us surface urgency in goal recommendations.</p>
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
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand hover:bg-brand-hover text-[oklch(0.10_0.012_148)] text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Saving…" : saved ? "✓ Saved" : "Save changes"}
        </button>
      </main>
    </div>
  )
}
```

### Step 4b: Add Settings link to app nav

- [ ] **Locate the nav in `app/(app)/layout.tsx` and add a Settings link**

Find the navigation links in the layout. Add a link to `/settings`:

```typescript
<Link href="/settings" className="text-ink-muted hover:text-ink text-sm transition-colors">
  Settings
</Link>
```

Or if the nav uses icons, use `<Settings className="w-4 h-4" />` from lucide-react.

- [ ] **Commit**

```bash
git add app/(app)/settings/page.tsx app/(app)/settings/settings-client.tsx app/(app)/layout.tsx
git commit -m "feat: add settings page with target firms and experience level editing"
```

---

## Task 5: Verify API Profile PATCH Endpoint

**Files:**
- Check/Modify: `app/api/profile/route.ts`

- [ ] **Read `app/api/profile/route.ts` and verify PATCH handler exists**

The settings page calls `PATCH /api/profile` with `targetFirms`, `experienceLevel`, `interviewDate`. Verify the handler accepts these fields.

If a PATCH handler is missing, add it:

```typescript
export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 })

  const body = await request.json()
  const { targetFirms, experienceLevel, interviewDate, ...rest } = body

  await db
    .update(candidateProfiles)
    .set({
      ...(targetFirms !== undefined && { targetFirms }),
      ...(experienceLevel !== undefined && { experienceLevel }),
      ...(interviewDate !== undefined && { interviewDate: interviewDate ? new Date(interviewDate) : null }),
      ...rest,
    })
    .where(eq(candidateProfiles.userId, session.user.id))

  return Response.json({ ok: true })
}
```

- [ ] **Commit if changed**

```bash
git add app/api/profile/route.ts
git commit -m "fix: ensure PATCH /api/profile handles targetFirms, experienceLevel, interviewDate"
```

---

## Task 6: Push and Verify Deployment

- [ ] **Push all commits to GitHub**

```bash
git push origin master
```

- [ ] **Verify Vercel build succeeds**

Check Vercel dashboard. Expected: build passes, no TypeScript errors.

- [ ] **Smoke test the product loop**

1. Sign in → screener → dashboard ✓
2. `/interview/new` → verify all 5 modes appear ✓
3. Start a case interview → interview room loads ✓
4. Complete interview → feedback page shows scores ✓
5. `/drills` → drill library shows 25 drills ✓
6. `/analytics` → charts show data (after first eval) ✓
7. `/settings` → firm selection saves ✓
8. Dashboard → firm readiness widget shows ✓

---

## Self-Review Against Spec

| Spec Requirement | Covered By |
|---|---|
| Dashboard with readiness score, firm readiness, drills, goals | Task 3 (firm readiness added), rest already built |
| Screener / onboarding | Already fully built ✅ |
| AI interview room — all 5 modes | Task 2 adds case_math + pressure_round |
| Drill library (25 drills) | Task 1 (seed) |
| Analytics with charts | Already built with recharts ✅ |
| Rubric transparency on feedback page | Already built ✅ |
| Goal setting | Already built ✅ |
| Recruiter summary | Already built in evaluator ✅ |
| Settings / profile editing | Task 4 |
| Case library (20 cases) | Task 1 (seed) |

**Gaps intentionally deferred (Phase 2):**
- Exhibits/data uploads in interview room
- Comparative benchmark analytics
- Email notifications
- Billing/Stripe integration
