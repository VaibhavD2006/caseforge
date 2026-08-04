import { getResourceCategories, getResources, getFeaturedResources, getPracticeListings } from "@/lib/db/queries/resources"
import ResourcesClient from "./resources-client"

export const dynamic = "force-dynamic"

export default async function ResourcesPage() {
  const [categories, featured, allResources, practice] = await Promise.all([
    getResourceCategories().catch((e) => { console.error("[resources] categories:", e); return [] }),
    getFeaturedResources(6).catch((e) => { console.error("[resources] featured:", e); return [] }),
    getResources().catch((e) => { console.error("[resources] all:", e); return [] }),
    getPracticeListings().catch((e) => { console.error("[resources] practice:", e); return [] }),
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