import { requireAuth } from "@/lib/auth/session"
import { getProfileByUserId } from "@/lib/db/queries/profile"
import SettingsClient from "./settings-client"

export default async function SettingsPage() {
  const session = await requireAuth()
  const userId = session.user.id!
  const profile = await getProfileByUserId(userId)

  return (
    <SettingsClient
      profile={{
        targetFirms: (profile?.targetFirms as string[]) ?? [],
        experienceLevel: profile?.experienceLevel ?? "",
        // interviewDate is a date() column — Drizzle returns it as string "YYYY-MM-DD" directly
        interviewDate: profile?.interviewDate ?? "",
      }}
      user={{
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        image: session.user.image ?? null,
      }}
    />
  )
}
