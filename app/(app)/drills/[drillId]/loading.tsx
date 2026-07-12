export default function DrillLoading() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="border-b border-border-subtle bg-surface h-12" />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-surface border border-border-subtle rounded-xl p-5 h-64 animate-pulse" />
            <div className="bg-surface border border-border-subtle rounded-xl p-4 h-32 animate-pulse" />
          </div>
          <div className="bg-surface border border-border-subtle rounded-xl p-5 h-96 animate-pulse" />
        </div>
      </main>
    </div>
  )
}
