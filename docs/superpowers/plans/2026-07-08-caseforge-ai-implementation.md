# CaseForge AI — Full Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an AI-native consulting interview practice SaaS (CaseForge AI) that delivers company-style mock interviews, rubric-based scoring, persistent weakness tracking, and longitudinal dashboard progress.

**Architecture:** Next.js App Router frontend + Supabase Postgres + Drizzle ORM + Auth.js v5 (Google OAuth) + multi-stage LLM pipeline (OpenAI/Anthropic) + Inngest background jobs for async evaluation.

**Tech Stack:** Next.js 15, Tailwind CSS, shadcn/ui, Auth.js v5 (NextAuth) + Google OAuth, Supabase, Drizzle, OpenAI SDK, Anthropic SDK, Inngest, PostHog, Vercel

**Design workflow:** `/impeccable init` → palette seed → PRODUCT.md + DESIGN.md → `ui-ux-pro-max` design system → build UI following both skill guidelines. `/impeccable` governs all visual decisions (OKLCH tokens, motion, component craft). `ui-ux-pro-max` provides design system recommendations and pre-delivery checklist enforcement.

---

## Assumptions Made

- Working title **CaseForge AI** is adopted as the product name throughout.
- Text-first MVP only — voice is explicitly deferred to Phase 5+.
- MVP launches with **4 firm styles** (MBB, Big Four, Boutique, Generic) and **3 interview types** (Case, Market Sizing, Behavioral) plus Drill mode = 12 template combinations.
- Seed content = 20 original cases written by the team, distributed across firm styles and types. No scraped proprietary content.
- Weakness tags use a **canonical taxonomy** (predefined set of ~40 tags), not free-form AI-generated strings.
- Evaluation runs async via Inngest background jobs. Feedback page polls or uses server-sent events to detect completion (target: <30 seconds).
- Free tier = 1 full mock interview + 3 drills. Pro = unlimited. Premium (voice, benchmarks) is post-MVP.
- Drizzle ORM over Prisma (lighter, TypeScript-native, better Supabase ergonomics).
- **Auth: Auth.js v5 (NextAuth.js) with Google OAuth provider.** No Clerk. User signs in with Google only. Session stored as JWT; user record synced to DB on first sign-in via Auth.js callbacks. Removes per-seat SaaS costs.
- Inngest over Trigger.dev (simpler setup, first-class Next.js support).
- Admin routes are internal-only and protected by a hard-coded admin email list in middleware for MVP.
- No multi-tenancy (university portals, cohort accounts) in MVP.
- **Design is built with `/impeccable` skill governance:** PRODUCT.md + DESIGN.md created before any UI code; palette seeded via `palette.mjs`; all color in OKLCH; motion intentional with `prefers-reduced-motion` support; production-grade craft, not prototype quality.
- **`ui-ux-pro-max` design system generated before Phase 0 UI work** via `python3 skills/ui-ux-pro-max/scripts/search.py "consulting interview practice SaaS AI dashboard dark" --design-system -p "CaseForge AI"`. All pre-delivery checklists enforced.
- **Deployment: Vercel MCP** (`vercel:deploy` skill) used for final production deployment.

---

## 1. Executive Synthesis

CaseForge AI is an AI-native SaaS that helps consulting candidates prepare for case interviews through structured, company-specific mock sessions that produce strict rubric-based scorecards, remember recurring weaknesses across sessions, and convert raw practice into a measurable readiness trajectory. The product sits between generic AI chatbots (too flexible, no structure, no memory) and expensive human coaching (unaffordable at scale), addressing the specific unmet need for high-volume, consistent, personalized interview practice.

The core product loop is: **onboard → select firm style → run mock interview → receive scored feedback → see weakness tags → launch targeted drill → return to dashboard → repeat**. What makes CaseForge AI distinct is the combination of three things no current lightweight tool does well simultaneously: (1) rubric scores with transcript evidence rather than vague praise, (2) cross-session weakness memory that influences subsequent recommendations, and (3) a longitudinal dashboard that converts isolated sessions into a visible readiness trajectory. The wedge is not more mocks — it is measurable, persistent improvement.

---

## 2. Document Reconciliation

### What the 4 docs agree on
- Text-first MVP, voice is deferred.
- Rubric-based scoring across 7 dimensions.
- Weakness memory is the key differentiator.
- Firm-style templates are required at MVP, not later.
- Dashboard must reflect longitudinal progress.
- Bootstrap/small-team build, no overengineering.
- Stack: Next.js, Tailwind, Postgres, Drizzle or Prisma, OpenAI + Anthropic, PostHog, Inngest/Trigger.dev.

### Contradictions resolved

| Conflict | Resolution |
|---|---|
| Build Plan puts firm-style differentiation in Phase 3 | MVP Scope and ICP say firm styles are required at MVP. **Resolution: firm-style templates are seeded in Phase 0 and used from Phase 2 onward.** |
| Build Plan has 5 phases; plan requires 8 | Expanded to 8 phases. Phase 3 (firm styles) is absorbed into Phase 2 (interview runtime) since it is seed data. |
| Build Plan says "LangChain or direct provider SDKs" | **Resolution: direct provider SDKs (OpenAI SDK + Anthropic SDK) with a thin provider abstraction layer in `lib/ai/providers.ts`.** LangChain adds unnecessary abstraction weight for an MVP. |
| PRD mentions "confidence interval or reliability flag" on scorecards; other docs do not | Retained. A `reliabilityFlag` boolean on scorecards is a low-cost signal for calibration. |
| No doc specifies ORM choice clearly | **Resolution: Drizzle.** Chosen over Prisma for its lighter bundle, TypeScript-native schema definition, and Supabase compatibility. |
| Source docs suggest Clerk auth | **Resolution: Auth.js v5 + Google OAuth.** Free, no per-seat costs, native App Router support. |

### Gaps filled
- **Canonical weakness tag taxonomy**: No doc defines what the tags actually are. Defined below in Section 7.
- **Evaluation latency strategy**: No doc specifies async vs sync. Resolved as async (Inngest job, <30s target).
- **Drill mode definition**: MVP Scope mentions it but does not define what a drill session looks like. Defined as a short (10-15 turn) focused practice session targeting one or two specific weakness dimensions.
- **Progress snapshot trigger**: Not specified. Resolved as: snapshot generated automatically after every completed session.
- **Free vs Pro gating**: MVP Scope mentions pricing but no doc defines what triggers the paywall. Resolved as: free users can complete 1 full mock and 3 drills; Pro unlocks unlimited both.

### Final planning baseline
Build a greenfield Next.js application with Auth.js v5 + Google OAuth, Supabase Postgres, Drizzle ORM, multi-stage AI pipeline, and Inngest background jobs. Ship in 8 phases, text-first. Firm-style templates seeded from day one. Evaluation is async. Weakness tags use a predefined taxonomy. Dashboard is longitudinal from first session. UI governed by `/impeccable` + `ui-ux-pro-max`. Deploy via Vercel MCP.

---

## 3. Final MVP Definition

### In scope (must work in v1)

