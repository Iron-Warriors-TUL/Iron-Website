import { FixedImage } from './smart-image'

const countryNames: Record<string, string> = {
  pl: 'Polska',
  fr: 'Francja',
  gb: 'Wielka Brytania',
  fi: 'Finlandia',
  nl: 'Holandia',
}

/** Flaga targetu: pole 133×100 px w wrapperze 168 px z ujemnymi marginesami widgetu. */
export function CountryFlag({ code }: { code?: string }) {
  if (!code || !countryNames[code]) return null

  return (
    <div
      className="-my-[35px] flex h-[168px] w-full items-center justify-center text-center"
      aria-label={countryNames[code]}
    >
      <FixedImage
        src={`/flags/${code}.svg`}
        alt=""
        width={133}
        height={100}
        sizes="133px"
        className="h-[100px] w-[133px] object-contain"
      />
    </div>
  )
}
