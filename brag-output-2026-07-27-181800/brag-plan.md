# Brag Plan: CaseForge AI — v2

## What is this app?
CaseForge AI is a premium consulting interview prep platform that runs live AI mock case interviews, scores candidates across 7 dimensions instantly, tracks progress through analytics and drills, and now ranks them on a competitive campus leaderboard — so candidates know exactly where they stand before McKinsey, BCG, and Bain recruiting season.

## The angle
v1 showed the interview and scorecard. v2 adds the competitive layer that makes CaseForge feel socially alive: the leaderboard. The video tells a complete product story — from dashboard awareness to live interview to scorecard feedback to climbing the campus rankings. The emotional arc is: *"You're not just practicing. You're competing."* This is what separates CaseForge from a generic prep tool — it knows where you stand, scores what matters, and shows where you rank.

## Hook (first 2-3 seconds)
CaseForge wordmark on the deep `#071A0A` dark-green background. Below it, a single sharp subtitle: "Crack the case." — then after a beat: "Every session." The green glow pulses. The hook earns the next 22 seconds by establishing premium credibility immediately.

## Key moments (the middle)
- **Dashboard:** Readiness score animating to 74%, tier badge (Silver → Gold progression), session streak, firm-readiness bar — the system that knows exactly where you are.
- **Interview room:** Split panel — McKinsey case prompt left, AI conversation right. The AI types out a smart follow-up: *"What would drive the cost reduction in year one?"* — feels like a real interviewer, not a chatbot.
- **Scorecard:** Five dimension bars animate in one by one (Structure 8.2, Hypothesis 7.5, Numerics 6.8, Synthesis 7.9, Communication 8.5). AI feedback bubble: "Strong structure. Quantify the revenue impact before pivoting."
- **Growth loop:** Recommended drill card slides in — "Case Math Drills · Weak area" — with a progress ring. One focused beat that says the product knows what to fix.
- **Leaderboard reveal:** The premium moment. Campus leaderboard animates in — top 5 candidates with emerald/gold tier badges. A highlighted row ("You — #7") glows green. A rank movement arrow appears: ↑4. The "You" row animates upward through the list. Campus label: "Harvard Business · Top 23%." The product feels alive and competitive.

## Outro / punchline
Wordmark returns on `#071A0A`. One line below: **"Get the offer."** Green CTA button: "Start practicing free →". Quiet and final — the product has already made its case.

## User flow worth showing
1. **Entry:** Dashboard — readiness score at 74%, Silver tier, 12 sessions, firm-readiness progress
2. **Key action:** Interview room — AI conducting live McKinsey profitability case, smart follow-up typed in real time
3. **Result:** Scorecard — 5 dimension bars + AI feedback, then growth drill recommendation
4. **Social layer:** Leaderboard — campus ranking, rank climb animation, tier badge, competitive context

## Tone
- Preset: `cinematic` with `polished` restraint — big reveals, confident pacing, premium signals
- Creative direction: premium consulting SaaS launch — serious, aspirational, conversion-focused. "Make it look expensive."
- Interpretation: Each scene gets a dramatic entrance but holds long enough to read. No chaos. Big type on dark backgrounds. The leaderboard scene is the emotional peak — treat it like a hero reveal. Motion is fluid and intentional, never decorative.

## Format: landscape — 1920×1080
## Duration: 24 seconds

## Visual identity (from the project)
- Background: `#071A0A` (near-black, deep green tint)
- Surface/card: `#0B1F0E` (dark panel)
- Accent: `#4ADE80` (bright emerald green)
- Secondary green: `#86EFAC` (softer green)
- Text: `#FAFAF9` (near-white)
- Muted text: `#A7C4AB`, `#7A9F7E`
- Score gradient: `linear-gradient(90deg, #16A34A, #4ADE80)`
- Tier colors: emerald `#4ADE80`, gold `#eab308`, silver `#94a3b8`, bronze `#cd7f32`
- Display font: DM Serif Display (Google Fonts)
- Body font: Inter (Google Fonts)
- Strongest visual element: Leaderboard with animated rank movement + tier badges — new in v2

## Share copy (draft)
CaseForge: AI case interviews that score like a McKinsey partner and rank you against your campus. 7 dimensions. Instant feedback. Leaderboard. Practice smarter. Get the offer.

## Audio direction
- Role: steady cinematic bed with 3-4 minimal, professional accents. The leaderboard scene gets the most impactful cue.
- Music: `happy-beats-business-moves-vol-12-by-ende-dot-app.mp3` — steady and clean, best for polished/cinematic
- Music treatment: starts at 0, volume 0.32, no aggressive swell, gentle fade from 21s to 24s under the CTA
- Music cue guidance: bundled preset at `skills/brag/assets/music/cues/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.json`. Beat-lock the interview room entrance at 8.74s (strongCue). Beat-lock the leaderboard rank-climb moment at 17.47s (strongCue, intensity 0.99 — the emotional peak). Beat-grid the 5 dimension bar reveals starting near 13.11s, bars on consecutive beats (~0.55s apart).
- Audio-reactive treatment: subtle; use RMS/bass to make the hero glow breathe and the leaderboard's highlighted row gain warmth on the rank-climb moment. No waveform or equalizer visuals.
- SFX posture: minimal, polished — 3-4 cues total, low-to-medium volume. Cinematic energy: one big bell hit on the leaderboard reveal.
- Audio-coupled moments:
  - Scorecard dimension bars (5 bars, ~0.55s apart) → soft `interface/drop_001` per bar
  - AI feedback bubble settles → `impact/impactBell_heavy_000` at 0.45 volume
  - Leaderboard rank-climb / hero reveal → `impact/impactBell_heavy_003` at 0.65 volume (the emotional peak)
  - CTA button appears → `interface/click_001` at 0.50 volume
