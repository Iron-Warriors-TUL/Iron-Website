// Domyślna treść stron, która do czasu wprowadzenia CMS-u była na sztywno
// w komponentach. Wartości są kopiowane 1:1 — registry używa ich jako fallbacku.

export const aboutTop = `Jesteśmy Rekordzistami Polski, grupą młodych, ambitnych studentów Politechniki Łódzkiej, robiących coś ponadprzeciętnego, a przede wszystkim wykorzystujących w praktyce wiedzę zdobywaną na studiach.

Jesteśmy najszybciej rozwijającą się polską drużyną startującą w zawodach typu eco-marathon.`

export const aboutLeft = `W ciągu 14 lat zbudowaliśmy trzy bolidy i osiągnęliśmy naprawdę wiele m.in. zajęliśmy 1. miejsce podczas zawodów Educ Eco we Francji czy dwukrotnie ustanowiliśmy Rekord Polski w jeździe na kropelkę benzyny – 837 km w przeliczeniu na 1 l benzyny.

Od 2022 roku pracujemy także nad pojazdem elektrycznym, powstałym na bazie Eco Arrow 2. W ten sposób staliśmy się jedyną w Polsce drużyną mogącą startować w kategorii pojazdów prototypowych napędzanych silnikiem elektrycznym. W 2026 roku udało nam się natomiast ustanowić Rekord Polski w kategorii pojazdów zasilanych energią elektryczną – 2267 km w przeliczeniu na 1 l benzyny.`

export const aboutRight = `Ciągle dążymy do łamania barier, dlatego aktualnie pracujemy nad modernizacją bolidów w zakresie elektryki i silników. Dzięki szkoleniom możemy rozwijać nasze umiejętności, dzięki którym możemy uzyskiwać coraz lepsze wyniki poprzez projektowanie nowych rozwiązań czy całych pojazdów. Szkolenia te dotyczą zarówno obsługi programów do projektowania 3D, analiz numerycznych, jak i interpretacji uzyskiwanych wyników. Naszym pojazdem Eco Arrow 3 pragniemy przekroczyć granicę 1000 km przejechanych w przeliczeniu na jeden litr benzyny, a Eco Arrow 2 Electric – wprowadzić na zawody Shell Eco-marathon.

Poza działalnością związaną z budową oraz ulepszaniem naszych pojazdów, działamy także na polu naukowym, tworząc publikacje naukowe. Bierzemy udział również w wielu konferencjach międzynarodowych, na które umożliwiają nam prezentowanie naszych osiągnięć. Odwiedziliśmy już m.in. Cambridge, Melbourne, Helsinki czy Bangkok.`

export const aboutGallery = [
  '/images/team-7.jpg', '/images/team-1.jpg', '/images/team-2.jpg', '/images/team-3.jpg',
  '/images/team-4.jpg', '/images/team-5.jpg', '/images/team-6.jpg', '/images/team-7.jpg',
]

export const homeStats = [
  { label: 'Członków zespołu', value: '34', unit: '' },
  { label: 'Kategoria Prototype ICE', value: '837', unit: 'km/l' },
  { label: 'Kategoria Prototype Battery Electric', value: '2267', unit: 'km/l SP95' },
  { label: 'Bolidy', value: '3', unit: '' },
]

export type HomeVehicleContent = {
  heading: string
  stats: { label: string; value: string; unit: string }[]
  text: string
  gallery: string[]
  background: string
}

