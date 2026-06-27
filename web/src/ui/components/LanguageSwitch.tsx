import { useTranslation } from 'react-i18next'
import { setLanguage, SUPPORTED } from '@/i18n/i18n'

export default function LanguageSwitch() {
  const { i18n } = useTranslation()
  const current = i18n.resolvedLanguage
  return (
    <div className="lang" role="group" aria-label="Language">
      {SUPPORTED.map((lang) => (
        <button
          key={lang}
          type="button"
          className={lang === current ? undefined : 'outline'}
          aria-pressed={lang === current}
          onClick={() => setLanguage(lang)}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