- Google OAuth sign-in (Auth.js v5)
- Candidate profile: target firms, experience level, interview date, target role
- 4 firm styles: MBB, Big Four, Boutique, Generic
- 3 interview types: Case, Market Sizing, Behavioral
- Drill mode (targeted short practice)
- Streaming chat interface for multi-turn text mock interviews
- Transcript persistence (every turn, real-time)
- Post-session evaluation: 7-dimension scoring with evidence snippets
- Feedback report with top 3 strengths, top 3 weaknesses, next-drill CTA
- Weakness tag aggregation across sessions (canonical taxonomy)
- Dashboard: score history, skill trend charts, weakness heatmap, readiness level, tier badge
- Drill recommendations based on weakness history
- Admin panel: case library CRUD, template manager, rubric editor
- Free vs Pro gating (1 mock free, unlimited Pro)
- Stripe subscription (basic, no upsell flows)
- Seed content: 20 cases, 12 prompt templates (4 styles × 3 types)
- Production-grade UI via `/impeccable` + `ui-ux-pro-max` design system
- Production deploy via Vercel MCP

### Explicitly out of scope for v1

- Voice/speech-to-text
- Tone analysis, filler word detection
- Peer leaderboard or benchmarking against other users
- Human coach marketplace
- University / campus admin portal
- Video answer capture
- Mobile native apps
- Team or cohort accounts
- Multimodal evaluation
- Full enterprise reporting

### Must work on day 1
User signs in with Google → creates profile → starts MBB-style case mock → completes session → receives scored feedback with evidence → sees weakness tags → launches a drill → returns to dashboard and sees score trend.

### Postpone to post-v1
Voice mode, benchmarking, coach review, campus portal, peer features, advanced analytics.

---

## 4. User Flow Architecture

### 4.1 Onboarding Flow

**Entry point:** Landing page CTA or direct `/sign-in`

**Steps:**
1. User clicks "Sign in with Google" on `/sign-in` page
2. Google OAuth flow completes → Auth.js creates session
3. Auth.js `signIn` callback: upsert `User` row in DB
4. Check if `CandidateProfile` exists → if not, redirect to `/onboarding/profile`
5. Profile form: target firms (multi-select chips), target role, experience level, interview date, optional self-assessment
6. Submit → `POST /api/profile` → creates `CandidateProfile`
7. Redirect to `/dashboard` (empty state with "Start your first mock" CTA)

**Data created:** `User` (via Auth.js callback), `CandidateProfile`

**Main UI surfaces:** Landing page, Google sign-in page, profile setup form

**Edge cases:**
- User skips self-assessment → null, ignored
- User returns without completing profile → redirect to `/onboarding/profile` on any protected page
- Google OAuth fails → Auth.js error page with retry link

---

### 4.2 Profile Setup Flow

**Entry point:** `/onboarding/profile` (first time) or `/profile/edit` (returning user)

**Steps:**
1. Form pre-filled with existing values if editing
2. Fields: `targetFirms[]`, `targetRole`, `experienceLevel`, `interviewDate`, `selfAssessmentScores` (optional)
3. Save → `PATCH /api/profile`
4. Redirect back to dashboard

**Data created/updated:** `CandidateProfile`

**Edge cases:**
- Interview date in the past → warn but allow
- No target firms selected → default to Generic style

---

### 4.3 First Mock Interview Flow

**Entry point:** Dashboard "Start Mock" button or `/interview/new`

**Steps:**
1. Interview setup: select interview type, select firm style
2. System selects case from library (least-used first for the selected type + style)
3. `POST /api/interview/start` → creates `InterviewSession`, returns first AI turn (streamed)
4. Chat interface: streaming first message from AI interviewer
5. User types response → `POST /api/interview/turn` → appends to transcript, streams AI response
6. User clicks "End Interview"
7. `POST /api/interview/end` → marks session `completed`, dispatches Inngest evaluation job
8. Redirect to `/feedback/[sessionId]` with "Generating feedback..." state

**Data created:** `InterviewSession`, `Transcript` (built per turn)

**Edge cases:**
- Browser closed mid-session → transcript saved per turn; session stays `in_progress`; user can resume or abandon on return
- AI response times out → retry × 3 with backoff, then error toast
- Free user tries 2nd full mock → paywall modal

---

### 4.4 Post-Interview Feedback Flow

**Entry point:** Redirect from `/interview/[sessionId]` after completion

**Steps:**
1. `/feedback/[sessionId]` polls `GET /api/evaluation/status/[sessionId]`
2. Inngest job completes → scorecard written to DB
3. Page renders: overall score, 7 dimension cards (score + rationale + evidence snippets), top 3 strengths, top 3 weaknesses, recommended drills
4. User clicks "Launch Drill" → creates `DrillRecommendation`, navigates to `/drills/[drillId]`
5. User can toggle full transcript view

**Data created:** `Scorecard`, `WeaknessTag` updates (via Inngest)

**Edge cases:**
- Evaluation fails → retry button calling `POST /api/evaluation/retry/[sessionId]`
- Evaluation takes >45 seconds → timeout message; email notification when ready

---

### 4.5 Weakness Tracking Flow

**Entry point:** Automatic after every scorecard generation

**Steps:**
1. Inngest job reads scorecard weakness tags
2. For each tag: upsert into `WeaknessTag`, increment `occurrenceCount`, update `lastSeenAt`
3. If `occurrenceCount >= 3` → set `isPersistent: true`
4. Dashboard weakness heatmap reflects updated state on next load

**Data created/updated:** `WeaknessTag` records

**Edge cases:**
- First session → all tags `occurrenceCount: 1`, none persistent
- Drill completion improves a dimension → tag count stays; dimension score trend shows improvement separately

---

### 4.6 Drill Recommendation Flow

**Entry point:** Feedback page "Launch Drill" CTA or Dashboard "Practice weaknesses" CTA

**Steps:**
1. System reads top 2-3 persistent weakness tags (session-specific tags if none persistent yet)
2. `POST /api/drills/generate` → Inngest job generates drill prompt
3. `DrillRecommendation` created with `status: pending`
4. `/drills/[drillId]` → 10-15 turn focused session
5. Drill completes → mini evaluation (2-3 dimensions), mini scorecard shown

**Data created:** `DrillRecommendation`, mini `Scorecard`

**Edge cases:**
- No weakness tags (first session) → generate generic beginner drill based on profile
- All drills completed → "You're on a roll" state with suggestion to run a full mock

---

### 4.7 Dashboard Review Flow

**Entry point:** `/dashboard` after any session

**Steps:**
1. Dashboard loads from `ProgressSnapshot` + latest `Scorecard` + `WeaknessTag` aggregates
2. Sections: readiness level + tier badge, score history chart, dimension radar, weakness heatmap, session history table, "Next recommended action" banner
3. Click session → `/feedback/[sessionId]`
4. Click weakness tag → drill launch

**Edge cases:**
- 0 sessions → empty state with single "Start your first mock" CTA
- 1 session → no trend charts; "Complete 3 sessions to unlock trend view"
- Pro expired → locked Pro features with upgrade prompt

---

## 5. Product Architecture

### 5.1 Frontend App Modules

