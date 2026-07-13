import Link from "next/link"

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-10">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
              <span className="text-[oklch(0.10_0.012_148)] text-xs font-bold">CF</span>
            </div>
            <span className="text-ink font-semibold tracking-tight">CaseForge AI</span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  )
}
