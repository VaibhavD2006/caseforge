import { db } from "@/lib/db"
import { resources, resourceCategories, practiceListings } from "@/lib/db/schema"
import { eq, ilike, or, and, desc, sql } from "drizzle-orm"

export async function getResourceCategories() {
  const cols = {
    id: resourceCategories.id,
    name: resourceCategories.name,
    slug: resourceCategories.slug,
    description: resourceCategories.description,
    icon: resourceCategories.icon,
    sortOrder: resourceCategories.sortOrder,
  }
  return db.select(cols).from(resourceCategories).orderBy(resourceCategories.sortOrder)
}

export async function getFeaturedResources(limit = 6) {
  const cols = {
    id: resources.id,
    title: resources.title,
    slug: resources.slug,
    description: resources.description,
    content: resources.content,
    format: resources.format,
    difficulty: resources.difficulty,
    categoryId: resources.categoryId,
    tags: resources.tags,
    isFeatured: resources.isFeatured,
    viewCount: resources.viewCount,
    externalUrl: resources.externalUrl,
    author: resources.author,
    source: resources.source,
  }
  return db
    .select(cols)
    .from(resources)
    .where(and(eq(resources.isFeatured, true), eq(resources.isPublished, true)))
    .orderBy(desc(resources.createdAt))
    .limit(limit)
}

export async function getResources({
  categorySlug,
  format,
  difficulty,
  search,
  featured,
}: {
  categorySlug?: string
  format?: string
  difficulty?: string
  search?: string
  featured?: boolean
} = {}) {
  const conditions = [eq(resources.isPublished, true)]

  if (featured) conditions.push(eq(resources.isFeatured, true))
  if (format) conditions.push(eq(resources.format, format as any))
  if (difficulty) conditions.push(eq(resources.difficulty, difficulty as any))
  if (search) {
    conditions.push(
      or(
        ilike(resources.title, `%${search}%`),
        ilike(resources.description, `%${search}%`),
        sql`${resources.tags}::text ilike ${`%${search}%`}`
      )!
    )
  }

  const cols = {
    id: resources.id,
    title: resources.title,
    slug: resources.slug,
    description: resources.description,
    content: resources.content,
    format: resources.format,
    difficulty: resources.difficulty,
    categoryId: resources.categoryId,
    tags: resources.tags,
    isFeatured: resources.isFeatured,
    viewCount: resources.viewCount,
    externalUrl: resources.externalUrl,
    author: resources.author,
    source: resources.source,
  }

  if (categorySlug) {
    return db
      .select(cols)
      .from(resources)
      .innerJoin(resourceCategories, eq(resources.categoryId, resourceCategories.id))
      .where(and(...conditions, eq(resourceCategories.slug, categorySlug)))
      .orderBy(desc(resources.isFeatured), desc(resources.viewCount))
  }

  return db
    .select(cols)
    .from(resources)
    .where(and(...conditions))
    .orderBy(desc(resources.isFeatured), desc(resources.viewCount), desc(resources.createdAt))
}

export async function getResourceBySlug(slug: string) {
  const cols = {
    id: resources.id,
    title: resources.title,
    slug: resources.slug,
    description: resources.description,
    content: resources.content,
    format: resources.format,
    difficulty: resources.difficulty,
    categoryId: resources.categoryId,
    tags: resources.tags,
    isFeatured: resources.isFeatured,
    viewCount: resources.viewCount,
    externalUrl: resources.externalUrl,
    author: resources.author,
    source: resources.source,
  }
  const [resource] = await db
    .select(cols)
    .from(resources)
    .where(and(eq(resources.slug, slug), eq(resources.isPublished, true)))
    .limit(1)
  return resource ?? null
}

export async function incrementViewCount(id: string) {
  await db
    .update(resources)
    .set({ viewCount: sql`${resources.viewCount} + 1` })
    .where(eq(resources.id, id))
}

export async function getPracticeListings() {
  const cols = {
    id: practiceListings.id,
    title: practiceListings.title,
    description: practiceListings.description,
    type: practiceListings.type,
    bookingUrl: practiceListings.bookingUrl,
    hostName: practiceListings.hostName,
    durationMinutes: practiceListings.durationMinutes,
    sortOrder: practiceListings.sortOrder,
  }
  return db
    .select(cols)
    .from(practiceListings)
    .where(eq(practiceListings.isActive, true))
    .orderBy(practiceListings.sortOrder)
}

export async function upsertResource(data: {
  id?: string
  title: string
  slug: string
  description: string
  content?: string
  format: string
  difficulty: string
  categoryId?: string
  externalUrl?: string
  author?: string
  source?: string
  tags?: string[]
  isFeatured?: boolean
  isPublished?: boolean
}) {
  const id = data.id ?? crypto.randomUUID()
  await db
    .insert(resources)
    .values({ ...(data as any), id, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: resources.id,
      set: { ...(data as any), updatedAt: new Date() },
    })
  return id
}

export async function deleteResource(id: string) {
  await db.delete(resources).where(eq(resources.id, id))
}

export async function getAllResourcesAdmin() {
  return db
    .select({
      id: resources.id,
      title: resources.title,
      slug: resources.slug,
      format: resources.format,
      difficulty: resources.difficulty,
      isFeatured: resources.isFeatured,
      isPublished: resources.isPublished,
      viewCount: resources.viewCount,
      createdAt: resources.createdAt,
    })
    .from(resources)
    .orderBy(desc(resources.createdAt))
}
