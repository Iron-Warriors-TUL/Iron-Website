# Iron Warriors — strona + CMS

Lokalne środowisko pełnoprawne: PostgreSQL w Dockerze, better-auth i panel CMS do edycji całej strony.

👉 **Kompletna instrukcja uruchomienia na nowym komputerze: [SETUP.md](SETUP.md)**

Krótka wersja (zakładając, że kontener `iw-postgres` już istnieje):

1. Upewnij się, że **Docker Desktop jest uruchomiony** (jeśli zniknął, błąd `ECONNREFUSED ...:55432` oznacza właśnie to).
2. Uruchom bazę: `corepack pnpm db:up` (port `55432`).
3. Zastosuj schemat i dane startowe: `corepack pnpm db:migrate && corepack pnpm db:seed`.
4. Start aplikacji: `corepack pnpm dev` → http://localhost:3000

### Uruchomienie całego środowiska w Dockerze

```bash
docker compose up --build
```

Aplikacja będzie dostępna pod http://localhost:3000, a PostgreSQL pod portem `55432`.
Docker Compose sam utworzy bazę, zastosuje migracje i dane startowe.

Zatrzymanie i usunięcie kontenerów:

```bash
docker compose down
```

Panel admina: http://localhost:3000/iw-panel-7k2q/login

Podczas weryfikacji utworzono konto:

- e-mail: `admin@ironwarriors.local`
- hasło: `IronWarriors2026!`

Rejestracja kolejnych kont jest zablokowana — panel jest tylko dla administratora.

## Panel CMS — edycja całej strony

Panel ma trzy główne sekcje edycji:

- **Treść strony** — 17 obszarów (strona główna, nagłówek, stopka, CTA, bolidy, rekrutacja, kontakt, zostań partnerem, ustawienia itd.). Wybierasz obszar → listę wpisów → formularz z etykietami i jednym przyciskiem „Zapisz treść". Każdy wpis można przywrócić do wartości domyślnych. W obszarach wielowpisowych dostępne jest „Dodaj i edytuj".
- **Nawigacja (navbar)** — etykiety, linki, rodzic, kolejność i przycisk CTA. Zmiany pojawiają się na wszystkich stronach.
- **Osoby** — biblioteka 121 kart (imię, zdjęcie, portret). Zmiana osoby aktualizuje ją we wszystkich składach, bez edytowania każdego roku osobno.

Elementy powtarzalne są zdefiniowane raz i tylko się do nich odwołują:

- `Osoby` → `Zespoły – sekcje` (64 sekcje, 221 odwołań) i `Zespoły – roczniki`.
- `Katalog partnerów` (42 karty) → `Partnerzy – grupy` i `Partnerzy – roczniki`.
- `Ustawienia strony` → link do oferty sponsorskiej (`sponsorPdf`) użyty na `Kontakt` i `Zostań partnerem`.

Domyślne treści żyją w `lib/content-registry.ts`. Baza nie musi być seedowana treścią — brak wpisu w `site_content` oznacza automatyczny fallback do wersji 1:1 z oryginalnej strony. Zmiana zapisuje tylko nadpisany wpis.

## Strony publiczne

Nawigacja i treści odwzorowują `https://ironwarriors.p.lodz.pl`:

- `/` — strona główna (hero, „O nas", „O nas w liczbach" / „Nasze Rekordy", „Nasze bolidy", CTA)
- `/bolidy`, `/bolidy/[slug]` — 4 bolidy z pełnymi specyfikacjami i galeriami
- `/zespol-2025-2026`, `/zespol-2024-2025`, `/zespol-2023-2024`, `/zespol-2022-2023` — składy zespołów
- `/projekty`, `/projekty-mnisw`, `/projekty-rada-kol`, `/projekty-fundacja-pl`, `/projekty-miasto-lodz` — 25 projektów w 4 kategoriach
- `/partnerzy-2026` … `/partnerzy-2023` — logo partnerów wg roku
- `/kontakt` — dane kontaktowe, zdjęcie i tekst oferty sponsorskiej edytowalne w „Treść strony → Kontakt"
- `/dolacz-do-nas`, `/zostan-partnerem`, `/blog`

Adresy z myślnikiem (`zespol-*`, `partnerzy-*`, `projekty-*`) są maskami z `next.config.mjs` prowadzącymi do tras `zespol/[year]`, `partnerzy/[year]` i `projekty/[slug]` — dzięki temu URL-e są identyczne jak w źródle.

Zdjęcia pobrane z oryginalnej strony znajdują się w `public/images/`. Źródło nie publikuje wpisów bloga, ale `/blog` i dwa przykładowe wpisy zostały zachowane, aby CMS był w pełni funkcjonalny.

## Uploady

Bez `BLOB_READ_WRITE_TOKEN` pliki wgrywane w panelu lądują w `public/uploads/` i są serwowane dynamicznie pod `/api/uploads/...`. W produkcji należy ustawić token Vercel Blob — wtedy pliki trafiają do prywatnego bucketu i są serwowane przez `/api/media`.

## Kontrola jakości

```bash
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm test
corepack pnpm build
```

`build` wymaga działającej bazy, ponieważ strony publiczne są prerenderowane i odświeżane przez `revalidatePath()` po zmianach w CMS.
