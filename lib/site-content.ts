export type Member = { name: string; role?: string; photo: string; portrait?: boolean }
export type TeamSection = {
  id?: string
  title?: string
  background?: string
  overlay?: string
  columns: 1 | 2 | 3 | 4 | 5 | 6
  maxWidth?: number
  offset?: number
  members: Member[]
}
export function teamSectionOverlay(section: TeamSection, year: string) {
  const bg = section.background ?? ''
  if (year === '2022-2023') {
    if (!bg && section.id === 'zespolMarketingu') return '#ffffffd9'
    return '#ffffffcc'
  }
  if (!bg) return '#ffffffde'
  if (bg.includes('eco-arrow-3-2')) return '#ffffffd1'
  if (bg.includes('20221223')) return '#ffffffdb'
  if (bg.includes('20230522')) return '#ffffffe3'
  return '#ffffffe6'
}

export type TeamJump = { label: string; id: string }
export type TeamYear = {
  year: string
  label: string
  intro: string
  heroBackground: string
  seasonTag: 'h1' | 'h2'
  jumps: TeamJump[]
  sections: TeamSection[]
}

const img = (file: string) => `/images/${file}`
const ph = img('brunette-man-avatar-portrait-young-guy-vector-illustration-face_217290-1035.webp')
const ph150 = img('brunette-man-avatar-portrait-young-guy-vector-illustration-face_217290-1035-150x150.webp')

const person = (name: string, role: string | undefined, file: string, portrait = false): Member => ({
  name,
  role,
  photo: img(file),
  portrait,
})
const placeholder = (name: string, role?: string, small = false): Member => ({
  name,
  role,
  photo: small ? ph150 : ph,
})

const introNew =
  'Iron Warriors to zespół stworzony z pasjonatów motoryzacji. Jesteśmy z różnych wydziałów Politechniki Łódzkiej, jednak łączy nas pasja i chęć doskonalenia naszych pojazdów, aby jechać coraz dalej, zużywając najmniej paliwa jak to możliwe.'
const introOld =
  'Iron Warriors to zespół stworzony z pasjonatów motoryzacji i silników spalinowych. Jesteśmy z różnych wydziałów Politechniki Łódzkiej, jednak łączy nas pasja i chęć doskonalenia naszego pojazdu, aby jechać coraz dalej, zużywając najmniej paliwa jak to możliwe.'

const hero = '/images/Shell-Eco-Marathon.jpg'
const driversBg = '/images/eco-arrow-3-2-scaled.jpg'
const mechBg = '/images/20221223-115530_resize.jpg'
const elecBg = '/images/20221006-211817_resize.jpg'
const marketingBg = '/images/20230522-170809_resize_2.jpg'
const itBg = '/images/eco-arrow-2-electric-5.jpg'
const oldMechBg = '/images/rsz_dscn0772.jpg'

const modernDrivers = [
  person('Łukasz Barszczak', undefined, 'Kierowca-Barszczak-Lukasz-1.jpg', true),
  person('Aleksandra Woźniak', undefined, 'Kierowca-Wozniak-Aleksandra-1.jpg', true),
  person('Kalina Stanik', undefined, 'Kierowca-Stanik-Kalina-2.jpg', true),
]

