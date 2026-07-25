# Brag Plan: CaseForge AI

## What is this app?
CaseForge AI is an AI mock interview platform for consulting candidates: live case sessions scored across 7 dimensions, with weakness tracking and a readiness dashboard that tells you exactly when you're prepared for the real thing.

## The angle
Most prep tools make you feel busy. CaseForge makes you feel *measured*. The video leans into that — the product is cold, honest, and precise. It doesn't cheer you on, it scores you. That's the appeal, and that's the hook: instead of "prepare better," the message is "find out how good you actually are." The scorecard is the hero moment — five progress bars filling in sequence like a verdict being read.

## Hook (first 2.5 seconds)
Two lines in DM Serif Display, dark green bg, vivid green accent. Beat-staggered arrival:
- "Crack the case." — pure white, slams in on beat 1 (0.56s)
- "Every session." — in #4ADE80 green, arrives on beat 2 (1.09s)
Minimal chrome. Just the claim, the color, the brand energy. No explainer text yet.

## Key moments (the middle)
1. **Interview setup** — dark UI card, McKinsey selected, Full Case Interview selected, cursor clicks "Begin interview →". Shows the choice feels real and firm-specific.
2. **Live AI interview** — chat interface: AI asks "Walk me through your structure for a profitability case." User types. AI pushes back: "Good. Prioritize one branch. Where's the pain?" This is the product's soul — it doesn't just respond, it interrogates.
3. **Scorecard fills in sequence** — five dimension bars (Structure → Hypothesis → Numerics → Synthesis → Communication) animate in one by one, each locked to a beat. Communication 8.5/10 lands on a strong cue. AI feedback box slides in: "Strong structure. Quantify the revenue impact before pivoting to cost drivers." The bars make the scoring concrete and visual.

## Outro / punchline
Readiness dashboard: Avg Score 7.4/10, 12 Sessions, Silver Tier, 74% readiness bar fills to a strong beat. "~4 sessions to interview-ready." Then: CaseForge logo in DM Serif Display green, "Start practicing free →". No fluff, just the bar that still needs filling.

## User flow worth showing
1. **Entry:** Interview setup page — pick McKinsey, pick Full Case, click Begin
2. **Key action:** Live AI chat — AI interrogates, user responds, AI pushes back
3. **Result:** Scorecard reveals 5 dimension scores + AI written feedback → Dashboard shows readiness progress

## Tone
- Preset: `app-store`
- Creative direction: Premium AI product reveal — clean, confident, makes you want to test yourself right now
- Interpretation: Fast but readable reveals, no clutter, no celebration. The product's confidence comes from the data, not the copy. Every scene has one thing to read. Transitions are smooth wipes, not cuts.

## Format: landscape — 1280×720
## Duration: 20 seconds

## Visual identity (from the project)
- Background: `#071A0A` (near-black with a deep forest-green tint)
- Surface/card: `#0B1F0E`
- Accent: `#4ADE80` (vivid green — all CTAs, scores, progress fills)
- Muted green: `#7A9F7E` / `#A7C4AB` (secondary text, labels)
- Text: `#FAFAF9` (near-white)
- Display font: DM Serif Display (400, serif — headings on landing page)
- Body font: Inter (sans-serif — UI, labels, scores)
- Strongest visual element: The animated score card with five progress bars filling from left to right in `linear-gradient(90deg, #16A34A, #4ADE80)`, plus the "Session Scorecard" chrome with macOS-style dots

## Share copy (draft)
CaseForge AI runs a live consulting mock interview, scores you on 7 dimensions, and tracks your readiness until you're actually ready — not just practiced. Free to start.

## Audio direction
- Role: Warm, steady corporate bed with tasteful interaction SFX
- Music: `happy-beats-business-moves-vol-12-by-ende-dot-app.mp3` (steady and clean, 109.96 BPM — ideal for app-store/polished tone)
- Music treatment: Start at 0s, vol 0.35, fade to 0.18 in the final 1.5s of the outro; no abrupt cut
- Music cue guidance: Bundled preset available at `assets/music/cues/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.json`. Key strong cues to target: 8.74s (AI pushback moment, 0.99), 10.93s (scorecard reveal start, 0.97), 13.11s (Communication bar + bell, 0.98), 17.47s (readiness bar fill, 0.99), 18.56s (logo landing, 0.99). Beat grid for sequential dimension bars: 10.93, 11.46, 12.02, 12.55, 13.11s (one per beat, ~0.545s apart).
- Audio-reactive treatment: Subtle; use music RMS/bass to make the hero glow breathe and the scorecard card gain gentle presence on stronger beats. No waveform/equalizer visuals.
- SFX posture: Moderate, motion-matched. Professional restraint — never stacked, never louder than the music moment warrants.
- Audio-coupled moments:
  - Scene 1: headline slam — short impact accent on first word
  - Scene 2: firm card selection — `interface/click_001` or `ui/mouseclick1`; "Begin interview" button — `interface/drop_001`
  - Scene 3: AI message typing — randomized `keyboard/keypress-*.wav` for 3-4 characters; AI pushback arrives on beat 8.74s — `interface/drop_002`
  - Scene 4: each dimension bar — `casino/card-place-1` through `casino/card-place-4` (rotate), Communication bar at 13.11s strong cue — `impact/impactBell_heavy_000` at modest volume (0.65)
  - Scene 5: readiness bar fill at 17.47s strong cue — `impact/impactGlass_light_001` or `impact/impactBell_heavy_003`
  - Scene 6: logo arrival at 18.56s — `interface/bong_001` soft (0.55), let it ring over the music fade
