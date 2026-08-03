import { AppNav } from "@/components/app-nav"
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
    <div className="min-h-screen bg-bg">
      <AppNav />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <ResourcesClient
          categories={categories}
          featured={featured}
          allResources={allResources}
          practice={practice}
        />
      </main>
    </div>
  )
}
