# Asset extraction report

Source: https://ironwarriors.p.lodz.pl

## Summary

- Pages fetched: 11 (/, /bolidy/, /bolidy/eco-arrow-3/, 4 team seasons, /partnerzy-2026/, /projekty/, /kontakt/, /dolacz-do-nas/)
- Unique wp-content/uploads URLs found: **596** (579 images, 17 non-image CSS/JS/PDF skipped)
- Images downloaded: **144**
- Images already present (skipped): **22**
- Download failures: **0**
- Total new asset bytes: 24,156,017
- Distinct image basenames: 128 (largest original + source-used variants downloaded)
- Member names with a real source photo: **23 / 41**
- Member names without an exact source photo: **18**

## Outputs

- Mapping JSON: `scripts/asset-map.json`
- Downloaded assets: `public/images/`

## Footer image

- Source-used (Elementor thumbnail, exact filename): `/wp-content/uploads/elementor/thumbs/12431645_1087304941293749_1342854788_n-removebg-preview-riqbwh2hpz3jazv6auesrscoodjxwgde3wxgi8mqkg.png`
- Original full-size: `/wp-content/uploads/2020/05/12431645_1087304941293749_1342854788_n-removebg-preview.png`
- Local copies: `/images/12431645_1087304941293749_1342854788_n-removebg-preview-riqbwh2hpz3jazv6auesrscoodjxwgde3wxgi8mqkg.png` and `/images/12431645_1087304941293749_1342854788_n-removebg-preview.png`
- `footerImage` in the JSON points at the exact source-used filename.

## Member photo mapping

| Name | Local photo |
| --- | --- |
| Krzysztof Sobczyk | /images/Sobczyk-Krzysztof-2.jpg |
| Aleksandra Woźniak | /images/Wozniak-Aleksandra.jpg |
| Michał Szczotka | /images/Szczotka-Michal.jpg |
| Bartosz Marciniak | /images/Marciniak-Bartosz.jpg |
| Cyprian Pikor | /images/Pikor-Cyprian.jpg |
| Hubert Pacyna | /images/Pacyna-Hubert.jpg |
| Łukasz Barszczak | /images/Barszczak-Lukasz.jpg |
| Kalina Stanik | /images/Stanik-Kalina.jpg |
| Radosław Michalski | /images/Michalski-Radoslaw.jpg |
| Jan Maciejewski | /images/Maciejewski-Jan.jpg |
| Natalia Woch | /images/Woch-Natalia.jpg |
| Kamil Skonieczny | /images/Skonieczny-Kamil-2.jpg |
| Piotr Wlazło | /images/Wlazlo-Piotr.jpg |
| Marta Deredas | /images/Deredas-Marta.jpg |
| Paulina Krawiec | /images/Krawiec-Paulina.jpg |
| Artur Melnychenko | /images/Melnychenko-Artur.jpg |
| Jakub Klimczak | /images/Klimczak-Jakub.jpg |
| Dominik Gasper | /images/Gasper-Dominik.jpg |
| Julia Janus | /images/Janus-Julia.jpg |
| Tomasz Woźniak | /images/Wozniak-Tomasz.jpg |
| Filip Barski | /images/Barski-Filip.jpg |
| Hubert Szadkowski | /images/Szadkowski-Hubert.jpg |
| Tycjan Fortuna | /images/Fortuna-Tycjan.jpg |

## Unresolved member names (no exact photo on source)

- Kacper Lipertowicz
- Adam Rybus
- Tomasz Cichomski
- Damian Dłużniweski
- Dawid Ryba
- Krzysztof Łabuć
- Aleksander Grzesik
- Jakub Cieślarek
- Marceli Kozieł
- Marta Dembowska
- Umberto Menchiari
- Wael Alasal
- Bartosz Kozak
- Julian Bednarek
- Bartłomiej Sęczkowski
- Kacper Moczkowski
- dr inż. Rafał Dychto
- dr inż. Piotr Jasiński

These members were shown with the generic stock avatar on the source site; the local clone uses `/images/brunette-man-avatar-portrait-young-guy-vector-illustration-face_217290-1035.webp`.

## Notes

- Scraped 11 source pages; 596 unique wp-content/uploads URLs found (579 image URLs + 17 non-image CSS/JS/PDF skipped).
- Download plan: one largest/original variant per distinct filename, plus every source-used variant (src, data-src, inline background-image, JSON data-settings).
- Footer image exact source filename '12431645_1087304941293749_1342854788_n-removebg-preview-riqbwh2hpz3jazv6auesrscoodjxwgde3wxgi8mqkg.png' comes from /wp-content/uploads/elementor/thumbs/ and was downloaded verbatim.
- Footer full original found at https://ironwarriors.p.lodz.pl/wp-content/uploads/2020/05/12431645_1087304941293749_1342854788_n-removebg-preview.png and downloaded as /images/12431645_1087304941293749_1342854788_n-removebg-preview.png.
- Two filenames occur in two upload directories: Barszczak-Lukasz.jpg and Michalski-Radoslaw.jpg (2023/11 and 2024/12). Newest kept the canonical name; older copies saved with a -2023-11 suffix.
- 18 of 41 requested member names have no exact photo on the source site (only a generic placeholder avatar was used); they are omitted from memberPhotos and should use /images/avatar-placeholder.webp.
- Source heading for Artur Melnychenko contained a trailing zero-width space (U+200B); name was normalized for matching.
- Where a member had both a square headshot and a 'Kierowca-...' driver portrait, the square headshot was chosen for memberPhotos; both files were downloaded.
- Existing files with identical names were skipped (no overwrite).