export const teams: TeamYear[] = [
  {
    year: '2025-2026',
    label: 'Zespół 2025/2026',
    intro: introNew,
    heroBackground: hero,
    seasonTag: 'h2',
    jumps: [
      { label: 'Kierowcy', id: 'zespolKierowcy' },
      { label: 'Dział Mechaniczny', id: 'zespolMechaniczny' },
      { label: 'Dział Elektroniczny', id: 'zespolElektryczny' },
      { label: 'Dział Marketingu', id: 'zespolMarketingu' },
      { label: 'Dział Programistyczny', id: 'zespolProgramistow' },
      { label: 'Opiekunowie', id: 'opiekunowie' },
    ],
    sections: [
      {
        title: 'Leaderzy', columns: 6, maxWidth: 1400, members: [
          person('Krzysztof Sobczyk', 'Team Leader', 'Sobczyk-Krzysztof-2.jpg'),
          person('Aleksandra Woźniak', 'Działy Mechaniczny i Marketingu', 'Wozniak-Aleksandra.jpg'),
          person('Michał Szczotka', 'Projekt Eco Arrow 3', 'Szczotka-Michal.jpg'),
          person('Bartosz Marciniak', 'Projekt Eco Arrow 2 Electric', 'Marciniak-Bartosz.jpg'),
          person('Cyprian Pikor', 'Dział Elektroniczny', 'Pikor-Cyprian.jpg'),
          person('Hubert Pacyna', 'Dział Programistyczny', 'Pacyna-Hubert.jpg'),
        ],
      },
      {
        id: 'zespolKierowcy', title: 'Kierowcy', background: driversBg, columns: 5, offset: 1, members: modernDrivers,
      },
      {
        id: 'zespolMechaniczny', title: 'Dział Mechaniczny', background: mechBg, columns: 5, maxWidth: 1330, offset: 1, members: [
          person('Michał Szczotka', 'Zastępca Koordynatora\nds. Projektu Eco Arrow 3', 'Szczotka-Michal.jpg'),
          person('Aleksandra Woźniak', 'Koordynator Działu', 'Wozniak-Aleksandra.jpg'),
          person('Bartosz Marciniak', 'Zastępca Koordynatora\nds. Projektu Eco Arrow 2 Electric', 'Marciniak-Bartosz.jpg'),
        ],
      },
      {
        background: mechBg, columns: 5, members: [
          person('Krzysztof Sobczyk', 'Technologia CNC', 'Sobczyk-Krzysztof-1.jpg'),
          person('Radosław Michalski', 'Układ kierowniczy', 'Michalski-Radoslaw.jpg'),
          person('Łukasz Barszczak', 'Projektant CAD', 'Barszczak-Lukasz.jpg'),
          person('Jan Maciejewski', 'Projektant CAD', 'Maciejewski-Jan.jpg'),
          person('Natalia Woch', 'Projektant CAD', 'Woch-Natalia.jpg'),
        ],
      },
      {
        background: mechBg, columns: 5, members: [
          person('Kamil Skonieczny', 'Układy hamulcowe', 'Skonieczny-Kamil-2.jpg'),
          person('Piotr Wlazło', 'Research części', 'Wlazlo-Piotr.jpg'),
          person('Marta Deredas', 'Projektant CAD', 'Deredas-Marta.jpg'),
          person('Paulina Krawiec', 'Kompozyty', 'Krawiec-Paulina.jpg'),
          placeholder('Kacper Lipertowicz', 'Mechanika ogólna'),
        ],
      },
      {
        background: mechBg, columns: 2, members: [
          placeholder('Adam Rybus', 'Mechanika ogólna'),
          placeholder('Tomasz Cichomski', 'Mechanika ogólna'),
        ],
      },
      {
        id: 'zespolElektryczny', title: 'Dział Elektroniczny', background: elecBg, columns: 1, members: [
          person('Cyprian Pikor', 'Koordynator Działu', 'Pikor-Cyprian.jpg'),
        ],
      },
      {
        background: elecBg, columns: 4, members: [
          person('Artur Melnychenko', 'Sterowanie silników elektrycznych', 'Melnychenko-Artur.jpg'),
          person('Jakub Klimczak', 'Wykonywanie układów elektronicznych', 'Klimczak-Jakub.jpg'),
          person('Dominik Gasper', 'Projektowanie układów elektronicznych', 'Gasper-Dominik.jpg'),
          person('Radosław Michalski', 'Silniki elektryczne', 'Michalski-Radoslaw.jpg'),
        ],
      },
      {
        background: elecBg, columns: 4, members: [
          person('Łukasz Barszczak', 'Wykonywanie układów elektronicznych', 'Barszczak-Lukasz.jpg'),
          placeholder('Damian Dłużniweski', 'Elektronika ogólna'),
          placeholder('Dawid Ryba', 'Elektronika ogólna'),
          placeholder('Krzysztof Łabuć', 'Projektowanie PCB'),
        ],
      },
      {
        background: elecBg, columns: 4, members: [
          placeholder('Aleksander Grzesik', 'Elektronika ogólna'),
          placeholder('Jakub Cieślarek', 'Elektronika ogólna'),
          placeholder('Marceli Kozieł', 'Elektronika ogólna'),
          placeholder('Marta Dembowska', 'Elektronika ogólna'),
        ],
      },
      {
        background: elecBg, columns: 4, members: [
          placeholder('Umberto Menchiari', 'Projektowanie PCB'),
          placeholder('Tomasz Cichomski', 'Elektronika ogólna'),
          placeholder('Wael Alasal', 'Elektronika ogólna'),
          placeholder('Bartosz Kozak', 'Elektronika ogólna'),
        ],
      },
      {
        id: 'zespolMarketingu', title: 'Dział Marketingu', background: marketingBg, columns: 3, offset: 1, members: [
          person('Aleksandra Woźniak', 'Koordynator Działu', 'Wozniak-Aleksandra.jpg'),
        ],
      },
      {
        background: marketingBg, columns: 5, members: [
          person('Julia Janus', 'Grafiki / Sponsorzy', 'Janus-Julia.jpg'),
          person('Tomasz Woźniak', 'Zdjęcia / Strona internetowa', 'Wozniak-Tomasz.jpg'),
          person('Łukasz Barszczak', 'Obróbka zdjęć', 'Barszczak-Lukasz.jpg'),
          person('Paulina Krawiec', 'Grafiki / Filmy', 'Krawiec-Paulina.jpg'),
          person('Natalia Woch', 'Grafiki / Social Media', 'Woch-Natalia.jpg'),
        ],
      },
      {
        background: marketingBg, columns: 4, members: [
          person('Hubert Pacyna', 'Sponsorzy', 'Pacyna-Hubert.jpg'),
          person('Filip Barski', 'Zdjęcia', 'Barski-Filip.jpg'),
          person('Kalina Stanik', 'Social Media / Sponsorzy', 'Stanik-Kalina.jpg'),
          person('Marta Deredas', 'Grafiki / Social Media', 'Deredas-Marta.jpg'),
        ],
      },
      {
        id: 'zespolProgramistow', title: 'Dział Programistyczny', background: itBg, columns: 1, members: [
          person('Hubert Pacyna', 'Koordynator Działu', 'Pacyna-Hubert.jpg'),
        ],
      },
      {
        background: itBg, columns: 5, members: [
          person('Tomasz Woźniak', 'System telemetrii / DevOps', 'Wozniak-Tomasz.jpg'),
          person('Łukasz Barszczak', 'System telemetrii', 'Barszczak-Lukasz.jpg'),
          person('Piotr Wlazło', 'System telemetrii', 'Wlazlo-Piotr.jpg'),
          person('Artur Melnychenko', 'Analiza danych z hamowni', 'Melnychenko-Artur.jpg'),
          person('Bartosz Pełka', 'Analiza danych z hamowni', 'Pelka-Bartosz.jpg'),
        ],
      },
      {
        background: itBg, columns: 4, members: [
          person('Hubert Szadkowski', 'Analiza danych z hamownii', 'Szadkowski-Hubert.jpg'),
          person('Tycjan Fortuna', 'System telemetrii', 'Fortuna-Tycjan.jpg'),
          placeholder('Julian Bednarek', 'System telemetrii'),
          placeholder('Bartłomiej Sęczkowski', 'System telemetrii'),
        ],
      },
      {
        background: itBg, columns: 1, members: [placeholder('Kacper Moczkowski', 'System telemetrii')],
      },
      {
        id: 'opiekunowie', title: 'Opiekunowie', background: itBg, columns: 2, members: [
          placeholder('dr inż. Rafał Dychto', 'Opiekun Naukowy\nZakład Aparatury Medycznej\nInstytut Maszyn Przepływowych PŁ'),
          placeholder('dr inż. Piotr Jasiński', 'Opiekun Merytoryczny\nZakład Techniki Cieplnej i Chłodnictwa\nInstytut Maszyn Przepływowych PŁ'),
        ],
      },
    ],
  },
  {
    year: '2024-2025',
    label: 'Zespół 2024/2025',
    intro: introNew,
    heroBackground: hero,
    seasonTag: 'h2',
    jumps: [
      { label: 'Kierowcy', id: 'zespolKierowcy' },
      { label: 'Dział Mechaniczny', id: 'zespolMechaniczny' },
      { label: 'Dział Elektroniczny', id: 'zespolElektryczny' },
      { label: 'Dział Marketingu', id: 'zespolMarketingu' },
      { label: 'Dział Programistyczny', id: 'zespolProgramistow' },
    ],
    sections: [
      {
        title: 'Leaderzy', columns: 6, maxWidth: 1400, members: [
          person('Krzysztof Sobczyk', 'Team Leader', 'Sobczyk-Krzysztof-2.jpg'),
          person('Aleksandra Woźniak', 'Działy Mechaniczny i Marketingu', 'Wozniak-Aleksandra.jpg'),
          person('Radosław Michalski', 'Projekt Eco Arrow 3', 'Michalski-Radoslaw.jpg'),
          person('Bartosz Marciniak', 'Projekt Eco Arrow 2 Electric', 'Marciniak-Bartosz.jpg'),
          person('Dominik Gasper', 'Dział Elektryczny (Elektroniczny)', 'Gasper-Dominik.jpg'),
          person('Hubert\nPacyna', 'Dział Programistyczny', 'Pacyna-Hubert.jpg'),
        ],
      },
      {
        id: 'zespolKierowcy', title: 'Kierowcy', background: driversBg, columns: 5, offset: 1, members: modernDrivers,
      },
      {
        id: 'zespolMechaniczny', title: 'Dział Mechaniczny', background: mechBg, columns: 5, maxWidth: 1330, offset: 1, members: [
          person('Radosław Michalski', 'Zastępca Koordynatora\nds. Projektu Eco Arrow 3', 'Michalski-Radoslaw.jpg'),
          person('Aleksandra Woźniak', 'Koordynator Działu', 'Wozniak-Aleksandra.jpg'),
          person('Bartosz Marciniak', 'Zastępca Koordynatora\nds. Projektu Eco Arrow 2 Electric', 'Marciniak-Bartosz.jpg'),
        ],
      },
      {
        background: mechBg, columns: 5, members: [
          person('Krzysztof Sobczyk', 'Technologia CNC', 'Sobczyk-Krzysztof-1.jpg'),
          person('Emil Bartczak', 'Układ hamulcowy', 'Bartczak-Emil.jpg'),
          person('Łukasz Barszczak', 'Projektant CAD', 'Barszczak-Lukasz.jpg'),
          person('Mateusz Łazowy', 'Układ dogrzewania silnika EA3', 'Lazowy-Mateusz.jpg'),
          person('Natalia Woch', 'Projektant CAD', 'Woch-Natalia.jpg'),
        ],
      },
      {
        background: mechBg, columns: 5, members: [
          person('Michał Kruczkowski', 'Research części', 'Kruczkowski-Michal.jpg'),
          person('Jan Maciejewski', 'Projektant CAD', 'Maciejewski-Jan.jpg'),
          person('Piotr Wlazło', 'Research części', 'Wlazlo-Piotr.jpg'),
          person('Bartosz Zagórski', 'Mechanika ogólna', 'Zagorski-Bartosz.jpg'),
          person('Filip Barski', 'Układ dolotowy EA3', 'Barski-Filip.jpg'),
        ],
      },
      {
        background: mechBg, columns: 5, members: [
          person('Michał Szczotka', 'Mechanika ogólna', 'Szczotka-Michal.jpg'),
          person('Cyprian Pikor', 'Mechanika ogólna', 'Pikor-Cyprian.jpg'),
          person('Kamil Skonieczny', 'Układ dolotowy EA3', 'Skonieczny-Kamil-2.jpg'),
          placeholder('Kacper Jabłoński', 'Mechanika ogólna'),
          placeholder('Łukasz Bartosik', 'Mechanika ogólna'),
        ],
      },
      {
        background: mechBg, columns: 4, members: [
          placeholder('Michał Grabowski', 'Kompozyty'),
          placeholder('Igor Sobczak', 'Kompozyty'),
        ],
      },
      {
        id: 'zespolElektryczny', title: 'Dział Elektryczny (Elektroniczny)', background: elecBg, columns: 1, members: [
          person('Dominik Gapser', 'Koordynator Działu', 'Gasper-Dominik.jpg'),
        ],
      },
      {
        background: elecBg, columns: 4, members: [
          person('Artur Melnychenko', 'Projektowanie układów elektrycznych', 'Melnychenko-Artur.jpg'),
          person('Jakub Klimczak', 'Wykonywanie układów elektronicznych', 'Klimczak-Jakub.jpg'),
          person('Filip Barski', 'Wytwarzanie PCB', 'Barski-Filip.jpg'),
          person('Cyprian Pikor', 'Silniki elektryczne', 'Pikor-Cyprian.jpg'),
        ],
      },
      {
        background: elecBg, columns: 4, offset: 1, members: [
          placeholder('Kacper Jabłoński', 'Silniki elektryczne'),
          placeholder('Łukasz Bartosik', 'Silniki elektryczne'),
        ],
      },
      {
        id: 'zespolMarketingu', title: 'Dział Marketingu', background: marketingBg, columns: 3, offset: 1, members: [
          person('Aleksandra Woźniak', 'Koordynator Działu', 'Wozniak-Aleksandra.jpg'),
        ],
      },
      {
        background: marketingBg, columns: 5, members: [
          person('Julia Janus', 'Grafiki / Sponsorzy', 'Janus-Julia.jpg'),
          person('Tomasz Woźniak', 'Zdjęcia / Strona internetowa', 'Wozniak-Tomasz.jpg'),
          person('Łukasz Barszczak', 'Obróbka zdjęć', 'Barszczak-Lukasz.jpg'),
          person('Paulina Krawiec', 'Grafiki / Filmy', 'Krawiec-Paulina.jpg'),
          person('Natalia Woch', 'Grafiki / Social Media', 'Woch-Natalia.jpg'),
        ],
      },
      {
        background: marketingBg, columns: 5, members: [
          person('Michał Kruczkowski', 'Sponsorzy', 'Kruczkowski-Michal.jpg'),
          person('Filip Barski', 'Zdjęcia', 'Barski-Filip.jpg'),
          person('Kalina Stanik', 'Social Media / Sponsorzy', 'Stanik-Kalina.jpg'),
          person('Michał Szczotka', 'Social Media / Tłumaczenia', 'Szczotka-Michal.jpg'),
          person('Marta Deredas', 'Grafiki / Social Media', 'Deredas-Marta.jpg'),
        ],
      },
      {
        background: marketingBg, columns: 4, offset: 1, members: [
          placeholder('Natalia Stawinoga', 'Grafiki'),
          person('Hubert Pacyna', 'Sponsorzy', 'Pacyna-Hubert.jpg'),
        ],
      },
      {
        id: 'zespolProgramistow', title: 'Dział Programistyczny', background: itBg, columns: 1, members: [
          person('Hubert Pacyna', 'Koordynator Działu', 'Pacyna-Hubert.jpg'),
        ],
      },
      {
        background: itBg, columns: 5, members: [
          person('Tomasz Woźniak', 'System telemetrii / DevOps', 'Wozniak-Tomasz.jpg'),
          person('Łukasz Barszczak', 'System telemetrii', 'Barszczak-Lukasz.jpg'),
          person('Piotr Wlazło', 'System telemetrii', 'Wlazlo-Piotr.jpg'),
          person('Artur Melnychenko', 'Analiza danych z hamowni', 'Melnychenko-Artur.jpg'),
          person('Bartosz Pełka', 'Analiza danych z hamowni', 'Pelka-Bartosz.jpg'),
        ],
      },
      {
        background: itBg, columns: 4, members: [
          person('Hubert Szadkowski', 'Analiza danych z hamownii', 'Szadkowski-Hubert.jpg'),
          person('Tycjan Fortuna', 'System telemetrii', 'Fortuna-Tycjan.jpg'),
          placeholder('Julian Bednarek', 'System telemetrii'),
          placeholder('Bartłomiej Sęczkowski', 'System telemetrii'),
        ],
      },
    ],
  },
  {
    year: '2023-2024',
    label: 'Zespół 2023/2024',
    intro: introOld,
    heroBackground: hero,
    seasonTag: 'h2',
    jumps: [
      { label: 'Kierowcy', id: 'zespolKierowcy' },
      { label: 'Dział Mechaniczny', id: 'zespolMechaniczny' },
      { label: 'Dział Elektroniczny', id: 'zespolElektryczny' },
      { label: 'Dział Marketingu', id: 'zespolMarketingu' },
    ],
    sections: [
      {
        title: 'Leaderzy', columns: 5, maxWidth: 1400, members: [
          person('Krzysztof Sobczyk', 'Team Leader', 'Sobczyk-Krzysztof-2.jpg'),
          person('Kamil Skonieczny', 'Koordynator Działu Mechanicznego', 'Skonieczny-Kamil-2.jpg'),
          person('Dominik Gasper', 'Koordynator Działu Elektrycznego', 'Gasper-Dominik.jpg'),
          person('Kalina Stanik', 'Współkoordynator Działu Marketingu', 'Stanik-Kalina.jpg'),
          person('Mykyta Dorohov', 'Współkoordynator Działu Marketingu', 'Dorohov-Mykyta.jpg'),
        ],
      },
      {
        id: 'zespolKierowcy', title: 'Kierowcy', background: driversBg, columns: 5, offset: 1, members: modernDrivers,
      },
      {
        id: 'zespolMechaniczny', title: 'Dział Mechaniczny', background: mechBg, columns: 1, members: [
          person('Kamil Skonieczny', 'Koordynator Działu Mechanicznego', 'Skonieczny-Kamil-2.jpg'),
        ],
      },
      {
        background: mechBg, columns: 5, members: [
          person('Krzysztof Sobczyk', 'Technologia CNC', 'Sobczyk-Krzysztof-1.jpg'),
          person('Emil Bartczak', 'Układ hamulcowy', 'Bartczak-Emil.jpg'),
          person('Łukasz Barszczak', 'Projektant CAD', 'Barszczak-Lukasz.jpg'),
          person('Mateusz Łazowy', 'Układ dogrzewania silnika EA3', 'Lazowy-Mateusz.jpg'),
          person('Aleksandra Woźniak', 'Badania i rozwój', 'Wozniak-Aleksandra.jpg'),
        ],
      },
      {
        background: mechBg, columns: 5, members: [
          person('Dominik Gasper', 'Projektant CAD/CAM', 'Gasper-Dominik.jpg'),
          person('Mikołaj Leśniewski', 'Projektant CAD/CAM', 'Lesniewski-Mikolaj.jpg'),
          person('Szymon Białek', 'Układ hamulcowy EA2', 'Bialek-Szymon.jpg'),
          person('Mateusz Juszczykowski', 'Mapy silnikowe', 'Juszczykowski-Mateusz.jpg'),
          person('Filip Barski', 'Układ dolotowy EA3', 'Barski-Filip.jpg'),
        ],
      },
      {
        background: mechBg, columns: 5, members: [
          person('Maksymilian Stranz', undefined, 'Stranz-Maksymilian-480x480.jpg'),
          person('Patryk Janeczek', 'Research części', 'Janeczek-Patryk.jpg'),
          person('Małgorzata Adamczyk', 'Research części', 'Adamczyk-Aleksandra.jpg'),
          person('Andrzej Bialiauski', undefined, 'Bialiauski-Andrzej.jpg'),
          person('Radosław Michalski', undefined, 'Michalski-Radoslaw.jpg'),
        ],
      },
      {
        background: mechBg, columns: 5, members: [
          person('Antoni Kijo', undefined, 'Kijo-Antoni.jpg'),
          person('Wiktor Sykulski', undefined, 'Sykulski-Witold.jpg'),
          person('Bartosz Marciniak', undefined, 'Marciniak-Bartosz.jpg'),
          person('Maciej Wójt', undefined, 'Wojt-Maciej.jpg'),
          person('Maciej Cieślak', undefined, 'Cieslak-Maciej.jpg'),
        ],
      },
      {
        background: mechBg, columns: 4, members: [
          person('Arkadiusz Łyszkowicz', undefined, 'Lyszkowicz-Arkadiusz.jpg'),
          person('Witold Chajdys', undefined, 'Chajdys-Witold.jpg'),
        ],
      },
      {
        id: 'zespolElektryczny', title: 'Dział Elektryczny', background: elecBg, columns: 1, members: [
          person('Dominik Gapser', 'Koordynator Działu Elektrycznego', 'Gasper-Dominik.jpg'),
        ],
      },
      {
        background: elecBg, columns: 5, members: [
          person('Mikołaj Pichit', undefined, 'Pichit-Mikolaj.jpg'),
          person('Ruslan Assylgareyev', 'Wiązki elektryczne EA2/EA3', 'Assylgareyev-Ruslan.jpg'),
          person('Kacper Kopycki', 'Wiązki elektryczne EA2/EA3', 'Kopycki-Kacper.jpg'),
          person('Ivan Iziumov', 'Programista Embedded', 'Iziumov-Ivan.jpg'),
          person('Kacper Więclewski', 'Wiązki elektryczne EA2', 'Wieclewski-Kacper.jpg'),
        ],
      },
      {
        background: elecBg, columns: 5, members: [
          person('Artur Melnychenko', 'Wiązki elektryczne EA2', 'Melnychenko-Artur.jpg'),
          person('Arseni Skrabneu', 'Wiązki elektryczne EA2', 'Skrabneu-Arseni.jpg'),
          person('Oleksander Prokhin', undefined, 'Prokhin-Oleksander.jpg'),
        ],
      },
      {
        id: 'zespolMarketingu', title: 'Dział Marketingu', background: marketingBg, columns: 4, members: [
          person('Kalina Stanik', 'Współkoordynator Działu Marketingu', 'Stanik-Kalina.jpg'),
          person('Mykyta Dorohov', 'Współkoordynator Działu Marketingu', 'Dorohov-Mykyta.jpg'),
        ],
      },
      {
        background: marketingBg, columns: 5, members: [
          person('Julia Janus', 'Materiały marketingowe', 'Janus-Julia.jpg'),
          person('Tomasz Woźniak', 'Zdjęcia / Strona internetowa', 'Wozniak-Tomasz.jpg'),
          person('Sebastian Pawlak', undefined, 'Pawlak-Sebastian.jpg'),
          person('Paulina Krawiec', 'Grafiki', 'Krawiec-Paulina.jpg'),
          person('Weronika Szulc', undefined, 'Szulc-Weronika.jpg'),
        ],
      },
      {
        background: marketingBg, columns: 5, members: [
          person('Bartosz Staniewicz', undefined, 'Staniewicz-Bartosz.jpg'),
          person('Filip Barski', 'Zdjęcia', 'Barski-Filip.jpg'),
          person('Katarzyna Pietrzyk', undefined, 'Pietrzyk-Katarzyna.jpg'),
          person('Szymon Białek', undefined, 'Bialek-Szymon.jpg'),
          person('Łukasz Barszczak', undefined, 'Barszczak-Lukasz.jpg'),
        ],
      },
      {
        background: marketingBg, columns: 5, members: [
          person('Andrzej Bialiauski', 'Zdjęcia', 'Bialiauski-Andrzej.jpg'),
          placeholder('Barbara Pawłowska'),
          person('Dominik Regeńczuk', undefined, 'Regenczuk-Dominik.jpg'),
          person('Kacper Więclewski', undefined, 'Wieclewski-Kacper.jpg'),
          person('Mateusz Łazowy', undefined, 'Lazowy-Mateusz.jpg'),
        ],
      },
      {
        background: marketingBg, columns: 5, members: [
          person('Oleksander Prokhin', undefined, 'Prokhin-Oleksander.jpg'),
        ],
      },
    ],
  },
  {
    year: '2022-2023',
    label: 'Zespół 2022/2023',
    intro: introOld,
    heroBackground: hero,
    seasonTag: 'h1',
    jumps: [
      { label: 'Kierowcy', id: 'zespolKierowcy' },
      { label: 'Dział Mechaniczny', id: 'zespolMechaniczny' },
      { label: 'Dział Elektroniczny', id: 'zespolElektryczny' },
      { label: 'Dział Marketingu', id: 'zespolMarketingu' },
    ],
    sections: [
      {
        title: 'Leaderzy', columns: 4, maxWidth: 1063, members: [
          person('Krzysztof Sobczyk', 'Team Leader', 'IMG_2020-2.jpg'),
          person('Aleksandra Woźniak', 'Koordynator Działu Mechanicznego', 'IMG_2435_1_1.jpg'),
          person('Ivan Iziumov', 'Koordynator Działu Elektrycznego', 'IMG_1882.jpg'),
          person('Tomasz Woźniak', 'Koordynator Działu Marketingu', '20230323-164611-3.jpg'),
        ],
      },
      {
        id: 'zespolKierowcy', title: 'Kierowcy', columns: 5, offset: 1, members: [
          placeholder('Łukasz Barszczak'),
          person('Aleksandra Woźniak', undefined, 'IMG_2435_1_1.jpg'),
          placeholder('Kalina Stanik'),
        ],
      },
      {
        id: 'zespolMechaniczny', title: 'Dział Mechaniczny', background: oldMechBg, columns: 1, members: [
          person('Aleksandra Woźniak', 'Koordynator Działu Mechanicznego', 'IMG_2435_1_1-150x150.jpg'),
        ],
      },
      {
        background: oldMechBg, columns: 5, members: [
          person('Krzysztof Sobczyk', 'Technologia CNC', 'IMG_2020-2-150x150.jpg'),
          placeholder('Emil Bartczak', 'Układ hamulcowy', true),
          placeholder('Łukasz Barszczak', 'Projektant CAD', true),
          placeholder('Mateusz Łazowy', 'Układ dogrzewania silnika EA3', true),
          placeholder('Mikołaj Leśniewski', 'Projektant CAD/CAM', true),
        ],
      },
      {
        background: oldMechBg, columns: 5, members: [
          placeholder('Bartłomiej Miłosz', 'Research części', true),
          placeholder('Kamil Skonieczny', 'Układ jezdny EA2', true),
          placeholder('Szymon Białek', 'Układ hamulcowy EA2', true),
          placeholder('Mateusz Juszczykowski', 'Mapy silnikowe', true),
          placeholder('Filip Barski', 'Układ dolotowy EA3', true),
        ],
      },
      {
        background: oldMechBg, columns: 3, members: [
          placeholder('Maciej Okła', 'Mocowania EA2', true),
          placeholder('Kalina Stanik', 'Układ napędowy EA2', true),
          placeholder('Małgorzata Adamczyk', 'Research części', true),
        ],
      },
      {
        id: 'zespolElektryczny', title: 'Dział Elektryczny', columns: 1, members: [
          person('Ivan Iziumov', 'Koordynator Działu Elektrycznego', 'IMG_1882-150x150.jpg'),
        ],
      },
      {
        columns: 5, members: [
          person('Przemysław Kościelak', 'Mapy silnikowe', 'IMG_1832-150x150.jpg'),
          person('Bartłomiej Miłosz', 'Wiązki elektryczne EA3', 'IMG_1916-150x150.jpg'),
          person('Kacper Kopycki', 'Wiązki elektryczne EA2/EA3', 'IMG_3107-150x150.jpg'),
          placeholder('Ruslan Assylgareyev', 'Wiązki elektryczne EA2', true),
          placeholder('Prokhin Oleksander', 'Wiązki elektryczne EA2', true),
        ],
      },
      {
        columns: 5, members: [
          placeholder('Jakub Żaczek', 'Enkodery', true),
          placeholder('Dominik Gasper', 'Wiązki elektryczne EA3', true),
          placeholder('Arseni Skrabneu', 'Wiązki elektryczne EA2', true),
        ],
      },
      {
        id: 'zespolMarketingu', title: 'Dział Marketingu', columns: 1, members: [
          person('Tomasz Woźniak', 'Koordynator Działu Marketingu', '20230323-164611-3-150x150.jpg'),
        ],
      },
      {
        columns: 5, members: [
          placeholder('Julia Janus', 'Kontakt ze sponsorami', true),
          placeholder('Zbigniew Tomaszewski', 'Kontakt ze sponsorami', true),
          placeholder('Sebastian Pawlak', 'Kontakt ze sponsorami', true),
          placeholder('Mykyta Dorohov', 'Organizacja wydarzeń', true),
          placeholder('Małgorzata Adamczyk', 'Public Relation', true),
        ],
      },
      {
        columns: 4, members: [
          person('Kamila Słomkowska', 'Social Media', 'IMG_2721-150x150.jpg'),
          person('Kacper Kopycki', 'Wideo', 'IMG_3107-150x150.jpg'),
          placeholder('Katarzyna Pietrzyk', 'Materiały marketingowe', true),
          placeholder('Paweł Wacławiak', 'Wystąpienia publiczne', true),
        ],
      },
    ],
  },
]

