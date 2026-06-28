import { beforeEach, describe, expect, it } from 'vitest'
import { detectLanguage, setLanguage, SUPPORTED } from '@/i18n/i18n'

describe('i18n', () => {
  beforeEach(() => localStorage.clear())

  it('supports ru and en', () => {
    expect(SUPPORTED).toEqual(['ru', 'en'])
  })

  it('detects the saved language', () => {
    setLanguage('ru')
    expect(detectLanguage()).toBe('ru')
  })

  it('falls back to the browser language', () => {
    expect(detectLanguage()).toBe('en')
  })

  it('skips unsupported browser languages', () => {
    Object.defineProperty(window.navigator, 'languages', { value: ['fr', 'en'], configurable: true })
    expect(detectLanguage()).toBe('en')
    Object.defineProperty(window.navigator, 'languages', { value: ['en-US'], configurable: true })
  })

  it('uses navigator.language when languages is empty', () => {
    Object.defineProperty(window.navigator, 'languages', { value: [], configurable: true })
    Object.defineProperty(window.navigator, 'language', { value: 'ru-RU', configurable: true })
    expect(detectLanguage()).toBe('ru')
    Object.defineProperty(window.navigator, 'languages', { value: ['en-US'], configurable: true })
  })

  it('returns null when nothing is supported', () => {
    Object.defineProperty(window.navigator, 'languages', { value: ['fr-FR'], configurable: true })
    expect(detectLanguage()).toBeNull()
    Object.defineProperty(window.navigator, 'languages', { value: ['en-US'], configurable: true })
  })
})