export const homeVehicles: Record<string, HomeVehicleContent> = {
  'eco-arrow-3': {
    heading: 'Eco Arrow 3.1',
    background: '/images/eco-arrow-3-4.jpg',
    stats: [
      { label: 'Moc silnika', value: '1.6', unit: 'KM' },
      { label: 'Moment obrotowy', value: '2.1', unit: 'Nm' },
      { label: 'Waga bolidu', value: '46', unit: 'kg' },
      { label: 'Prędkość maksymalna', value: '50', unit: 'km/h' },
    ],
    text: `Trzeci pojazd zespołu miał swoją premierę 12 stycznia 2018 w Łódzkiej Manufakturze. Pierwszy oficjalny start nowego pojazdu Eco Arrow 3.0 przypadł na zawody Educ Eco 2018 we francuskim Valenciennes. Zespół ukończył je z wynikiem 616 km/l paliwa i wygrał zawody w kategorii prototypów zasilanych benzyną. Następnie bolid wystartował w zawodach Shell Eco-marathon France 2018 w Paryżu, które ukończył na najwyższym stopniu podium zwynikiem 643 km/l będąc najlepszą drużyną w kategorii Prototype Gasoline. Zawody Shell Eco-marathon 2024 stanowią kolejny przełomowy moment w historii modyfikacji naszej trzeciej strzały, w tej edycji po raz pierwszy z sukcesem zadebiutował nowy układ elektryczny pojazdu oparty na płytce PCB, stworzonej w całości przez dział elektryczny zespołu.

Aktualnie głównym celem rozwoju projektu Eco Arrow 3 jest przekroczenie bariery 1000 km/l benzyny.`,
    gallery: ['/images/eco-arrow-3-6.jpg', ...[1, 2, 3, 4, 5, 6].map((n) => `/images/eco-arrow-3-${n}.jpg`)],
  },
  'eco-arrow-2-electric': {
    heading: 'Eco Arrow 2 Electric',
    background: '/images/eco-arrow-2-electric-6.jpg',
    stats: [
      { label: 'Moc silnika', value: '1.35', unit: 'kW' },
      { label: 'Waga bolidu', value: '42', unit: 'kg' },
      { label: 'Prędkość maksymalna', value: '50', unit: 'km/h' },
    ],
    text: `Elektryczna wersja pojazdu Eco Arrow 2 miała swoją premierę podczas zawodów Albi Eco Race 2023. Pierwszy oficjalny start pojazdu Eco Arrow 2 Electric był udany i zapewnił Zespołowi ostatni stopień podium i 4. miejsce w klasyfikacji pojazdów. Kolejny rok stanowił jeszcze większy sukces – zespół zajął II miejsce w klasyfikacji generalnej, zyskując tytuł Wicemistrzów Europy. Rok 2025 był przełomowy – po raz pierwszy Zespół wystartował swoim elektrycznym pojazdem w typowym eco-marathonie, przywracając drugą wersję strzały do tej konkurencji. Podczas tego debiutu na zawodach Challenge EcoGreen Energy pojazd zajął V miejsce w kategorii Prototype Battery Electric, ustanawiając jednocześnie Rekord Polski – 2112 km/l (w przeliczeniu na benzynę). Rok później zespół pobił go z wynikiem – 2267 km/l.

Aktualnie głównym celem rozwoju projektu Eco Arrow 2 Electric jest start w zawodach Shell Eco-marathon.`,
    gallery: [
      '/images/team-6.jpg', '/images/eco-arrow-2-electric-6.jpg', '/images/eco-arrow-2-electric-5.jpg',
      '/images/eco-arrow-2-electric-4.jpg', '/images/eco-arrow-2-electric-2.jpg', '/images/eco-arrow-2-electric-1.jpg',
      '/images/team-6.jpg',
    ],
  },
}

export const footerSocials = [
  { label: 'Facebook', href: 'https://www.facebook.com/IronWarriorsTeam/', icon: 'facebook' },
  { label: 'Instagram', href: 'https://www.instagram.com/ironwarriors_plodz/', icon: 'instagram' },
  { label: 'Youtube', href: 'https://www.youtube.com/user/IronWarriorsTV', icon: 'youtube' },
  { label: 'Linkedin', href: 'https://www.linkedin.com/company/75473763/', icon: 'linkedin' },
]

export const footerAddress = `Politechnika Łódzka
Instytut Maszyn Przepływowych
ul. Wólczańska 217/221
93-005 Łódź`

export const footerCopyright = 'Copyright © 2026 Iron Warriors'

export const vehicleLayout: Record<
  string,
  { gallery: string[]; heroAspect: string; achievementRows: string }
> = {
  'eco-arrow-3': {
    gallery: [1, 2, 3, 4, 5, 6].map((n) => `/images/eco-arrow-3-${n}-1024x576.jpg`),
    heroAspect: 'aspect-[2560/1006]',
    achievementRows: '3,4,4',
  },
  'eco-arrow-2-electric': {
    gallery: [2, 3, 4, 5, 6].map((n) => `/images/eco-arrow-2-electric-${n}-1024x576.jpg`),
    heroAspect: 'aspect-[2000/789]',
    achievementRows: '2,4',
  },
  'eco-arrow-2': {
    gallery: [1, 2, 3, 4].map((n) => `/images/eco-arrow-2-${n}-1024x576.jpg`),
    heroAspect: '',
    achievementRows: '4,4',
  },
  'eco-arrow-1': {
    gallery: [
      '/images/eco-arrow-1-1-1024x577.jpg',
      ...[2, 3].map((n) => `/images/eco-arrow-1-${n}-1024x576.jpg`),
    ],
    heroAspect: '',
    achievementRows: '1',
  },
}

