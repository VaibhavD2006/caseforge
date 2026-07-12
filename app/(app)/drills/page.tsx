import { requireAuth } from "@/lib/auth/session"
import { getActiveDrills, getUserAttemptCountPerDrill } from "@/lib/db/queries/drills"
import DrillsClient from "./drills-client"

export default async function DrillsPage() {
  const session = await requireAuth()
  const [allDrills, attemptCounts] = await Promise.all([
    getActiveDrills(),
    getUserAttemptCountPerDrill(session.user.id!),
  ])

  return (
    <DrillsClient
      drills={allDrills.map((d) => ({
        id: d.id,
        title: d.title,
        skillFocus: d.skillFocus,
        difficulty: d.difficulty,
        estimatedMinutes: d.estimatedMinutes,
        timesAttempted: d.timesAttempted,
        userAttempts: attemptCounts[d.id] ?? 0,
      }))}
    />
  )
}
