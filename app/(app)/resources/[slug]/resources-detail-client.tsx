"use client"

import Link from "next/link"
import { AppNav } from "@/components/app-nav"
import { ExternalLink, ArrowLeft, Tag, BookOpen, Star } from "lucide-react"

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
}

type RelatedResource = Omit<Resource, "content" | "categoryId">

const FORMAT_LABELS: Record<string, string> = {
  guide: "Guide", case_book: "Case Book", video: "Video", book: "Book",
  drill_ref: "Drill Ref", link: "Link", pdf: "PDF", definition: "Definition", checklist: "Checklist"
}

const FORMAT_COLORS: Record<string, string> = {
  guide: "text-[oklch(0.62_0.15_158)] bg-[oklch(0.14_0.05_158)] border-[oklch(0.28_0.08_158)]",
  definition: "text-[oklch(0.65_0.15_250)] bg-[oklch(0.13_0.05_250)] border-[oklch(0.28_0.08_250)]",
  case_book: "text-[oklch(0.65_0.15_290)] bg-[oklch(0.13_0.05_290)] border-[oklch(0.28_0.08_290)]",
  book: "text-[oklch(0.72_0.15_78)] bg-[oklch(0.16_0.05_78)] border-[oklch(0.30_0.08_78)]",
  video: "text-[oklch(0.60_0.18_22)] bg-[oklch(0.16_0.05_22)] border-[oklch(0.28_0.08_22)]",
  default: "text-ink-faint bg-surface border-border-subtle",
}

const DIFF_COLORS: Record<string, string> = {
  beginner: "text-[oklch(0.62_0.15_158)] bg-[oklch(0.14_0.05_158)] border-[oklch(0.28_0.08_158)]",
  intermediate: "text-[oklch(0.72_0.15_78)] bg-[oklch(0.16_0.05_78)] border-[oklch(0.30_0.08_78)]",
  advanced: "text-[oklch(0.60_0.18_22)] bg-[oklch(0.16_0.05_22)] border-[oklch(0.28_0.08_22)]",
}

// Inline bold only: **text** → <strong>
function parseInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i} className="text-ink font-semibold">{part.slice(2, -2)}</strong>
      : part
  )
}

function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n")
  const nodes: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i] ?? ""

    if (line.startsWith("## ")) {
      nodes.push(
        <h2 key={i} className="text-ink font-semibold text-base mt-7 mb-2.5 first:mt-0">
          {line.slice(3)}
        </h2>
      )
      i++
    } else if (line.startsWith("### ")) {
      nodes.push(
        <h3 key={i} className="text-ink font-medium text-sm mt-5 mb-1.5">
          {line.slice(4)}
        </h3>
      )
      i++
    } else if (line.startsWith("- ")) {
      const items: string[] = []
      while (i < lines.length && (lines[i] ?? "").startsWith("- ")) {
        items.push((lines[i] ?? "").slice(2))
        i++
      }
      nodes.push(
        <ul key={`ul-${i}`} className="space-y-2 my-3">
          {items.map((item, j) => (
            <li key={j} className="flex gap-2.5 text-ink-muted text-sm leading-relaxed">
              <span className="text-brand shrink-0 mt-0.5 select-none">•</span>
              <span>{parseInline(item)}</span>
            </li>
          ))}
        </ul>
      )
    } else if (line.trim() === "") {
      i++
    } else {
      nodes.push(
        <p key={i} className="text-ink-muted text-sm leading-relaxed my-2">
          {parseInline(line)}
        </p>
      )
      i++
    }
  }

  return <div className="space-y-0.5">{nodes}</div>
}

function RelatedCard({ r }: { r: RelatedResource }) {
  const formatColor = FORMAT_COLORS[r.format] ?? FORMAT_COLORS.default
  const diffColor = DIFF_COLORS[r.difficulty]
  const href = r.externalUrl ?? `/resources/${r.slug}`
  const isExternal = !!r.externalUrl

  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="group bg-surface border border-border-subtle rounded-xl p-4 hover:border-brand/40 transition-colors duration-200 flex flex-col gap-2.5 cursor-pointer"
    >
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${formatColor}`}>
          {FORMAT_LABELS[r.format] ?? r.format}
        </span>
        {r.difficulty !== "all_levels" && diffColor && (
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${diffColor}`}>
            {r.difficulty}
          </span>
        )}
        {r.isFeatured && <Star className="w-3 h-3 text-brand fill-brand ml-auto" />}
      </div>
      <div>
        <h3 className="text-ink font-semibold text-sm leading-snug group-hover:text-brand transition-colors duration-200 mb-1">
          {r.title}
        </h3>
        <p className="text-ink-muted text-xs leading-relaxed line-clamp-2">{r.description}</p>
      </div>
      {(r.author ?? r.source) && (
        <p className="text-ink-faint text-[10px]">{r.author ?? r.source}</p>
      )}
    </Link>
  )
}

export default function ResourceDetailClient({
  resource,
  related,
}: {
  resource: Resource
  related: RelatedResource[]
}) {
  const formatColor = FORMAT_COLORS[resource.format] ?? FORMAT_COLORS.default
  const diffColor = DIFF_COLORS[resource.difficulty]

  return (
    <div className="min-h-screen bg-bg">
      <AppNav />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Back */}
        <Link
          href="/resources"
          className="inline-flex items-center gap-1.5 text-ink-muted text-sm hover:text-ink transition-colors duration-200 mb-8 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Resources
        </Link>

        <article>
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${formatColor}`}>
                {FORMAT_LABELS[resource.format] ?? resource.format.replace("_", " ")}
              </span>
              {resource.difficulty !== "all_levels" && diffColor && (
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${diffColor}`}>
                  {resource.difficulty}
                </span>
              )}
              {resource.isFeatured && (
                <span className="flex items-center gap-1 text-[10px] font-medium text-brand">
                  <Star className="w-3 h-3 fill-brand" /> Featured
                </span>
              )}
            </div>
            <h1 className="text-ink text-2xl font-bold mb-2 text-balance">{resource.title}</h1>
            <p className="text-ink-muted text-sm leading-relaxed text-pretty">{resource.description}</p>
            {(resource.author ?? resource.source) && (
              <p className="text-ink-faint text-xs mt-2">By {resource.author ?? resource.source}</p>
            )}
          </header>

          {/* External link CTA */}
          {resource.externalUrl && (
            <div className="mb-7">
              <Link
                href={resource.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-[oklch(0.10_0.012_148)] text-sm font-semibold transition-colors duration-200 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                Open Resource
              </Link>
            </div>
          )}

          {/* Main content */}
          {resource.content ? (
            <div className="bg-surface border border-border-subtle rounded-xl px-6 py-7">
              <MarkdownContent content={resource.content} />
            </div>
          ) : !resource.externalUrl ? (
            <div className="bg-surface border border-border-subtle rounded-xl p-6 text-center">
              <BookOpen className="w-8 h-8 text-ink-faint mx-auto mb-2" />
              <p className="text-ink-muted text-sm">Content for this resource is coming soon.</p>
            </div>
          ) : null}

          {/* Tags */}
          {resource.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mt-6">
              <Tag className="w-3.5 h-3.5 text-ink-faint shrink-0" />
              {resource.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded-full border text-ink-faint bg-surface border-border-subtle"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </article>

        {/* Recommended Reading */}
        {related.length > 0 && (
          <section className="mt-12 pt-8 border-t border-border-subtle">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-ink-faint" />
              <h2 className="text-ink font-semibold text-sm">Continue Reading</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {related.map((r) => (
                <RelatedCard key={r.id} r={r} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
