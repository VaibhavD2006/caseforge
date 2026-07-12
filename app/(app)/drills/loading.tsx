export default function DrillsLoading() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="border-b border-border-subtle bg-surface h-14" />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <div className="h-6 w-40 bg-surface-raised rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-32 bg-surface-raised rounded animate-pulse" />
        </div>
        <div className="flex gap-3 mb-6">
          <div className="h-8 w-44 bg-surface rounded-lg border border-border-subtle animate-pulse" />
          <div className="h-8 w-28 bg-surface rounded-lg border border-border-subtle animate-pulse" />
          <div className="h-8 w-80 bg-surface rounded-lg border border-border-subtle animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="bg-surface border border-border-subtle rounded-xl p-4 h-28 animate-pulse" />
          ))}
        </div>
      </main>
    </div>
  )
}