- Restraint rule: no punchy hits, no chaos — each SFX must feel like a natural product UI response, not a sound effect layer

---

## Storyboard

### Scene 1 — Brand Hook — 2.5s (0:00–0:02.5)
**On screen:** Full `#071A0A` background. Subtle green grid texture (opacity ~2.5%). CaseForge wordmark in DM Serif Display, `#4ADE80`, centered, fades up 0→1 over 0.7s. A soft radial glow pulses once behind it. Tagline "Crack the case. Every session." in Inter `#FAFAF9` 18px fades in 0.3s after wordmark. Clean, no noise.
Sequential/interaction: wordmark first, tagline follows with slight delay
Audio intent: music bed opens quietly, establishing warmth
Audio-coupled idea: none — let silence and music bed open the scene
Music: vol-12, volume 0.32, fade-in over 0.5s
Transition mood: soft crossfade → Scene 2

### Scene 2 — Dashboard Intelligence — 3.5s (0:02.5–0:06)
**On screen:** Dashboard card slides in from the right. Dark `#0B1F0E` surface, `rgba(74,222,128,0.13)` border, 18px radius. Top: "CaseForge Dashboard" header in `#86EFAC`. Four stat tiles pop in one by one: "Avg Score · 7.4/10", "Sessions · 12", "Tier · Silver", "Status · On Track". Below: readiness progress bar fills 0%→74% in the `#16A34A→#4ADE80` gradient over 1.2s. Bar label: "~4 sessions to interview-ready" in `#7A9F7E`. Below bar: firm-readiness row — "McKinsey · 68%" "BCG · 71%" "Bain · 75%" — three small bars.
Sequential/interaction: yes — 4 stat tiles arrive one by one left-to-right at ~0.4s intervals starting at 3.0s; progress bar fills after tiles settle; firm bars appear last
Audio intent: music has found its rhythm; tile arrivals feel measured and confident
Audio-coupled idea: soft `interface/drop_002` on each of the 4 tile arrivals; Hyperframes judges density
Music: vol-12 beat-aligned near 3.82s for first tile
Transition mood: clean slide → Scene 3

### Scene 3 — Live AI Interview — 4.5s (0:06–0:10.5)
**On screen:** Interview room layout. Dark `#0B1F0E` split panel. LEFT: Case prompt card — label "McKinsey · Profitability Case" in `#86EFAC` uppercase 10px. Below: case prompt paragraph in `#A7C4AB`. RIGHT: AI conversation panel. At 7.5s, the AI message types in character by character: *"What would drive the cost reduction in year one?"* in `#FAFAF9`. Blinking cursor. Below it, a candidate response line appears softer in `#7A9F7E`. A subtle voice-waveform stripe pulses at the bottom in muted green.
Sequential/interaction: yes — left panel slides in first, right panel follows; AI message types character-by-character (~1.5s at 8.74s); cursor blinks; response fades in below
Audio intent: intimate, quiet tension — the product is thinking. Music stays steady and cinematic.
Audio-coupled idea: soft keyboard sounds (`keyboard/keypress-*.wav` randomized) per character during AI typing at 8.74s, volume ~0.20, thinned to ~1 in 3 keypresses; no SFX on candidate response
Music: vol-12; room reveals beat-locked at 8.74s strongCue
Transition mood: clean crossfade → Scene 4

### Scene 4 — Scorecard Reveal — 3.5s (0:10.5–0:14)
**On screen:** Scorecard card fills center. Label "Session Scorecard — McKinsey style" in `#86EFAC`. Five dimension rows reveal one by one: Structure 8.2 → Hypothesis 7.5 → Numerics 6.8 → Synthesis 7.9 → Communication 8.5. Each: dimension name `#A7C4AB`, score `#4ADE80` bold, bar fills left-to-right in score gradient. After bars settle, AI feedback bubble fades in: "Strong structure. Quantify the revenue impact before pivoting to cost drivers." in `#A7C4AB`, subtle `rgba(74,222,128,0.08)` bubble bg.
Sequential/interaction: yes — 5 dimension bars appear one by one, beat-grid starting near 13.11s strongCue, bars on consecutive beats (~0.55s apart); feedback bubble fades after bar 5 settles
Audio intent: building certainty — each bar says the system knows
Audio-coupled idea: `interface/drop_001` per dimension bar (5 bars, ~0.55s apart starting ~13.11s); `impact/impactBell_heavy_000` at 0.45 when feedback bubble settles (~14.7s)
Music: vol-12, steady
Transition mood: soft crossfade → Scene 5

