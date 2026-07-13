"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleEmailSignUp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }
    if (!agreed) {
      setError("You must agree to the Terms of Service and Privacy Policy.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.")
        return
      }
      router.push(`/verify-email?email=${encodeURIComponent(email)}`)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    if (!agreed) {
      setError("You must agree to the Terms of Service and Privacy Policy.")
      return
    }
    setGoogleLoading(true)
    await signIn("google", { callbackUrl: "/dashboard" })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="w-full max-w-sm px-6">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
              <span className="text-[oklch(0.10_0.012_148)] text-sm font-bold">CF</span>
            </div>
            <span className="text-ink font-semibold text-lg tracking-tight">CaseForge AI</span>
          </div>
          <p className="text-ink-muted text-sm">Consulting interview practice. Strict feedback. Real progress.</p>
        </div>

        <div className="rounded-xl border border-border-subtle bg-surface p-8">
          <h1 className="text-ink text-xl font-semibold mb-1">Create an account</h1>
          <p className="text-ink-muted text-sm mb-6">Start your consulting interview prep.</p>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-border-subtle bg-surface-raised text-ink text-sm font-medium hover:bg-surface hover:border-border-strong transition-colors cursor-pointer disabled:opacity-50"
          >
            <GoogleIcon />
            {googleLoading ? "Redirecting…" : "Sign up with Google"}
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border-subtle" />
            <span className="text-ink-faint text-xs">or</span>
            <div className="flex-1 h-px bg-border-subtle" />
          </div>

          {/* Email/password form */}
          <form onSubmit={handleEmailSignUp} className="space-y-3">
            <div>
              <label className="block text-ink-muted text-xs mb-1" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-border-subtle bg-surface-raised text-ink text-sm px-3 py-2.5 placeholder:text-ink-faint focus:outline-none focus:border-brand-muted focus:ring-1 focus:ring-brand-muted transition-colors"
              />
            </div>
            <div>
              <label className="block text-ink-muted text-xs mb-1" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full rounded-lg border border-border-subtle bg-surface-raised text-ink text-sm px-3 py-2.5 placeholder:text-ink-faint focus:outline-none focus:border-brand-muted focus:ring-1 focus:ring-brand-muted transition-colors"
              />
            </div>
            <div>
              <label className="block text-ink-muted text-xs mb-1" htmlFor="confirm">Confirm password</label>
              <input
                id="confirm"
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter password"
                className="w-full rounded-lg border border-border-subtle bg-surface-raised text-ink text-sm px-3 py-2.5 placeholder:text-ink-faint focus:outline-none focus:border-brand-muted focus:ring-1 focus:ring-brand-muted transition-colors"
              />
            </div>

            {/* ToS checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-border-subtle accent-brand flex-shrink-0"
              />
              <span className="text-ink-muted text-xs leading-relaxed">
                I agree to the{" "}
                <Link href="/terms" target="_blank" className="text-brand hover:text-brand-hover underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" target="_blank" className="text-brand hover:text-brand-hover underline">
                  Privacy Policy
                </Link>
              </span>
            </label>

            {error && (
              <p className="text-[oklch(0.60_0.18_22)] text-xs">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !agreed}
              className="w-full py-2.5 rounded-lg bg-brand hover:bg-brand-hover text-[oklch(0.10_0.012_148)] text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-ink-faint">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-brand hover:text-brand-hover">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}
