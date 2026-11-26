# Konta i role w panelu

Dokument opisuje zarządzanie dostępem do panelu CMS. Sekcja jest widoczna wyłącznie dla
administratorów: **Administracja → Konta i role** (`/iw-panel-7k2q/konta`).

Edytor, który spróbuje otworzyć ten adres, zostanie odesłany na pulpit z komunikatem
o braku uprawnień. Uprawnienia są sprawdzane także w akcjach serwerowych, więc samo
ukrycie menu nie wystarcza do obejścia zabezpieczeń.

## Role

| Uprawnienie | Administrator | Edytor |
| --- | :---: | :---: |
| Teksty, zdjęcia, osoby, partnerzy | tak | tak |
| Blog, bolidy, projekty, obrazy | tak | tak |
| Menu strony (nawigacja) | tak | nie |
| Ustawienia strony | tak | nie |
| Konta, role i reset 2FA innych osób | tak | nie |

- **Administrator** ma pełny dostęp do panelu, w tym do kont, nawigacji i ustawień witryny.
- **Edytor** zmienia treść, wpisy i obrazy, ale nie zarządza kontami ani strukturą strony.

## Dodawanie konta

1. Otwórz **Administracja → Konta i role**.
2. Kliknij **Dodaj konto**.
3. Podaj imię i nazwisko, e-mail oraz hasło (minimum 12 znaków).
4. Wybierz rolę: **Edytor** lub **Administrator**.
5. Kliknij **Dodaj konto**.

E-mail musi być unikalny. Nowe konto od razu może logować się pod adresem
`/iw-panel-7k2q/login`; rejestracja w przeglądarce jest wyłączona.

## Edycja konta

Kliknij konto na liście, aby:

- zmienić imię i nazwisko lub e-mail,
- zmienić rolę,
- zresetować hasło (pozostaw pole puste, aby go nie zmieniać),
- usunąć konto.

Lista pokazuje rolę oraz stan logowania dwuetapowego (2FA) każdego konta. Konto, na którym
jesteś zalogowany, jest oznaczone dopiskiem **(Ty)** i nie można go usunąć z tego miejsca.

## Hasła

- Minimalna długość hasła to **12 znaków**.
- Administrator może ustawić nowe hasło dowolnemu kontu bez znajomości starego.
- Własne hasło zmienia się przez reset wykonany przez administratora — panel nie ma
  osobnego formularza „zmień hasło” dla zalogowanego użytkownika.

## 2FA

- Każdy użytkownik włącza i wyłącza własne 2FA w **Ustawieniach → Bezpieczeństwo**.
  Do wyłączenia potrzebne jest hasło oraz kod z aplikacji lub kod zapasowy.
- Administrator może **zresetować 2FA** innej osobie w edycji jej konta. To przydatne, gdy
  użytkownik zgubił telefon i nie ma kodów zapasowych. Reset usuwa klucz 2FA i wyłącza
  tę metodę dla danego konta.
- Własnego 2FA nie resetuje się przyciskiem administratora — służy do tego sekcja
  **Bezpieczeństwo** w ustawieniach.

## Zabezpieczenia

- Nie można usunąć konta, na którym jesteś aktualnie zalogowany.
- System nie pozwoli usunąć ani zdegradować ostatniego administratora — zawsze musi
  pozostać co najmniej jedno konto z rolą **Administrator**.
- Wszystkie operacje na kontach wymagają sesji administratora (`requireAdmin`).
- Usunięcie konta kasuje je trwale wraz z powiązanymi danymi logowania.

## Alternatywa: wiersz poleceń

Panel jest podstawowym sposobem zarządzania kontami. CLI nadal przydaje się do
pierwszego bootstrapu w Dockerze, automatyzacji i odzyskiwania dostępu, gdy nikt nie
może się zalogować:

```bash
# nowe konto
docker compose exec -T app node scripts/create-account.mjs \
  --email jan@example.com --name "Jan Kowalski" --role editor --password-stdin

# zmiana hasła istniejącego konta
docker compose exec -T app node scripts/create-account.mjs \
  --email jan@example.com --update-password --password-stdin

# wszystkie opcje
docker compose exec app node scripts/create-account.mjs --help
```

Konto startowe administratora powstaje z `ADMIN_EMAIL` i `ADMIN_PASSWORD` podczas
pierwszego uruchomienia (szczegóły w [SETUP.md](SETUP.md) i [MAINTENANCE.md](MAINTENANCE.md)).

## Powiązane pliki

- `app/iw-panel-7k2q/(dash)/konta/page.tsx` — lista kont (tylko administrator).
- `app/iw-panel-7k2q/(dash)/konta/[id]/page.tsx` — formularz dodawania i edycji konta.
- `app/iw-panel-7k2q/actions.ts` — akcje `saveAccount`, `deleteAccount`, `resetAccountSecurity`.
- `lib/roles.ts` — definicje ról i uprawnień.
- `lib/admin.ts` — `requireAdminPage` i `requireAdmin`.
