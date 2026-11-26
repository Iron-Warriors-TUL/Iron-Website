# Podgląd strony na Render (darmowo)

Plik `render.yaml` opisuje całe środowisko: darmowy Web Service (Node 24) i darmową bazę PostgreSQL 17, oba we Frankfurcie.

## Wdrożenie (ok. 10 minut, w tym ok. 5 minut budowania)

1. Załóż konto na https://dashboard.render.com/register (najprościej „Sign in with GitHub”). Karta płatnicza nie jest potrzebna.
2. Wejdź na https://dashboard.render.com/blueprint/new i połącz konto GitHub. Przy pytaniu o dostęp wybierz repozytorium `react-website-iw`.
3. Wybierz repo, ustaw **Branch** na gałąź z tym plikiem i nadaj nazwę Blueprintu (np. `iron-warriors`).
4. Render poprosi o dwie wartości:
   - `ADMIN_EMAIL`: e-mail konta administratora,
   - `ADMIN_PASSWORD`: własne, losowe hasło (min. 12 znaków; wartości z przykładów są odrzucane).
5. Kliknij **Deploy Blueprint**. Gdy usługa `iron-warriors` ma status **Live**, adres strony jest u góry jej strony (np. `https://iron-warriors.onrender.com`).
6. Panel: `<adres>/iw-panel-7k2q`. Konto dla klienta (rola edytor) najlepiej założyć w panelu, w zakładce kont.

`BETTER_AUTH_SECRET` generuje Render, a publiczny adres (`RENDER_EXTERNAL_URL`) aplikacja odczytuje sama, więc nie trzeba nic więcej ustawiać.

## Ograniczenia darmowego planu

- Po 15 minutach bez ruchu usługa usypia; pierwsze wejście potem trwa ok. minuty.
- Darmowa baza wygasa po 30 dniach (wystarczy na podgląd).
- Dysk usługi jest ulotny: zdjęcia wgrane w panelu znikają przy restarcie, uśpieniu i nowym wdrożeniu. Teksty i inne zmiany w bazie zostają.
- Strona ma `SITE_NOINDEX=true`, więc robots.txt blokuje wyszukiwarki.

## Aktualizacja podglądu

Automatyczne wdrożenia są wyłączone. Po nowych commitach: usługa `iron-warriors` → **Manual Deploy** → **Deploy latest commit**.
Seed uruchamia się tylko przy pustej bazie (`scripts/seed-if-empty.mjs`), więc kolejne wdrożenia nie kasują zmian z panelu.