export type Partner = { name: string; logo: string; href: string }
export type PartnerGroup = { columns: 2 | 3 | 4; height: 240 | 291; items: Partner[] }
export type PartnerSection = { title?: string; groups: PartnerGroup[] }
export type PartnerYear = {
  year: string
  background: string
  bottomBackground?: string
  overlay: string
  plainImages?: boolean
  sections: PartnerSection[]
}

const p = (name: string, logo: string, href: string): Partner => ({ name, logo, href })

const pl = p('Politechnika Łódzka', '/images/partner-pl.png', 'https://www.p.lodz.pl/pl')
const mechaniczny = p('Wydział Mechaniczny PŁ', '/images/partner-mechaniczny.png', 'https://www.mechaniczny.p.lodz.pl/')
const imp = p('Instytut Maszyn Przepływowych PŁ', '/images/partner-imp.png', 'http://www.imp.p.lodz.pl/')
const veolia = p('Veolia', '/images/partner-veolia.png', 'https://www.veolia.pl/')
const tbp = p('TBP', '/images/partner-tbp.png', 'http://tbp-group.pl/')
const hart = p('Hart-Tech', '/images/logotypHT-768x259.jpg', 'https://hart-tech.pl/')
const innovar = p('Innovar', '/images/INNOVAR_poziome_jasne_tlo_4800px-768x192.png', 'https://www.innovar.pl/')
const msGroup = p('MS Group', '/images/partner-ms-group.png', 'https://ms-group.pl/')
const arpaprint = p('Arpaprint', '/images/partner-arpaprint.png', 'https://www.arpaprint.pl/')
const edred = p('EDRed', '/images/edred-1-768x269.png', 'https://edred.pl/')
const avl = p('AVL', '/images/default-logo@3x.png', 'https://www.avl.com/en')
const mnisw = p('MEN', '/images/01_znak_siatka_podstawowy_kolor_biale_tlo-768x239.png', 'https://gov.pl/web/nauka')
const fundacja = p('Fundacja PŁ', '/images/fundacjapl.png', 'https://fundacja.p.lodz.pl/')
const easy = p('Easy Composites', '/images/partner-easy-composites.jpg', 'https://www.easycomposites.eu/')
const lodzKreuje = p('Łódź Kreuje', '/images/logo-lodz-kreuje.png', 'https://lodz.pl/')
const mlodzi = p('Młodzi w Łodzi', '/images/logo-mlodzi-w-lodzi.png', 'https://mlodziwlodzi.pl/')
const opus = p('Centrum Opus', '/images/logo-centrum-opus.png', 'https://centrumopus.pl/')
const igus = p('igus', '/images/partner-pl.png', 'https://www.igus.pl/')
const strefa = p('Strefa Drukarek', '/images/partner-arpaprint.png', 'https://strefadrukarek.pl/')
const oiz = p('OiZ PŁ', '/images/partner-oiz.webp', 'https://woiz.p.lodz.pl/')
const chemia = p('WCh PŁ', '/images/partner-chemia.webp', 'https://chemia.p.lodz.pl/')
const wipos = p('WIPoS PŁ', '/images/partner-wipos.webp', 'https://wipos.p.lodz.pl/')
const cti = p('CTI PŁ', '/images/cti2.png', 'https://cti.p.lodz.pl/')
const wwiw = p('WWiW PŁ', '/images/partner-wwiw.png', 'https://style.p.lodz.pl/')

