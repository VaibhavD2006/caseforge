# CaseForge — Non-Technical Upkeep Guide

> For 180 Degrees Consulting at NC State. No code changes needed for any task in this guide.

---

## 1. Admin Dashboard

Visit **`/admin`** (you must have admin role — see Setup below).

| Page | What it shows |
|------|---------------|
| `/admin` | Overview: users, sessions, avg score, AI cost |
| `/admin/users` | All users with session counts and scores |
| `/admin/settings` | Edit leaderboard rules and feature toggles |

### Grant admin access (one-time, per person)

In the [Supabase SQL editor](https://supabase.com/dashboard), run:

```sql
UPDATE users
SET role = 'admin', organization = '180dc_ncstate'
WHERE email = 'president@example.com';
```

---

## 2. Managing Drills

Drills live in the `drills` table. To add or edit a drill:

1. Open **Supabase → Table Editor → drills**
2. Click **Insert row** or click an existing row to edit
3. Fields:
   - `title` — drill name shown to students
   - `prompt` — the question/task given to the student
   - `skill_focus` — one of: `structure`, `hypothesis`, `quantitative`, `business_judgment`, `synthesis`, `communication`, `confidence`
   - `drill_type` — one of: `mini_case`, `math_exercise`, `synthesis_prompt`, `communication_exercise`
   - `difficulty` — `easy`, `medium`, or `hard`
   - `estimated_minutes` — approximate completion time
   - `is_active` — set to `false` to hide a drill without deleting it

No code deploy needed.

---

## 3. Leaderboard Rules

Edit these in **`/admin/settings`**:

| Key | Default | Meaning |
|-----|---------|---------|
| `leaderboard.min_sessions` | `3` | Sessions required to appear on leaderboard |
| `leaderboard.decay_days` | `90` | Score half-life in days (older sessions count less) |
| `leaderboard.max_per_day` | `3` | Max sessions per day that count (anti-gaming) |
| `features.leaderboard` | `true` | Set to `false` to hide leaderboard entirely |
| `features.drills` | `true` | Set to `false` to hide drills |

> **Note:** As of now the engine reads these constants from code. To make them fully live from the DB, a developer needs to update `lib/leaderboard/engine.ts` to read from `config_settings`. This is a 30-minute task.

### Resetting the leaderboard for a new season

To clear rank history (fresh start before recruiting season):

```sql
TRUNCATE leaderboard_rank_history;
TRUNCATE leaderboard_score_cache;
```

This does **not** delete interview history or scores — only the leaderboard rank snapshots.

---

## 4. Season Dates

Set in **`/admin/settings`**:

- `season.start_date` — e.g. `"2026-09-01"` (ISO date string, or `null`)
- `season.end_date` — e.g. `"2026-11-30"`

These are stored for reference; the leaderboard currently uses all-time data. A developer can add season filtering in `lib/db/queries/leaderboard.ts` when needed.

---

## 5. AI Cost Monitoring

Check **`/admin`** for:
- **AI Cost** — total estimated Gemini API cost across all sessions
- **Cost per session** — shown below the total

Costs are estimates based on character counts × Gemini Flash Lite pricing (~$0.075/1M input tokens, ~$0.30/1M output tokens). Actual costs may differ slightly.

To get the exact Gemini usage, visit [Google AI Studio billing](https://aistudio.google.com/billing).

If costs spike unexpectedly, the most likely cause is a surge in interview sessions. You can check `/admin/users` to see which users are driving volume.

**If you need to temporarily disable AI (e.g., quota hit):**

Set `GEMINI_API_KEY` to an invalid value in Vercel environment variables and redeploy. Students will see a friendly error message.

---

## 6. Interview Firm Styles

Firm styles (MBB, Big Four, Boutique, Generic) and their interviewer personalities live in:

```
config/firms/firm-styles.ts
```

This requires a developer change. Contact the technical team to add new firm styles or adjust interviewer personalities.

---

## 7. Recommended Monthly Checks

| Task | Where |
|------|-------|
| Review user growth | `/admin` → Total Users |
| Check AI cost trend | `/admin` → AI Cost card |
| Review avg score | `/admin` → Avg Score card |
| Look at most active users | `/admin/users` |
| Confirm drills are active | Supabase → drills table (`is_active = true`) |

---

## 8. Recommended Quarterly Checks

- Reset leaderboard snapshots before recruiting season starts (see Section 3)
- Update season dates in `/admin/settings`
- Verify Gemini API key is valid and not rate-limited
- Check if any drills need to be added/updated for the new semester

---

## 9. Rolling Back a Feature

If something breaks in production:

1. Go to **Vercel → Deployments** for the `caseforge-ai` project
2. Find the last working deployment
3. Click **"Promote to production"**

No code knowledge needed. Rollbacks take ~1 minute.

---

## 10. Getting Help

- **Technical issues:** File an issue in the GitHub repo or contact the developer who built this
- **Database questions:** [Supabase docs](https://supabase.com/docs)
- **AI quota issues:** [Google AI Studio](https://aistudio.google.com)
- **Hosting / deployment:** [Vercel dashboard](https://vercel.com/dashboard)
