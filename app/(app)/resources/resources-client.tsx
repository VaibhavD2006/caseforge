'use client'

import { useState, useMemo } from "react"
import Link from "next/link"
import { Search, Star, ExternalLink, BookOpen, Calendar, Users, Eye, Building2, LayoutGrid, BookMarked, FileText, Play } from "lucide-react"
import { AppNav } from "@/components/app-nav"

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

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  sortOrder: number
}

type Practice = {
  id: string
  title: string
  description: string
  type: string
  bookingUrl: string | null
  hostName: string | null
  durationMinutes: number | null
  sortOrder: number
}

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
  pdf: "text-[oklch(0.65_0.15_250)] bg-[oklch(0.13_0.05_250)] border-[oklch(0.28_0.08_250)]",
  default: "text-ink-faint bg-surface border-border-subtle",
}

const DIFF_COLORS: Record<string, string> = {
  beginner: "text-[oklch(0.62_0.15_158)] bg-[oklch(0.14_0.05_158)] border-[oklch(0.28_0.08_158)]",
  intermediate: "text-[oklch(0.72_0.15_78)] bg-[oklch(0.16_0.05_78)] border-[oklch(0.30_0.08_78)]",
  advanced: "text-[oklch(0.60_0.18_22)] bg-[oklch(0.16_0.05_22)] border-[oklch(0.28_0.08_22)]",
  all_levels: "text-ink-faint bg-surface border-border-subtle",
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "consulting-basics": <Building2 className="w-3.5 h-3.5" />,
  "frameworks": <LayoutGrid className="w-3.5 h-3.5" />,
  "case-books": <BookMarked className="w-3.5 h-3.5" />,
  "guides": <FileText className="w-3.5 h-3.5" />,
  "books": <BookOpen className="w-3.5 h-3.5" />,
  "videos": <Play className="w-3.5 h-3.5" />,
}

const FORMAT_FILTERS = [
  { value: "all", label: "All" },
  { value: "guide", label: "Guides" },
  { value: "case_book", label: "Case Books" },
  { value: "definition", label: "Definitions" },
  { value: "book", label: "Books" },
  { value: "video", label: "Videos" },
]