- Restraint rule: No SFX stacking within 0.4s of each other. No sound on the outro tagline — let the bong ring.

---

## Storyboard

### Scene 1 — Hook — 2.5s (0.0–2.5s)
**On screen:** `#071A0A` background, faint `rgba(74,222,128,0.032)` grid texture (40px squares), single soft radial glow at top-left pulsing slowly. Two lines of DM Serif Display text, center-aligned, large.
- "Crack the case." — `#FAFAF9`, ~52px — fades/slams up at 0.56s (beat-locked)
- "Every session." — `#4ADE80` green — arrives at 1.09s (beat-locked)
- Small label below: badge pill "AI-POWERED CASE INTERVIEW PREP" in `#86EFAC` uppercase 10px — fades in at 1.64s (beat)
Copy load: 5 words across two short reads. 0.56s settled on "Crack the case." (about 0.53s), 1.09s settled on "Every session." (1.4s hold before transition) — legible ✓
Sequential/interaction: Yes — "Crack the case." and "Every session." arrive on separate beats, staggered 0.53s apart
Audio intent: Open cold and confident — the music bed is already underway; the headline slam lands like a decision, not an announcement
Audio-coupled idea: Short `impactSoft_medium_000` or `impactGeneric_light_000` at 0.5s as "Crack the case." arrives; nothing on the green line (let the color speak)
Music: Steady corporate bed enters at 0s, vol 0.35
Transition mood: smooth slide → Scene 2

### Scene 2 — Interview Setup — 3s (2.5–5.5s)
**On screen:** Dark UI card (`#0B1F0E`, border `rgba(74,222,128,0.16)`, border-radius 18px) slides in from right. Inside:
- Heading: "Start a mock interview" in Inter bold `#FAFAF9`
- Firm row: McKinsey card is selected (green border `#4ADE80`, `bg-brand-subtle`), showing radio dot filled
- Interview type: "Full Case Interview" card is highlighted — "Medium–Hard" difficulty badge in amber, "Structure, Judgment, Synthesis" emphasis line
- "Begin interview →" green button at bottom, cursor appears and clicks it
The card arrives near beat 2.73s. The cursor click lands near beat 5.34s, button pulses green on click.
Sequential/interaction: Yes — simulate cursor click on "Begin interview →" button at ~5.34s (beat); button gives a brief scale-down (0.97) and scale-up before transition
Audio intent: Professional and purposeful — this is a tool being used, not demoed
Audio-coupled idea: `ui/mouseclick1` at cursor click moment (5.34s); brief `interface/drop_001` (0.5 vol) as the card slides in at 2.73s
Music: Steady bed continues
Transition mood: hard cut → Scene 3

### Scene 3 — Live AI Interview — 4.5s (5.5–10.0s)
**On screen:** Dark chat interface — `#0B1F0E` background with chat bubbles. Left-aligned AI bubbles (dark surface, green-tinted border), right-aligned user bubble.
1. AI message types in character by character at ~5.7s: "Walk me through your structure for a profitability case." (typing cursor blinks)
2. User response appears as a completed block at ~7.5s: "I'd break this into Revenue and Cost drivers — "
3. AI pushback arrives in full at ~8.74s (strong_beat, 0.99 — beat-locked): "Good. Prioritize one branch. Where's the pain?"
Small green "AI Interviewer" badge on the first bubble. Subtle green glow on the AI bubble at 8.74s (audio-reactive moment — bass hits).
Sequential/interaction: Yes — per-character AI typing animation with keyboard sounds (5.7–6.6s); user text appears at 7.5s; AI pushback slams in full at strong cue 8.74s
Audio intent: Alive and a little tense — this is a real interview happening, not a demo script
Audio-coupled idea: Randomized `keyboard/keypress-*.wav` for ~8 characters of AI typing (5.7–6.6s, thin out mid-type); `interface/drop_002` (0.60 vol) at 8.74s when AI pushback arrives; card glow brightens on bass at the strong cue
Music: Bed continues
Transition mood: smooth slide → Scene 4

