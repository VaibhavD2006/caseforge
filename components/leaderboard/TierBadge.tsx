"use client"

const TIER_CONFIG = {
  bronze: { label: "Bronze", color: "text-[oklch(0.65_0.12_55)]", bg: "bg-[oklch(0.16_0.04_55)]", border: "border-[oklch(0.30_0.08_55)]" },
  silver: { label: "Silver", color: "text-[oklch(0.72_0.04_265)]", bg: "bg-[oklch(0.16_0.02_265)]", border: "border-[oklch(0.30_0.04_265)]" },
  gold: { label: "Gold", color: "text-[oklch(0.78_0.15_85)]", bg: "bg-[oklch(0.16_0.05_85)]", border: "border-[oklch(0.30_0.10_85)]" },
  emerald: { label: "Emerald", color: "text-[oklch(0.72_0.16_160)]", bg: "bg-[oklch(0.14_0.05_160)]", border: "border-[oklch(0.28_0.10_160)]" },
}

type Tier = keyof typeof TIER_CONFIG

export function TierBadge({ tier, size = "sm" }: { tier: Tier; size?: "sm" | "xs" }) {
  const t = TIER_CONFIG[tier] ?? TIER_CONFIG.bronze
  const sizeClass = size === "xs" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2.5 py-1"
  return (
    <span className={`font-semibold rounded-full border ${sizeClass} ${t.color} ${t.bg} ${t.border}`}>
      {t.label}
    </span>
  )
}
