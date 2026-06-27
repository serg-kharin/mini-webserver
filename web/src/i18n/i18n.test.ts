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
})