const DIFF_FILTERS = [
  { value: "all", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
]

function ResourceCard({ r }: { r: Resource }) {
  const formatColor = FORMAT_COLORS[r.format] ?? FORMAT_COLORS.default
  const diffColor = DIFF_COLORS[r.difficulty] ?? DIFF_COLORS.all_levels
  const href = r.externalUrl ?? `/resources/${r.slug}`
  const isExternal = !!r.externalUrl

  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="bg-surface border border-border-subtle rounded-xl p-4 hover:border-brand/40 transition-colors flex flex-col gap-3 group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${formatColor}`}>
            {FORMAT_LABELS[r.format] ?? r.format}
          </span>
          {r.difficulty !== "all_levels" && (
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${diffColor}`}>
              {r.difficulty}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {r.isFeatured && <Star className="w-3.5 h-3.5 text-brand fill-brand" />}
          {isExternal && <ExternalLink className="w-3.5 h-3.5 text-ink-faint group-hover:text-brand transition-colors" />}
        </div>
      </div>
      <div>
        <h3 className="text-ink font-semibold text-sm leading-snug mb-1 group-hover:text-brand transition-colors">{r.title}</h3>
        <p className="text-ink-muted text-xs leading-relaxed line-clamp-2">{r.description}</p>
      </div>
      {(r.author ?? r.source) && (
        <p className="text-ink-faint text-[10px]">{r.author ?? r.source}</p>
      )}
      {r.viewCount > 0 && (
        <div className="flex items-center gap-1 text-ink-faint text-[10px]">
          <Eye className="w-3 h-3" />
          <span>{r.viewCount}</span>
        </div>
      )}
    </Link>
  )
}

export default function ResourcesClient({
  categories,
  featured,
  allResources,
  practice,
}: {
  categories: Category[]
  featured: Resource[]
  allResources: Resource[]
  practice: Practice[]
}) {
  const [search, setSearch] = useState("")
  const [format, setFormat] = useState("all")
  const [difficulty, setDifficulty] = useState("all")

  const filtered = useMemo(() => {
    return allResources.filter((r) => {
      if (format !== "all" && r.format !== format) return false
      if (difficulty !== "all" && r.difficulty !== difficulty) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [allResources, format, difficulty, search])

  const isFiltering = search || format !== "all" || difficulty !== "all"

  const byCategory = useMemo(() => {
    const map = new Map<string, Resource[]>()
    for (const r of allResources) {
      const key = r.categoryId ?? "__none__"
      const bucket = map.get(key) ?? []
      bucket.push(r)
      map.set(key, bucket)
    }
    return map
  }, [allResources])

  return (
    <div className="min-h-screen bg-bg">
      <AppNav />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <div>
        <h1 className="text-ink text-2xl font-bold mb-1">Resource Library</h1>
        <p className="text-ink-muted text-sm">Everything you need for consulting prep, organized in one place.</p>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources… e.g. 'frameworks', 'market sizing', 'MBB'"
            className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border-subtle rounded-xl text-ink text-sm placeholder:text-ink-faint focus:outline-none focus:border-brand/60 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {FORMAT_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFormat(f.value)}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                format === f.value
                  ? "bg-brand text-[oklch(0.10_0.012_148)] border-brand"
                  : "bg-surface text-ink-muted border-border-subtle hover:text-ink"
              }`}
            >
              {f.label}
            </button>
          ))}
          <div className="w-px h-4 bg-border-subtle mx-1" />
          {DIFF_FILTERS.map((d) => (
            <button
              key={d.value}
              onClick={() => setDifficulty(d.value)}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                difficulty === d.value
                  ? "bg-brand text-[oklch(0.10_0.012_148)] border-brand"
                  : "bg-surface text-ink-muted border-border-subtle hover:text-ink"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Featured section — only when not actively filtering */}
      {!isFiltering && featured.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-brand fill-brand" />
            <h2 className="text-ink font-semibold text-sm">Featured Resources</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {featured.map((r) => <ResourceCard key={r.id} r={r} />)}
          </div>
        </div>
      )}

      {/* Category folders (default) / flat results (when filtering) */}
      {isFiltering ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-ink font-semibold text-sm">Results ({filtered.length})</h2>
            <button
              onClick={() => { setSearch(""); setFormat("all"); setDifficulty("all") }}
              className="text-ink-faint text-xs hover:text-ink transition-colors cursor-pointer"
            >
              Clear filters
            </button>
          </div>
          {filtered.length === 0 ? (
            <div className="bg-surface border border-border-subtle rounded-xl p-8 text-center">
              <BookOpen className="w-8 h-8 text-ink-faint mx-auto mb-2" />
              <p className="text-ink-muted text-sm">No resources match your search.</p>
              <button
                onClick={() => { setSearch(""); setFormat("all"); setDifficulty("all") }}
                className="mt-2 text-brand text-xs hover:underline cursor-pointer"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((r) => <ResourceCard key={r.id} r={r} />)}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {categories
            .filter((c) => byCategory.has(c.id))
            .map((c) => {
              const items = byCategory.get(c.id) ?? []
              return (
                <div key={c.id}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-brand">{CATEGORY_ICONS[c.slug]}</span>
                    <h2 className="text-ink font-semibold text-sm">{c.name}</h2>
                    <span className="text-ink-faint text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-surface border border-border-subtle">
                      {items.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {items.map((r) => <ResourceCard key={r.id} r={r} />)}
                  </div>
                </div>
              )
            })}
        </div>
      )}

      {/* Practice & Expert Sessions */}
      {practice.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-brand" />
            <h2 className="text-ink font-semibold text-sm">Practice & Expert Sessions</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {practice.map((p) => (
              <div key={p.id} className="bg-surface border border-border-subtle rounded-xl p-4 flex flex-col gap-3">
                <div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    p.type === "expert" ? "text-brand bg-[oklch(0.14_0.05_158)] border-[oklch(0.28_0.08_158)]" : "text-ink-faint bg-surface border-border-subtle"
                  }`}>
                    {p.type === "expert" ? "Expert" : p.type === "shadow" ? "Shadow" : p.type === "peer" ? "Peer" : p.type}
                  </span>
                </div>
                <div>
                  <h3 className="text-ink font-semibold text-sm mb-1">{p.title}</h3>
                  <p className="text-ink-muted text-xs leading-relaxed">{p.description}</p>
                </div>
                {p.durationMinutes && (
                  <p className="text-ink-faint text-[10px]">{p.durationMinutes} min session</p>
                )}
                {p.bookingUrl ? (
                  <Link
                    href={p.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 justify-center px-3 py-1.5 rounded-lg bg-brand hover:bg-brand-hover text-[oklch(0.10_0.012_148)] text-xs font-semibold transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Book Session
                  </Link>
                ) : (
                  <button
                    disabled
                    className="flex items-center gap-1.5 justify-center px-3 py-1.5 rounded-lg bg-surface border border-border-subtle text-ink-faint text-xs font-medium cursor-not-allowed"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Coming Soon
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
  )
}