| Module | Responsibility | MVP/Later |
|---|---|---|
| Auth shell | Google sign-in, route protection | MVP |
| Onboarding | Profile setup form | MVP |
| Interview setup | Select type, firm style | MVP |
| Chat interface | Streaming multi-turn messages, controls | MVP |
| Feedback report | Scorecard, dimension cards, evidence, drills CTA | MVP |
| Dashboard | Progress charts, weakness heatmap, tier badge, session history | MVP |
| Drill interface | Focused short session + mini scorecard | MVP |
| Billing | Stripe checkout, subscription status, upgrade prompts | MVP |
| Admin panel | Template CRUD, case library CRUD, rubric editor | MVP |
| Voice interface | Speech input/output | Later |
| Benchmark view | Percentile comparisons | Later |

### 5.2 Backend Services

| Service | Responsibility | MVP/Later |
|---|---|---|
| Auth handler | Auth.js Google OAuth → upsert User in DB | MVP |
| Profile API | CRUD for CandidateProfile | MVP |
| Interview API | Start session, handle turns, end session | MVP |
| Evaluation API | Trigger + status polling for scorecard | MVP |
| Drills API | Generate and serve drill recommendations | MVP |
| Dashboard API | Aggregate stats from snapshots + scorecards | MVP |
| Admin API | Protected CRUD for templates, cases, rubrics | MVP |
| Billing API | Stripe webhooks, subscription gating | MVP |
| Voice API | STT + TTS integration | Later |

### 5.3 Interview Engine

**Responsibility:** Orchestrate multi-turn AI interviewer behavior during a live session.

**Inputs:** System prompt (from template + firm style config), case content, conversation history, user turn

**Outputs:** Next interviewer turn (streamed text)

**Behavior rules encoded in system prompt:**
- Firm-specific persona (MBB: analytical, structured, probing; Big Four: broader, more practical; Boutique: flexible)
- Pushback policy: if answer lacks quantification → ask for numbers; if hypothesis is vague → challenge it; do not compliment unless answer is clearly excellent
- Turn budget: target 15-25 turns per full mock, 8-12 per drill
- Never reveal the rubric or scoring criteria during the session

**MVP:** Single model provider (OpenAI GPT-4o). Later: provider abstraction for cost optimization.

### 5.4 Scoring Engine

**Responsibility:** Evaluate completed transcripts against rubric anchors and produce per-dimension scorecards.

**Inputs:** Full transcript, case content + rubric anchors (from template)

**Outputs:** `Scorecard` JSON with 7 dimension scores, rationale, evidence snippets, strength/weakness tags

**Pipeline:** Multi-stage (see Section 7). Runs as Inngest background job.

**MVP:** 7 separate dimension evaluator prompts. Later: calibration set + offline variance testing.

### 5.5 Weakness-Memory Engine

**Responsibility:** Extract weakness tags from scorecards, aggregate into user profile, detect persistent patterns.

**Inputs:** Scorecard weakness tags, existing `WeaknessTag` records for user

**Outputs:** Updated `WeaknessTag` table rows

**MVP:** Pure database aggregation (no AI call). Tag matching is deterministic.

### 5.6 Recommendation Engine

**Responsibility:** Generate targeted drill recommendations from weakness tags.

**Inputs:** User's top N weakness tags, session context

**Outputs:** `DrillRecommendation` records with drill prompt content

**MVP:** One AI call per drill. Takes top 2 weakness tags → generates focused drill prompt + title + description.

### 5.7 Dashboard Analytics Layer

**Responsibility:** Serve pre-aggregated metrics for dashboard.

**Inputs:** `ProgressSnapshot` records, latest `Scorecard`, `WeaknessTag` aggregates

**Outputs:** Dashboard API response: readiness level, tier, score trends, dimension averages, weakness heatmap data

**MVP:** Snapshot generated at end of each evaluation job. Later: separate cron-based snapshot job.

### 5.8 Admin / Content Management Layer

**Responsibility:** Internal team can manage cases, templates, rubrics without direct DB access.

**MVP:** Protected by admin email allowlist. No CMS integrations. Later: headless CMS (Sanity or Contentful).

---

## 6. Data Architecture

### Entity Relationship Overview

```
User (Auth.js) ─── CandidateProfile
User ─── InterviewSession (many)
InterviewSession ─── Transcript (1:1)
InterviewSession ─── Scorecard (1:1)
InterviewSession ─── InterviewTemplate (many:1)
InterviewSession ─── CaseLibrary (many:1)
User ─── WeaknessTag (aggregated, many)
User ─── DrillRecommendation (many)
User ─── ProgressSnapshot (many, one per session)
```

### Core Entities

#### User (+ Auth.js adapter tables)
```
id: uuid (PK)
email: string (unique)
name: string | null
image: string | null  (Google profile picture URL)
createdAt: timestamp
updatedAt: timestamp

-- Auth.js adapter tables (required):
accounts: { userId, provider, providerAccountId, ... }
sessions: { sessionToken, userId, expires }
```

#### CandidateProfile
```
id: uuid (PK)
userId: uuid (FK → User, unique)
targetFirms: text[]
targetRole: string
experienceLevel: enum (undergrad | mba | professional | career_switcher)
interviewDate: date | null
selfAssessmentScores: jsonb | null
planTier: enum (free | pro | premium)
stripeCustomerId: string | null
stripeSubscriptionId: string | null
createdAt: timestamp
updatedAt: timestamp
```

#### InterviewTemplate
```
id: uuid (PK)
firmStyle: enum (mbb | big4 | boutique | generic)
interviewType: enum (case | market_sizing | behavioral | drill)
title: string
description: string
systemPromptRef: string (FK → PromptTemplate.name)
rubricRef: string (FK → RubricConfig.key)
isActive: boolean
version: integer
createdAt: timestamp
updatedAt: timestamp
```

#### CaseLibrary
```
id: uuid (PK)
title: string
industry: string
firmStyle: enum
difficulty: enum (easy | medium | hard)
caseType: enum (profitability | market_entry | growth | operations | market_sizing | strategy)
contextText: text
idealAnswerOutline: jsonb
keyMetrics: jsonb
isActive: boolean
version: integer
timesUsed: integer
createdAt: timestamp
updatedAt: timestamp
```

#### InterviewSession
```
id: uuid (PK)
userId: uuid (FK → User)
templateId: uuid (FK → InterviewTemplate)
caseId: uuid | null (FK → CaseLibrary)
firmStyle: enum (denormalized)
interviewType: enum (denormalized)
status: enum (in_progress | completed | abandoned | evaluation_pending | evaluated)
startedAt: timestamp
completedAt: timestamp | null
durationSeconds: integer | null
turnCount: integer
createdAt: timestamp
```

#### Transcript
```
id: uuid (PK)
sessionId: uuid (FK → InterviewSession, unique)
turns: jsonb [{role: 'interviewer'|'user', content: string, timestamp: iso8601}]
updatedAt: timestamp
```

#### Scorecard
```
id: uuid (PK)
sessionId: uuid (FK → InterviewSession, unique)
userId: uuid (FK → User)
overallScore: decimal(4,2)
dimensionScores: jsonb {
  structure: {score, rationale, evidenceSnippets[]},
  hypothesis: {score, rationale, evidenceSnippets[]},
  quantitative: {score, rationale, evidenceSnippets[]},
  businessJudgment: {score, rationale, evidenceSnippets[]},
  synthesis: {score, rationale, evidenceSnippets[]},
  communication: {score, rationale, evidenceSnippets[]},
  confidence: {score, rationale, evidenceSnippets[]}
}
topStrengths: text[3]
topWeaknesses: text[3]
strengthTagKeys: text[]
weaknessTagKeys: text[]
evaluatorModel: string
evaluatorPromptVersion: string
reliabilityFlag: boolean
nextActions: text[]
createdAt: timestamp
```

