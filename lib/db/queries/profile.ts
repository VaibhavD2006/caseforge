import { db } from "@/lib/db"
import { candidateProfiles } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function getProfileByUserId(userId: string) {
  const [profile] = await db
    .select()
    .from(candidateProfiles)
    .where(eq(candidateProfiles.userId, userId))
    .limit(1)
  return profile ?? null
}

type ProfileData = {
  targetFirms?: string[]
  targetRole?: string
  experienceLevel?: "undergrad" | "mba" | "professional" | "career_switcher"
  interviewDate?: string
  selfAssessmentScores?: Record<string, number>
  screenerCompleted?: boolean
  behavioralConfidenceRating?: number
  quantComfortRating?: number
  screenerBaselineResponse?: string
  screenerCompletedAt?: Date
}

export async function createProfile(userId: string, data: ProfileData) {
  const [profile] = await db
    .insert(candidateProfiles)
    .values({
      userId,
      targetFirms: data.targetFirms ?? [],
      targetRole: data.targetRole ?? null,
      experienceLevel: data.experienceLevel ?? null,
      interviewDate: data.interviewDate ?? null,
      selfAssessmentScores: data.selfAssessmentScores ?? null,
      screenerCompleted: data.screenerCompleted ?? false,
      behavioralConfidenceRating: data.behavioralConfidenceRating ?? null,
      quantComfortRating: data.quantComfortRating ?? null,
      screenerBaselineResponse: data.screenerBaselineResponse ?? null,
      screenerCompletedAt: data.screenerCompletedAt ?? null,
    })
    .returning()
  return profile!
}

export async function updateProfile(userId: string, data: ProfileData) {
  const [profile] = await db
    .update(candidateProfiles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(candidateProfiles.userId, userId))
    .returning()
  return profile ?? null
}