export const partners: PartnerYear[] = [
  {
    year: '2026',
    background: '/images/eco-arrow-2-electric-5.jpg',
    bottomBackground: '/images/eco-arrow-2-electric-3.jpg',
    overlay: '#ffffffe8',
    sections: [
      {
        groups: [
          { columns: 2, height: 291, items: [veolia, tbp] },
          { columns: 2, height: 291, items: [hart, innovar] },
          { columns: 3, height: 240, items: [pl, mechaniczny, imp] },
          { columns: 4, height: 240, items: [msGroup, arpaprint, edred, avl] },
          { columns: 2, height: 240, items: [mnisw, fundacja] },
        ],
      },
      {
        title: 'Rabatów udzielili nam',
        groups: [{ columns: 4, height: 240, items: [easy, p('Nordynski Rent Car', '/images/partner-nordynski.png', 'https://nordynski-rent.pl/')] }],
      },
      {
        title: 'Jednostki PŁ, które udzieliły nam wsparcia',
        groups: [{
          columns: 4,
          height: 240,
          items: [
            oiz, chemia, wipos, p('WEEIA PŁ', '/images/WEEIA_Logo.png', 'https://weeia.p.lodz.pl/'), cti,
            p('AVL', '/images/default-logo@3x.png', 'https://www.avl.com/'), wwiw,
          ],
        }],
      },
    ],
  },
  {
    year: '2025',
    background: '/images/eco-arrow-2-electric-5.jpg',
    bottomBackground: '/images/eco-arrow-2-electric-3.jpg',
    overlay: '#ffffffe8',
    sections: [
      {
        groups: [{
          columns: 4,
          height: 240,
          items: [
            veolia, tbp, hart, p('Biooleo', '/images/biooleo.png', 'https://biooleo.pl/'), pl, mechaniczny, imp,
            p('Pafana', '/images/logo-pafana-1000px-768x232.png', 'https://pafana.pl/'), msGroup, arpaprint,
            p('Xenergy', '/images/Logo-Xenergy-768x981.png', 'https://drinkid.eu/pl/nasze-marki#x-energy-drink'),
            mlodzi, opus, p('Inkubator PS', '/images/inkubator-1.png', 'https://inkubatorps.pl/'), lodzKreuje,
            igus, strefa, mnisw, fundacja,
          ],
        }],
      },
      {
        title: 'Rabatów udzielili nam',
        groups: [{
          columns: 4,
          height: 240,
          items: [easy, edred, p('RallyShop', '/images/RallyShop.png', 'https://www.rallyshop.pl/'), p('WZL1', '/images/WZL1.png', 'https://wzl1.mil.pl/')],
        }],
      },
      {
        title: 'Jednostki PŁ, które udzieliły nam wsparcia',
        groups: [{
          columns: 4,
          height: 240,
          items: [
            oiz, p('PŁWBAIŚ', '/images/PLWBAIS_PFP_SZARYNABIELI_OKRAG-768x768.png', 'https://bais.p.lodz.pl/'),
            chemia, wipos, p('IFE PŁ', '/images/IFE_LOGO-eng.png', 'https://www.ife.p.lodz.pl/'),
            p('FTIMS PŁ', '/images/ftims.png', 'https://ftims.p.lodz.pl/'),
          ],
        }],
      },
    ],
  },
  {
    year: '2024',
    background: '/images/eco-arrow-2-electric-5.jpg',
    bottomBackground: '/images/eco-arrow-2-electric-3.jpg',
    overlay: '#ffffffe8',
    sections: [{
      groups: [{
        columns: 4,
        height: 240,
        items: [
          veolia, tbp, pl, mechaniczny, imp,
          p('Fundacja PŁ', '/images/logo-fundacja-politechniki-lodzkiej-1000px-768x191.png', 'https://fundacja.p.lodz.pl/'),
          mlodzi, opus, p('Inkubator PS', '/images/inkubator-1.png', 'https://inkubatorps.pl/'), lodzKreuje,
          igus, p('EBMIA', '/images/logo-ebmia-1000px-768x253.png', 'https://ebmia.eu/'), strefa,
          p('MEiN', '/images/logo-ministerstwo-edukacji-i-nauki-1000px-rgb-768x253.png', 'https://www.gov.pl/web/edukacja-i-nauka'),
          p('Pafana', '/images/logo-pafana-1000px-768x232.png', 'https://pafana.pl/'),
          p('Tor Łódź', '/images/partner-tbp.png', 'https://tor-lodz.pl/'), msGroup, arpaprint,
        ],
      }],
    }],
  },
  {
    year: '2023',
    background: '/images/onas2.jpg',
    overlay: '#ffffffe8',
    plainImages: true,
    sections: [{
      groups: [{
        columns: 4,
        height: 240,
        items: [
          veolia, tbp, pl, mechaniczny, imp, fundacja, mlodzi, opus, lodzKreuje,
          p('MEiN', '/images/logo-ministerstwo-edukacji-i-nauki-1000px-rgb-768x253.png', 'https://www.gov.pl/web/edukacja-i-nauka'),
          igus, strefa, p('Tor Łódź', '/images/partner-tbp.png', 'https://tor-lodz.pl/'), arpaprint,
          p('EBMIA', '/images/logo-ebmia-1000px-768x253.png', 'https://tor-lodz.pl/'),
          p('MS Group', '/images/partner-ms-group.png', 'https://tor-lodz.pl/'),
        ],
      }],
    }],
  },
]

