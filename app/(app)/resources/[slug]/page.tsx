import { notFound } from "next/navigation"
import ResourceDetailClient from "./resources-detail-client"
import { getResourceBySlug, incrementViewCount } from "@/lib/db/queries/resources"

export const dynamic = "force-dynamic"

export default async function ResourceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const resource = await getResourceBySlug(slug)
  if (!resource) notFound()

  // fire-and-forget view count increment
  incrementViewCount(resource.id).catch(() => {})

  return <ResourceDetailClient resource={resource} />
}