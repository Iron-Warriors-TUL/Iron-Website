const socials = [
  { label: 'Facebook', href: 'https://www.facebook.com/IronWarriorsPL' },
  { label: 'Instagram', href: 'https://www.instagram.com/ironwarriors_pl' },
  { label: 'YouTube', href: 'https://www.youtube.com/@ironwarriors' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/iron-warriors' },
]

export function Footer() {
  return (
    <footer className="bg-[oklch(0.14_0.004_285)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3 md:px-6">
        <div className="flex justify-center md:justify-start">
          <img src="/images/logo-iron-warriors-svg.svg" alt="Iron Warriors" className="h-28 w-auto" />
        </div>
        <div>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Social media</h2>
          <ul className="flex flex-wrap gap-2">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-sm bg-secondary px-3 py-2 text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Adres</h2>
          <address className="text-sm not-italic leading-relaxed">
            Politechnika Łódzka
            <br />
            Instytut Maszyn Przepływowych
            <br />
            ul. Wólczańska 217/221
            <br />
            93-005 Łódź
          </address>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        {`Copyright © ${new Date().getFullYear()} Iron Warriors`}
      </div>
    </footer>
  )
}
