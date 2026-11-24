const STORAGE_KEY = 'iw-admin-theme'

export function ThemeScript() {
  const script = `(function(){try{if(localStorage.getItem('${STORAGE_KEY}')==='dark'){document.documentElement.classList.add('dark')}}catch(e){}})()`
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
