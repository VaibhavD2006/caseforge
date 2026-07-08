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

export async function createProfile(
  userId: string,
  data: {
    targetFirms?: string[]
    targetRole?: string
    experienceLevel?: "undergrad" | "mba" | "professional" | "career_switcher"
    interviewDate?: string
    selfAssessmentScores?: Record<string, number>
  }
) {
  const [profile] = await db
    .insert(candidateProfiles)
    .values({
      userId,
      targetFirms: data.targetFirms ?? [],
      targetRole: data.targetRole ?? null,
      experienceLevel: data.experienceLevel ?? null,
      interviewDate: data.interviewDate ?? null,
      selfAssessmentScores: data.selfAssessmentScores ?? null,
    })
    .returning()
  return profile!
}

export async function updateProfile(
  userId: string,
  data: {
    targetFirms?: string[]
    targetRole?: string
    experienceLevel?: "undergrad" | "mba" | "professional" | "career_switcher"
    interviewDate?: string
    selfAssessmentScores?: Record<string, number>
  }
) {
  const [profile] = await db
    .update(candidateProfiles)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(candidateProfiles.userId, userId))
    .returning()
  return profile ?? null
}
