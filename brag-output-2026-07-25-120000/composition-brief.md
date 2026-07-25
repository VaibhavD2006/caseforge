# Hyperframes Composition Brief: CaseForge AI

## Objective
Create a 20-second polished, cinematic launch-style promo video for CaseForge AI — an AI-powered consulting interview practice platform. The video lives on the landing page. It must feel premium, product-led, and trustworthy.

## Output
- Composition directory: `brag-output-2026-07-25-120000/composition/`
- Rendered video: `brag-output-2026-07-25-120000/brag.mp4`
- Format: landscape — 1920×1080
- Duration: 20 seconds

## Source Material
- Project root: `C:/Users/dandy/OneDrive/Documents/caseforge-ai`
- Primary files read: `app/landing-page.tsx`, `app/globals.css`, `app/(app)/dashboard/dashboard-client.tsx`, `app/(app)/feedback/[sessionId]/page.tsx`
- Product name: CaseForge AI
- Tagline / strongest claim: "Crack the case. Every session." — and: "A partner-level interviewer, always available"
- Key UI or visual moment to recreate: The session scorecard card (five dimension progress bars in `#4ADE80` green on dark `#071A0A` background) — this is the exact hero card from the landing page
- Copy that must appear verbatim:
  - "Crack the case. Every session."
  - "Readiness Dashboard"
  - "Session Scorecard"
  - "Start practicing free →"

## Creative Direction
- Tone preset: `polished`
- Creative direction: quiet premium product film — the product is confident, so the video is too
- Interpretation: Fewer scenes, longer holds. No hype. Every frame shows the product doing something real. Restraint is the luxury signal. Transitions are soft crossfades and clean slides. No flash cuts, no aggressive zooms.
- Angle: Most candidates prep in the dark. CaseForge shows what it looks like when that's actually solved — a partner-level AI that scores your logic the way MBB does, instantly. The video doesn't explain it. It shows the product doing it.
- Hook: CaseForge wordmark on deep green background, tagline fades in. Clean. Confident.
- Outro / punchline: Green CTA button slides up — "Start practicing free →" — then logo. Product has made its case.
- Avoid:
  - Generic SaaS language ("streamline your workflow", "unlock your potential")
  - Abstract filler visuals — every frame shows the product
  - Unrelated visual redesign — stay inside the `#071A0A` / `#4ADE80` brand palette

## Visual Identity
- Background: `#071A0A` (near-black, deep green tint)
- Surface / card: `#0B1F0E` (dark panel)
- Accent primary: `#4ADE80` (brand green, used for progress bars, CTA, logo)
- Accent secondary: `#86EFAC` (softer green, labels and captions)
- Text primary: `#FAFAF9` (near-white)
- Text muted: `#A7C4AB`, `#7A9F7E`
- Progress bar gradient: `linear-gradient(90deg, #16A34A, #4ADE80)`
- Card border: `rgba(74, 222, 128, 0.13)` (subtle green border)
- Glow effect: `radial-gradient(circle, rgba(74,222,128,0.08), transparent 70%)`
- Display font: DM Serif Display (Google Fonts, weight 400) — used for wordmark and tagline
- Body font: Inter — used for all UI text, labels, scores
- Visual references: The HeroCard component in landing-page.tsx is the gold standard. Recreate it exactly: dark `#0B1F0E` card, green border, macOS window dots, "Session Scorecard", dimension rows with labels in `#A7C4AB`, scores in `#4ADE80`, progress bars filling left-to-right.

## Storyboard
Use the storyboard in `brag-output-2026-07-25-120000/brag-plan.md` as the creative contract.

Scene summary:
1. Brand Hook — 3s (0:00–0:03) — CaseForge wordmark + "Crack the case. Every session." on dark green
2. Dashboard — 5s (0:03–0:08) — Readiness card: 4 stat tiles (Avg Score 7.4/10, Sessions 12, Tier Silver, Status On Track) + 74% progress bar filling
3. Live Interview — 6s (0:08–0:14) — Split layout: case prompt left / AI typing a follow-up right, cursor blinking, transcript appearing
4. Scorecard + CTA — 6s (0:14–0:20) — 5 dimension bars reveal one by one, AI feedback bubble, "Start practicing free →" CTA button

