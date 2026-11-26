# Utrzymanie strony na serwerze uczelnianym (Docker)

Docelowo strona działa jako `docker compose` (aplikacja + PostgreSQL) na serwerze uczelni.
Poniżej minimum, które warto ustawić raz i potem tylko pilnować.

## 1. Pierwsze uruchomienie

1. Na serwerze: `git clone` repozytorium do np. `/srv/iron-warriors`.
2. Utwórz plik `.env` obok `docker-compose.yml` (nie commituj go):

   ```env
   POSTGRES_PASSWORD=<openssl rand -base64 24>
   BETTER_AUTH_SECRET=<openssl rand -base64 48>
   BETTER_AUTH_URL=https://ironwarriors.p.lodz.pl   # dokładny publiczny adres strony
   ADMIN_EMAIL=...
   ADMIN_PASSWORD=<min. 12 znaków, tylko na pierwsze uruchomienie>
   ```

   Aplikacja z adresem `https://` **nie wystartuje** z domyślnym lub krótszym niż 32 znaki sekretem.
   Docker czyta wyłącznie `.env` obok `docker-compose.yml`; `.env.local` służy tylko do pracy lokalnej.
3. `docker compose up -d --build`. Migracje i seed (tylko pustej bazy) uruchamiają się same,
   a potem idempotentny bootstrap admina z `ADMIN_*`.
4. Sprawdź, czy admin powstał: `docker compose logs app | grep accounts`. Po pierwszym logowaniu
   włącz 2FA i usuń `ADMIN_PASSWORD` (a najlepiej całe `ADMIN_*`) z `.env` — konto zostaje w bazie,
   a kolejne starty pominą bootstrap.

Kolejne konta dodawaj w panelu (**Administracja → Konta i role**). Opis ról, resetu haseł
i 2FA znajduje się w [KONTA-I-ROLE.md](KONTA-I-ROLE.md). Rejestracja w przeglądarce jest
wyłączona, a CLI służy do bootstrapu, automatyzacji i odzyskiwania dostępu:

```bash
docker compose exec -T app node scripts/create-account.mjs \
  --email jan@example.com --name "Jan Kowalski" --role editor --password-stdin
```

Reset hasła istniejącego konta: dodaj `--update-password`. Podgląd wszystkich opcji:
`docker compose exec app node scripts/create-account.mjs --help`.

> Nie używaj `docker compose down -v` — usuwa wolumeny z bazą i zdjęciami. Zwykłe
> `docker compose down` oraz przebudowa obrazu zachowują treść dodaną w panelu.

## 2. HTTPS i reverse proxy

