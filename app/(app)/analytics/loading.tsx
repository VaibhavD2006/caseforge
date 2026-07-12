export default function AnalyticsLoading() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="border-b border-border-subtle bg-surface h-14" />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-surface border border-border-subtle rounded-xl p-4 h-20 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-surface border border-border-subtle rounded-xl p-5 h-64 animate-pulse" />
          ))}
        </div>
        <div className="bg-surface border border-border-subtle rounded-xl p-5 h-48 animate-pulse" />
      </main>
    </div>
  )
}
