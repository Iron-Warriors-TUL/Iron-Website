import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-primary">Błąd 404</p>
      <h1 className="text-balance text-4xl font-bold md:text-6xl">Nie znaleziono strony</h1>
      <p className="max-w-md text-muted-foreground">
        Strona, której szukasz, nie istnieje lub została przeniesiona.
      </p>
      <Link
        href="/"
        className="rounded-sm bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-opacity hover:opacity-90"
      >
        Wróć na stronę główną
      </Link>
    </main>
  )
}
