import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

const nav = [
  { label: 'Strona główna', href: '/', children: [] },
  { label: 'Bolidy', href: '/bolidy', children: [
    { label: 'Eco Arrow 3', href: '/bolidy/eco-arrow-3' },
    { label: 'Eco Arrow 2 Electric', href: '/bolidy/eco-arrow-2-electric' },
    { label: 'Eco Arrow 2', href: '/bolidy/eco-arrow-2' },
    { label: 'Eco Arrow 1', href: '/bolidy/eco-arrow-1' },
  ] },
  { label: 'Projekty', href: '/projekty', children: [] },
  { label: 'Blog', href: '/blog', children: [] },
  { label: 'Kontakt', href: '/kontakt', children: [] },
  { label: 'Dołącz do nas', href: '/kontakt', isButton: true, children: [] },
]

const vehicles = [
  {
    slug: 'eco-arrow-3', name: 'Eco Arrow 3.1', debut: 2018, image: '/images/eco-arrow-3-1.jpg', featured: true,
    description: 'Trzeci pojazd zespołu miał swoją premierę 12 stycznia 2018 w Łódzkiej Manufakturze. Pierwszy oficjalny start nowego pojazdu Eco Arrow 3.0 przypadł na zawody Educ Eco 2018 we francuskim Valenciennes. Zespół ukończył je z wynikiem 616 km/l paliwa i wygrał zawody w kategorii prototypów zasilanych benzyną.\n\nNastępnie bolid wystartował w zawodach Shell Eco-marathon France 2018 w Paryżu, które ukończył na najwyższym stopniu podium z wynikiem 643 km/l będąc najlepszą drużyną w kategorii Prototype Gasoline. Zawody Shell Eco-marathon 2024 stanowią kolejny przełomowy moment w historii modyfikacji naszej trzeciej strzały, w tej edycji po raz pierwszy z sukcesem zadebiutował nowy układ elektryczny pojazdu oparty na płytce PCB, stworzonej w całości przez dział elektryczny zespołu.',
    goal: 'Aktualnie głównym celem rozwoju projektu Eco Arrow 3 jest przekroczenie bariery 1000 km/l benzyny.',
    specs: [
      ['Debiut', '2018'], ['Typ nadwozia', 'Samonośne (monocoque)'], ['Silnik', 'Honda GX35'], ['Jednostka sterująca', 'Ecumaster EMU'],
      ['Rodzaj wtrysku', 'Elektroniczny, pośredni'], ['Paliwo', 'Benzyna PB95'], ['Koła', '3 (2 przednie skrętne, 1 tylne)'],
      ['Opony', 'Michelin 45/75 R16 Prototype Tires'],
    ],
    stats: [['Moc silnika', '1.3', 'KM'], ['Moment obrotowy', '1.6', 'Nm'], ['Waga bolidu', '35', 'kg'], ['Prędkość maksymalna', '40', 'km/h']],
    achievements: [
      ['Shell Eco-marathon France 2018', 'Paryż, Francja', 'I miejsce – 643 km/l kategoria Prototype Gasoline'],
      ['Educ Eco 2018', 'Valenciennes, Francja', 'I miejsce – 616 km/l kategoria Prototype Gasoline'],
    ],
    best: '837 km/l',
  },
  {
    slug: 'eco-arrow-2-electric', name: 'Eco Arrow 2 Electric', debut: 2023, image: '/images/eco-arrow-2-electric-1.jpg', featured: true,
    description: 'Elektryczna wersja pojazdu Eco Arrow 2 miała swoją premierę podczas zawodów Albi Eco Race 2023. Pierwszy oficjalny start pojazdu Eco Arrow 2 Electric był udany i zapewnił Zespołowi ostatni stopień podium i 4. miejsce w klasyfikacji pojazdów. Kolejny rok stanowił jeszcze większy sukces – zespół zajął II miejsce w klasyfikacji generalnej, zyskując tytuł Wicemistrzów Europy.\n\nRok 2025 był przełomowy – po raz pierwszy Zespół wystartował swoim elektrycznym pojazdem w typowym eco-marathonie, przywracając drugą wersję strzały do konkurencji. Podczas tego debiutu na zawodach Challenge EcoGreen Energy pojazd zajął V miejsce w kategorii Prototype Battery Electric, ustanawiając jednocześnie Rekord Polski – 2112 km/l (w przeliczeniu na benzynę). Rok później zespół pobił go z wynikiem – 2267 km/l.',
    goal: 'Aktualnie głównym celem rozwoju projektu Eco Arrow 2 Electric jest start w zawodach Shell Eco-marathon.',
    specs: [['Debiut', '2023'], ['Napęd', 'Elektryczny'], ['Kategoria', 'Prototype Battery Electric'], ['Koła', '3 (2 przednie skrętne, 1 tylne)']],
    stats: [['Moc silnika', '0.4', 'kW'], ['Prędkość maksymalna', '45', 'km/h'], ['Waga bolidu', '50', 'kg']],
    achievements: [
      ['Challenge EcoGreen Energy 2026', 'Francja', 'Rekord Polski – 2267 km/l (w przeliczeniu na benzynę)'],
      ['Challenge EcoGreen Energy 2025', 'Francja', 'V miejsce – 2112 km/l kategoria Prototype Battery Electric'],
      ['Albi Eco Race 2024', 'Albi, Francja', 'II miejsce w klasyfikacji generalnej – Wicemistrzowie Europy'],
      ['Albi Eco Race 2023', 'Albi, Francja', 'III miejsce na podium, 4. miejsce w klasyfikacji pojazdów'],
    ],
    best: '2267 km/l',
  },
  {
    slug: 'eco-arrow-2', name: 'Eco Arrow 2', debut: 2014, image: '/images/eco-arrow-2-electric-2.jpg', featured: false,
    description: 'Eco Arrow 2 to druga generacja pojazdu o minimalnym zużyciu paliwa, który w 2014 roku, po całym roku projektowania i budowy, zastąpił pojazd Eco Arrow 1.0. Debiut bolidu przypadł w 2014 roku na zawodach Shell Eco-marathon w Rotterdamie. Od tamtego czasu pojazd Eco Arrow 2 był stale udoskonalany.\n\nW 2015 roku na zawodach Shell Eco-marathon w Rotterdamie oraz Pisaralla Pisimmälle w Nokii wystartowała jego zmodernizowana wersja Eco Arrow 2.1. Podczas zawodów Pisaralla Pisimmälle został pobity rekord Polski w „jeździe na kropelce” – 830 km/l!\n\nW 2016 jako Eco Arrow 2.2 wziął udział w czterech zawodach w ciągu jednego roku. Podczas zawodów Pisaralla Pisimmälle zespół z wynikiem 837 km/l paliwa ponownie ustanowił rekord Polski, który do dziś pozostaje naszym najlepszym rezultatem.',
    goal: '',
    specs: [
      ['Debiut', '2014'], ['Typ nadwozia', 'Samonośne (bezramowe)'], ['Silnik', 'Honda GX35'], ['Jednostka sterująca', 'Ecumaster EMU'],
      ['Rodzaj wtrysku', 'Elektroniczny, pośredni'], ['Zapłon', 'Elektroniczny'], ['Paliwo', 'Benzyna PB95'], ['Pojemność baku paliwa', '150 ml'],
      ['Koła', '3 (2 przednie skrętne, 1 tylne)'], ['Opony', 'Michelin 45/75 R16 Prototype Tires'], ['Długość', '320 cm'], ['Szerokość', '75 cm'], ['Wysokość', '70 cm'],
    ],
    stats: [],
    achievements: [
      ['Pisaralla Pisimmälle 2017', 'Nokia, Finlandia', 'V miejsce – 688 km/l kategoria Small Engine Gasoline'],
      ['Pisaralla Pisimmälle 2016', 'Nokia, Finlandia', 'V miejsce – 837 km/l kategoria Small Engine Gasoline'],
      ['Shell Eco-marathon Europe 2016', 'Londyn, Wielka Brytania', '471 km/l kategoria Prototype Gasoline'],
      ['EducEco Challenge 2016', 'Valenciennes, Francja', 'I miejsce – 489 km/l kategoria Prototype SP95'],
      ['Shell Eco-marathon Challenger France 2016', 'Le Mans, Francja', '492 km/l kategoria Prototype Gasoline'],
      ['Pisaralla Pisimmälle 2015', 'Nokia, Finlandia', 'VI miejsce – 830 km/l kategoria Small Engine Motor Petrol'],
      ['Shell Eco-marathon Europe 2015', 'Rotterdam, Holandia', '640 km/l kategoria Prototype Gasoline'],
      ['Shell Eco-marathon Europe 2014', 'Rotterdam, Holandia', '259 km/l kategoria Prototype Gasoline'],
    ],
    best: '837 km/l',
  },
  {
    slug: 'eco-arrow-1', name: 'Eco Arrow 1', debut: 2013, image: '/images/team-3.jpg', featured: false,
    description: 'W 2012 roku studenci rozpoczęli pierwszy na Politechnice Łódzkiej projekt budowy pojazdu, który miał charakteryzować się jak najniższym zużyciem paliwa. Prace obejmowały zaprojektowanie całego bolidu: od pojedynczych układów, przez ich połączenie po ramę oraz karoserię.\n\nBudowa trwała rok i zwieńczona została debiutem pojazdu oraz całego Zespołu na zawodach Shell Eco-marathon w Rotterdamie w 2013 roku. Na jednym litrze benzyny Eco Arrow 1 podczas swojego pierwszego konkursu przejechał 150 kilometrów.\n\nIron Warriors zainspirowani pierwszym sukcesem postanowili stworzyć nową wersję pojazdu. Studenci nauczeni doświadczeniem zaprojektowali od podstaw nowy pojazd – Eco Arrow 2.',
    goal: '',
    specs: [
      ['Debiut', '2013'], ['Typ nadwozia', 'Ramowe (nieniosące)'], ['Silnik', 'Honda GX25'], ['Jednostka sterująca', 'Konstrukcja własna'],
      ['Rodzaj wtrysku', 'Elektroniczny, pośredni'], ['Zapłon', 'Elektroniczny'], ['Paliwo', 'Benzyna PB95'], ['Pojemność baku paliwa', '150 ml'],
      ['Koła', '3 (2 przednie skrętne, 1 tylne)'], ['Opony', 'Michelin 45/75 R16 Prototype Tires'], ['Długość', '270 cm'], ['Szerokość', '65 cm'], ['Wysokość', '60 cm'],
    ],
    stats: [],
    achievements: [['Shell Eco-marathon 2013', 'Rotterdam, Holandia', '150 km/l kategoria Prototype Gasoline']],
    best: '150 km/l',
  },
]

