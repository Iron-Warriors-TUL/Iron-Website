# Uruchomienie projektu na nowym komputerze

Instrukcja kompletna — od pustego katalogu po działającą stronę i panel CMS.
Repo prywatne: https://github.com/1xnmx1/react-website-iw

---

## 1. Wymagania

| Narzędzie | Wersja | Uwagi |
| --- | --- | --- |
| Node.js | **≥ 20.9.0** (testowano na 24.x) | https://nodejs.org |
| Corepack | dostępne w Node.js | `corepack --version` |
| Docker Desktop | dowolna aktualna | https://www.docker.com/products/docker-desktop/ |
| Git | dowolna aktualna | https://git-scm.com |

Sprawdzenie:

```bash
node -v
corepack --version
docker --version
```

> **Windows:** `corepack enable` może zwrócić `EPERM`. Nie jest potrzebne — zawsze używaj `corepack pnpm ...` zamiast samego `pnpm`.

---

## 2. Sklonowanie repozytorium

Repo jest **prywatne** — potrzebne jest konto GitHub `1xnmx1` (lub inny account z dostępem) i logowanie przy klonowaniu.

```bash
git clone https://github.com/1xnmx1/react-website-iw.git
cd react-website-iw
```

Jeśli Git poprosi o hasło, użyj **Personal Access Token** z uprawnieniem `repo` zamiast hasła konta.

---

## 3. Zależności

```bash
corepack pnpm install
```

Corepack sam pobierze wersję pnpm z `package.json` (`packageManager: pnpm@12.3.4`).

---

## 4. Konfiguracja środowiska

Skopiuj przykład i uzupełnij sekret:

```bash
# macOS / Linux
cp .env.example .env.local

# Windows (PowerShell)
Copy-Item .env.example .env.local
```

Wygeneruj losowy sekret i wklej go do `.env.local` jako `BETTER_AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# albo: openssl rand -base64 32
```

Minimalna poprawna zawartość `.env.local`:

```env
DATABASE_URL=postgresql://iw_user:iw_dev_password@localhost:55432/ironwarriors
BETTER_AUTH_SECRET=<wygenerowany-ciąg-60-znaków>
BETTER_AUTH_URL=http://localhost:3000
```

`BLOB_READ_WRITE_TOKEN` pozostaw pusty — bez niego uploady z panelu zapisują się lokalnie w `public/uploads/` i projekt działa w pełni.

> `.env.local` jest w `.gitignore` i **nie może trafić do repozytorium**. W repo znajduje się tylko `.env.example`.

---

## 5. PostgreSQL w Dockerze

Uruchom Docker Desktop i odczekaj, aż daemon będzie gotowy.

**Pierwsze uruchomienie na nowym komputerze** (kontener jeszcze nie istnieje):

```bash
docker run -d --name iw-postgres \
  -e POSTGRES_USER=iw_user \
  -e POSTGRES_PASSWORD=iw_dev_password \
  -e POSTGRES_DB=ironwarriors \
  -p 55432:5432 \
  postgres:17-alpine
```

W PowerShell użyj jednej linii:

```powershell
docker run -d --name iw-postgres -e POSTGRES_USER=iw_user -e POSTGRES_PASSWORD=iw_dev_password -e POSTGRES_DB=ironwarriors -p 55432:5432 postgres:17-alpine
```

**Kolejne uruchomienia** (kontener już jest):

```bash
corepack pnpm db:up     # = docker start iw-postgres
```

Sprawdzenie:

```bash
docker ps --filter name=iw-postgres
```

Powinno pokazać `Up ... 0.0.0.0:55432->5432/tcp`.

---

## 6. Schemat i dane startowe

```bash
corepack pnpm db:migrate
corepack pnpm db:seed
```

- `db:migrate` stosuje pliki z `db/` (`schema.sql`, `002_project_details.sql`, `003_site_content.sql`). Jest idempotentny.
- `db:seed` wstawia 24 elementy nawigacji, 4 bolidy i 25 projektów.
- **Treść stron nie wymaga seedowania.** Domysły żyją w `lib/content-registry.ts`; pusta tabela `site_content` oznacza treść 1:1 z oryginalnej strony.

---

## 7. Start aplikacji

```bash
corepack pnpm dev
```

Otwórz http://localhost:3000

Panel CMS: http://localhost:3000/iw-panel-7k2q/login

| E-mail | Hasło |
| --- | --- |
Konto startowe jest tworzone przez `db:seed` tylko wtedy, gdy ustawisz:

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<losowe-haslo-o-dlugosci-co-najmniej-12-znakow>
ADMIN_NAME=Administrator
```

Bez `ADMIN_EMAIL` i `ADMIN_PASSWORD` seed nie utworzy żadnego konta.
Rejestracja nowych kont w przeglądarce jest zablokowana, więc kolejne konta dodaj przez CLI:

```bash
# lokalnie (czyta .env.local / .env)
node scripts/create-account.mjs --email jan@example.com --name "Jan Kowalski" --role editor --password-stdin

# w kontenerze (czyta .env obok docker-compose.yml)
docker compose exec -T app node scripts/create-account.mjs \
  --email jan@example.com --name "Jan Kowalski" --role editor --password-stdin