## Audio
- Audio role: cinematic bed — steady, warm, professional
- Audio arc: vol-12 bed at 0.35 throughout, fades 0.35 → 0.10 from 18s to 20s so CTA lands quietly
- Music: `assets/music/happy-beats-business-moves-vol-12-by-ende-dot-app.mp3`
- Music treatment: starts at t=0, volume 0.35, no beat drops or swells, gentle fade-out from 18s
- Music cue guidance: bundled preset at `skills/brag/assets/music/cues/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.json`. Beat tempo: ~110 BPM. Beat-lock Scene 3 entrance (interview room) at strongCue 8.74s (intensity 0.99). Beat-lock CTA reveal at strongCue 17.47s (intensity 0.99). Beat-grid 5 scorecard dimension bars starting at strongCue 13.11s (intensity 0.98), consecutive beats ~0.55s apart: 13.11s, 13.64s, 14.20s, 14.73s, 15.29s.
- Audio-reactive treatment: subtle; use music RMS/bass to make the hero glow breathe slightly and give the scorecard card a gentle presence pulse on reveal. No waveform/equalizer visuals, no strobing.
- Audio-coupled moments:
  - Scene 2 stat tiles (4 tiles at 3.5s, 3.9s, 4.3s, 4.7s) — soft `interface/drop_001` per tile at 0.60 volume
  - Scene 3 AI message type-out (~9.5s–11s) — randomized `keyboard/keypress-*.wav` per character at 0.22 volume, thin to 1-in-3 keypresses so it reads as quiet activity
  - Scene 4 dimension bars (5 bars, beat-grid at 13.11s–15.29s) — soft `interface/drop_001` or `interface/drop_002` per bar at 0.55 volume
  - Scene 4 AI feedback bubble settles (~15.5s, near beat 15.84s) — `impact/impactBell_heavy_000` at 0.42 volume
  - Scene 4 CTA button at strongCue 17.47s — `interface/click_001` at 0.55 volume
- SFX selection guidance: polished energy — minimal, restrained. Nothing above 0.65. `interface/drop` for soft pop-ins. `impact/impactBell_heavy_000` for the single major payoff (AI feedback reveal). `interface/click_001` for the CTA tap. Keyboard sounds for AI typing — thin out to avoid noise. Prefer low/medium HF risk files.
- SFX analysis guidance: `~/.claude/plugins/cache/brag/brag/0.2.2/skills/brag/assets/sfx/sfx-analysis.md` if present
- Exact SFX choice: Hyperframes should choose final filenames, timestamps, density, and volume based on the actual implemented animation timing
- Audio files: copy music from plugin cache `~/.claude/plugins/cache/brag/brag/0.2.2/skills/brag/assets/music/happy-beats-business-moves-vol-12-by-ende-dot-app.mp3` into `brag-output-2026-07-25-120000/composition/assets/music/`

## Hyperframes Instructions
Load `hyperframes-core`, `hyperframes-animation`, `hyperframes-creative`, `hyperframes-keyframes`, `hyperframes-cli` domain skills. /brag is its own workflow — do not enter the hyperframes entry-point intent interview. Prefer native Hyperframes conventions.

Requirements:
- Show at least one real UI element from the project: the Session Scorecard card with live dimension bars (Structure, Hypothesis, Numerics, Synthesis, Communication) is mandatory
- Keep all text readable — every label, score, and UI string holds long enough to read (short label: ~0.8s settled; sentence: ~0.3s/word minimum)
- Total duration: exactly 20 seconds
- Include the music and SFX layer as specified
- Music cue metadata is optional timing guidance — Hyperframes decides exact animation timing; ignore cues that hurt readability, pacing, or product story
- Beat-locked twos are marked `// beat-locked` in the composition
- Sequential bar reveals are marked `// beat-grid` with timestamps
- The composition must show the real brand: `#071A0A` bg, `#4ADE80` green, DM Serif Display for wordmark, Inter for UI
- Run `npx hyperframes check` before render — it is the single gate
- Render to `brag-output-2026-07-25-120000/brag.mp4`
