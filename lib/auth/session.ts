import { cache } from "react"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

// Cached per request — auth() is only called once even if multiple server components need it
export const requireAuth = cache(async () => {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/sign-in")
  }
  return session
})

export const getOptionalSession = cache(async () => {
  return auth()
})
