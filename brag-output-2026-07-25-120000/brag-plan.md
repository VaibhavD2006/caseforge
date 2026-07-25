# Brag Plan: CaseForge AI

## What is this app?
CaseForge AI is an AI-powered consulting interview platform that runs live mock case interviews, scores every response across 7 dimensions instantly, and tracks readiness until candidates are genuinely ready for McKinsey, BCG, and Bain — without scheduling a coach or waiting for feedback.

## The angle
Most candidates prep in the dark — prep books, one or two expensive mock sessions, no real signal on where they're breaking down. CaseForge is what it looks like when that problem is actually solved: a partner-level interviewer always available, scoring your logic the way MBB does, in seconds. The video doesn't explain that. It shows the product doing it.

## Hook (first 2-3 seconds)
The CaseForge wordmark emerges on the deep `#071A0A` dark-green background. The tagline "Crack the case. Every session." fades up. A green glow pulses once. This is the product at rest before it does its thing — confident, clean, no noise.

## Key moments (the middle)
- The readiness dashboard: Silver tier badge, "74%" progress bar filling from 0, "Avg Score 7.4/10" stat ticking up — the system tracking you.
- The interview room: split layout — case prompt on the left, AI conversation typing on the right. One sharp AI follow-up line appears: *"What would drive the cost reduction in year one?"* The product is live and thinking.
- The scorecard reveal: 5 dimension bars animate left to right one by one — Structure 8.2, Hypothesis 7.5, Numerics 6.8, Synthesis 7.9, Communication 8.5 — in `#4ADE80` green. The AI feedback bubble fades in: "Strong structure. Quantify the revenue impact before pivoting."

## Outro / punchline
The product logo returns on dark green with a single line: **"Start practicing free →"** in the green CTA button. No claims. No pitch. Just the invitation after the product has already made its case.

## User flow worth showing
1. Entry: Dashboard with readiness score, tier, session stats — the system that knows where you stand
2. Key action: Interview room — AI conducting a live McKinsey-style case, asking a follow-up, voice/transcript in real time
3. Result: Scorecard with dimension bars and AI written feedback — the scoring that tells you exactly what to fix

## Tone
- Preset: `polished`
- Creative direction: quiet premium product film — the product is confident, so the video is too
- Interpretation: Fewer scenes, longer holds. No hype. Every visual is the product doing something real. Restraint is the luxury signal.

## Format: landscape — 1920×1080
## Duration: 20 seconds

## Visual identity (from the project)
- Background: `#071A0A` (near-black, deep green tint)
- Surface/card: `#0B1F0E` (dark panel)
- Accent: `#4ADE80` (bright green)
- Secondary green: `#86EFAC` (softer green)
- Text: `#FAFAF9` (near-white)
- Muted text: `#A7C4AB`, `#7A9F7E`
- Score gradient: `linear-gradient(90deg, #16A34A, #4ADE80)`
- Display font: DM Serif Display (Google Fonts)
- Body font: Inter
- Strongest visual element: Session scorecard card with animated green progress bars on dark panel — exactly the hero card from the landing page

## Share copy (draft)
CaseForge: live AI case interviews that score like a McKinsey partner. 7 dimensions. Instant feedback. Know exactly what to fix before your final round.

## Audio direction
- Role: steady cinematic bed with 2-3 minimal, professional accents
- Music: `happy-beats-business-moves-vol-12-by-ende-dot-app.mp3` — 110 BPM, steady and clean, best for polished/cinematic
- Music treatment: starts at 0, volume 0.35, no aggressive swell, gentle fade-out from 18s to 22s so the CTA lands in a quiet moment
- Music cue guidance: bundled preset at `skills/brag/assets/music/cues/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.json`. Beat-lock the interview room entrance at 8.74s (strongCue, intensity 0.99). Beat-lock the CTA reveal at 17.47s (strongCue, intensity 0.99). Beat-grid the 5 dimension bar reveals starting at ~13.11s (strongCue), spacing bars on consecutive beats (~0.55s apart).
- Audio-reactive treatment: subtle; use RMS/bass to make the hero glow breathe and the score bars gain slight warmth on reveal. No waveform or pulse graphics.
- SFX posture: minimal, polished — 2-3 cues total, low-to-medium volume
- Audio-coupled moments: 
  - Scorecard dimension bars appear one by one → soft `interface/drop_001` or `interface/drop_002` per bar (5 bars, ~0.55s apart, starting ~13.11s)
  - AI feedback bubble fades in → `impact/impactBell_heavy_000` at low volume (~0.45) at the moment the bubble settles (~15.5s)
  - CTA button slides in at 17.47s → `interface/click_001` at 0.55 volume
- Restraint rule: no punchy hits, no chaotic layering, nothing that draws attention to itself — each SFX should feel like a natural part of the UI, not like a sound effect

---

## Storyboard