#### WeaknessTag
```
id: uuid (PK)
userId: uuid (FK → User)
tagKey: string (canonical, e.g. 'structure_not_mece')
tagLabel: string
dimension: enum (structure | hypothesis | quantitative | business_judgment | synthesis | communication | confidence)
occurrenceCount: integer
isPersistent: boolean  (true if occurrenceCount >= 3)
lastSeenAt: timestamp
firstSeenAt: timestamp
sessionIds: uuid[]
updatedAt: timestamp
UNIQUE (userId, tagKey)
```

#### DrillRecommendation
```
id: uuid (PK)
userId: uuid (FK → User)
sourceSessionId: uuid | null (FK → InterviewSession)
targetTagKeys: text[]
drillType: enum (mini_case | math_exercise | synthesis_prompt | communication_exercise)
title: string
description: string
promptContent: text
status: enum (pending | in_progress | completed | skipped)
completedAt: timestamp | null
sessionId: uuid | null (FK → InterviewSession)
createdAt: timestamp
```

#### ProgressSnapshot
```
id: uuid (PK)
userId: uuid (FK → User)
snapshotDate: date
triggerSessionId: uuid (FK → InterviewSession)
sessionCount: integer
avgOverallScore: decimal(4,2)
dimensionAvgScores: jsonb {structure: number, ...}
readinessLevel: enum (not_started | developing | approaching_ready | interview_ready)
tier: enum (bronze | silver | gold | emerald)
persistentWeaknessTagKeys: text[]
createdAt: timestamp
```

#### PromptTemplate
```
id: uuid (PK)
name: string (unique slug)
type: enum (interviewer_system | evaluator_dimension | drill_generation | recommendation)
content: text
version: integer
isActive: boolean
createdAt: timestamp
updatedAt: timestamp
```

#### RubricConfig
```
id: uuid (PK)
key: string (unique)
dimensions: jsonb {
  structure: { description, bands: [{range: [1,3], anchor}, ...] },
  ...
}
version: integer
isActive: boolean
createdAt: timestamp
```

### Derived vs Persisted

| Data | Strategy |
|---|---|
| Overall score | Derived (weighted avg). Persisted in Scorecard for fast reads. |
| Readiness level / tier | Derived formula. Persisted in ProgressSnapshot. |
| Weakness heatmap | Derived from WeaknessTag.occurrenceCount. Not separately persisted. |
| Score trends | Derived from ProgressSnapshot history. |
| Dimension averages over time | Derived from ProgressSnapshot.dimensionAvgScores history. |

### Versioning
`PromptTemplate` and `RubricConfig` are versioned. Each `Scorecard` stores `evaluatorPromptVersion` so historical scorecards remain interpretable after prompt changes.

---

## 7. AI System Design

The AI layer is broken into **7 discrete stages**, each with its own prompt contract. No monolithic prompt handles everything.

### Stage 1: Case Selection

**Trigger:** User starts a new session (not behavioral/drill)

**Process:** Deterministic DB query, no AI call. Select from `CaseLibrary` WHERE `firmStyle = userStyle AND caseType compatible with interviewType AND isActive = true` ORDER BY `timesUsed ASC`. Fall back to Generic style if no match.

**Output:** `CaseLibrary` record

---

### Stage 2: Interviewer Initialization

**Trigger:** Session start, after case selection

**System prompt structure:**
```
You are a [FIRM_STYLE] consulting interviewer named [NAME].
Persona: [firm-specific behavioral description]
Case context: [case contextText injected here]
Behavioral rules:
- If candidate answer lacks quantification: ask for specific numbers
- If hypothesis is stated without evidence: challenge it
- If structure is missing: ask to re-structure before proceeding
- Do NOT compliment unless answer is genuinely strong (score 8+)
- Target 20-25 turns total
- Never reveal scoring criteria or rubric
Opening: [firm-specific opening line]
```

**Output:** First interviewer turn (streamed to chat)

---

### Stage 3: Interview Runtime (Per-Turn)

**Trigger:** Each user message

**Input:** System prompt (from Stage 2) + full conversation history + latest user turn

**Process:** Standard chat completion (streaming). Pushback and behavioral rules enforced entirely by system prompt.

**Model:** `gpt-4o` (primary). `claude-3-5-sonnet` (fallback).

---

### Stage 4: Evaluation Pipeline (Post-Session, Async)

Runs as Inngest background job.

#### Stage 4a: Transcript Chunking by Dimension

No AI call. Parse transcript into dimension-relevant segments using keyword/topic heuristics:
- Structure → opening framework exchanges
- Quantitative → turns involving numbers, math, estimates
- Synthesis → closing summary / recommendation exchanges
- Communication → all turns (overall quality assessment)

#### Stage 4b: Per-Dimension Evaluation (7 Parallel Calls)

One AI call per dimension:
```
You are evaluating a consulting interview candidate on the [DIMENSION] dimension.
Rubric anchors:
  1-3: [anchor text from RubricConfig]
  4-6: [anchor text]
  7-8: [anchor text]
  9-10: [anchor text]

Relevant transcript excerpts:
[chunked turns for this dimension]

Case context:
[case idealAnswerOutline and keyMetrics]

Return JSON:
{
  "dimension": "[DIMENSION]",
  "score": <1-10 integer>,
  "rationale": "<2-3 sentences>",
  "evidenceSnippets": ["<exact quote from transcript>", ...],
  "tagKeys": ["<canonical_tag_key>", ...] // from allowed taxonomy only
}

IMPORTANT: Quote exact words from the transcript as evidence. Do not assert behaviors not present in the transcript.
```

**Allowed tag taxonomy (excerpt):**
```
structure_not_mece, structure_no_framework, structure_too_narrow,
hypothesis_vague, hypothesis_missing, hypothesis_not_data_driven,
quantitative_math_error, quantitative_no_numbers, quantitative_estimation_weak,
synthesis_no_recommendation, synthesis_weak_summary,
communication_too_long, communication_unclear, communication_filler_heavy,
business_judgment_surface_level, business_judgment_wrong_priority,
confidence_hesitant, confidence_backtracking
```
(Full taxonomy: ~40 tags in `config/rubrics/weakness-taxonomy.json`)

#### Stage 4c: Scorecard Synthesis

One AI call with all 7 dimension results:
```
Given these 7 dimension evaluations: [JSON array from 4b]
Return:
{
  "overallScore": <weighted average: structure 20%, hypothesis 15%, quantitative 15%, businessJudgment 20%, synthesis 15%, communication 10%, confidence 5%>,
  "topStrengths": ["<3 specific observed strengths>"],
  "topWeaknesses": ["<3 specific observed weaknesses>"],
  "nextActions": ["<3 concrete practice recommendations>"],
  "reliabilityFlag": <true if any dimension score feels uncertain>
}
```

#### Stage 4d: Weakness Tag Aggregation (DB, No AI)

