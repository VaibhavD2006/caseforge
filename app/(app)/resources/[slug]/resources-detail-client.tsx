"use client"

import Link from "next/link"
import { AppNav } from "@/components/app-nav"
import { ExternalLink, ArrowLeft, Tag } from "lucide-react"

type Resource = {
  id: string
  title: string
  slug: string
  description: string
  content: string | null
  format: string
  difficulty: string
  categoryId: string | null
  tags: string[]
  isFeatured: boolean
  viewCount: number
  externalUrl: string | null
  author: string | null
  source: string | null
  createdAt: Date
}

export default function ResourceDetailClient({ resource }: { resource: Resource }) {
  return (
    <div className="min-h-screen bg-bg">
      <AppNav />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <Link href="/resources" className="flex items-center gap-1.5 text-ink-muted text-sm hover:text-ink transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Resources
        </Link>

        <article className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border text-brand bg-[oklch(0.14_0.05_158)] border-[oklch(0.28_0.08_158)]">
                {resource.format.replace("_", " ")}
              </span>
              {resource.difficulty !== "all_levels" && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border text-ink-faint bg-surface border-border-subtle">
                  {resource.difficulty}
                </span>
              )}
            </div>
            <h1 className="text-ink text-2xl font-bold mb-2">{resource.title}</h1>
            <p className="text-ink-muted">{resource.description}</p>
            {(resource.author ?? resource.source) && (
              <p className="text-ink-faint text-sm mt-1">By {resource.author ?? resource.source}</p>
            )}
          </div>

          {/* External link */}
          {resource.externalUrl && (
            <Link
              href={resource.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-[oklch(0.10_0.012_148)] text-sm font-semibold transition-colors w-fit"
            >
              <ExternalLink className="w-4 h-4" />
              Open Resource
            </Link>
          )}

          {/* Content */}
          {resource.content && (
            <div className="bg-surface border border-border-subtle rounded-xl p-6">
              <div className="text-ink-muted text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {resource.content}
              </div>
            </div>
          )}

          {/* No content fallback */}
          {!resource.content && !resource.externalUrl && (
            <div className="bg-surface border border-border-subtle rounded-xl p-6 text-center">
              <p className="text-ink-muted text-sm">Content for this resource will be added soon.</p>
            </div>
          )}

          {/* Tags */}
          {resource.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-3.5 h-3.5 text-ink-faint" />
              {resource.tags.map((tag) => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full border text-ink-faint bg-surface border-border-subtle">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </article>
      </main>
    </div>
  )
}