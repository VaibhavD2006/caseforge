# Auth: Email/Password + Signup Flow Design

**Date:** 2026-07-13  
**Status:** Approved

---

## Context

CaseForge AI currently supports Google OAuth only (NextAuth v5, JWT strategy, DrizzleAdapter on Supabase). New users have no alternative sign-in method and there is no explicit signup page or legal agreement gate.

This spec adds email/password auth with email verification, a dedicated signup page, and static legal pages. The UX rule: **new users always go through signup (and accept ToS), returning users go to login**.

---

## User Flows

### New user
1. Lands on `/sign-up`
2. Chooses **Sign up with Google** OR fills **email + password** fields
3. Must check: *"I agree to the Terms of Service and Privacy Policy"* — submit blocked until checked
4. On Google: OAuth flow completes → if first time, mark account as accepted ToS → `/dashboard`
5. On email/password: POST `/api/auth/register` → verification email sent → redirect to `/verify-email`
6. Clicks link in email → `/api/auth/verify-email?token=...` → redirects to `/sign-in?verified=true`

### Returning user
1. Lands on `/sign-in`
2. Chooses **Sign in with Google** OR fills **email + password**
3. No ToS checkbox (already accepted at signup)
4. Unverified email → error: "Please verify your email. Check your inbox."
5. Wrong password → generic error: "Invalid email or password." (no enumeration)
6. Success → `/dashboard`

### Sign-in ↔ Sign-up navigation
- `/sign-in` has footer: *"New here? [Create an account]"* → `/sign-up`
- `/sign-up` has footer: *"Already have an account? [Sign in]"* → `/sign-in`

---

## Architecture

### New dependencies
- `bcryptjs` + `@types/bcryptjs` — password hashing (pure JS, no native deps)
- `resend` — transactional email

### Schema changes
One new nullable column on `users`:
```sql
ALTER TABLE users ADD COLUMN password_hash text;
```
Nullable so existing Google OAuth users are unaffected. A user can have both a `passwordHash` (email/password) and a linked Google account.

Uses existing `verificationTokens` table (`identifier` = email, `token` = random UUID, `expires` = 24h from creation).

### Auth config (`auth.ts`)
Add `Credentials` provider alongside the existing `Google` provider:
- Looks up user by email
- Verifies `emailVerified` is not null (rejects unverified accounts)
- Compares submitted password against `passwordHash` with `bcrypt.compare`
- Returns null on any failure (no leaking which field was wrong)

### Registration route (`POST /api/auth/register`)
Validates:
- Email is valid format
- Password ≥ 8 characters
- Email not already registered (if taken and verified: "Account already exists. Sign in instead." — if taken and unverified: resend verification email)

On success:
1. Hash password with `bcrypt.hash(password, 12)`
2. Insert user with `emailVerified: null`, `passwordHash`
3. Generate `crypto.randomUUID()` token, insert into `verificationTokens` (expires 24h)
4. Send verification email via Resend
5. Return `{ ok: true }`

### Verification route (`GET /api/auth/verify-email`)
Query param: `token`
1. Look up token in `verificationTokens`
2. If not found or expired → redirect to `/sign-in?error=invalid-token`
3. Set `emailVerified = new Date()` on matching user
4. Delete token
5. Redirect to `/sign-in?verified=true`

### Email (`lib/email/send-verification.ts`)
Sends via Resend from `noreply@caseforge.ai` (or configured domain).  
Subject: *"Verify your CaseForge AI email"*  
Body: Plain transactional — link, expires in 24 hours, ignore if didn't sign up.

---

## Pages

| Route | Type | Purpose |
|-------|------|---------|
| `/sign-in` | Server + client form | Login: Google button + email/password form. No ToS checkbox. Shows `?verified=true` banner. Shows `?error=` messages. |
| `/sign-up` | Client | Signup: Google button + email/password form + ToS checkbox (required). |
| `/verify-email` | Server | Static "Check your inbox" confirmation page. Shows email address. Link to resend (future). |
| `/terms` | Server | Terms of Service — static content. |
| `/privacy` | Server | Privacy Policy — static content. |

### ToS checkbox (sign-up only)
```
☐ I agree to the Terms of Service and Privacy Policy
```
Both words are links opening the respective pages. Form submit is disabled until checked. Acceptance is implicit in account creation — no separate DB column needed for MVP (ToS version tracking is future scope).

### Sign-in error states
- `?error=invalid-token` → "This verification link is invalid or has expired. Please sign up again."
- `?verified=true` → "Email verified. You can now sign in."
- Credential error → "Invalid email or password." (shown inline)
- Unverified → "Please verify your email before signing in."

---

## Security

- Passwords hashed with bcrypt cost factor 12
- No password enumeration: same error for wrong email and wrong password
- Verification tokens are single-use and expire in 24 hours
- Email/password and Google OAuth are independent credential types — a user can link both
- No rate limiting in this spec (add at infra/middleware layer separately)

---

## Out of Scope (not in this spec)

- Password reset / forgot password flow
- Resending verification email
- ToS version tracking / re-acceptance on version bump
- Account linking (merge Google + email accounts for same email)
- Rate limiting sign-in attempts

---

## Files Changed

| File | Change |
|------|--------|
| `auth.ts` | Add `Credentials` provider |
| `lib/db/schema.ts` | Add `passwordHash` to `users` |
| `lib/email/send-verification.ts` | NEW — Resend email sender |
| `app/api/auth/register/route.ts` | NEW — registration handler |
| `app/api/auth/verify-email/route.ts` | NEW — token verification handler |
| `app/(auth)/sign-in/page.tsx` | Add email/password form, verified banner, error states, "New here?" link |
| `app/(auth)/sign-up/page.tsx` | NEW — Google + email/password + ToS checkbox |
| `app/(auth)/verify-email/page.tsx` | NEW — "Check your inbox" page |
| `app/(legal)/terms/page.tsx` | NEW — Terms of Service |
| `app/(legal)/privacy/page.tsx` | NEW — Privacy Policy |

DB migration: one `ALTER TABLE users ADD COLUMN password_hash text` via `drizzle-kit push`.