For each `tagKey` in `weaknessTagKeys`: upsert `WeaknessTag`, increment `occurrenceCount`, update `lastSeenAt`, set `isPersistent = true` if `occurrenceCount >= 3`.

---

### Stage 5: Drill Generation

**Input:** Top 2 persistent weakness tag keys + user profile

**Prompt:**
```
Generate a focused drill exercise targeting these weaknesses:
Tags: [tagKey1, tagKey2]
User experience level: [level]
Firm style: [style]

Return JSON:
{
  "title": "<drill title>",
  "description": "<1-2 sentence description>",
  "drillType": "<mini_case | math_exercise | synthesis_prompt | communication_exercise>",
  "promptContent": "<full system prompt for a 10-15 turn drill interviewer>"
}
```

---

### Stage 6: Drill Evaluation (Simplified)

Same as Stage 4 but evaluates only 2-3 dimensions relevant to the drill's target tags. Produces a mini-scorecard.

---

### Stage 7: Progress Snapshot (DB, No AI)

After each evaluation:
1. Query all `Scorecard` records for user, compute `avgOverallScore` and `dimensionAvgScores`
2. Readiness level: `not_started` (0 sessions), `developing` (1-4 sessions or avgScore < 5.0), `approaching_ready` (5+ sessions, 5.0-7.4), `interview_ready` (5+ sessions, ≥7.5)
3. Tier: Bronze (<5.0), Silver (5.0-6.4), Gold (6.5-7.9), Emerald (8.0+)
4. Insert `ProgressSnapshot`

---

### Hallucination Reduction Strategy

| Risk | Mitigation |
|---|---|
| Evaluator invents behaviors | Mandatory `evidenceSnippets` with direct quotes |
| Inconsistent scores across runs | Per-dimension rubric anchors; `reliabilityFlag` |
| Tags outside taxonomy | Taxonomy listed in prompt; post-processing strips unknown keys |
| Interviewer reveals rubric | System prompt: "Never reveal scoring rubric or dimensions" |
| Interviewer too soft | System prompt: "Do NOT compliment unless score would be 8+" |

---

## 8. Technical Architecture Recommendation

### Stack Decisions

| Layer | Recommended | Fallback | Rationale |
|---|---|---|---|
| Frontend | Next.js 15 (App Router) | — | SSR for dashboard; streaming support |
| UI | Tailwind CSS + shadcn/ui | — | Fast, composable |
| Auth | **Auth.js v5 + Google OAuth** | Supabase Auth + Google | Free, no per-seat costs, native App Router support |
| Database | Supabase (Postgres) | Neon | Free tier; managed; includes storage |
| ORM | Drizzle | Prisma | TypeScript-native schema; smaller bundle |
| Primary LLM | OpenAI GPT-4o | — | Best structured JSON output |
| Secondary LLM | Anthropic Claude 3.5 Sonnet | — | Fallback; diversity in evaluator pipeline |
| LLM Abstraction | Custom thin wrapper (`lib/ai/providers.ts`) | Vercel AI SDK | Minimal; no LangChain overhead |
| Background Jobs | Inngest | Trigger.dev | Best Next.js integration; generous free tier |
| Analytics | PostHog | — | Session recording + events + funnels |
| Payments | Stripe | — | Industry standard |
| Hosting | **Vercel (deployed via Vercel MCP)** | Railway | Native Next.js deployment |
| Storage | Supabase Storage | S3 | For future audio files |
| Design system | `/impeccable` + `ui-ux-pro-max` | — | Production-grade craft; OKLCH; pre-delivery checklists |

### Key Architecture Decisions

**Auth (Google OAuth):**
- Install `next-auth@beta` (Auth.js v5)
- Configure `auth.ts` with GoogleProvider using `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`
- Use DrizzleAdapter to persist sessions/accounts to Supabase Postgres
- `middleware.ts` uses `auth()` from Auth.js for route protection
- On first sign-in, Auth.js `signIn` callback creates/upserts `User` row in DB
- No Clerk dependency anywhere

**Streaming:** OpenAI SDK streaming for chat interface. Most user-visible performance concern.

**Evaluation async:** Evaluation NEVER runs synchronously. Always Inngest. Target <30s end-to-end. Dashboard polls `GET /api/evaluation/status/[sessionId]`.

**Provider abstraction:**
```typescript
// lib/ai/providers.ts
export const llm = {
  chat: (model: 'gpt-4o' | 'claude-3-5-sonnet', messages, options) => ...,
  json: (model, messages, schema, options) => ...  // structured output
}
```

**Design system setup (before any UI code):**
1. Run `node .claude/skills/impeccable/scripts/context.mjs` — reports NO_PRODUCT_MD on new project
2. Run `/impeccable init` → create `PRODUCT.md` and `DESIGN.md`
3. Run `node .claude/skills/impeccable/scripts/palette.mjs` → brand seed color; compose OKLCH palette
4. Run `python3 skills/ui-ux-pro-max/scripts/search.py "consulting interview AI SaaS dashboard professional" --design-system -p "CaseForge AI"`
5. All colors as OKLCH CSS custom properties in `app/globals.css`. No hex. No HSL fallbacks.

**Vercel MCP deployment (final step):**
- Use `/vercel:deploy` skill for production deployment
- Configure env vars in Vercel dashboard before first deploy
- Preview deploys on every branch automatically

---

## 9. Build Sequence

### Phase 0: Setup, Design System, and Skeleton (Days 1-3)

**Objective:** Working app shell with Google auth, DB, production-grade design system, and navigation deployed to Vercel.

**Features:**
- Next.js 15 project init with Tailwind, shadcn/ui, TypeScript strict, ESLint, Prettier
- `/impeccable init` → `PRODUCT.md` + `DESIGN.md`
- `palette.mjs` → brand seed color → OKLCH palette defined in `app/globals.css`
- `ui-ux-pro-max` design system generation
- Auth.js v5 + Google OAuth + DrizzleAdapter
- Google sign-in page (single button, no email/password)
- Route protection via `middleware.ts`
- Supabase + Drizzle schema (all tables) + initial migration
- App shell: all routes scaffolded with empty states (designed to brand)
- Deploy skeleton to Vercel via `/vercel:deploy`

**Files:** `PRODUCT.md`, `DESIGN.md`, `app/globals.css`, `auth.ts`, `middleware.ts`, `lib/db/schema.ts`, `lib/db/index.ts`, `app/layout.tsx`, `app/(auth)/sign-in/page.tsx`, `app/(app)/dashboard/page.tsx`

**Risks:** Google OAuth consent screen setup; Auth.js DrizzleAdapter requires exact schema for `users`, `accounts`, `sessions`, `verification_tokens` tables

**Definition of done:** User can sign in with Google, see empty dashboard with correct branding, app deployed to Vercel preview URL.

---

### Phase 1: Onboarding and Profile (Days 4-5)

**Objective:** Users can create and update candidate profile after Google sign-in.

**Features:**
- Auth.js `signIn` callback → upsert `User` in DB (no webhook needed)
- Post-sign-in redirect logic (profile check → `/onboarding/profile` or `/dashboard`)
- Profile form: target firms (multi-select chips), role, experience level, interview date, optional self-assessment
- `GET/POST/PATCH /api/profile`
- Dashboard shows Google avatar + name
- Premium form craft: custom focus rings, smooth transitions, designed error states

