import { auth, signIn } from "@/auth"
import { redirect } from "next/navigation"

export default async function SignInPage() {
  const session = await auth()
  if (session?.user?.id) redirect("/dashboard")

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
          <h1 className="text-ink text-xl font-semibold mb-1">Sign in</h1>
          <p className="text-ink-muted text-sm mb-6">Access your practice dashboard and interview history.</p>

          <form
            action={async () => {
              "use server"
              await signIn("google", { redirectTo: "/dashboard" })
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-border-subtle bg-surface-raised text-ink text-sm font-medium hover:bg-surface hover:border-border-strong transition-colors cursor-pointer"
            >
              <GoogleIcon />
              Sign in with Google
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-ink-faint">By signing in, you agree to our terms of service.</p>
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
