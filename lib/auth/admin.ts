import { cache } from 'react'
import { requireAuth } from './session'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'

export const requireAdmin = cache(async () => {
  const session = await requireAuth()
  const [user] = await db
    .select({ role: users.role, organization: users.organization })
    .from(users)
    .where(eq(users.id, session.user.id!))
    .limit(1)

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    redirect('/dashboard')
  }

  return { session, user }
})