**Files:** `app/api/profile/route.ts`, `app/(app)/onboarding/profile/page.tsx`, `components/shared/profile-form.tsx`, `lib/db/queries/profile.ts`, `lib/auth/session.ts`

**Risks:** Auth.js session typing is loose by default; extend `Session` type in `auth.ts` to include `userId` and `planTier`

**Definition of done:** User signs in with Google → profile form → data persists → reaches dashboard with avatar and name visible.

---

### Phase 2: Interview Runtime (Days 5-9)

**Objective:** User can complete a full text-based mock interview end to end.

**Features:**
- Seed 12 `InterviewTemplate`, 20 `CaseLibrary`, 12 `PromptTemplate` (interviewer), `RubricConfig`
- Interview setup page (type + firm style selector)
- `POST /api/interview/start` → creates session, returns first AI turn (streaming)
- Streaming chat interface with message bubbles, typing indicator, smooth scroll
- `POST /api/interview/turn` (streaming), `POST /api/interview/end`
- Transcript saved to DB every turn
- Feedback page "Generating feedback..." loading state

**Files:** `lib/ai/interview.ts`, `lib/ai/providers.ts`, `lib/prompts/interviewer/` (12 files), `app/api/interview/`, `app/(app)/interview/new/page.tsx`, `app/(app)/interview/[sessionId]/page.tsx`, `components/interview/`, `db/seed/`

**Risks:** Streaming implementation complexity; Inngest local dev setup

**Definition of done:** User completes 15+ turn MBB case mock. Transcript in DB. Feedback loading state shows.

---

### Phase 3: Scoring and Feedback (Days 10-14)

**Objective:** Sessions produce structured scorecards; feedback reports are readable and well-designed.

**Features:**
- Inngest `evaluate-session` job (7-stage pipeline)
- 7 per-dimension evaluator prompts
- Scorecard written to DB
- `GET /api/evaluation/status/[sessionId]` polling
- Feedback page: overall score, 7 dimension cards with evidence snippets, top strengths/weaknesses, next actions
- Transcript viewer (collapsible)
- `/impeccable audit` on feedback page

**Files:** `lib/ai/evaluator.ts`, `lib/prompts/evaluator/` (7 files), `inngest/functions/evaluate-session.ts`, `app/api/evaluation/`, `app/(app)/feedback/[sessionId]/page.tsx`, `components/feedback/`

**Risks:** 7 parallel AI calls → latency spike; evaluator prompt calibration quality

**Definition of done:** Scorecard appears within 30 seconds of session end. All 7 dimensions scored with evidence snippets and rationale.

---

### Phase 4: Weakness Memory and Drills (Days 15-18)

**Objective:** Weakness patterns persist across sessions; targeted drills available.

**Features:**
- Inngest post-evaluation step: upsert `WeaknessTag` records
- "Your patterns" section on feedback page
- Drill generation AI call + `DrillRecommendation` creation
- Drill interface (10-15 turn focused session)
- Mini scorecard for drill completion
- "Launch Drill" CTA on feedback page

**Files:** `lib/ai/weakness.ts`, `lib/ai/recommender.ts`, `lib/prompts/drills/drill-generator.md`, `inngest/functions/generate-drills.ts`, `app/api/drills/`, `app/(app)/drills/[drillId]/page.tsx`, `components/drills/`, `config/rubrics/weakness-taxonomy.json`

**Risks:** Tag taxonomy too coarse; drill quality too generic

**Definition of done:** After 2 sessions with same weakness tag, `isPersistent: true`. User launches drill and receives mini scorecard.

---

### Phase 5: Dashboard and Progress (Days 19-22)

**Objective:** Dashboard reflects full longitudinal history and readiness trajectory.

**Features:**
- `ProgressSnapshot` generation after each evaluation job
- Score history chart (last 10 sessions)
- Skill radar chart (dimension averages)
- Weakness heatmap (tag frequency)
- Tier badge + readiness level
- Session history table
- "Next recommended action" banner
- Empty/partial states (0 and 1 session)

**Files:** `inngest/functions/snapshot-progress.ts`, `lib/db/queries/dashboard.ts`, `app/api/dashboard/route.ts`, `app/(app)/dashboard/page.tsx`, `components/dashboard/`

**Risks:** Chart library choice (Recharts recommended for Next.js); mobile responsiveness

**Definition of done:** After 3 sessions, dashboard shows score trend chart, weakness heatmap, and correct tier badge.

---

### Phase 6: Admin Tooling (Days 23-26)

**Objective:** Internal team can manage content without direct DB access.

**Features:**
- Admin route group protected by email allowlist middleware
- Case library CRUD
- Interview template manager
- Prompt template editor with version history
- Rubric config editor

**Files:** `app/(admin)/`, `app/api/admin/`, `components/admin/`, `lib/db/queries/admin.ts`

**Risks:** Admin route security must be airtight

**Definition of done:** Admin adds a new case and edits a prompt template; changes reflected in new sessions without code deployment.

---

### Phase 7: Monetization, Polish, and Production Deploy (Days 27-34)

**Objective:** Free/Pro gating works, Stripe processes subscriptions, UI passes all quality gates, product deployed to production.

**Features:**
- Free tier enforcement: 1 full mock + 3 drills (middleware check on session start)
- Stripe subscription (monthly Pro plan)
- Stripe webhook handler: subscription created/cancelled → update `planTier`
- Upgrade modals (designed to brand)
- PostHog event instrumentation (all key actions)
- Resend email: "feedback ready" notification
- **`/impeccable polish`** pass on all pages: contrast, motion, typography, mobile
- **`ui-ux-pro-max` pre-delivery checklist** on all pages
- **`/impeccable audit`** on dashboard + feedback pages
- Error states for all surfaces (loading, empty, error, success) designed to brand
- Mobile responsiveness pass at 375px
- **Production deploy via Vercel MCP** (`/vercel:deploy`): configure env vars, deploy, promote to production

**Files:** `app/api/webhooks/stripe/route.ts`, `app/(app)/billing/page.tsx`, `lib/analytics/posthog.ts`, `lib/email/resend.ts`, middleware plan gating

**Risks:** Stripe webhook reliability; paywall edge cases; production env var configuration

**Definition of done:** Free user blocked after 1 mock. Stripe checkout works. All pages pass impeccable + ui-ux-pro-max checklists. App live on production Vercel URL.

---

## 10. Repo Structure

