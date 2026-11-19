type MapEmbedProps = {
  className?: string
}

/** Mapa dojazdu z oryginalnej strony (Google Maps embed). */
export function MapEmbed({ className }: MapEmbedProps) {
  return (
    <iframe
      className={className}
      title="Mapa dojazdu do Iron Warriors"
      src="https://maps.google.com/maps?q=%C5%81%C3%B3d%C5%BA%20Iron%20Warriors&t=m&z=15&output=embed&iwloc=near"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
  )
}
