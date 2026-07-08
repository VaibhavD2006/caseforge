import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth/session"
import { db } from "@/lib/db"
import { candidateProfiles } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAuth()
  const userId = session.user.id

  const hdrs = await headers()
  const pathname = hdrs.get("x-pathname") ?? "/"
  const isOnboarding = pathname.startsWith("/onboarding")

  if (!isOnboarding) {
    const [profile] = await db
      .select({ id: candidateProfiles.id })
      .from(candidateProfiles)
      .where(eq(candidateProfiles.userId, userId))
      .limit(1)

    if (!profile) {
      redirect("/onboarding/profile")
    }
  }

  return <>{children}</>
}
