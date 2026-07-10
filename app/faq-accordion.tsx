"use client"

import { useState } from "react"

const FAQS = [
  {
    q: "How is this different from mock interviews with a human coach?",
    a: "Human coaches are valuable but scarce and expensive. CaseForge gives you unlimited reps with immediate quantitative feedback. Use both — use us for volume, coaches for polish.",
  },
  {
    q: "What firms is this built for?",
    a: "Primarily MBB and T2 strategy firms. The case formats, rubrics, and difficulty calibration are tuned to McKinsey, BCG, Bain, Oliver Wyman, Deloitte S&O, and LEK.",
  },
  {
    q: "Do I need to have case experience to start?",
    a: "No. The platform detects where you are and adjusts. Beginners get foundational frameworks; advanced candidates get synthesis-heavy market sizing.",
  },
  {
    q: "How does scoring work?",
    a: "Each session is evaluated on seven dimensions: structure, hypothesis quality, numerics, synthesis, communication, time management, and adaptability. Scores are 1–10 with written commentary.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Your session transcripts and scorecard data are tied only to your account and never shared or used to train third-party models.",
  },
]

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {FAQS.map((faq, i) => (
        <div
          key={i}
          style={{ background: "#FFFFFF", borderRadius: 12, border: "1px solid #E5E7EB", overflow: "hidden", marginBottom: 2 }}
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{ width: "100%", textAlign: "left", padding: "20px 24px", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}
          >
            <span style={{ color: "#111827", fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>{faq.q}</span>
            <span style={{ color: "#16A34A", fontSize: 20, fontWeight: 300, flexShrink: 0, transition: "transform .2s", transform: open === i ? "rotate(45deg)" : "none" }}>+</span>
          </button>
          {open === i && (
            <div style={{ padding: "0 24px 20px", color: "#4B5563", fontSize: 15, lineHeight: 1.75 }}>
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
