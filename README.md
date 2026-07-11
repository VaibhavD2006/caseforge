# CaseForge AI

AI-powered consulting case interview prep. Live mock interviews, instant 7-dimension scoring, and a readiness dashboard that tracks your progress toward offer-ready.

Built for candidates targeting McKinsey, BCG, Bain, and other MBB/T2 strategy firms.

---

## Features

- **AI Interviewer** — Adaptive mock interviews that mirror real case styles, with follow-up questions and pressure testing
- **7-Dimension Scorecard** — Structure, hypothesis quality, numerics, synthesis, communication, and more — scored and explained per session
- **Readiness Dashboard** — Aggregated progress score, weakness tag tracking, tier progression (Bronze → Silver → Gold → Platinum)
- **Drill Library** — 100+ case scenarios across industries (retail, healthcare, M&A, operations), difficulty scaled to your level
- **Goals Tracking** — Set and monitor prep milestones
- **Session History & Analytics** — Full history with filters, charts, and dimension trends over time

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript / React 19 |
| Styling | Tailwind CSS v4 + Shadcn UI |
| Animations | Framer Motion |
| Auth | Auth.js v5 (NextAuth) — Google OAuth |
| Database | PostgreSQL via Drizzle ORM |
| AI | Google Gemini + Ollama (local) |
| Background Jobs | Inngest (7-stage evaluation pipeline) |
| Charts | Recharts |
| Package Manager | pnpm |

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (`npm i -g pnpm`)
- PostgreSQL database
- [Ollama](https://ollama.ai) running locally (for local AI inference)
- Google Cloud project with OAuth credentials

### 1. Clone and install

```bash
git clone https://github.com/VaibhavD2006/caseforge.git
cd caseforge
pnpm install
```

### 2. Environment variables

Create a `.env.local` file:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/caseforge

# Auth.js
AUTH_SECRET=your-auth-secret         # generate with: openssl rand -base64 32
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret

# AI
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key

# Inngest (optional for local dev — uses dev server)
INNGEST_EVENT_KEY=your-inngest-event-key
INNGEST_SIGNING_KEY=your-inngest-signing-key
```

### 3. Database setup

```bash
pnpm db:generate   # generate migrations from schema
pnpm db:migrate    # apply migrations
pnpm db:seed       # seed sample data (optional)
```

### 4. Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

For the Inngest background pipeline (session evaluation), also run:

```bash
npx inngest-cli@latest dev
```

---

## Project Structure

```
app/
  (auth)/sign-in/       # Google OAuth sign-in page
  (app)/
    dashboard/          # Readiness dashboard + analytics widgets
    interview/          # Interview setup + live session room
    feedback/           # Post-session scorecard
    drills/             # Case drill library + attempt UI
    goals/              # Goal tracking
    analytics/          # Charts and dimension trends
    history/            # Session history with filters
    onboarding/         # Profile setup + screener
lib/
  ai/                   # AI providers (Gemini, Ollama), evaluator, drills
  db/                   # Drizzle schema, queries, migrations
  auth/                 # Session helpers
inngest/
  functions/            # 7-stage async evaluation pipeline
```

---

## AI Evaluation Pipeline

Each interview session is evaluated asynchronously via an Inngest pipeline:

1. Transcript ingestion
2. Structure scoring
3. Hypothesis quality analysis
4. Numerics assessment
5. Synthesis scoring
6. Communication grading
7. Weakness tag assignment + readiness snapshot update

---

## Database

Managed with [Drizzle ORM](https://orm.drizzle.team). Useful commands:

```bash
pnpm db:studio    # open Drizzle Studio (visual DB browser)
pnpm db:push      # push schema changes without migration files (dev only)
```

---

## License

MIT