### Scene 4 — Scorecard Reveal — 5s (10.0–15.0s)
**On screen:** "Session Scorecard" card (`#0B1F0E`, green border glow). Window chrome dots (red/amber/green, 9px). Title: "Profitability Case — McKinsey style" in Inter 12px bold.
Five dimension rows appear in sequence, one per beat (beat-grid locked), each row: label left + score right (green, 11px bold) + progress bar filling to its value:
- **Structure 8.2/10** → bar fills to 82% at 10.93s (strong_beat 0.97) — `casino/card-place-1` sound
- **Hypothesis 7.5/10** → bar fills to 75% at 11.46s (beat) — `casino/card-place-2`
- **Numerics 6.8/10** → bar fills to 68% at 12.02s (beat) — `casino/card-place-3`
- **Synthesis 7.9/10** → bar fills to 79% at 12.55s (beat) — `casino/card-place-4`
- **Communication 8.5/10** → bar fills to 85% at 13.11s (strong_beat 0.98) — `impact/impactBell_heavy_000` (0.65 vol)
Bar fill: `linear-gradient(90deg, #16A34A, #4ADE80)` on `rgba(74,222,128,0.1)` track.
AI Feedback box slides up from bottom at 13.64s (beat): green `#86EFAC` "AI FEEDBACK" label + `#A7C4AB` text: "Strong structure. Quantify the revenue impact before pivoting to cost drivers."
Hold everything fully visible until 15.0s (1.4s settled).
Sequential/interaction: Yes — five dimension bars arriving one per beat, each with a card sound; Communication bar lands on a strong cue with bell
Audio intent: Verdict being delivered — methodical, then the Communication bar rings out like confirmation
Audio-coupled idea: Beat-grid card sounds for bars 1-4; impactBell at bar 5 on strong cue; AI feedback box slides in on the next beat at 13.64s
Music: Bed continues, slight warmth gain as bars fill (audio-reactive — RMS brightens glow)
Transition mood: soft crossfade → Scene 5

### Scene 5 — Readiness Dashboard — 3s (15.0–18.0s)
**On screen:** "Readiness Dashboard" label (uppercase, `#86EFAC`, 10px). 2×2 stat grid, four tiles in `rgba(74,222,128,0.055)` with subtle borders, appear in staggered sequence:
- **Avg Score — 7.4 / 10** at 15.29s (beat) — `interface/drop_001`
- **Sessions — 12** at 15.84s (beat) — `interface/drop_001`
- **Tier — Silver** at 16.38s (beat) — `interface/drop_002`
- **Status — On Track** at 16.93s (beat) — `interface/drop_002`
Readiness progress bar below: label "Readiness progress" + "74%" in green, bar fills from 0 to 74% at 17.47s (strong_beat 0.99 — beat-locked). `#7A9F7E` line below: "~4 more sessions to interview-ready"
Sequential/interaction: Yes — four stat tiles arriving one per beat, then readiness bar fills on the strongest cue in the window
Audio intent: Assessment complete — the dashboard is the honest answer to "how am I doing?"
Audio-coupled idea: Soft `interface/drop_001` and `_002` per stat tile (0.55 vol); `impact/impactGlass_light_001` (0.65 vol) at 17.47s as the readiness bar lands on the strong cue
Music: Bed, vol beginning to ease slightly at ~17s
Transition mood: fade → Scene 6

### Scene 6 — Outro — 2s (18.0–20.0s)
**On screen:** `#071A0A` background, single centered radial green glow pulses slowly. 
- "CaseForge" in DM Serif Display, `#4ADE80`, ~46px — scales in (1.0→1.0 bounce, or fade) at 18.02s (beat)
- "Start practicing free →" in Inter, `#A7C4AB`, 15px — fades in at 18.56s (strong_beat 0.99 — beat-locked)
Glow breathes once gently at 18.56s (audio-reactive, bass from the strong beat).
Hold until 20.0s. Music fades from 0.35 to 0 over final 1.5s.
Sequential/interaction: None — simple centered reveal, logo then tagline, 0.54s apart on the beat
Audio intent: Clean landing — the bong rings, the glow breathes, then silence
Audio-coupled idea: `interface/bong_001` (0.55 vol) at 18.56s as tagline appears; let it decay over the music fade; no further SFX
Music: Fade from 0.35 to 0 over 18.5–20.0s
Transition mood: end

---

**Music mood for this video:** Steady, warm, corporate-clean — builds confidence without urgency
**Audio summary:** Music bed runs throughout at moderate volume; beat-locked SFX mark every data reveal and interaction; the scorecard's Communication bar gets the one bell hit; the readiness strong cue gets glass; the logo landing gets the bong — then silence.

## Music cue guidance
- Track: `happy-beats-business-moves-vol-12-by-ende-dot-app.mp3` — 109.96 BPM, bundled preset
- Strong cue locks (1–3 per video rule):
  1. Scorecard reveal start: 10.93s (0.97 strong_beat) — first dimension bar
  2. Communication bar (strongest scorecard moment): 13.11s (0.98 strong_beat) — bell SFX
  3. Readiness bar fill: 17.47s (0.99 strong_beat) — glass SFX
- Beat-grid for dimension bars: 10.93, 11.46, 12.02, 12.55, 13.11s (consecutive beats, ~0.545s apart) — card sounds per bar, text holds on screen after each arrival so all 5 are visible and readable together before transition
- Beat-grid for stat tiles: 15.29, 15.84, 16.38, 16.93s (consecutive beats)
- Logo tagline: 18.56s (0.99 strong_beat)
- Restraint: Only 3 strong-cue locks. SFX never stacked within 0.4s. No SFX after 18.56s.
