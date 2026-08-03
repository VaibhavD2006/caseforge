import { getResourceCategories, getResources, getFeaturedResources, getPracticeListings } from "@/lib/db/queries/resources"
import ResourcesClient from "./resources-client"

export const dynamic = "force-dynamic"

export default async function ResourcesPage() {
  const [categories, featured, allResources, practice] = await Promise.all([
    getResourceCategories(),
    getFeaturedResources(6),
    getResources(),
    getPracticeListings(),
  ])

  return (
    <ResourcesClient
      categories={categories}
      featured={featured}
      allResources={allResources}
      practice={practice}
    />
  )
}