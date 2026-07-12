# Build Plan

## Build philosophy

Use an incremental, bootstrap-first approach. Start with the smallest usable system that proves the core loop: mock interview -> scorecard -> weakness memory -> next drill -> dashboard progress. This fits both the market gap and the preferred low-complexity validation style for early product builds.[cite:1][cite:2]

## Recommended stack

- Frontend: Next.js
- UI: Tailwind + component system
- Auth: Clerk or Supabase Auth
- Database: Postgres via Supabase or Neon
- ORM: Prisma or Drizzle
- LLM orchestration: LangChain or direct provider SDKs
- Model providers: OpenAI + Anthropic abstraction
- Analytics: PostHog
- Background jobs: Inngest or Trigger.dev
- Storage: Supabase storage or S3

## Architecture modules

### 1. Web app
- Landing page
- Auth
- Dashboard
- Interview chat page
- Feedback page
- Drill page

### 2. Interview engine
- Prompt template selector
- Firm-style selector
- Case generator / retriever
- Runtime turn manager
- Pushback policy engine

### 3. Evaluation engine
- Rubric-based scorer
- Transcript chunk evaluator
- Weakness tagger
- Recommendation generator

### 4. Data layer
- User profile storage
- Session transcript storage
- Score history
- Weakness trend storage
- Prompt / case library tables

### 5. Admin layer
- Template manager
- Rubric editor
- Case library CRUD

## Phased implementation

### Phase 0: Product skeleton

- Set up repo, auth, DB, app shell, and navigation.
- Create base schema for users, sessions, scorecards, templates, and weakness tags.
- Build empty dashboard and chat surfaces.

### Phase 1: Text mock interview MVP

- Add structured interview templates.
- Build text-only interviewer loop.
- Save transcript.
- Generate scorecard after session.
- Show feedback summary.

This phase proves the minimum user value because it directly competes with general AI plus prompt engineering while adding structure and persistence.[cite:2]

### Phase 2: Weakness memory and drills

- Persist weakness tags.
- Build weak-skill drill generator.
- Add dashboard trend views.
- Add readiness level and tier system.

This is the key differentiation layer because external reviews repeatedly identify lack of weak-spot memory as a current limitation in AI practice tools.[cite:1][cite:2]

### Phase 3: Firm-style differentiation

- Add company-style prompt packs.
- Add Big Four vs MBB behavioral differences.
- Add more case types and industry contexts.

### Phase 4: Quality and monetization

- Add free / paid limits.
- Add payment flow.
- Add analytics and retention instrumentation.
- Improve evaluator reliability with offline calibration set.

### Phase 5: Voice and advanced realism

- Add speech-to-text.
- Add interruption logic.
- Add speaking metrics like filler-word frequency and response length.

## Claude execution order

When importing into Claude, build in this exact order:

1. Database schema
2. Auth and onboarding
3. Dashboard shell
4. Interview chat experience
5. LLM interview engine
6. Scoring pipeline
7. Weakness memory
8. Drill recommender
9. Admin tooling
10. Payments and polish

## Definition of done for each module

- Feature works end to end.
- Data persists correctly.
- Errors are handled cleanly.
- Prompt contracts are versioned.
- UI states exist for loading, empty, error, and success.

## Key metrics

- Activation: first mock completed.
- Week-1 retention.
- Average mocks per active user.
- Drill usage after feedback.
- Conversion from free to paid.
- Improvement trend over first 5 sessions.

## Testing plan

- Unit tests for scoring transforms and weakness tagging.
- Prompt regression tests using saved transcripts.
- UX testing on onboarding and score explanation clarity.
- Reliability review comparing outputs across repeated identical transcripts.

## What Claude should not do

- Do not overbuild voice before text MVP is validated.
- Do not create a huge scraping pipeline first.
- Do not rely on one opaque prompt for all scoring.
- Do not build enterprise admin before candidate workflow works.