```
caseforge-ai/
├── PRODUCT.md                              (impeccable: product context + design intent)
├── DESIGN.md                               (impeccable: committed design system)
├── auth.ts                                 (Auth.js v5: GoogleProvider + DrizzleAdapter + typed Session)
├── middleware.ts                           (Auth.js route protection + admin guard + plan gating)
├── drizzle.config.ts
├── next.config.ts
├── tailwind.config.ts
├── app/
│   ├── globals.css                         (OKLCH design tokens: bg, surface, ink, accent, muted, brand)
│   ├── layout.tsx
│   ├── page.tsx                            (landing page)
│   ├── (auth)/
│   │   └── sign-in/page.tsx               (single "Sign in with Google" button)
│   ├── (app)/
│   │   ├── layout.tsx                      (protected layout with nav)
│   │   ├── dashboard/page.tsx
│   │   ├── onboarding/profile/page.tsx
│   │   ├── interview/
│   │   │   ├── new/page.tsx               (setup: type + firm style selector)
│   │   │   └── [sessionId]/page.tsx       (live streaming chat)
│   │   ├── feedback/[sessionId]/page.tsx
│   │   ├── drills/[drillId]/page.tsx
│   │   ├── profile/page.tsx
│   │   └── billing/page.tsx
│   ├── (admin)/
│   │   ├── layout.tsx                      (admin guard)
│   │   ├── cases/page.tsx
│   │   ├── templates/page.tsx
│   │   ├── rubrics/page.tsx
│   │   └── prompts/page.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts     (Auth.js handler)
│       ├── webhooks/stripe/route.ts
│       ├── profile/route.ts
│       ├── interview/
│       │   ├── start/route.ts
│       │   ├── turn/route.ts
│       │   └── end/route.ts
│       ├── evaluation/
│       │   ├── status/[sessionId]/route.ts
│       │   └── retry/[sessionId]/route.ts
│       ├── drills/
│       │   ├── generate/route.ts
│       │   └── [drillId]/route.ts
│       ├── dashboard/route.ts
│       ├── admin/
│       │   ├── cases/route.ts
│       │   ├── templates/route.ts
│       │   └── prompts/route.ts
│       └── inngest/route.ts
├── components/
│   ├── ui/                                 (shadcn components)
│   ├── interview/
│   │   ├── chat-interface.tsx
│   │   ├── message-bubble.tsx
│   │   ├── interview-setup-modal.tsx
│   │   └── session-controls.tsx
│   ├── feedback/
│   │   ├── scorecard.tsx
│   │   ├── dimension-card.tsx
│   │   ├── evidence-snippet.tsx
│   │   ├── drill-cta.tsx
│   │   └── transcript-viewer.tsx
│   ├── dashboard/
│   │   ├── score-chart.tsx
│   │   ├── skill-radar.tsx
│   │   ├── weakness-heatmap.tsx
│   │   ├── tier-badge.tsx
│   │   ├── readiness-banner.tsx
│   │   └── session-history-table.tsx
│   ├── drills/
│   │   ├── drill-card.tsx
│   │   └── mini-scorecard.tsx
│   └── shared/
│       ├── nav.tsx
│       ├── page-layout.tsx
│       ├── loading-state.tsx
│       └── upgrade-modal.tsx
├── lib/
│   ├── ai/
│   │   ├── providers.ts                    (OpenAI + Anthropic thin wrapper)
│   │   ├── interview.ts                    (interview engine)
│   │   ├── evaluator.ts                    (scoring pipeline orchestrator)
│   │   ├── weakness.ts                     (tag extraction + aggregation)
│   │   └── recommender.ts                  (drill recommendation generator)
│   ├── db/
│   │   ├── schema.ts                       (complete Drizzle schema)
│   │   ├── index.ts                        (db client singleton)
│   │   └── queries/
│   │       ├── profile.ts
│   │       ├── sessions.ts
│   │       ├── scorecards.ts
│   │       ├── weakness-tags.ts
│   │       ├── drills.ts
│   │       └── dashboard.ts
│   ├── prompts/
│   │   ├── interviewer/
│   │   │   ├── mbb-case.md
│   │   │   ├── mbb-behavioral.md
│   │   │   ├── mbb-market-sizing.md
│   │   │   ├── big4-case.md
│   │   │   ├── big4-behavioral.md
│   │   │   ├── big4-market-sizing.md
│   │   │   ├── boutique-case.md
│   │   │   ├── boutique-behavioral.md
│   │   │   ├── boutique-market-sizing.md
│   │   │   ├── generic-case.md
│   │   │   ├── generic-behavioral.md
│   │   │   └── generic-market-sizing.md
│   │   ├── evaluator/
│   │   │   ├── structure.md
│   │   │   ├── hypothesis.md
│   │   │   ├── quantitative.md
│   │   │   ├── business-judgment.md
│   │   │   ├── synthesis.md
│   │   │   ├── communication.md
│   │   │   └── confidence.md
│   │   └── drills/
│   │       └── drill-generator.md
│   ├── auth/
│   │   └── session.ts                      (typed session helper)
│   ├── analytics/
│   │   └── posthog.ts
│   ├── email/
│   │   └── resend.ts
│   └── utils/
│       ├── readiness.ts                    (tier + readiness computation)
│       └── scores.ts                       (weighted score aggregation)
├── inngest/
│   ├── client.ts
│   └── functions/
│       ├── evaluate-session.ts             (main evaluation pipeline)
│       ├── generate-drills.ts
│       └── snapshot-progress.ts
├── db/
│   ├── migrations/
│   └── seed/
│       ├── cases.ts                        (20 seeded cases)
│       ├── templates.ts                    (12 interview templates)
│       └── rubrics.ts                      (default rubric config)
├── config/
│   ├── rubrics/
│   │   ├── scoring-dimensions.json         (rubric anchors per dimension per band)
│   │   └── weakness-taxonomy.json          (~40 canonical tag definitions)
│   └── firm-styles/
│       └── styles.json                     (persona + behavioral config per firm style)
├── tests/
│   ├── unit/
│   │   ├── scores.test.ts
│   │   ├── readiness.test.ts
│   │   └── weakness-aggregation.test.ts
│   ├── integration/
│   │   ├── interview-flow.test.ts
│   │   └── evaluation-pipeline.test.ts
│   └── prompts/
│       ├── fixtures/
│       └── regression.test.ts
└── docs/
    ├── architecture.md
    ├── ai-system.md
    └── rubric-definitions.md
```

---

## 11. Testing and Quality Plan

### Unit Tests (Vitest)

- `scores.ts`: weighted average calculation, per-dimension validation (1-10), overall score bounds
- `readiness.ts`: tier assignment for all edge cases (exactly 5.0, exactly 7.5, 0 sessions)
- `weakness.ts`: tag aggregation, `isPersistent` transition at `occurrenceCount === 3`
- `evaluator.ts`: post-processing strips unknown tag keys from AI output

**Run:** `pnpm test:unit`

### Integration Tests (Vitest + test DB)

- Full interview flow: start → 3 turns → end → session in DB with correct status
- Evaluation pipeline: fixed transcript fixture → scorecard with expected structure
- Dashboard query: 5 scorecards → correct progress snapshot computation
- Plan gating: free user blocked from 2nd session with 403

**Run:** `pnpm test:integration`

### Prompt Regression Tests

15 canonical transcripts in `tests/prompts/fixtures/`. Each has transcript + expected score ranges (±1) + expected tag keys.

After each prompt change: run evaluator against all fixtures. Fail if score drifts >1 point or expected tag is missing.

**Run:** `pnpm test:prompts` (hits real OpenAI API; tag as `[slow]` in CI)

### Evaluation Reliability Tests

5 representative transcripts run 3× each. Assert dimension standard deviation < 0.75 points.

**Run:** `pnpm test:reliability` (run weekly or pre-release only)

### UX Validation (Manual Checklist)

Before each phase ships:
- [ ] Complete full mock interview as new user end-to-end
- [ ] Scorecard loads within 30 seconds of session end
- [ ] All 7 dimensions have readable rationale and at least 1 evidence snippet
- [ ] Dashboard reflects correct tier after 3+ sessions
- [ ] Drill launches correctly from feedback page
- [ ] Mobile layout usable on 375px viewport

