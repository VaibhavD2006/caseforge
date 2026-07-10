"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DM_Serif_Display } from "next/font/google"

const serif = DM_Serif_Display({ subsets: ["latin"], weight: "400" })

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        transition: "background .3s, backdrop-filter .3s, border-color .3s",
        background: scrolled ? "rgba(7,26,10,.85)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(74,222,128,.12)" : "1px solid transparent",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className={serif.className} style={{ fontSize: 22, color: "#4ADE80", letterSpacing: "-0.5px" }}>CaseForge</span>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <a href="#how-it-works" style={{ color: "#86EFAC", fontSize: 14, textDecoration: "none", opacity: .8 }}>How it works</a>
          <a href="#faq" style={{ color: "#86EFAC", fontSize: 14, textDecoration: "none", opacity: .8 }}>FAQ</a>
          <Link
            href="/sign-in"
            style={{ background: "#4ADE80", color: "#071A0A", fontSize: 14, fontWeight: 700, padding: "8px 20px", borderRadius: 8, textDecoration: "none", letterSpacing: ".2px" }}
          >
            Get started
          </Link>
        </div>
      </div>
    </nav>
  )
}
