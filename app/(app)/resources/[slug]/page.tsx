import { notFound } from "next/navigation"
import ResourceDetailClient from "./resources-detail-client"
import { getResourceBySlug, incrementViewCount, getRelatedResources } from "@/lib/db/queries/resources"

export const dynamic = "force-dynamic"

export default async function ResourceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const resource = await getResourceBySlug(slug)
  if (!resource) notFound()

  const [related] = await Promise.all([
    getRelatedResources(resource.id, 3).catch(() => [] as Awaited<ReturnType<typeof getRelatedResources>>),
    incrementViewCount(resource.id).catch(() => {}),
  ])

  return <ResourceDetailClient resource={resource} related={related} />
}
