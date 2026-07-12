# Product Requirements Document

## Product name

Working title: CaseForge AI

## Product vision

CaseForge AI helps consulting candidates become interview-ready through realistic company-style mock interviews, strict recruiter-style scoring, persistent weakness tracking, and a dashboard that makes improvement measurable.

## Problem

Consulting candidates need many repetitions to become good at case and fit interviews, but human practice is expensive, inconsistent, and hard to schedule. General AI tools are cheap and flexible, yet external reviews highlight repeat problems: agreeable behavior, inconsistent grading, weak pushback, and no memory of repeated user weaknesses.[cite:1][cite:2]

Purpose-built prep tools improve on this with prebuilt cases and rubrics, but the market still shows room for stronger feedback loops, better progress tracking, and deeper company-style simulation.[cite:1]

## Users

### Primary user

A consulting candidate preparing for interviews within the next 1 to 8 weeks.

### Secondary user

A career switcher or university student who wants structured solo prep before paying for coaching.

## Jobs to be done

- Help the user practice realistic consulting interviews alone.
- Diagnose why the user's answers are weak.
- Recommend what to improve next.
- Track whether the user is actually getting better.
- Simulate pressure and interviewer pushback.

## Core product principles

- Feedback must be strict, not flattering.
- Scores must be explainable.
- The product must remember weakness patterns over time.
- Practice should feel tailored to target firms.
- The dashboard should convert prep into visible progress.

## User stories

### Onboarding

- As a user, I want to choose my target firms so mocks feel relevant.
- As a user, I want to declare my interview timeline so the product can adapt urgency and intensity.

### Practice

- As a user, I want to start a mock interview in one click.
- As a user, I want the interviewer to challenge weak answers instead of praising everything.
- As a user, I want different interview styles depending on the company type.

### Feedback

- As a user, I want to receive a breakdown of my performance across key skills.
- As a user, I want examples of what I said wrong and how to improve it.
- As a user, I want follow-up drills that target my weakest dimensions.

### Progress

- As a user, I want to see whether my scores are improving over time.
- As a user, I want to know my recurring mistakes.
- As a user, I want a readiness level that tells me whether I am interview-ready.

## Functional requirements

### FR1: Account and profile
- User can register and sign in.
- User profile stores target firms, interview type, role level, timeline, and previous experience.

### FR2: Interview generation
- System generates or selects a case consistent with chosen interview type and firm style.
- System stores interview script, prompts, and ideal rubric anchors.

### FR3: Interview runtime
- Chat interface supports multi-turn interaction.
- Interviewer can ask follow-up questions, push back, and redirect.
- User can pause or exit session.

### FR4: Evaluation
- System evaluates each session against fixed scoring dimensions.
- System outputs per-dimension score plus rationale.
- System identifies strength tags and weakness tags.

### FR5: Weakness memory
- System stores recurring weakness patterns across sessions.
- System uses weakness history for recommendations.

### FR6: Dashboard
- System shows overall score trend.
- System shows dimension trends.
- System shows repeated weakness categories.
- System shows badges / tiers based on progress.

### FR7: Drill recommendations
- System generates targeted follow-up drills from weakness tags.
- User can launch drills directly from feedback report.

### FR8: Admin tools
- Admin can add prompt templates.
- Admin can edit scoring rubric definitions.
- Admin can add structured case content.

## Non-functional requirements

- Average feedback generation under 10 seconds.
- Session transcript persistence.
- Explainable scoring output, not opaque single-number judgment.
- Mobile-friendly dashboard.
- Secure storage of user profiles and transcripts.

## Data model

### Main entities
- User
- CandidateProfile
- InterviewSession
- InterviewTemplate
- Scorecard
- WeaknessTag
- DrillRecommendation
- ProgressSnapshot

## Scoring model

Each session should produce:
- Overall score
- Skill-level scores
- Confidence interval or reliability flag
- Evidence snippets from transcript
- Recommended next actions

## Dashboard requirements

The dashboard should answer:
- How many mocks has the user completed?
- What is the current readiness score?
- Which skills are weakest?
- Which mistakes repeat most?
- Is the user improving over the last 5 sessions?

## Risks

### Risk 1: Hallucinated scoring

General AI systems can be inconsistent, especially if prompts are not tightly scaffolded.[cite:1][cite:2] Mitigation: fixed evaluator prompt schema, rubric anchors, transcript evidence extraction, and calibration tests.

### Risk 2: False confidence

AI tends to soften feedback unless explicitly designed otherwise.[cite:1][cite:2] Mitigation: adversarial interviewer behavior, mandatory critique section, and benchmark-based strictness rules.

### Risk 3: Copyright / data use

Using scraped proprietary interview content too literally creates legal and product-quality risk. Mitigation: use public source material for pattern extraction and create original case content in similar style.

### Risk 4: Weak differentiation

Many tools already offer AI mocks and scoring.[cite:1] Mitigation: focus on memory, strictness, company-style simulation, and better longitudinal dashboarding.

## MVP acceptance criteria

- User can onboard and choose target firm style.
- User can complete at least one mock interview end to end.
- System produces dimension-level scorecard and written feedback.
- Dashboard stores and displays historical progress.
- Weakness memory influences subsequent drill recommendations.

## Future roadmap

- Voice mode and speech scoring
- Peer benchmark percentile
- Human coach review marketplace
- University / bootcamp analytics portal
- AI-assisted interview mode for firms that test AI collaboration directly, reflecting the growing relevance of AI fluency in consulting assessment.[cite:1][cite:2]