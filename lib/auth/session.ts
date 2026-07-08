import { auth } from "@/auth"
import { redirect } from "next/navigation"

export async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/sign-in")
  }
  return session
}

export async function getOptionalSession() {
  return auth()
}
