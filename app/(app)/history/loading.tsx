export default function HistoryLoading() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="border-b border-border-subtle bg-surface h-14" />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <div className="h-6 w-44 bg-surface-raised rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-24 bg-surface-raised rounded animate-pulse" />
        </div>
        <div className="flex gap-3 mb-5">
          <div className="h-8 w-48 bg-surface rounded-lg border border-border-subtle animate-pulse" />
          <div className="h-8 w-24 bg-surface rounded-lg border border-border-subtle animate-pulse" />
          <div className="h-8 w-24 bg-surface rounded-lg border border-border-subtle animate-pulse" />
        </div>
        <div className="bg-surface border border-border-subtle rounded-xl overflow-hidden">
          <div className="border-b border-border-subtle h-10 animate-pulse bg-surface-raised" />
          {[...Array(8)].map((_, i) => (
            <div key={i} className="border-b border-border-subtle last:border-0 h-12 animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />
          ))}
        </div>
      </main>
    </div>
  )
}