export const sponsorPdf = 'https://ironwarriors.p.lodz.pl/wp-content/uploads/2026/05/Broszura-sponsorska-bez-spadow.pdf'

export const projectCategories = [
  {
    slug: 'mnisw', title: 'Projekty Ministerstwa Nauki i Szkolnictwa Wyższego',
    description: 'Projekty finansowane przez MNiSW ze środków Budżetu Państwa.',
    image: '/images/logo-mnisw.png',
  },
  {
    slug: 'rada-kol', title: 'Konkursy Rady Kół Naukowych Politechniki Łódzkiej',
    description: 'Konkursy Rady Kół Naukowych Politechniki Łódzkiej to wewnętrzne konkursy grantowe organizowane przez Radę Kół Naukowych, działającą przy Samorządzie Studenckim Politechniki Łódzkiej. Wygrane projekty finansowane są ze środków Prorektora ds. Studenckich Politechniki Łódzkiej.',
    image: '/images/logo-rada-kol.png',
  },
  {
    slug: 'fundacja-pl', title: 'Projekty Fundacji Politechniki Łódzkiej',
    description: 'Fundacja Politechniki Łódzkiej co roku organizuje wewnętrzny konkurs grantowy, do którego przystąpić może każdy podmiot non-profit. W trybie ciągłym – do wykorzystania środków Fundacja PŁ przyznaje też Mikrodotacje na mniejsze projekty badawcze i rozwojowe.',
    image: '/images/logo-fundacja-pl.png',
  },
  {
    slug: 'miasto-lodz', title: 'Granty Miasta Łodzi',
    description: 'Coroczne konkursy grantowe finansowane z budżetu Miasta Łodzi, mające na celu wsparcie inicjatyw akademickich i kulturowych podmiotów związanych z miastem.',
    image: '/images/logo-lodz-kreuje.png',
  },
]