export const vehiclesPage = {
  heading: 'Bolidy',
  background: '/images/eco-arrow-3-3.jpg',
  moreLabel: 'Zobacz więcej',
  summaries: [
    ['eco-arrow-3', 'Eco Arrow 3 to trzeci pojazd stworzony w 2018 roku przez studentów Politechniki Łódzkiej. Na jednym litrze benzyny przejechał m. in. 616 km podczas zawodów EducEco, a następnie 643 km na Shell Eco-marathon France 2018 w Paryżu. Oba starty zespół ukończył na najwyższym stopniu podium w kategorii prototypów zasilanych benzyną.'],
    ['eco-arrow-2-electric', 'Eco Arrow 2 Electric to najnowsza konstrukcja, wykorzystująca zbudowany w 2014 roku bolid Eco Arrow 2. Wyróżnia się on zastosowaniem silnika elektrycznego, w przeciwieństwie do pozostałych bolidów spalinowych. Odnowiony Eco Arrow 2 zaliczył swoją premierę w maju 2023 na zwodach Albi Eco Race we Francji.'],
    ['eco-arrow-2', 'Eco Arrow 2 to drugi pojazd całkowicie stworzony przez studentów Politechniki Łódzkiej. Budowę bolidu zakończono w 2014 roku. Zmodernizowany w 2015 roku na Eco Arrow 2.1, a w 2016 roku na Eco Arrow 2.2. Na jednym litrze benzyny przejechał 837 km podczas zawodów Pisaralla Pisimmälle 2016 w Nokii. Tym wynikiem zespół ustanowił rekord Polski.'],
    ['eco-arrow-1', 'Eco Arrow 1 to pierwszy pojazd zaprojektowany i zbudowany przez Iron Warriors, który zadebiutował w 2013 roku. Na jednym litrze benzyny przejechał 150 km podczas zawodów Shell Eco-marathon w Rotterdamie.'],
  ],
  galleries: [
    ...[1, 2, 3, 4, 5, 6].map((n) => ['eco-arrow-3', `/images/eco-arrow-3-${n}-1024x576.jpg`]),
    ...[1, 2, 3, 4, 5, 6].map((n) => ['eco-arrow-2-electric', `/images/eco-arrow-2-electric-${n}-1024x576.jpg`]),
    ...[1, 2, 3, 4].map((n) => ['eco-arrow-2', `/images/eco-arrow-2-${n}-768x432.jpg`]),
    ['eco-arrow-1', '/images/eco-arrow-1-1-1024x577.jpg'],
    ['eco-arrow-1', '/images/eco-arrow-1-2-1024x576.jpg'],
    ['eco-arrow-1', '/images/eco-arrow-1-3-1024x576.jpg'],
  ],
}

export const becomePartnerPage = {
  title: 'Zostań partnerem',
  image: '/images/team-2.jpg',
  text: 'Jesteś zainteresowany współpracą z naszym projektem? Zapraszamy do zapoznania się z naszą ofertą sponsorską lub bezpośredniego kontaktu z naszym zespołem. Po wstępnym ustaleniu formy oraz po określeniu kwoty, jaką chcesz przeznaczyć na wsparcie dla naszego zespołu, będziemy mieli możliwość przedstawienia przykładowej umowy zawieranej pomiędzy zespołem a sponsorem. Jeśli forma czy wysokość wsparcia, jakie chcesz nam zaoferować odbiega od tych prezentowanych w ofercie sponsorskiej, prosimy o kontakt, celem omówienia współpracy. Widoczność w mediach – nie tylko tych regionalnych – jest dla nas równie ważna, co pomoc finansowa. Zatem zachęcamy do kontaktu również w tym zakresie.',
  offerLabel: 'Oferta sponsorska',
  contactLabel: 'Kontakt',
  contactHref: '/kontakt',
}

export const joinCta = {
  videoId: 'wHd4UsA3T2k',
  start: '3',
  end: '22',
  poster: '/images/eco-arrow-3-2.jpg',
  heading: 'Dołącz do nas!',
  memberLabel: 'Zostań członkiem',
  memberHref: '/dolacz-do-nas',
  partnerLabel: 'Zostań partnerem',
  partnerHref: '/zostan-partnerem',
}

export const contactPage = {
  title: 'Kontakt',
  background: '/images/78_full-scaled.jpg',
  photo: '/images/Wozniak-Aleksandra.jpg',
  photoAlt: 'Aleksandra Woźniak',
  name: 'Aleksandra Woźniak',
  role: 'Koordynator Działu Marketingu',
  email: 'kontakt.ironwarriors@info.p.lodz.pl',
  sponsorText: 'Jesteś zainteresowany współpracą z naszym projektem? Zapraszamy do przejrzenia naszej oferty sponsorskiej lub bezpośredniego kontaktu z naszym zespołem.',
  sponsorButtonLabel: 'Oferta sponsorska',
}

export const recruitmentPage = {
  heroImage: '/images/eco-arrow-3-3.jpg',
  heroOverlay: 'bg-white/92',
  formLabel: 'FORMULARZ REKRUTACYJNY',
  heading: 'Dołącz do nas!',
  gainsHeading: 'Co zyskujesz?',
  expectationsHeading: 'Czego oczekujemy?',
  gainsImage: '/images/eco-arrow-2-electric-2.jpg',
  gainsImageAlt: 'Eco Arrow 2 Electric',
  expectationsImage: '/images/eco-arrow-3-6.jpg',
  expectationsImageAlt: 'Eco Arrow 3',
}
