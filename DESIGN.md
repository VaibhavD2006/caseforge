# Design System

## Theme

Dark mode primary. Product register (design serves the task). Restrained color strategy: tinted dark neutrals + one authoritative brand accent. No light mode in MVP.

The direction aligns with the "Trust & Authority" pattern surfaced by the ui-ux-pro-max design search (best-fit for financial services / enterprise software / premium products): dark background, credential-forward, metric-driven, WCAG-strict. Per that search we explicitly **avoid AI purple/pink gradients** and generic decorative styling — the accent is a single authoritative indigo-blue, not a gradient.

## Color

Tokens are authored in OKLCH and live in `app/globals.css` (Tailwind v4 CSS-first config via `@theme inline`). The CaseForge `--cf-*` tokens are the source of truth; shadcn/ui variables (`--background`, `--primary`, etc.) are derived from them so both systems stay in sync.

```css
/* Core surfaces */
--cf-bg: oklch(0.11 0.012 258);            /* near-black with slight indigo tint */
--cf-surface: oklch(0.15 0.013 258);       /* dark panel/card bg */
--cf-surface-raised: oklch(0.19 0.014 258); /* elevated surface (modals, dropdowns) */
--cf-border: oklch(0.25 0.015 258);        /* subtle borders */
--cf-border-strong: oklch(0.35 0.018 258); /* visible dividers */

/* Text */
--cf-ink: oklch(0.93 0.005 258);           /* primary text (near-white) */
--cf-ink-muted: oklch(0.62 0.010 258);     /* secondary text */
--cf-ink-faint: oklch(0.40 0.008 258);     /* placeholder, disabled */

/* Brand accent — authoritative indigo-blue */
--cf-brand: oklch(0.62 0.19 258);          /* primary actions, links, selection */
--cf-brand-hover: oklch(0.67 0.19 258);    /* hover state */
--cf-brand-subtle: oklch(0.20 0.05 258);   /* brand tinted bg */
--cf-brand-muted: oklch(0.35 0.10 258);    /* brand mid-tone */

/* Semantic states */
--cf-success: oklch(0.62 0.15 158);
--cf-success-subtle: oklch(0.18 0.05 158);
--cf-warning: oklch(0.72 0.15 78);
--cf-warning-subtle: oklch(0.18 0.05 78);
--cf-error: oklch(0.60 0.18 22);
--cf-error-subtle: oklch(0.18 0.05 22);
--cf-info: oklch(0.62 0.12 225);
--cf-info-subtle: oklch(0.18 0.04 225);

/* Scoring tiers */
--cf-tier-bronze: oklch(0.65 0.12 55);
--cf-tier-silver: oklch(0.72 0.04 265);
--cf-tier-gold: oklch(0.78 0.15 85);
--cf-tier-emerald: oklch(0.72 0.16 160);
```

**Color roles:**
- `--cf-bg`: Page background
- `--cf-surface`: Cards, panels, sidebars
- `--cf-surface-raised`: Modals, dropdowns, popovers
- `--cf-brand`: CTAs, active states, links, current nav item
- Semantic colors for score states (success/warning/error map to scoring bands)
- Tier colors for Bronze/Silver/Gold/Emerald badges

**Tailwind utilities:** the tokens are exposed as utility classes — `bg-surface`, `text-ink`, `text-ink-muted`, `border-border-strong`, `bg-brand`, `text-success`, `bg-gold`, etc. — mapped in the `@theme inline` block.

**Contrast:** All text on surfaces passes WCAG AA (4.5:1 for normal, 3:1 for large). `--cf-ink` on `--cf-bg`/`--cf-surface` clears AA comfortably; `--cf-ink-muted` is reserved for secondary text at ≥14px.

## Typography

One family: Inter (via `next/font/google`, exposed as `--font-inter`). Tight scale ratio (1.15). No display fonts in UI labels.

Scale:
- `text-xs` (12px) — labels, badges, captions
- `text-sm` (14px) — secondary body, form labels
- `text-base` (16px) — primary body
- `text-lg` (18px) — section headings
- `text-xl` (20px) — page headings
- `text-2xl` (24px) — feature headings
- `text-3xl` (30px) — dashboard numbers

Line height: 1.5 for body, 1.2 for headings. Max line length: 70ch for prose.

## Components

Built on shadcn/ui (radix base, Nova preset). All interactive states: default, hover, focus, active, disabled, loading, error.
- Buttons: brand-filled (primary), outlined (secondary), ghost (tertiary)
- Forms: custom focus ring in `--cf-brand`, no default browser styles. Use Server Actions for mutations (`<form action={serverAction}>`), not per-mutation API routes.
- Cards: `--cf-surface` bg, `--cf-border` border, 8px radius
- Badges: score bands use semantic colors, tier badges use tier colors
- Skeletons for loading states (never spinners in content areas)

## Motion

150-250ms transitions. `ease-out` for entering, `ease-in` for exiting (per ux-guidelines — linear feels robotic). State changes only (no decoration). Continuous/infinite animation reserved for loading indicators only.
`@media (prefers-reduced-motion: reduce)` on all animations (High-severity accessibility requirement).

## Layout

App shell: top nav + content area. Max content width: 1200px. Dashboard: 2-column grid (sidebar + main). Mobile: single column. Responsive breakpoints verified at 375px, 768px, 1024px, 1440px.

Z-index scale: dropdown (10), sticky (20), modal-backdrop (30), modal (40), toast (50), tooltip (60).

## Icons

Lucide React. Consistent 20x20 viewport with `w-5 h-5` class. No emojis as icons.
