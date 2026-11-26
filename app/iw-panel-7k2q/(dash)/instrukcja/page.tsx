import Link from 'next/link'
import { ADMIN_PATH, requireCmsPage } from '@/lib/admin'

type Guide = { title: string; steps: string[]; href?: string; adminOnly?: boolean }

const guides: Guide[] = [
  {
    title: 'Zmiana tekstu lub zdjęcia',
    href: `${ADMIN_PATH}/tresc`,
    steps: ['Menu → Teksty i zdjęcia.', 'Wybierz część strony, np. „Strona główna”.', 'Zmień pole i kliknij Zapisz.'],
  },
  {
    title: 'Nowy wpis, bolid lub projekt',
    href: `${ADMIN_PATH}/blog/nowy`,
    steps: ['Menu → Blog, Bolidy albo Projekty.', 'Kliknij „Dodaj nowy”.', 'Uzupełnij pola i Zapisz.'],
  },
  {
    title: 'Dodanie partnera',
    href: `${ADMIN_PATH}/partnerzy`,
    steps: ['Menu → Partnerzy.', 'Wpisz nazwę i link, prześlij logo.', 'Wybierz rok i kliknij „Dodaj partnera”.'],
  },
  {
    title: 'Listy: galerie, skład, logotypy',
    steps: ['„Dodaj wiersz” dodaje element na końcu.', '↑ ↓ zmieniają kolejność, kosz usuwa.', 'Partnera lub osobę wybierasz z listy po nazwie.'],
  },
  {
    title: 'Obrazy',
    steps: ['Kliknij „Prześlij plik” (lub ikonę strzałki w wierszu).', 'JPG, PNG, WEBP lub AVIF do 4 MB.', 'Podgląd pokaże się od razu.'],
  },
  {
    title: 'Nowa podstrona',
    href: `${ADMIN_PATH}/tresc/pages`,
    steps: ['Teksty i zdjęcia → „Nowa podstrona”.', 'Wpisz adres, np. o-nas, i treść.', 'Dodaj ją do menu strony (administrator).'],
  },
  {
    title: 'Nowy sezon',
    href: `${ADMIN_PATH}/partnerzy#nowy-sezon`,
    adminOnly: true,
    steps: ['Partnerzy → „Nowy sezon”.', 'Sprawdź rok i kliknij „Utwórz sezon”.', 'Popraw skład i partnerów, którzy się zmienili.'],
  },
  {
    title: 'Menu strony',
    href: `${ADMIN_PATH}/nawigacja`,
    adminOnly: true,
    steps: ['Menu → Menu strony.', 'Dodaj pozycję lub podpozycję.', '↑ ↓ zmieniają kolejność.'],
  },
  {
    title: 'Moje konto i 2FA',
    href: `${ADMIN_PATH}/ustawienia`,
    steps: ['Kliknij zębatkę na dole menu.', 'Sprawdź swoje dane i rolę.', 'Bezpieczeństwo: włącz kod z aplikacji w telefonie.'],
  },
  {
    title: 'Konta i role zespołu',
    href: `${ADMIN_PATH}/konta`,
    adminOnly: true,
    steps: ['Menu → Administracja → Konta i role.', 'Kliknij „Dodaj konto” lub wybierz istniejące.', 'Ustaw rolę, zresetuj hasło lub 2FA.'],
  },
]

export default async function HelpPage() {
  const session = await requireCmsPage()
  const isAdmin = session.user.role === 'admin'
  const visible = guides.filter((guide) => isAdmin || !guide.adminOnly)

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Instrukcja obsługi</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Najczęstsze czynności w 3 krokach. Zmiany są widoczne na stronie od razu po zapisaniu.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((guide) => (
          <section key={guide.title} className="flex flex-col gap-3 rounded-md border border-border bg-card p-5">
            <h2 className="font-semibold">{guide.title}</h2>
            <ol className="flex flex-col gap-2 text-sm">
              {guide.steps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
            {guide.href && (
              <Link href={guide.href} className="mt-auto self-start text-sm font-semibold text-primary hover:underline">
                Przejdź →
              </Link>
            )}
          </section>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Coś poszło nie tak? Na stronie wpisu kliknij „Przywróć wartości domyślne”, aby cofnąć zmiany w danej sekcji.
      </p>
    </div>
  )
}