export const recruitment = {
  intro: `Interesujesz się motoryzacją i chciałbyś dołączyć do naszego zespołu?
A może nie boisz się wyzwań i chciałbyś spróbować czegoś zupełnie nowego?
Albo oczekujesz od studiów czegoś więcej niż wykłady i projekty, które kończą się na kartce papieru?

Jeśli choć raz odpowiedziałeś „TAK” to nie zwlekaj i dołącz do nas!

Nie musisz czekać na oficjalny nabór – jeśli akurat takiego nie prowadzimy napisz do nas maila lub DM na Facebooku lub Instagramie a na pewno się odezwiemy.* Na naszych socialach znajdziesz też informację kiedy i gdzie się spotykamy – możesz po prostu przyjść chwilę wcześniej i porozmawiać.

*między majem a lipcem możesz czekać trochę dłużej na odpowiedź – jeśli tak się dzieje to prawdopodobnie jesteśmy na zawodach`,
  formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSe84p6DfASdFbn0dH3Kh2dMk4-9WpsI7VG4kSH1t-pL--64Zg/viewform?pli=1',
  notice: 'A poniżej kilka ważnych informacji, jeśli jeszcze nie jesteś pewien lub nie wiesz który dział jest najlepszy dla ciebie.',
  gains: [
    'możliwość udziału w co najmniej 1 zawodach rangi międzynarodowej rocznie (byliśmy już we Francji, Holandii, Finlandii a kto wie co jeszcze przed nami)',
    'możliwość udziału w certyfikowanych szkoleniach o zróżnicowanej tematyce (Inventor, Fusion, spawanie, elektronika, obróbka zdjęć i filmów czy analizy numeryczne)',
    'możliwość prowadzenia badań, publikowania artykułów, udziału w konferencjach naukowych o różnym zasięgu',
    'dodatkowe osiągnięcia liczone do stypendiów (nie tylko uczelnianych) – praktycznie każdy nasz członek, spełniający podstawowe warunki aplikacji otrzymuje Stypendium Rektora PŁ',
    'doświadczenie i umiejętności, które wzbogacą twoje CV',
    'możliwość implementacji swoich projektów w realnych konstrukcjach, a nie tylko na symulacji',
    'możliwość rozwoju swoich pasji',
    'kontakt z osobami, które studiują na wyższych semestrach twojego kierunku (szczególnie przydatne w sesji)',
    'a jeśli myślisz o nauce na poważnie to z pewnością zainteresuje cię możliwość pozyskiwania grantów razem z nami i dodatkowe atuty w rekrutacji np. na doktorat',
  ],
  expectations: [
    'chęci do pracy i nauki',
    'zaangażowania w działalność zespołu – obecność na cotygodniowym zebraniu działu/zespołu',
    'zaangażowania w prace nad pojazdami – zarówno przy bieżących projektach, jak i podczas przygotowań do wydarzeń PR',
    'zaangażowania w wydarzenia, w których zespół bierze udział (m.in. Finały WOŚP w Manufakturze, gry terenowe, pikniki naukowe, targi branżowe)',
    'ciekawości – nie bój się pytać jeśli coś jest dla Ciebie niejasne',
    'komunikatywności (rozumiemy różne sytuacje – sami jesteśmy studentami i wiemy jak jest – ale oczekujemy informacji o nieobecności, o braku możliwości dokończenia zadania lub opóźnienia – my też mamy określone terminy i chcemy mieć możliwość reakcji na wszystkie zdarzenia losowe)',
    'znajomości języka obcego na poziomie min. B2',
  ],
  departments: [
    {
      title: 'Dział Mechaniczny',
      text: `Jeśli lubisz majsterkować i chcesz rozwijać swoje umiejętności, albo zawsze chciałeś nauczyć się pracy z podstawowymi narzędziami to ten dział jest zdecydowanie dla Ciebie!

Poza obowiązkami w zakresie utrzymania pojazdów w dobrym stanie technicznym będziesz projektował nowe części, układy i elementy funkcjonalne bolidów a także modernizował istniejące. Nauczysz się obsługi programów CAD/CAM (aktualnie bazujemy na Autodesk Inventor oraz Fusion), obsługi narzędzi ręcznych, elektrycznych, obrabiarek konwencjonalnych i CNC. Będziesz miał możliwość zdobycia doświadczenia w zakresie projektowania procesu wytwarzania, researchu naukowego, czy analiz numerycznych w oprogramowaniu takim jak ANSYS czy AVL.

Będziesz miał możliwość wzięcia udziału w certyfikowanych szkoleniach i kursach wewnętrznych.`,
      image: '/images/20221223-115530_resize-1024x682.jpg',
      imageClassName: 'aspect-[463/308]',
    },
    {
      title: 'Dział Elektroniczny',
      text: `Jeśli układy elektroniczne nie mają dla Ciebie tajemnic i chcesz rozwijać swoje umiejętności, albo zawsze chciałeś nauczyć się podstaw elektroniki to szukamy właśnie Ciebie!

Poza obowiązkami w zakresie utrzymania pojazdów w dobrym stanie technicznym będziesz projektował nowe układy i modernizował istniejące. Nauczysz się obsługi programów CAD/CAM (KiCAD, Autodesk Inventor, Fusion), lutowania, tworzenia układów elektronicznych i płytek PCB. Będziesz miał możliwość zdobycia doświadczenia w zakresie projektowania układów elektronicznych, czy researchu naukowego.

Będziesz miał możliwość wzięcia udziału w certyfikowanych szkoleniach i kursach wewnętrznych.`,
      image: '/images/20221006-211817_resize-1024x682.jpg',
      imageClassName: 'aspect-[463/308]',
    },
    {
      title: 'Dział Programistyczny',
      text: `Jeśli nie boisz się programistycznych wyzwań to zapraszamy Cię do zasilenia szeregów naszego Działu Programistycznego!

Poza tworzeniem, modyfikacją i utrzymaniem systemów telemetrycznych obu pojazdów będziesz tworzył stronę www zespołu, a także aplikacje ułatwiające bieżącą działalność zespołu. Nauczysz się integrowania systemów informatycznych z układami elektronicznymi oraz programowania mikrokontrolerów takich jak Rapsberry czy Arduino. Będziesz miał możliwość zdobycia doświadczenia nie tylko w programowaniu, ale także w analizie danych czy prowadzeniu badań.

Będziesz miał możliwość wzięcia udziału w certyfikowanych szkoleniach i kursach wewnętrznych.`,
      image: '/images/team-4.jpg',
      imageClassName: 'aspect-video',
    },
    {
      title: 'Marketing/PR/Współpraca zewnętrzna',
      text: `Jeśli masz w sobie coś z artysty, a twoją pasją jest fotografia, film czy grafika komputerowa, zawsze chciałeś sprawdzić swoich sił w zarządzaniu social mediami, albo chciałbyś spróbować swoich sił w kontakcie z firmami. To zapraszamy do zaangażowania się w działalność tej sekcji Iron Warriors!

Będziesz tworzył grafiki i filmy (zarówno dłuższe formy, jak i te krótkie) do naszych social mediów, współpracował z Działem Programistycznym w tworzeniu strony www, tworzył gadżety i materiały promocyjne zespołu.

Zadbasz także o współprace zewnętrzne – zapewniając finansowanie kolejnych projektów i usprawniając prace. Będziesz kontaktował się z obecnymi i potencjalnymi partnerami.

Ponadto będziesz dbał o wizerunek zespołu w tradycyjnych mediach – udzielając wywiadów, tworząc treści publikowane w drukowanych i internetowych czasopismach.`,
      image: '/images/eco-arrow-3-4.jpg',
      imageClassName: 'aspect-video',
    },
    {
      title: 'Kierowcy',
      text: `Kierowca w naszym zespole to bardzo szczególna rola. Wymaga przede wszystkim odpowiednich parametrów fizycznych, a przede wszystkim:

wzrostu: 150-160 cm
masy: około 50 kg

Ale są wyjątki. Do naszego Eco Arrow 2 Electric na zawody Albi Eco Race potrzebujemy kogoś trochę cięższego – wymagania:

wzrost: do 180 cm
masy: około 70 kg

Podczas kontroli technicznej testowany jest emergency exit w czasie poniże 10 s, więc ważne jest utrzymanie dobrej sprawności fizycznej. Ponadto kierowca musi nie mieć przeciwwskazań do prowadzenia pojazdów – niektórzy organizatorzy wymagają prawa jazdy kat. B, inni corocznych badań lekarskich (badania finansowane są przez SKN). Ze względu na regulamin oraz przepisy dotyczące jazdy wymagany jest dobry słuch.`,
      image: '/images/team-5.jpg',
      imageClassName: 'aspect-video',
    },
  ],
}