const projects = [
  ['MNiSW', 'Na przekór schematom – w stronę zielonej przyszłości', 'Wsparcie studentów w zakresie podniesienia ich kompetencji i umiejętności', '322 047,36 zł', null, '322 047,36 zł', '2025-2026', 'Celem projektu jest udział w dwóch międzynarodowych zawodach superoszczędnych pojazdów. Shell Eco–marathon 2026 pojazdem Eco Arrow 3 oraz Albi Eco Race 2026 pojazdem Eco Arrow 2 Electric. Udział w tych konkursach będzie sprawdzianem prac badawczo – rozwojowych prowadzonych w ramach projektu.'],
  ['MNiSW', 'Modernizacja funkcjonalna superoszczędnego pojazdu Eco Arrow 3.1', 'Studenckie Koła Naukowe Tworzą Innowacje', '39 300 zł', null, '39 300 zł', '2025-2026', 'Realizacja projektu umożliwi walkę o pobicie rekordu Polski w „jeździe na kropelkę” i przekroczenie bariery 1000 km przejechanych na litrze paliwa. Pozwoli także na rozwinięcie nowych rozwiązań technologicznych oraz na prowadzenie badań naukowych w kierunku rozwoju i modernizacji bolidu Eco Arrow 3.1.'],
  ['MNiSW', 'Na przekór schematom – w stronę zielonej przyszłości', 'Wsparcie studentów w zakresie podniesienia ich kompetencji i umiejętności', '299 505,49 zł', null, '299 505,49 zł', '2024-2025', 'W ramach projektu przeprowadzono prace badawczo – rozwojowe nad silnikiem spalinowym Honda GX35, celem zwiększenia jego efektywności energetycznej i zminimalizowaniu emisji szkodliwych związków. Zespół wziął udział w zawodach Shell Eco-marathon 2025, Albi Eco Race 2025 i Challenge EcoGreen Energy 2025.'],
  ['MNiSW', 'Modernizacja systemu elektrycznego bolidu Eco Arrow 3.1 startującego w międzynarodowych zawodach Shell Eco-marathon', 'Studenckie Koła Naukowe Tworzą Innowacje', '64 500 zł', null, '64 500 zł', '2023-2024', 'Pierwszym z realizowanych zadań jest budowa stanowiska do lutowania elementów elektronicznych, spełniająca odpowiednie standardy i wymogi BHP, wyposażonego w sprzęt do wykonywania płytek PCB i zabezpieczenia ESD.'],
  ['MNiSW', 'Budowa hamowni silnikowej oraz badania nad zwiększeniem sprawności silnika bolidu Eco Arrow 3.1', 'Studenckie Koła Naukowe Tworzą Innowacje', '59 445 zł', null, '59 445 zł', '2022-2023', 'Projekt pozwoli na prowadzenie badań naukowych w kierunku rozwoju i modernizacji jednostki napędowej bolidu Eco Arrow 3.1 oraz opracowanie publikacji naukowej.'],
  ['Miasto Łódź', 'Kolejny krok dla ekomobilności', 'ŁÓDŹ AKADEMICKA – NAUKOWA, KREATYWNA I WIELOKULTUROWA 2025', '18 000 zł', '2 000 zł', null, '2025', 'Realizacja projektu umożliwi start w trzech konkursach o zasięgu międzynarodowym: Challenge EcoGreen Energy, Albi Eco Race oraz Shell Eco-marathon Europe and Africa. Ponadto pozwoli na zakup niezbędnego wyposażenia kierowców oraz materiałów marketingowych.'],
  ['Miasto Łódź', 'Iron Warriors w drodze po elektromobilność i mniejsze spalanie', 'ŁÓDŹ AKADEMICKA – NAUKOWA, KREATYWNA I WIELOKULTUROWA 2024', '17 505 zł', '1 945 zł', null, '2024', 'Realizacja projektu umożliwi start w dwóch konkursach o zasięgu międzynarodowym: Albi Eco Race oraz Shell Eco-marathon Europe and Africa.'],
  ['Miasto Łódź', 'Iron Warriors w dwóch odsłonach – elektryczny Eco Arrow 2 i spalinowy Eco Arrow 3', 'ŁÓDŹ AKADEMICKA – NAUKOWA, KREATYWNA I WIELOKULTUROWA 2023', '15 750 zł', '1 750 zł', null, '2023', 'Realizacja projektu umożliwi start w dwóch konkursach o zasięgu międzynarodowym: Albi Eco Race oraz Shell Eco-marathon Europe and Africa.'],
  ['Miasto Łódź', 'Tysiąc kilometrów na jednej kropli bolidem Eco Arrow 3.1', 'ŁÓDŹ AKADEMICKA – NAUKOWA, KREATYWNA I WIELOKULTUROWA 2022', '15 750 zł', '1 750 zł', null, '2022', 'Realizacja projektu umożliwi start w Shell Eco-marathon Europe and Africa.'],
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
          JSON.stringify(v.achievements.map(([title, location, result]) => ({ title, location, result }))),
          v.best, v.featured, i,
        ],
      )
    }
    for (const [i, p] of projects.entries()) {
      await client.query(
        `INSERT INTO projects (category, title, program, funding, own_contribution, total_value, period, description, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
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