### Scene 5 — Growth Loop — 2.5s (0:14–0:16.5)
**On screen:** Clean, minimal scene. A single recommended drill card slides in from the bottom-right. Dark surface, green accent border. Top label "Recommended Drills" in `#86EFAC`. Card: "Case Math · Weak area" with a circular progress ring (0%→40% animated) and a small "Start drill →" link in `#4ADE80`. Below: two smaller tag chips: "Numerics · 6.8" and "Improve 0.8 pts". This is fast and punchy — one focused beat that says the system knows what to fix.
Sequential/interaction: yes — card slides in; progress ring animates; two chips pop in after ring settles
Audio intent: brief and energetic — a focused moment in a fast-moving scene
Audio-coupled idea: `interface/drop_002` as card lands; `interface/switch_001` as progress ring settles
Music: vol-12, steady
Transition mood: fast wipe → Scene 6

### Scene 6 — Leaderboard Reveal — 4.5s (0:16.5–0:21)
**On screen:** THE HERO MOMENT. Leaderboard card fills the frame — dark `#0B1F0E`, emerald border glow `rgba(74,222,128,0.2)`. Header: "Campus Leaderboard · Harvard Business" with a live green dot. Top 5 rows animate in from right one by one: rank numbers 1-5, names (A. Chen, M. Patel, J. Williams, S. Kim, R. Torres), emerald/gold tier badges, scores (9.4, 9.1, 8.7, 8.4, 8.2), rank arrows (↑ green, — gray). Then: a dimly visible rows 6, 7... and at row 7, the "You" row slides in — highlighted with a bright `rgba(74,222,128,0.12)` green bg and left border `4px solid #4ADE80`. Your score 8.1. Then the rank-climb animation: the "You" row glows brighter, the rank number changes 7 → 5 → 3 — climbing up through the list. Below the board: "Top 23% at Harvard Business · Silver tier" in `#86EFAC`. A rank badge with "↑4 this week" in green.
Sequential/interaction: yes — top 5 rows cascade in one-by-one (at 16.5s–17.5s); "You" row appears with glow at 17.47s (strongCue beat-locked); rank number counts down 7→5→3 over 0.8s; tier badge animates in
Audio intent: the emotional peak of the video — the product has made you competitive. Music holds steady; the bell hit makes this the cinematic moment.
Audio-coupled idea: `casino/card-slide-1.ogg` × 3 as the first rows arrive (three quick slides, ~0.25s apart); `impact/impactBell_heavy_003` at 0.65 volume when "You" row glows and rank climbs at 17.47s strongCue — this is the signature sound
Music: vol-12 beat-locked at 17.47s for the "You" row reveal
Transition mood: soft crossfade → Scene 7

### Scene 7 — CTA — 3s (0:21–0:24)
**On screen:** Return to `#071A0A`. CaseForge wordmark fades up in DM Serif `#4ADE80`. Underneath: "Get the offer." in Inter `#FAFAF9`, 22px. Below: green CTA button "Start practicing free →" with `#071A0A` text, slides up at 22.0s. Final and confident — no noise, no extra claims.
Sequential/interaction: wordmark fades in; tagline appears; CTA button slides up with slight bounce
Audio intent: quiet, final, inviting — the music fades under the CTA
Audio-coupled idea: `interface/click_001` at 0.50 as CTA button appears at 22.0s; music fades 21s→24s
Music: vol-12 fades from 0.32 → 0.08 starting at 21s
Transition mood: hold — end of video

**Music mood for this video:** steady cinematic — vol-12 at 110 BPM. Even tempo throughout. No aggressive swells. The emotional peak is Scene 6 (leaderboard bell hit), not the music — the track is backdrop, not event.
**Audio summary:** Clean music bed 0–24s, fading under the CTA. Five types of SFX: soft drops for tile/card/bar arrivals, keyboard whispers during AI typing, a quiet drop for the drill card, card slides for the leaderboard cascade, one resonant bell for the rank-climb climax, one click for the CTA. Restrained throughout.

## Music cue guidance
- Track: `happy-beats-business-moves-vol-12-by-ende-dot-app.mp3`
- Preset: `skills/brag/assets/music/cues/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.json`
- Strong cue locks (3 total):
  1. 8.74s — interview room reveal (major scene entrance)
  2. 13.11s — first dimension bar (scorecard sequence starts)
  3. 17.47s — "You" row glow + rank climb (emotional peak, loudest SFX)
- Beat-grid windows:
  - Dashboard tiles: ~3.82s, 4.22s, 4.62s, 5.02s (4 beats, ~0.40s apart)
  - Scorecard bars: ~13.11s, 13.64s, 14.20s, 14.73s, 15.29s (5 beats, ~0.55s apart)
  - Leaderboard rows: ~16.5s, 16.75s, 17.0s, 17.25s, 17.47s (5 rows)
- Restraint note: these are timing hints. Readability and scene pacing take priority. If a cue hurts copy legibility, use natural timing.
