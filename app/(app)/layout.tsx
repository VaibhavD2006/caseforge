import { cache } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth/session"
import { db } from "@/lib/db"
import { candidateProfiles } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

const getProfile = cache(async (userId: string) => {
  const [profile] = await db
    .select({ id: candidateProfiles.id })
    .from(candidateProfiles)
    .where(eq(candidateProfiles.userId, userId))
    .limit(1)
  return profile ?? null
})

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth()
  const userId = session.user.id!

  const hdrs = await headers()
  const pathname = hdrs.get("x-pathname") ?? "/"
  const isOnboarding = pathname.startsWith("/onboarding")

  if (!isOnboarding) {
    const profile = await getProfile(userId)
    // Only gate on profile existence — screener is first-time only, not enforced on return
    if (!profile) redirect("/onboarding/profile")
  }

  return <>{children}</>
}