### impeccable Pre-Delivery Checklist

Before Phase 7 deploy:
- [ ] `/impeccable audit` on dashboard page
- [ ] `/impeccable audit` on feedback page
- [ ] `/impeccable polish` pass on all pages
- [ ] `ui-ux-pro-max` pre-delivery checklist on all pages (SVG icons, cursor-pointer, hover states, contrast 4.5:1, responsive at 375/768/1024/1440px)

### Analytics Instrumentation

```
session_started {interviewType, firmStyle, userId}
session_completed {sessionId, turnCount, durationSeconds}
scorecard_viewed {sessionId, overallScore}
drill_launched {drillId, triggerTagKey}
drill_completed {drillId}
dashboard_viewed {sessionCount, tier}
upgrade_clicked {source}
subscription_created {plan}
```

### Failure-State Testing

- LLM timeout during turn → retry × 3 with backoff, then error toast. Max 10s before user sees error.
- Inngest job fails → session stays `evaluation_pending`; retry button on feedback page
- DB write fails mid-turn → transcript reconstructed from conversation history on retry
- Admin edits active prompt → new sessions use new template; in-flight sessions unaffected

---

## 12. Risks and Mitigations

| # | Risk | Category | Mitigation |
|---|---|---|---|
| 1 | Evaluator inconsistent scores | AI | Per-dimension rubric anchors; evidence mandate; reliability tests; `reliabilityFlag` |
| 2 | Evaluator too lenient | AI | System prompt: "do not compliment unless 8+"; mandatory critique; calibrate against expert scores |
| 3 | Tags drift from taxonomy | AI | Taxonomy listed in prompt; post-processing strips unknown keys; prompt regression tests |
| 4 | Weak differentiation | Product | Win on: cross-session weakness memory + rubric evidence + longitudinal dashboard |
| 5 | Bad UX after first mock | UX | Auto-redirect to feedback; "what to do next" always visible; email when feedback ready |
| 6 | Evaluation latency >45 seconds | Technical | Parallel 7-dimension calls; Inngest retry; live "processing" state on feedback page |
| 7 | Prompt brittleness after updates | AI | Version all prompts; regression tests; never deploy prompt change without `pnpm test:prompts` |
| 8 | Copyright risk from case content | Legal | Write all case content originally; document provenance; never reproduce proprietary materials |
| 9 | Session transcript lost on browser close | Technical | Persist every turn to DB immediately (not batched) |
| 10 | Overbuilding before validation | Product | Ship Phases 0-3 as cohesive unit; measure activation before building Phase 4+ |
| 11 | Cold start: no cases | Content | Seed 20 cases across all firm styles before any user-facing launch |
| 12 | Free tier too restrictive | Business | Track activation rate; 1 full mock should demonstrate the loop; adjust if needed |

---

## 13. Immediate Next Actions

### First 3 files/artifacts to create before touching application code

1. **`PRODUCT.md`** — Created by `/impeccable init`. Defines product name, register (product/app UI), target user, core product loop, and design intent. Required before any color or component decisions. Drives palette seed and all `/impeccable` commands.

2. **`config/rubrics/scoring-dimensions.json`** — Complete rubric anchor definitions for all 7 dimensions across all 4 score bands (1-3, 4-6, 7-8, 9-10). Source of truth for evaluation. Must be finalized before writing any evaluator prompts.

3. **`config/rubrics/weakness-taxonomy.json`** — Complete canonical tag taxonomy (~40 tags with `key`, `label`, `dimension`, `description`). Must exist before writing evaluator prompts or post-processing logic.

### First 10 implementation tasks (in exact order)

- [ ] **Task 1:** Initialize Next.js 15 project with Tailwind, shadcn/ui, TypeScript strict, ESLint, Prettier. Run `/impeccable init` → `PRODUCT.md` + `DESIGN.md`. Run `palette.mjs` → brand seed color. Run `ui-ux-pro-max` design system search. Write OKLCH tokens into `app/globals.css`.
- [ ] **Task 2:** Create Google OAuth credentials in Google Cloud Console. Install `next-auth@beta`, configure `auth.ts` with GoogleProvider + DrizzleAdapter. Create `middleware.ts`. Build `/sign-in` page (single "Sign in with Google" button). Test: OAuth flow → session created.
- [ ] **Task 3:** Create Supabase project. Install Drizzle + Drizzle Kit. Write `lib/db/schema.ts` (Auth.js adapter tables + all CaseForge entities). Run first migration.
- [ ] **Task 4:** Wire Auth.js `signIn` callback → upsert `User` in DB. Build post-sign-in redirect (no `CandidateProfile` → `/onboarding/profile`; else → `/dashboard`). Test full first-login flow end-to-end.
- [ ] **Task 5:** Build profile form + `GET/POST/PATCH /api/profile`. Test: new user completes profile → data in DB → reaches dashboard with Google avatar + name visible.
- [ ] **Task 6:** Write seed scripts for `InterviewTemplate` (12), `CaseLibrary` (20), `PromptTemplate` (12 interviewer + 7 evaluator), `RubricConfig` (1 default). Run seed against dev DB.
- [ ] **Task 7:** Build interview setup page (`/interview/new`) with firm style + type selectors. Wire to `POST /api/interview/start` → creates `InterviewSession`, returns first AI turn (streaming).
- [ ] **Task 8:** Build streaming chat interface (`/interview/[sessionId]`): message list, input, `POST /api/interview/turn` (streaming), `POST /api/interview/end`. Transcript persists every turn. Apply impeccable craft: message bubbles, typing indicator, smooth scroll.
- [ ] **Task 9:** Set up Inngest (`inngest/client.ts`, `evaluate-session.ts` with 7-stage pipeline, `/api/inngest` route). Test: real transcript → scorecard in DB within 30 seconds.
- [ ] **Task 10:** Build feedback report page (`/feedback/[sessionId]`): poll for scorecard, render all 7 dimension cards with evidence snippets, strengths/weaknesses, next actions. Run `/impeccable audit` on this page.

### First engineering milestone

**Milestone: End-to-End Core Loop**

A new user signs in with Google, creates a profile, completes an MBB-style case mock interview, and receives a structured scorecard with 7 dimension scores backed by transcript evidence — all within a single session — and the feedback page loads within 30 seconds of session completion.

This milestone proves the core product hypothesis: structured AI feedback is meaningfully better than generic ChatGPT use. Everything else (weakness memory, drills, dashboard) builds on top of this loop.

---

## Open Questions

1. **Interview turn budget:** Should the interviewer end the session itself after N turns, or should the user always control session end? Recommendation: user controls end, but interviewer signals "we're nearing the end of our time" after 20 turns. Verify this feels natural in testing.

2. **Evaluation model cost:** Should per-dimension evaluations use GPT-4o (high quality, higher cost) or GPT-4o-mini (lower quality, lower cost)? For MVP use GPT-4o throughout; add cost tracking and consider model tiering post-launch based on actual spend.

3. **Email provider:** Resend or Postmark for "feedback ready" emails? Both are fine; Resend has simpler Next.js DX. Decide at Phase 7.
