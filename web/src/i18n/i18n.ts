import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '@/i18n/locales/en.json'
import ru from '@/i18n/locales/ru.json'

export type Lang = 'ru' | 'en'
export const SUPPORTED: Lang[] = ['ru', 'en']
const STORAGE_KEY = 'lng'

function isSupported(value: string): value is Lang {
  return (SUPPORTED as string[]).includes(value)
}

// Returns null when no supported language can be determined, so the app asks.
export function detectLanguage(): Lang | null {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved && isSupported(saved)) return saved
  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const c of candidates) {
    const base = (c || '').slice(0, 2).toLowerCase()
    if (isSupported(base)) return base
  }
  return null
}

export function setLanguage(lng: Lang): void {
  localStorage.setItem(STORAGE_KEY, lng)
  void i18n.changeLanguage(lng)
}

void i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    en: { translation: en },
  },
  lng: detectLanguage() ?? 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
