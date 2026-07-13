import Link from "next/link"

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="w-full max-w-sm px-6 text-center">
        <div className="inline-flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
            <span className="text-[oklch(0.10_0.012_148)] text-sm font-bold">CF</span>
          </div>
          <span className="text-ink font-semibold text-lg tracking-tight">CaseForge AI</span>
        </div>

        <div className="rounded-xl border border-border-subtle bg-surface p-8 mb-6">
          <div className="w-12 h-12 rounded-full bg-brand-subtle border border-brand-muted flex items-center justify-center mx-auto mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <h1 className="text-ink text-xl font-semibold mb-2">Check your inbox</h1>
          <p className="text-ink-muted text-sm leading-relaxed">
            We sent a verification link to your email. Click it to activate your account.
          </p>
          <p className="text-ink-faint text-xs mt-3">The link expires in 24 hours.</p>
        </div>

        <p className="text-xs text-ink-faint">
          Already verified?{" "}
          <Link href="/sign-in" className="text-brand hover:text-brand-hover">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
