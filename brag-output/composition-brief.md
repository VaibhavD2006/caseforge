# Composition Brief: CaseForge AI

## Objective
20-second app-store-tone promotional video showing the live consulting interview flow: setup → AI interview → scorecard → dashboard.

## Output
- Composition: `brag-output/composition/index.html` (GSAP + HTML, self-contained)
- Renderer: `brag-output/composition/render.js` (Playwright frame capture → ffmpeg)
- Video: `brag-output/brag.mp4`
- Format: landscape 1280×720

## Source Material
- Product: CaseForge AI — AI mock interview platform for consulting candidates
- Tagline: "Crack the case. Every session."
- Key visual: Scorecard with 5 dimension bars filling beat-by-beat
- Copy shown verbatim:
  - "Crack the case. / Every session."
  - "McKinsey & Company — Hypothesis-led · Structured logic · Analytical rigor"
  - "Walk me through your structure for a profitability case."
  - "Good. Prioritize one branch. Where's the pain?"
  - "Strong structure. Quantify the revenue impact before pivoting to cost drivers."

## Visual Identity
- Background: `#071A0A`
- Surface/card: `#0B1F0E`
- Accent: `#4ADE80`
- Muted: `#7A9F7E` / `#A7C4AB`
- Text: `#FAFAF9`
- Display font: DM Serif Display (Google Fonts CDN)
- Body font: Inter
- GSAP: self-hosted at `assets/js/gsap.min.js`

## Scenes
1. **Hook** (0–2.5s) — "Crack the case. / Every session." on dark green bg, badge pill, glow texture
2. **Interview Setup** (2.5–5.5s) — card with McKinsey + Full Case selected, cursor clicks "Begin interview"
3. **Live AI Interview** (5.5–10.0s) — chat: AI types question, user responds, AI pushback on beat
4. **Scorecard** (10.0–15.0s) — 5 dimension bars fill one-per-beat (10.93–13.11s), AI feedback slides in
5. **Dashboard** (15.0–18.0s) — 4 stat tiles stagger in, readiness bar fills to 74% at 17.47s
6. **Outro** (18.0–20.0s) — "CaseForge" logo + "Start practicing free →", fade to black

## Beat Lock
- Scorecard reveal start: 10.93s (strong_beat 0.97)
- Communication bar: 13.11s (strong_beat 0.98)
- Readiness bar: 17.47s (strong_beat 0.99)
- Logo tagline: 18.56s (strong_beat 0.99)
- Bar beat-grid: 10.93, 11.46, 12.02, 12.55, 13.11s

## Audio
- Music: `assets/music/happy-beats-business-moves-vol-12-by-ende-dot-app.mp3`
- Volume: 0.35, fades to 0 over 18.5–20.0s
- Render: mixed in by ffmpeg at assembly time (not played in browser during frame capture)

## Render Method
Node 22 unavailable (system has Node 20.10.0, Hyperframes requires 22+).
Rendered via `render.js`: Playwright headless browser seeks GSAP timeline per frame,
captures 600 PNG frames at 1280×720, ffmpeg assembles with music track.
