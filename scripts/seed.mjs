import pg from 'pg'

for (const envFile of ['.env.local', '.env']) {
  try {
    process.loadEnvFile(envFile)
  } catch {
    // plik opcjonalny
  }
}

if (!process.env.DATABASE_URL) {
  console.error('Ustaw DATABASE_URL w .env.local (zobacz .env.example).')
  process.exit(1)
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

const nav = [
  { label: 'Strona główna', href: '/', children: [] },
  {
    label: 'Zespół', href: '/zespol-2025-2026', children: [
      { label: 'Zespół 2025/2026', href: '/zespol-2025-2026' },
      { label: 'Zespół 2024/2025', href: '/zespol-2024-2025' },
      { label: 'Zespół 2023/2024', href: '/zespol-2023-2024' },
      { label: 'Zespół 2022/2023', href: '/zespol-2022-2023' },
    ],
  },
  {
    label: 'Bolidy', href: '/bolidy', children: [
      { label: 'Eco Arrow 3', href: '/eco-arrow-3' },
      { label: 'Eco Arrow 2 Electric', href: '/eco-arrow-2-electric' },
      { label: 'Eco Arrow 2', href: '/eco-arrow-2' },
      { label: 'Eco Arrow 1', href: '/eco-arrow-1' },
    ],
  },
  {
    label: 'Projekty', href: '/projekty', children: [
      { label: 'MNiSW', href: '/projekty-mnisw' },
      { label: 'Rada Kół Naukowych PŁ', href: '/rada-kol-naukowych-pl' },
      { label: 'Fundacja PŁ', href: '/projekty-fundacja-pl' },
      { label: 'Miasto Łódź', href: '/projekty-miasto-lodz' },
    ],
  },
  {
    label: 'Partnerzy', href: '/partnerzy-2026', children: [
      { label: 'Partnerzy 2026', href: '/partnerzy-2026' },
      { label: 'Partnerzy 2025', href: '/partnerzy-2025' },
      { label: 'Partnerzy 2024', href: '/partnerzy-2024' },
      { label: 'Partnerzy 2023', href: '/partnerzy-2023' },
      { label: 'Zostań partnerem', href: '/zostan-partnerem' },
    ],
  },
  { label: 'Kontakt', href: '/kontakt', children: [] },
  { label: 'Dołącz do nas', href: '/dolacz-do-nas', isButton: true, children: [] },
]

const vehicles = [
  {
    slug: 'eco-arrow-3', name: 'Eco Arrow 3', debut: 2018, image: '/images/eco-arrow-3-crop.jpg', featured: true,
    description: 'Eco Arrow 3 to trzeci pojazd zbudowany przez studentów. Premiera pojazdu odbyła się 12 stycznia 2018 roku w Łódzkiej Manufakturze. Debiut nowego pojazdu Eco Arrow 3.0 odbył się na zawodach EducEco w 2018 roku we francuskim Valenciennes. Z wynikiem 616 km/l paliwa zespół zajął pierwsze miejsce w kategorii prototypów zasilanych benzyną. W tym samym roku zespół wystartował w zawodach Shell Eco-marathon France 2018 w Paryżu, które ukończył na najwyższym stopniu podium w kategorii Prototype Gasoline z wynikiem 643 km/l. Ostatnimi startami po dłuższej przerwie były zawody Shell Eco-marathon Europe & Africa 2022 oraz Shell Eco-marathon Europe & Africa 2023 w Nogaro we Francji. Shell Eco-marathon Europe & Africa 2024 stanowi przełomowy moment w historii pojazdu – podczas tej edycji zawodów zadebiutował on z sukcesem z zupełnie nowym układem elektrycznym, którego serce stanowi zaprojektowana i wykonana przez nas płytka PCB. Ponadto po raz pierwszy organizatorzy zaczęli odliczać zużytą energię elektryczną od uzyskanego wyniku.',
    goal: 'Aktualnie głównym celem rozwoju projektu Eco Arrow 3 jest przekroczenie bariery 1000 km/l benzyny.',
    specs: [
      ['Debiut', '2018'], ['Typ nadwozia', 'Samonośne (bezramowe)'], ['Silnik', 'Honda GX35'], ['Jednostka sterująca', 'Ecumaster EMU Black'],
      ['Rodzaj wtrysku', 'Elektroniczny, pośredni'], ['Zapłon', 'Elektroniczny'], ['Paliwo', 'Benzyna PB95'], ['Pojemność baku paliwa', '30 ml'],
      ['Koła', '3 (2 przednie skrętne, 1 tylne)'], ['Opony', 'Michelin 45/75 R16 Prototype Tires'], ['Długość', '280 cm'], ['Szerokość', '60 cm'], ['Wysokość', '50 cm'],
    ],
    stats: [
      ['Moc silnika', '1.6', 'KM'], ['Moment obrotowy', '1.3', 'Nm'], ['Prędkość maksymalna', '50', 'km/h'], ['Waga bolidu', '46', 'kg'],
    ],
    achievements: [
      ['Shell Eco-marathon Europe 2026', 'Kamień Śląski, Polska', '13. miejsce – 674 km/l kategoria Prototype ICE', 'pl'],
      ['Shell Eco-marathon Europe 2025', 'Kamień Śląski, Polska', 'Pomyślne przejście kontroli technicznej kategoria Prototype ICE', 'pl'],
      ['Shell Eco-marathon Europe & Africa 2024', 'Nogaro, Francja', '15. miejsce – 482 km/l (558 km/l przed uwzględnieniem zużytej energii elektrycznej) kategoria Prototype ICE', 'fr'],
      ['Shell Eco-marathon Europe & Africa 2023', 'Nogaro, Francja', 'Pomyślne przejście kontroli technicznej kategoria Prototype ICE', 'fr'],
      ['Shell Eco-marathon Europe & Africa 2022', 'Nogaro, Francja', 'Pomyślne przejście kontroli technicznej kategoria Prototype ICE', 'fr'],
      ['Shell Eco-marathon Europe 2019', 'Londyn, Wielka Brytania', 'I miejsce – 716 km/l kategoria Prototype ICE', 'gb'],
      ['EducEco Challenge 2019', 'Valenciennes, Francja', 'II miejsce – 647 km/l kategoria Prototype SP95', 'fr'],
      ['Pisaralla Pisimmälle 2018', 'Nokia, Finlandia', 'IV miejsce – 713 km/l kategoria Small Engine Gasoline', 'fi'],
      ['Shell Eco-marathon Europe 2018', 'Londyn, Wielka Brytania', '620 km/l kategoria Prototype ICE', 'gb'],
      ['Shell Eco-marathon Challenger France 2018', 'Paryż, Francja', 'I miejsce – 643 km/l kategoria Prototype ICE', 'fr'],
      ['EducEco Challenge 2018', 'Valenciennes, Francja', 'I miejsce – 616 km/l kategoria Prototype SP95', 'fr'],
    ],
    best: '716 km/l',
  },
  {
    slug: 'eco-arrow-2-electric', name: 'Eco Arrow 2 Electric', debut: 2023, image: '/images/eco-arrow-2-electric-crop.jpg', featured: true,
    description: 'W związku z rozwiązaniem się organizacji odpowiedzialnej za zawody Educ Eco, a jednocześnie powstaniem nowych zawodów Albi Eco Race, przeznaczonych dla pojazdów elektrycznych, narodził się pomysł reaktywacji pojazdu Eco Arrow 2. W Eco Arrow 1 odkryliśmy porzucony pomysł implementacji silnika elektrycznego i w listopadzie 2022 roku rozpoczęliśmy prace – tak powstał Eco Arrow 2 Electric. Karoseria oraz układy kierowniczy i hamulcowy pozostały niezmienione względem spalinowej wersji, jednakże od nowa stworzyliśmy wiązkę elektryczną, a znacznym zmianom musiała ulec dawna komora silnika oraz układ napędowy. Należało usunąć zbędne elementy oraz zaprojektować nowe, takie jak mocowanie baterii czy tylnego koła. Nową odsłonę Eco Arrow 2 napędza silnik elektryczny umiejscowiony w piaście tylnego koła. Odnowiony Eco Arrow 2 zaliczył swoją premierę w maju 2023 na zawodach Albi Eco Race we Francji, podczas których zajęliśmy IV miejsce oraz otrzymaliśmy specjalne wyróżnienie. Już rok później podczas tego konkursu poprawiliśmy swój wynik, zajmując II miejsce. W sezonie 2025 po dokonaniu niezbędnych modyfikacji i wzięliśmy udział także w zawodach Challenge EcoGreen Energy. Zawody te są powrotem naszego Eco Arrow 2 do klasycznej formuły eco-marathonu. I mamy Rekord Polski, tym razem w kategorii Prototype Battery Electric! Uważamy to za nasz mały sukces – wkrótce określimy kierunki rozwoju na następny sezon.',
    goal: 'Aktualnie głównym celem rozwoju projektu Eco Arrow 2 Electric jest start w zawodach Shell Eco-marathon.',
    specs: [
      ['Debiut', '2023'], ['Typ nadwozia', 'Samonośne (bezramowe)'], ['Silnik', 'W piaście tylnego koła'], ['Jednostka sterująca', 'Go-FOC G300'],
      ['Akumulator', 'Li-Ion 13S6P'], ['Pojemność akumulatora', '0,5 kWh'], ['Koła', '3 (2 przednie skrętne, 1 tylne)'],
      ['Opony', 'Michelin 45/75 R16 Prototype Tires'], ['Długość', '320 cm'], ['Szerokość', '75 cm'], ['Wysokość', '70 cm'],
    ],
    stats: [
      ['Moc silnika', '1.35', 'kW'], ['Prędkość maksymalna', '50', 'km/h'], ['Waga bolidu', '42', 'kg'],
    ],
    achievements: [
      ['Challenge EcoGreen Energy 2026', 'Nantes, Francja', 'III miejsce 2267 km/l SP 95 kategoria Battery Electric', 'fr'],
      ['Albi Eco Race 2026', 'Albi, Francja', 'XI miejsce kategoria Battery Electric', 'fr'],
      ['Albi Eco Race 2025', 'Albi, Francja', 'XI miejsce kategoria Battery', 'fr'],
      ['Challenge EcoGreen Energy 2025', 'Nantes, Francja', 'V miejsce 2112 km/l SP 95 (233,7 km/kWh) kategoria Battery Electric', 'fr'],
      ['Albi Eco Race 2024', 'Albi, Francja', 'II miejsce kategoria Battery', 'fr'],
      ['Albi Eco Race 2023', 'Albi, Francja', 'IV miejsce (wyróżnienie) kategoria Batter', 'fr'],
    ],
    best: '2267 km/l',
  },
  {
    slug: 'eco-arrow-2', name: 'Eco Arrow 2', debut: 2014, image: '/images/eco-arrow-2-1.jpg', featured: false,
    description: 'Eco Arrow 2 to druga generacja pojazdu o minimalnym zużyciu paliwa, który w 2014 roku, po całym roku projektowania i budowy, zastąpił pojazd Eco Arrow 1.0. Debiut bolidu przypadł w 2014 roku na zawodach Shell Eco-marathon w Rotterdamie. Od tamtego czasu pojazd Eco Arrow 2 był stale udoskonalany. W 2015 roku na zawodach Shell Eco-marathon w Rotterdamie oraz Pisaralla Pisimmälle w Nokii wystartowała jego zmodernizowana wersja Eco Arrow 2.1. Warto wspomnieć, że podczas zawodów Pisaralla Pisimmälle został pobity rekord Polski w „jeździe na kropelce”. Bolid Eco Arrow 2.1 uzyskał wynik aż 830 km/l! Przez kolejny rok pojazd przeszedł kolejne modyfikacje i w 2016 jako Eco Arrow 2.2 wziął udział w zawodach: Shell Eco-marathon w Le mans, EducEco w Valenciennes, Shell Eco-marathon w Londynie oraz Pisaralla Pisimmälle w Nokii. Był to dla zespołu pracowity rok, ponieważ pierwszy raz w historii wystartowali w czterech zawodach w ciągu jednego roku. Należy również podkreślić, że podczas zawodów Pisaralla Pisimmälle zespół z wynikiem 837 km/l paliwa, ponownie ustanowił rekord Polski, który do dziś pozostaje naszym najlepszym rezultatem.',
    goal: '',
    specs: [
      ['Debiut', '2014'], ['Typ nadwozia', 'Samonośne (bezramowe)'], ['Silnik', 'Honda GX35'], ['Jednostka sterująca', 'Ecumaster EMU'],
      ['Rodzaj wtrysku', 'Elektroniczny, pośredni'], ['Zapłon', 'Elektroniczny'], ['Paliwo', 'Benzyna PB95'], ['Pojemność baku paliwa', '150 ml'],
      ['Koła', '3 (2 przednie skrętne, 1 tylne)'], ['Opony', 'Michelin 45/75 R16 Prototype Tires'], ['Długość', '320 cm'], ['Szerokość', '75 cm'], ['Wysokość', '70 cm'],
    ],
    stats: [
      ['Moc silnika', '1.6', 'KM'], ['Moment obrotowy', '1.3', 'Nm'], ['Prędkość maksymalna', '45', 'km/h'], ['Waga bolidu', '42', 'kg'],
    ],
    achievements: [
      ['Pisaralla Pisimmälle 2017', 'Nokia, Finlandia', 'V miejsce – 688 km/l kategoria Small Engine Gasoline', 'fi'],
      ['Pisaralla Pisimmälle 2016', 'Nokia, Finlandia', 'V miejsce – 837 km/l kategoria Small Engine Gasoline', 'fi'],
      ['Shell Eco-marathon Europe 2016', 'Londyn, Wielka Brytania', '471 km/l kategoria Prototype Gasoline', 'gb'],
      ['EducEco Challenge 2016', 'Valenciennes, Holandia', 'I miejsce – 489 km/l kategoria Prototype SP95', 'fr'],
      ['Shell Eco-marathon Challenger France 2016', 'Le Mans, Francja', '492 km/l kategoria Prototype Gasoline', 'fr'],
      ['Pisaralla Pisimmälle 2015', 'Nokia, Finlandia', 'VI miejsce – 830 km/l kategoria Small Engine Motor Petrol', 'fi'],
      ['Shell Eco-marathon Europe 2015', 'Rotterdam, Holandia', '640 km/l kategoria Prototype Gasoline', 'nl'],
      ['Shell Eco-marathon Europe 2014', 'Rotterdam, Holandia', '259 km/l kategoria Prototype Gasoline', 'nl'],
    ],
    best: '837 km/l',
  },
  {
    slug: 'eco-arrow-1', name: 'Eco Arrow 1', debut: 2013, image: '/images/eco-arrow-1-1.jpg', featured: false,
    description: 'W 2012 roku studenci rozpoczęli pierwszy na Politechnice Łódzkiej projekt budowy pojazdu, który miał charakteryzować się jak najniższym zużyciem paliwa. Prace obejmowały zaprojektowanie całego bolidu: od pojedynczych układów, przez ich połączenie po ramę oraz karoserię. Budowa trwała rok i zwieńczona została debiutem pojazdu oraz całego Zespołu na zawodach Shell Eco-marathon w Rotterdamie w 2013 roku. Na jednym litrze benzyny Eco Arrow 1 podczas swojego pierwszego konkursu przejechał 150 kilometrów. Był to pierwszy, a zarazem ostatni występ bolidu Eco Arrow 1 na międzynarodowych zawodach. Iron Warriors zainspirowani pierwszym sukcesem postanowili bowiem stworzyć nową wersję pojazdu. Zawody pozwoliły na zapoznanie się z rozwiązaniami stosowanymi przez inne zespoły oraz uwypukliły błędy popełnione podczas projektu oraz budowy pierwszego tego typu pojazdu. Studenci nauczeni doświadczeniem zaprojektowali od podstaw nowy pojazd – Eco Arrow 2.',
    goal: '',
    specs: [
      ['Debiut', '2013'], ['Typ nadwozia', 'Ramowe (nieniosące)'], ['Silnik', 'Honda GX25'], ['Jednostka sterująca', 'Konstrukcja własna'],
      ['Rodzaj wtrysku', 'Elektroniczny, pośredni'], ['Zapłon', 'Elektroniczny'], ['Paliwo', 'Benzyna PB95'], ['Pojemność baku paliwa', '150 ml'],
      ['Koła', '3 (2 przednie skrętne, 1 tylne)'], ['Opony', 'Michelin 45/75 R16 Prototype Tires'], ['Długość', '270 cm'], ['Szerokość', '65 cm'], ['Wysokość', '60 cm'],
    ],
    stats: [
      ['Moc silnika', '1', 'KM'], ['Moment obrotowy', '1', 'Nm'], ['Prędkość maksymalna', '50', 'km/h'], ['Waga bolidu', '40', 'kg'],
    ],
    achievements: [['Shell Eco-marathon 2013', 'Rotterdam, Holandia', '150 km/l kategoria Prototype Gasoline', 'nl']],
    best: '150 km/l',
  },
]

const projImgs = {
  fers: '/images/FERS_RP_UE_RGB-1-scaled-rr2jk3frr6agsq30ibchu761hbht1gf643ekp3od8g.png',
  znaki: '/images/znaki_strona_www-q8wsp3xqs0em356baxgmhsgv9uybgyrfxx5edqh4ow.png',
  skn: '/images/mein_studenckie_kola_naukowe_tworza_innowacje_logo-q8wspiz5tcz78wkgv3ynloo8s0w6w4f5bzl625utxc.png',
  fundacja: '/images/logo-fundacja-politechniki-lodzkiej-1000px-q4q1kihv2okpyckxebk80e6tfhbojn7y5k1k4lauww.png',
  rada: '/images/SSPL-stare-logo-rr4nmp5pr58d0u3xzlanyme86r9menhiyx7rul4em8.png',
  lodz2025: '/images/Lodz-Akademicka-2025-kolor-rr48qubzm9oobmgy0gqb0cd8ryfnah6aaohrotn3sw.png',
  lodz2024: '/images/2024.png',
  lodz2023: '/images/2023-rr4a6fp2qwb9l3j0qrl3vbo2lc4xsdzw21l7zl569s.png',
  lodz2022: '/images/2022-rr4a50xshuds65kqz5n94oh6ij348qedv2d02n8fls.png',
}

const hMnisw = 'Dofinansowanie ze środków Budżetu Państwa'
const hFundacja = 'Dofinansowanie ze środków Fundacji PŁ'
const hMiasto = 'Dofinansowanie ze środków Budżetu miasta Łodzi'
const hRada = (n) => `${n}. Konkurs Rady Kół Naukowych Politechniki Łódzkiej`

const projects = [
  ['MNiSW', 'Na przekór schematom – w stronę zielonej przyszłości', 'Wsparcie studentów w zakresie podniesienia ich kompetencji i umiejętności', '322 047,36 zł', null, '322 047,36 zł', '2025-2026',
    'Celem projektu jest udział w dwóch międzynarodowych zawodach superoszczędnych pojazdów. Shell Eco–marathon 2026 pojazdem Eco Arrow 3 oraz Albi Eco Race 2026 pojazdem Eco Arrow 2 Electric. Udział w tych konkursach będzie sprawdzianem prac badawczo – rozwojowych prowadzonych w ramach projektu. Są to konkursy o międzynarodowym zasięgu, ponadto zawody Shell Eco – marathon obejmują cały świat, podzielone są jednak na mniejsze regiony, a Polska klasyfikuje się do części europejsko – afrykańskiej.',
    hMnisw, projImgs.fers],
  ['MNiSW', 'Modernizacja funkcjonalna superoszczędnego pojazdu Eco Arrow 3.1 ', 'Studenckie Koła Naukowe Tworzą Innowacje', '39 300 zł', null, '39 300 zł', '2025-2026',
    'Realizacja projektu „Zwiększenie efektywności energetycznej podzespołów superoszczędnego pojazdu Eco Arrow 3.1” umożliwi walkę o pobicie rekordu Polski w „jeździe na kropelkę” i przekroczenie bariery 1000 km przejechanych na litrze paliwa. Pozwoli także na rozwinięcie nowych rozwiązań technologicznych oraz na prowadzenie badań naukowych w kierunku rozwoju i modernizacji bolidu Eco Arrow 3.1. Ponadto projekt stanowi fazę wstępną do stworzenia kolejnej generacji pojazdu. Przełoży się to bezpośrednio na możliwość podniesienia kompetencji członków Koła Naukowego, uczestniczących aktywnie w realizacji projektu badawczego. W końcowym efekcie przełoży się to na występ podczas międzynarodowych targów automotive.',
    hMnisw, [projImgs.znaki, projImgs.skn].join('\n')],
  ['MNiSW', 'Na przekór schematom – w stronę zielonej przyszłości', 'Wsparcie studentów w zakresie podniesienia ich kompetencji i umiejętności', '299 505,49 zł', null, '299 505,49 zł', '2024-2025',
    'W ramach projektu przeprowadzono prace badawczo – rozwojowe nad silnikiem spalinowym Honda GX35, celem zwiększenia jego efektywności energetycznej i zminimalizowaniu emisji szkodliwych związków. Prace były skupione wokół dwóch głównych zagadnień – optymalizacji termicznej, a także poprawienia parametrów pracy.\n\nW ramach projektu zespół wziął udział w międzynarodowych zawodach Shell Eco-marathon 2025, Albi Eco Race 2025 i Challenge EcoGreen Energy 2025, będący sprawdzianem prac badawczo – rozwojowych prowadzonych w ramach projektu. Są to konkursy o międzynarodowym zasięgu, ponadto zawody Shell Eco – marathon obejmują cały świat, podzielone są jednak na mniejsze regiony, a Polska klasyfikuje się do części europejsko – afrykańskiej.',
    hMnisw, projImgs.fers],
  ['MNiSW', 'Modernizacja systemu elektrycznego bolidu Eco Arrow 3.1 startującego w międzynarodowych zawodach Shell Eco-marathon', 'Studenckie Koła Naukowe Tworzą Innowacje', '64 500 zł', null, '64 500 zł', '2023-2024',
    'Realizacja projektu „Modernizacja systemu elektrycznego bolidu Eco Arrow 3.1 startującego w międzynarodowych zawodach Shell Eco-marathon” umożliwi walkę o pobicie rekordu Polski w „jeździe na kropelkę” i przekroczenie bariery 1000 km przejechanych na litrze paliwa. Pozwoli także na rozwinięcie nowych rozwiązań technologicznych. Pierwszym z realizowanych zadań jest budowa stanowiska do lutowania elementów elektronicznych, spełniająca odpowiednie standardy i wymogi BHP. Stanowisko zostanie wyposażone w odpowiedni sprzęt do wykonywania płytek PCB, lutowania elementów elektronicznych, sprawdzania poprawności wykonanych połączeń i płytek PCB oraz w odpowiedni sprzęt zabezpieczający przed wyładowaniami elektrostatycznymi które mogłyby uszkodzić elektronikę. Stanowisko wyposażone zostanie również w pochłaniacz dymu, filtr powietrza oraz odpowiednie oświetlenie zapewniające odpowiednie warunki do pracy na stanowisku.',
    hMnisw, [projImgs.znaki, projImgs.skn].join('\n')],
  ['MNiSW', 'Budowa hamowni silnikowej oraz badania nad zwiększeniem sprawności silnika bolidu Eco Arrow 3.1', 'Studenckie Koła Naukowe Tworzą Innowacje', '59 445 zł', null, '59 445 zł', '2022-2023',
    'Realizacja projektu „Budowa hamowni silnikowej oraz badania nad zwiększeniem sprawności silnika bolidu Eco Arrow 3.1” umożliwi walkę o pobicie rekordu Polski w „jeździe na kropelkę” i przekroczenie bariery 1000 km przejechanych na litrze paliwa. Pozwoli także na rozwinięcie nowych rozwiązań technologicznych oraz na prowadzenie badań naukowych w kierunku rozwoju i modernizacji jednostki napędowej bolidu Eco Arrow 3.1. Przełoży się to bezpośrednio na możliwość podniesienia kompetencji członków Koła Naukowego, uczestniczących aktywnie w realizacji projektu badawczego. W końcowym efekcie przełoży się to na opracowanie publikacji naukowej, która będzie mogła zostać zaprezentowana na krajowych lub międzynarodowych targach lub konferencjach.',
    hMnisw, [projImgs.znaki, projImgs.skn].join('\n')],

  ['Rada Kół Naukowych PŁ', 'Zastosowanie biokompozytów w celu zwiększenia efektywności energetycznej pojazdu Eco Arrow 3.5', '', '7 500 zł', null, null, '2026',
    'Projekt dotyczy opracowania oraz wykonania elementów karoserii pojazdu Eco Arrow 3.5 z wykorzystaniem materiałów biokompozytowych, w szczególności włókien lnianych oraz biożywic. Głównym celem jest uzyskanie konstrukcji o wysokiej wytrzymałości i sztywności, porównywalnej z tradycyjnymi kompozytami na bazie włókna węglowego, przy jednoczesnym ograniczeniu wpływu na środowisko naturalne.\n\nGłówna część karoserii pojazdu musi być wykonana z kompozytów na bazie włókna węglowego ze względu na bardzo wysokie wymagania dotyczące wytrzymałości, sztywności oraz bezpieczeństwa konstrukcji nośnej. Materiał ten charakteryzuje się wyjątkowo korzystnym stosunkiem wytrzymałości do masy, co jest kluczowe dla zachowania integralności strukturalnej pojazdu przy minimalnej masie pojazdu, a zatem dla osiągania maksymalnej efektywności energetycznej.\n\nPozostałe elementy, takie jak osłony, elementy mocujące oraz komponenty pomocnicze, mogą być natomiast wykonane z biokompozytów na bazie włókien lnianych i biożywic. W tych zastosowaniach wymagania mechaniczne są niższe, co umożliwia wykorzystanie materiałów bardziej przyjaznych środowisku, przy jednoczesnym zachowaniu odpowiednich parametrów użytkowych. Takie podejście pozwala na stopniowe wdrażanie ekologicznych rozwiązań materiałowych bez kompromisu w zakresie bezpieczeństwa i osiągów pojazdu.',
    hRada(30), projImgs.rada],
  ['Rada Kół Naukowych PŁ', 'Udział Studenckiego Koła Naukowego Iron Warriors w międzynarodowych zawodach Challenge EcoGreen Energy 2026', '', '18 500 zł', null, null, '2026',
    'Projekt dotyczy udziału zespołu w międzynarodowych zawodach Challenge EcoGreen Energy 2026 i próby pobicia własnego Rekordu Polski w kategorii Prototype Battery Electric.',
    hRada(30), projImgs.rada],
  ['Rada Kół Naukowych PŁ', 'Dostosowanie konstrukcji pojazdu Eco Arrow 2 Electric do wymogów regulaminowych Shell Eco-marathon', '', '4 700 zł', null, null, '2025',
    'Projekt dotyczy przystosowania pojazdu do startu w międzynarodowych zawodach Shell Eco-marathon i przyczyni się do rozwoju zespołu. Udział w tym prestiżowym konkursie będzie okazją do wymiany doświadczeń, dalszego ulepszania pojazdu, a w konsekwencji do powstania kolejnych publikacji naukowych.',
    hRada(29), projImgs.rada],
  ['Rada Kół Naukowych PŁ', 'Optymalizacja układu jezdnego superoszczędnego pojazdu Eco Arrow 2 Electric ', '', '7 500 zł', null, null, '2025',
    'Celem projektu jest optymalizacja układu jezdnego superoszczędnego pojazdu Eco Arrow 2 Electric, startującego w międzynarodowych zawodach Albi Eco Race oraz Challange Ecogreen Energy. W ramach projektu jest planowana analiza obecnego układu jezdnego, a w dalszej kolejności wybór nowego rozwiązania, jego symulacje oraz wykonanie i testy praktyczne. Obecnie planowany kierunek modernizacji układu to poprawa zdiagnozowanych wad piast oraz ogólne uproszczenie układu.\n\nZakładana modernizacja układu w istotny sposób przyczyni się do zwiększenia sprawności energetycznej całego pojazdu. To z kolei bezpośrednio przełoży się na poprawę wyników osiągane podczas przejazdów konkursowych.',
    hRada(29), projImgs.rada],
  ['Rada Kół Naukowych PŁ', 'Projekt i wykonanie kompozytowego układu kierowniczego super oszczędnego pojazdu Eco Arrow 3', '', '7 000 zł', null, null, '2025',
    'Celem projektu jest wykonanie nowego układu kierowniczego do superoszczędnego pojazdu Eco Arrow 3.1, startującego w międzynarodowych zawodach Shell Eco-marathon. Kluczowym aspektem w osiągnięciu jak najlepszych wyników jest minimalizacja wszelkich strat energii pojazdu i jak najlepsze wykorzystanie energii pobranej z paliwa.',
    hRada(29), projImgs.rada],
  ['Rada Kół Naukowych PŁ', 'Optymalizacja układu napędowego superoszczędnego pojazdu Eco Arrow 3.1', '', '14 400 zł', null, null, '2025',
    'Celem projektu jest optymalizacja układu napędowego superoszczędnego pojazdu Eco Arrow 3.1, startującego w międzynarodowych zawodach Shell Eco-marathon. Sercem pojazdu jest silnik Honda GX35, z którego moc jest przenoszona za pomocą układu sprzęgło odśrodkowe – przekładnia pasowa z pasem zębatym – sprzęgło kłowe. Zakładana modernizacja układu w istotny sposób przyczyni się do zwiększenia sprawności energetycznej całego pojazdu. To z kolei bezpośrednio przełoży się na poprawę wyników osiągane podczas przejazdów konkursowych.',
    hRada(29), projImgs.rada],
  ['Rada Kół Naukowych PŁ', 'Optymalizacja układu paliwowo-powietrznego silnika superoszczędnego pojazdu Eco Arrow 3.1', '', '4 999 zł', null, null, '2024',
    'Celem projektu jest optymalizacja układu paliwowo-powietrznego silnika superoszczędnego pojazdu Eco Arrow 3.1, startującego w międzynarodowych zawodach Shell Eco-marathon. Aktualnie sercem bolidu jest silnik Honda GX35 wyposażony w prosty kolektor dolotowy oraz rurę dolotową. Obecnie układ nie jest w pełni zoptymalizowany. Podczas projektowania kolektora dolotowego wykonane zostały tylko wstępne analizy numeryczne metodą elementów skończonych, a sam komponent został wykonany z myślą wprowadzania dalszych poprawek i miał posłużyć tymczasowo, celem podejścia do zawodów.',
    hRada(28), projImgs.rada],
  ['Rada Kół Naukowych PŁ', 'Modularna wiązka elektryczna zintegrowana z komputerem Ecumaster EMU Black bolidu Eco Arrow 3.1', '', '3 000 zł', null, null, '2022',
    'Celem projektu jest zaprojektowanie, wykonanie, implementacja i przetestowanie zintegrowanej płytki drukowanej zastępującej obecną wiązkę elektryczną w bolidzie. Pozwoli to na uzyskanie pełnej modularności, większej niezawodności i szerokich możliwości modernizacji układu.',
    hRada(26), projImgs.rada],
  ['Rada Kół Naukowych PŁ', 'Modernizacja silnika bolidu Eco Arrow 3.1', '', '15 400 zł', null, null, '2022',
    'Celem projektu jest budowa stanowiska pomiarowego do badań silnika spalinowego, będącego sercem pojazdu Eco Arrow 3.1 oraz przeprowadzenie badań na oryginalnym i zmodernizowanym silniku, celem zdefiniowania wpływu dokonanych zmian na parametry pracy silnika i jego osiągi.',
    hRada(26), projImgs.rada],
  ['Rada Kół Naukowych PŁ', 'Projekt oraz wykonanie systemu telemetrycznego do bolidu Eco Arrow 3.1', '', '7 800 zł', null, null, '2022',
    'Celem projektu jest stworzenie elektronicznego systemu telemetrycznego pozwalający na zdalny odczyt w czasie rzeczywistym parametrów zarówno silnika, jak i jazdy dla bolidu Eco Arrow 3.1. Możliwość takiego monitoringu pozwoli na wprowadzanie bieżących korekt ustawień silnika, celem optymalizacji jego parametrów pracy oraz osiągów.',
    hRada(26), projImgs.rada],

  ['Fundacja Politechniki Łódzkiej', 'Inżynieria odwrotna i rapid prototyping w aspekcie udoskonalenia pojazdów Eco Arrow 3.5 i Eco Arrow 2 Electric', 'Dotacje na projekty', '10 000 zł', null, null, '2026',
    'Projekt zakłada wykorzystanie inżynierii odwrotnej oraz technologii druku 3D do opracowania nowych elementów konstrukcyjnych stosowanych w pojazdach Eco Arrow 3 i Eco Arrow 2 Electric, a także w nowo budowanym pojeździe Eco Arrow 3.5. W ramach inicjatywy przeprowadzona zostanie cyfrowa rekonstrukcja wybranych komponentów z użyciem skanera 3D oraz modyfikacja w kierunku zwiększenia trwałości, obniżenia masy i poprawy efektywności energetycznej. Zespół zaprojektuje i wytworzy prototypy z wykorzystaniem profesjonalnej drukarki 3D, a następnie podda je testom funkcjonalnym. Projekt rozwija kompetencje młodych inżynierów, promuje myślenie nieszablonowe oraz wspiera ideę ekomobliności poprzez tworzenie innowacyjnych, niskoemisyjnych pojazdów prototypowych. Za pomocą metod inżynierii odwrotnej zostanie wykonany wiarygodny model nowo powstałej karoserii pojazdu Eco Arrow 3.5, co umożliwi zaprojektowanie i określenie docelowych miejsc montażu jego układów kierowniczego i napędowego.',
    hFundacja, projImgs.fundacja],
  ['Fundacja Politechniki Łódzkiej', 'Podniesienie efektywności energetycznej pojazdów Eco Arrow 3 i Eco Arrow 2 Electric oraz udział w corocznej konferencji zespołów Shell Polska', 'Mikrodotacje', '9 480 zł', null, null, '2025',
    'Realizacja projektu „Podniesienie efektywności energetycznej pojazdów Eco Arrow 3 i Eco Arrow 2 Electric oraz udział w corocznej konferencji zespołów Shell Polska” umożliwi walkę o ustanowienie kolejnych rekordów Polski w „jeździe na kropelkę”. Projekt zakłada kompleksową modernizację układu jezdnego pojazdu. Obejmuje on: projekt i wykonanie przekładni łańcuchowej pojazdu Eco Arrow 3.1, przeprojektowanie i wykonanie nowej tylnej osi pojazdu Eco Arrow 3.1, wykonanie przepustnicy DBW (Drive – by – Wire) do silnika pojazdu Eco Arrow 3.1, wykonanie pomiarów i badań wpływu przepustnicy na efektywność energetyczną silnika pojazdu Eco Arrow 3.1, wymianę sterownika silnika elektrycznego w pojeździe Eco Arrow 2 Electric oraz udział w corocznej konferencji zespołów Shell Polska.',
    hFundacja, projImgs.fundacja],
  ['Fundacja Politechniki Łódzkiej', 'Udział zespołu Iron Warriors w międzynarodowych zawodach Shell Eco-marathon 2024 oraz Albi Eco Race 2024 oraz nabycie kompetencji przez członków zespołu z zakresu projektowania oraz elektroniki cyfrowej.', 'Dotacje na projekty', '20 000 zł', null, null, '2024',
    'Celem projektu jest udział zespołu Iron Warriors w międzynarodowych zawodach Shell Eco-marathon 2024 (19 – 24 maja 2024 w Nogaro we Francji) oraz Albi Eco Race 2024 (23 – 25 maja 2024, w Albi we Francji). Przygotowanie zespołu do udziału w zawodach wymaga nabycia szczególnych i odpowiednich kompetencji przez członków zespołu. W ich zakres wchodzi projektowanie 3D części do pojazdów, umiejętności z zakresu elektroniki cyfrowej oraz mikrokontrolerów Raspberry Pi. W ramach projektu zakupione zostanie certyfikowane szkolenie z projektowania 3D dla zespołu, a także zestawy szkoleniowe z zakresu elektroniki. Końcowym etapem projektu będzie udział zespołu wraz ze swoimi pojazdami Eco Arrow 3.1 oraz Eco Arrow 2 Electric w międzynarodowych zawodach. Do tego niezbędny będzie wynajem aut dostawczych do transportu pojazdów oraz sprzętu, wynajem aut osobowych do transportu członków zespołu, zakup biletów lotniczych oraz opłacenie hoteli.',
    hFundacja, projImgs.fundacja],
  ['Fundacja Politechniki Łódzkiej', 'Modernizacja bolidów Eco Arrow 3.1 i Eco Arrow 2 Electric', 'Mikrodotacje', '5 000 zł', null, null, '2024',
    'W ramach projektu planowana jest modernizacja bolidów Eco Arrow 3.1 oraz Eco Arrow 2 Electric obejmująca następujące działania:\n- wymiana łożysk układu jezdnego bolidu Eco Arrow 3.1 na łożyska ceramiczne o obniżonym współczynniku oporów toczenia;\n- wymiana łożysk układu jezdnego bolidu Eco Arrow 2 Electric na nowe łożyska standardowe o obniżonym współczynniku oporów toczenia;\n- projekt oraz wykonanie elementów układu kierowniczego i jezdnego obu pojazdów, w szczególności wykonanie nowych piast, osi, wąsów kierowniczych, elementów sprzęgła kłowo-tarczowego.',
    hFundacja, projImgs.fundacja],
  ['Fundacja Politechniki Łódzkiej', 'Udział zespołu Iron Warriors w międzynarodowych zawodach Shell Eco-marathon', 'Dotacje na projekty', '17 000 zł', null, null, '2023',
    'W ramach realizowanego projektu 13 członków zespołu wzięło udział w certyfikowanym szkoleniu z projektowania 3D w programie Autodesk Inventor. Obejmowało ono zagadnienia związane z modelowaniem 3D, tworzeniem złożeń oraz przygotowywaniem dokumentacji technicznej. Dzięki temu szkoleniu, członkowie zespołu uzyskali niezbędne umiejętności do projektowania części do pojazdów Eco Arrow 3.1 oraz Eco Arrow 2 Electric, a także do tworzenia niezbędnej dokumentacji technicznej. W ramach projektu 15 członków zespołu wzięło udział w międzynarodowych zawodach Shell Eco-marathon 2023 (organizator ograniczył możliwość wzięcia udziału większej ilości osób), które odbyły się w dniach 20 – 25 maja w Nogaro we Francji.',
    hFundacja, projImgs.fundacja],
  ['Fundacja Politechniki Łódzkiej', 'Modernizacja bolidu Eco Arrow 3.1 oraz zwiększenie jego osiągów w celu pobicia rekordu Polski w liczbie kilometrów przejechanych na litrze paliwa', 'Dotacje na projekty', '20 640 zł', null, null, '2022',
    'W ramach projektu zespół wziął udział w szkoleniu z projektowania 3D w programie Autodesk Inventor, dzięki niemu zespół uzyskał niezbędne umiejętności zarówno do projektowania nowych części do bolidu Eco Arrow 3.1 oraz jego silnika, jak i tworzenia niezbędnej dokumentacji technicznej. W ramach pozyskanej dotacji zostały zakupione również materiały eksploatacyjne (filament) do drukarek 3D oraz żywica do drukarki SLA. Z zakupionych materiałów zostały wykonane nowe elementy silnika oraz bolidu. Ostatnim etapem projektu był udział zespołu w zawodach Shell Eco-marathon 2022, w których udział wzięło 10 członków zespołu (organizator ograniczył możliwość wzięcia udziału większej liczby osób). Zawody odbyły się w terminie od 28 czerwca do 1 lipca, w miejscowości Nogaro we Francji.',
    hFundacja, projImgs.fundacja],

  ['Miasto Łódź', 'Kolejny krok dla ekomobilności', 'ŁÓDŹ AKADEMICKA – NAUKOWA, KREATYWNA I WIELOKULTUROWA 2025', '18 000 zł', '2 000 zł', null, '2025',
    'Realizacja projektu „Kolejny krok dla ekomobilności” umożliwi start w trzech konkursach o zasięgu międzynarodowym: Challenge EcoGreen Energy, Albi Eco Race oraz Shell Eco-marathon Europe and Africa. Ponadto pozwoli na zakup niezbędnego wyposażenia kierowców oraz materiałów marketingowych w postaci koszulek z logotypami partnerów.',
    hMiasto, projImgs.lodz2025],
  ['Miasto Łódź', 'Iron Warriors w drodze po elektromobilność i mniejsze spalanie', 'ŁÓDŹ AKADEMICKA – NAUKOWA, KREATYWNA I WIELOKULTUROWA 2024', '17 505 zł', '1 945 zł', null, '2024',
    'Realizacja projektu „Iron Warriors w drodze po elektromobilność i mniejsze spalanie” umożliwi start w dwóch konkursach o zasięgu międzynarodowym: Albi Eco Race oraz Shell Eco-marathon Europe and Africa. Ponadto pozwoli na zakup materiałów marketingowych w postaci koszulek z logotypami partnerów.',
    hMiasto, projImgs.lodz2024],
  ['Miasto Łódź', 'Iron Warriors w dwóch odsłonach – elektryczny Eco Arrow 2 i spalinowy Eco Arrow 3', 'ŁÓDŹ AKADEMICKA – NAUKOWA, KREATYWNA I WIELOKULTUROWA 2023', '15 750 zł', '1 750 zł', null, '2023',
    'Realizacja projektu „Iron Warriors w dwóch odsłonach – elektryczny Eco Arrow 2 i spalinowy Eco Arrow 3” umożliwi start w dwóch konkursach o zasięgu międzynarodowym: Albi Eco Race oraz Shell Eco-marathon Europe and Africa.',
    hMiasto, projImgs.lodz2023],
  ['Miasto Łódź', 'Tysiąc kilometrów na jednej kropli bolidem Eco Arrow 3.1', 'ŁÓDŹ AKADEMICKA – NAUKOWA, KREATYWNA I WIELOKULTUROWA 2022', '15 750 zł', '1 750 zł', null, '2022',
    'Realizacja projektu „Tysiąc kilometrów na jednej kropli bolidem Eco Arrow 3.1” umożliwi start w Shell Eco-marathon Europe and Africa.',
    hMiasto, projImgs.lodz2022],
]

const posts = [
  {
    slug: 'rekord-polski-2267-km-l', title: 'Nowy Rekord Polski – 2267 km/l!', cover: '/images/eco-arrow-2-electric-4.jpg', date: '2026-05-20',
    excerpt: 'Eco Arrow 2 Electric pobił własny rekord Polski w kategorii pojazdów zasilanych energią elektryczną.',
    content: 'Podczas tegorocznych zawodów Challenge EcoGreen Energy nasz elektryczny bolid Eco Arrow 2 Electric osiągnął wynik 2267 km w przeliczeniu na 1 litr benzyny.\n\nTo poprawa naszego zeszłorocznego rekordu o ponad 150 km/l. Dziękujemy wszystkim członkom zespołu i partnerom, bez których ten sukces nie byłby możliwy!',
  },
  {
    slug: 'shell-eco-marathon-2026', title: 'Jedziemy na Shell Eco-marathon 2026', cover: '/images/team-1.jpg', date: '2026-04-02',
    excerpt: 'Zespół przygotowuje Eco Arrow 3.1 do startu w największych zawodach superoszczędnych pojazdów.',
    content: 'Trwają ostatnie przygotowania do startu w zawodach Shell Eco-marathon 2026. Naszym celem jest przekroczenie bariery 1000 km na jednym litrze benzyny.\n\nŚledźcie nasze media społecznościowe, aby być na bieżąco!',
  },
]

async function main() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('TRUNCATE nav_items, vehicles, projects, posts RESTART IDENTITY')
    let order = 0
    for (const item of nav) {
      const { rows } = await client.query(
        'INSERT INTO nav_items (label, href, sort_order, is_button) VALUES ($1,$2,$3,$4) RETURNING id',
        [item.label, item.href, order++, Boolean(item.isButton)],
      )
      let childOrder = 0
      for (const child of item.children) {
        await client.query(
          'INSERT INTO nav_items (label, href, parent_id, sort_order) VALUES ($1,$2,$3,$4)',
          [child.label, child.href, rows[0].id, childOrder++],
        )
      }
    }
    for (const [i, v] of vehicles.entries()) {
      await client.query(
        `INSERT INTO vehicles (slug, name, debut_year, image_url, description, goal, specs, stats, achievements, best_result, featured, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          v.slug, v.name, v.debut, v.image, v.description, v.goal,
          JSON.stringify(v.specs.map(([label, value]) => ({ label, value }))),
          JSON.stringify(v.stats.map(([label, value, unit]) => ({ label, value, unit }))),
          JSON.stringify(v.achievements.map(([title, location, result, countryCode]) => ({ title, location, result, countryCode }))),
          v.best, v.featured, i,
        ],
      )
    }
    for (const [i, p] of projects.entries()) {
      await client.query(
        `INSERT INTO projects (category, title, program, funding, own_contribution, total_value, period, description, heading, image_urls, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [...p, i],
      )
    }
    for (const p of posts) {
      await client.query(
        `INSERT INTO posts (slug, title, excerpt, content, cover_image, published, published_at) VALUES ($1,$2,$3,$4,$5,true,$6)`,
        [p.slug, p.title, p.excerpt, p.content, p.cover, p.date],
      )
    }
    await client.query('COMMIT')
    console.log('Seed complete')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
    await pool.end()
  }
}

main()
