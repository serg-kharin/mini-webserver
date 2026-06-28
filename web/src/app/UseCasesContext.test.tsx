import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { UseCasesProvider, useUseCases } from '@/app/UseCasesContext'
import { fakeUseCases } from '@/test/fakes'

describe('useUseCases', () => {
  it('throws outside a provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useUseCases())).toThrow()
  })

  it('returns the provided use cases', () => {
    const useCases = fakeUseCases()
    const { result } = renderHook(() => useUseCases(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <UseCasesProvider useCases={useCases}>{children}</UseCasesProvider>
      ),
    })
    expect(result.current).toBe(useCases)
  })
})