```

`--from-env` tworzy/promuje administratora z `ADMIN_*` i jest idempotentne. Po pierwszym
uruchomieniu można usunąć `ADMIN_PASSWORD` z `.env`; przy kolejnych startach bootstrap
zostanie pominięty, a konto pozostanie w bazie.

Wersja produkcyjna (wymaga działającej bazy przy budowie):

```bash
corepack pnpm build
corepack pnpm start
```

---

## 8. Co można edytować w panelu

- **Treść strony** — 17 obszarów: strona główna, nagłówek, stopka, CTA, bolidy (lista + detale), rekrutacja + działy, kontakt, zostań partnerem, zespoły (roczniki + sekcje), partnerzy (roczniki + grupy), osoby, katalog partnerów, ustawienia.
- **Nawigacja (navbar)** — etykiety, linki, zagnieżdżenie, kolejność, przycisk CTA.
- **Osoby** — 121 kart; zmiana aktualizuje wszystkie składy.
- **Blog / Bolidy / Projekty** — wpisy i dane dodatkowe.

Flow: wybierasz obszar → listę wpisów → formularz z etykietami → jeden przycisk „Zapisz treść". Przywrócenie domyślnej wartości usuwa nadpisanie z bazy.

Elementy powtarzalne definiuje się raz:
- `Osoby` → `Zespoły – sekcje` (64 sekcje, 221 odwołań),
- `Katalog partnerów` (42 karty) → `Partnerzy – grupy`,
- `Ustawienia strony` → `sponsorPdf` użyty na `Kontakt` i `Zostań partnerem`.

---

## 9. Backup i przywracanie bazy

```bash
# backup
docker exec iw-postgres pg_dump -U iw_user ironwarriors > backup.sql

# restore (PowerShell)
Get-Content backup.sql | docker exec -i iw-postgres psql -U iw_user -d ironwarriors
```

Plik `backup.sql` nie jest w repozytorium — trzymaj go poza nim.

---

## 10. Kontrola jakości

```bash
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm test      # 13 testów
corepack pnpm build     # 23 strony, WYMAGA bazy
```

---

## 11. Rozwiązywanie problemów

| Objaw | Przyczyna | Rozwiązanie |
| --- | --- | --- |
| `ECONNREFUSED ...:55432`, strony 500 | Docker Desktop nie działa | Uruchom Docker Desktop, potem `corepack pnpm db:up` |
| `docker: command not found` / npipe error | Docker niedostępny | Uruchom Docker Desktop i odczekaj ~10–30 s |
| `corepack enable` → `EPERM` | Brak uprawnień do katalogu globalnego | Używaj `corepack pnpm ...` (bez `enable`) |
| `Failed to get session`, `FAILED_TO_GET_SESSION` | Brak lub zły `BETTER_AUTH_SECRET` | Ustaw długi losowy sekret w `.env.local` i zrestartuj serwer |
| `Ustaw DATABASE_URL w .env.local` | Brak pliku env | Skopiuj `.env.example` → `.env.local` |
| `password authentication failed for user "iw_user"` | Istniejący wolumen bazy ma inne hasło niż `POSTGRES_PASSWORD` w `.env` (hasło z env działa tylko przy pierwszej inicjalizacji) | Zaloguj się do bazy lokalnie i ustaw hasło z `.env` przez `\password iw_user`, albo usuń wolumen bazy (uwaga: kasuje dane) i uruchom ponownie |
| Zmiany w CMS nie widać na stronie | Cache strony | Zapis formularza woła `revalidatePath`; odśwież stronę |

---

## 12. Struktura (najważniejsze)

```
app/(site)/                  strony publiczne (główna, bolidy, zespół, partnerzy, …)
app/iw-panel-7k2q/(dash)/    panel CMS (tresc/, nawigacja, blog, bolidy, projekty)
components/site/             navbar, stopka, galerie, film YouTube, obrazy
components/admin/            formularze panelu
lib/content-registry.ts      źródło prawdy: 17 obszarów, pola formularzy, domyślne treści
lib/content.ts               odczyt site_content, mapy osób i partnerów
lib/page-content.ts          domyślne treści przeniesione z komponentów
lib/db/schema.ts             schemat Drizzle (siteContent, navItems, posts, projects, vehicles)
db/*.sql                     migracje SQL
public/images/               zdjęcia z oryginalnej strony (w repo)
public/uploads/              lokalne uploady CMS (poza repo, jest .gitkeep)
scripts/migrate.mjs          aplikator migracji
scripts/seed.mjs             dane startowe i konto admina
```

---

## 13. Uwagi

- Zdjęcia i film w tle są odtworzone z `https://ironwarriors.p.lodz.pl` i leżą w `public/images/`; zmiany obrazów w CMS wskazują na ścieżki `/images/...` lub `/uploads/...`.
- Film główny: `lbf5afd5ik0`; tła filmów: `zlJS0_bf7zo`, `wHd4UsA3T2k`. Wszystkie iframe'y mają `mute=1`.
- Formularz rekrutacyjny prowadzi do Google Forms (link w `Ustawienia strony` / `Dołącz do nas`).
- Domena docelowa: https://ironwarriors.p.lodz.pl
