export default function Loading() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-8 px-4 py-20 md:px-6" aria-busy="true">
      <div className="h-12 w-2/3 animate-pulse rounded-md bg-muted" />
      <div className="h-64 w-full animate-pulse rounded-md bg-muted" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
      <span className="sr-only">Wczytywanie…</span>
    </main>
  )
}