### Scene 1 — Brand Hook — 3s (0:00–0:03)
**On screen:** Full dark `#071A0A` background. Subtle green grid texture (opacity ~3%). CaseForge wordmark in DM Serif Display at 52px centered, color `#4ADE80`, fades up from 0 → 1 opacity over 0.8s. A soft radial glow (`rgba(74,222,128,.08)`) pulses behind it once. Below, the tagline "Crack the case. Every session." in Inter, `#FAFAF9`, 18px, fades in at 0.4s delay.
Sequential/interaction: wordmark in first, tagline follows — clean, unhurried
Audio intent: the music bed establishes itself — clean, warm, steady. The glow pulse lands with the music's natural opening feel.
Audio-coupled idea: none — let the visual simplicity carry it
Music: vol-12, steady opening, volume 0.35
Transition mood: soft crossfade → Scene 2

### Scene 2 — Dashboard — 5s (0:03–0:08)
**On screen:** The readiness dashboard card slides in from the right — `#0B1F0E` surface, `rgba(74,222,128,.13)` border, 18px radius. Four stat tiles visible: "Avg Score · 7.4/10", "Sessions · 12", "Tier · Silver", "Status · On Track". Below them, the readiness progress bar fills from 0% → 74% in the `#16A34A → #4ADE80` gradient over 1.2s. Label below: "~4 more sessions to interview-ready" in `#7A9F7E`. The four stat tiles pop in one by one from left to right.
Sequential/interaction: yes — 4 stat tiles arrive one by one (left to right, ~0.4s apart starting at 3.5s); progress bar fills after tiles settle
Audio intent: slightly warmer — the music has found its rhythm. The sequential tile arrivals feel confident and measured.
Audio-coupled idea: soft `interface/drop_001` on each tile arrival (4 drops, at 3.5s, 3.9s, 4.3s, 4.7s); mute drops if they feel busy — Hyperframes should judge based on actual animation
Music: vol-12, beat-aligned to 3.82s nearby beat for the first tile
Transition mood: soft slide → Scene 3

### Scene 3 — Live Interview — 6s (0:08–0:14)
**On screen:** Interview room layout — dark `#0B1F0E` split panel. LEFT: Case prompt card. Label "McKinsey · Profitability Case" in `#86EFAC` at 10px uppercase. Below: case prompt text in `#A7C4AB`. RIGHT: AI conversation area. A message appears typed out: `"What would drive the cost reduction in year one?"` in `#FAFAF9`. A blinking cursor. Below it, transcript text appears in softer `#7A9F7E` as if the candidate is responding. The cursor blinks twice. A subtle voice waveform stripe pulses at the bottom of the right panel in muted green.
Sequential/interaction: yes — left panel slides in, then right panel. AI message types in character by character over 1.5s (starting at ~9.5s). Cursor blinks while response appears below.
Audio intent: the interview room has a quiet tension — the music stays steady but the scene is intimate and focused.
Audio-coupled idea: simulated AI typing — soft keyboard sounds (randomized from `keyboard/keypress-*.wav`) per character during the AI message type-out at 9.5s. Keep volume low (~0.25), thin out to ~1 in 3 keypresses so it reads as a whisper of activity.
Music: vol-12; room enters at 8.74s strongCue (beat-locked) — major reveal aligns to this
Transition mood: clean crossfade → Scene 4

### Scene 4 — Scorecard + CTA — 6s (0:14–0:20)
**On screen:** Scorecard card fills the center. Top label: "Session Scorecard — McKinsey style" in `#86EFAC`. Five dimension rows reveal one by one: Structure 8.2 → Hypothesis 7.5 → Numerics 6.8 → Synthesis 7.9 → Communication 8.5. Each row: dimension name in `#A7C4AB`, score in `#4ADE80` bold, progress bar fills left-to-right in `#16A34A → #4ADE80`. After bars settle (~15.5s), the AI feedback bubble fades in: "Strong structure. Quantify the revenue impact before pivoting to cost drivers." in `#A7C4AB`. At 17.5s, the CTA button slides up: `#4ADE80` pill button, `#071A0A` text, "Start practicing free →". Logo fades up below in DM Serif at `#4ADE80`.
Sequential/interaction: yes — 5 dimension bars appear one by one, each with its bar filling; beat-grid starting at 13.11s strongCue, bars on consecutive beats (~0.55s apart). CTA button beat-locked at 17.47s strongCue.
Audio intent: building to payoff — the bars arrive with a sense of certainty. The bell rings on the AI feedback. The CTA lands quietly, inviting.
Audio-coupled idea: `interface/drop_001` per dimension bar (5 bars, at 13.11s, 13.64s, 14.20s, 14.73s, 15.29s — beat-grid); `impact/impactBell_heavy_000` at 0.45 volume when AI feedback bubble settles (~15.5s, beat: 15.84s); `interface/click_001` at 0.55 when CTA slides in at 17.47s
Music: vol-12 fades from 0.35 → 0.10 starting at 18s to let the final visual breathe
Transition mood: hold — end of video

**Music mood for this video:** steady, clean, cinematic — vol-12 at 110 BPM. Even tempo throughout. No swells, no drops. The track is the backdrop, not the event.
**Audio summary:** Clean music bed from 0–20s, fading under the CTA. Three types of SFX: soft drops for card/bar arrivals, keyboard whispers during AI typing, one resonant bell on the AI feedback reveal. Restrained throughout — nothing earns an SFX unless the visual motion deserves it.
