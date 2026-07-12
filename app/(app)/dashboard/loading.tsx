export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Nav skeleton */}
      <div className="border-b border-border-subtle bg-surface h-14" />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="h-7 w-48 bg-surface-raised rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-64 bg-surface-raised rounded animate-pulse" />
        </div>
        {/* Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-surface border border-border-subtle rounded-xl p-5 h-32 animate-pulse" />
          ))}
        </div>
        {/* Row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-surface border border-border-subtle rounded-xl p-5 h-56 animate-pulse" />
          <div className="bg-surface border border-border-subtle rounded-xl p-5 h-56 animate-pulse" />
        </div>
        {/* Row 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-surface border border-border-subtle rounded-xl p-5 h-44 animate-pulse" />
          ))}
        </div>
        {/* Row 4 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-surface border border-border-subtle rounded-xl p-5 h-36 animate-pulse" />
          <div className="bg-surface border border-border-subtle rounded-xl p-5 h-36 animate-pulse" />
        </div>
      </main>
    </div>
  )
}
