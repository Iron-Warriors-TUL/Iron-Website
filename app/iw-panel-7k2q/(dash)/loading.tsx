export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <div className="h-9 w-48 animate-pulse rounded-md bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
      <span className="sr-only">Wczytywanie panelu…</span>
    </div>
  )
}