Aplikacja słucha tylko na `127.0.0.1:3000`. Z internetu ruch musi iść przez proxy z HTTPS.
Jeśli uczelnia nie daje własnego proxy, najprościej Caddy (sam pobiera certyfikat Let's Encrypt):

```caddyfile
# /etc/caddy/Caddyfile
ironwarriors.p.lodz.pl {
    encode zstd gzip
    reverse_proxy 127.0.0.1:3000
}
```

Ważne dla limitu logowania: proxy musi **nadpisywać** `X-Forwarded-For` adresem klienta.
Caddy robi to domyślnie. W nginx ustaw `proxy_set_header X-Forwarded-For $remote_addr;`
albo zostaw `$proxy_add_x_forwarded_for` i dodaj do `.env` `TRUSTED_PROXIES=<adres proxy>`.
Port 3000 nie może być otwarty na zewnątrz (firewall/`ufw`), bo wtedy nagłówek da się podrobić.

Jeśli proxy uczelni jest na innej maszynie, zmień w `docker-compose.yml` `127.0.0.1:3000` na adres
wewnętrzny i ustaw `TRUSTED_PROXIES` na adres tego proxy.

## 3. Aktualizacja strony (nowa wersja kodu)

```bash
cd /srv/iron-warriors
./backup.sh                     # zawsze kopia przed aktualizacją (sekcja 4)
git pull --ff-only
docker compose up -d --build    # przebudowa obrazu, migracje przy starcie
docker compose logs -f app      # sprawdź, czy wstało bez błędów
```

Wycofanie: `git checkout <poprzedni-commit> && docker compose up -d --build`, a gdy migracja
zepsuła dane, odtworzenie bazy z kopii (sekcja 4).

Wygodniej później: CI na GitHubie buduje obraz i wypycha go do GHCR, a serwer robi tylko
`docker compose pull && docker compose up -d`. Warto, gdy aktualizacje będą częste.

## 4. Kopie zapasowe

Do kopiowania są dwie rzeczy: baza PostgreSQL i wolumen `iw-app-uploads` (zdjęcia wgrane w CMS).

`/srv/iron-warriors/backup.sh`:

```bash
#!/bin/sh
set -eu
cd /srv/iron-warriors
DIR=/srv/backups/iron-warriors
STAMP=$(date +%F_%H%M)
mkdir -p "$DIR"
docker compose exec -T postgres pg_dump -U iw_user -Fc ironwarriors > "$DIR/db_$STAMP.dump"
docker run --rm -v iron-warriors_iw-app-uploads:/data:ro -v "$DIR":/out alpine \
  tar czf "/out/uploads_$STAMP.tar.gz" -C /data .
# Rotacja: 14 dni
find "$DIR" -type f -mtime +14 -delete
```

Cron (codziennie 3:30): `30 3 * * * /srv/iron-warriors/backup.sh >> /var/log/iw-backup.log 2>&1`

- Nazwę wolumenu sprawdź przez `docker volume ls` (prefiks to nazwa katalogu projektu).
- Kopie trzymaj też **poza tym serwerem** (np. `rclone` na dysk uczelniany / OneDrive), inaczej awaria dysku zabierze wszystko.
- Raz na semestr przetestuj odtworzenie:
  `docker compose exec -T postgres pg_restore -U iw_user -d ironwarriors --clean --if-exists < db_….dump`

## 5. Aktualizacje zależności i obrazów

- **Dependabot** (darmowy, wbudowany w GitHub): plik `.github/dependabot.yml` z ekosystemami
  `npm`, `docker` i `github-actions`, raz w tygodniu, grupowanie drobnych aktualizacji.
  CI sprawdza każdy PR (typecheck, lint, testy, build), więc wystarczy przejrzeć i zmergować.
- Poprawki bezpieczeństwa: `pnpm audit --prod` raz w miesiącu albo po alercie z GitHuba
  (zakładka *Security → Dependabot alerts*, włącz w ustawieniach repo).
- Obrazy bazowe: `node:24-alpine` i `postgres:17-alpine` dostają łatki przy każdym
  `docker compose build --pull` (dodaj `--pull` do aktualizacji raz w miesiącu).
  Zmiana wersji głównej Postgresa (17 → 18) wymaga dumpa i odtworzenia, nie samej podmiany obrazu.
- System serwera aktualizuje dział IT uczelni; upewnij się, kto za to odpowiada.

## 6. Logi i monitoring

- Logi: `docker compose logs --since 1h app`. Ogranicz rozmiar, dodając do usług w compose:
  `logging: { driver: json-file, options: { max-size: "10m", max-file: "5" } }`.
- Dostępność: darmowy monitor HTTP (UptimeRobot, Better Stack lub Uptime Kuma na serwerze)
  sprawdzający stronę główną co 5 minut, z powiadomieniem e-mail.
- Miejsce na dysku: kopie i obrazy Dockera rosną. Raz w miesiącu `docker system prune` i `df -h`.
- Konta CMS: przy odejściu osoby z zespołu usuń jej konto w *Ustawienia → Konta*.
- Wszyscy administratorzy powinni mieć włączone 2FA (widać to na liście kont).
