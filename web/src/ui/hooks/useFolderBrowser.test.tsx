import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { useFolderBrowser } from '@/ui/hooks/useFolderBrowser'
import { UseCasesProvider } from '@/app/UseCasesContext'
import type { UseCases } from '@/app/container'
import { fakeUseCases } from '@/test/fakes'

function setup(useCases: UseCases = fakeUseCases()) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <UseCasesProvider useCases={useCases}>{children}</UseCasesProvider>
  )
  return renderHook(() => useFolderBrowser(), { wrapper })
}

describe('useFolderBrowser', () => {
  it('loads folders and the initial listing', async () => {
    const { result } = setup()
    await waitFor(() => expect(result.current.folders).toHaveLength(1))
    await waitFor(() => expect(result.current.listing.dirs).toContain('Album'))
  })

  it('navigates folders', async () => {
    const { result } = setup()
    await waitFor(() => expect(result.current.folderId).toBe('t'))
    act(() => result.current.openDir('Album'))
    expect(result.current.path).toEqual(['Album'])
    act(() => result.current.goUp())
    expect(result.current.path).toEqual([])
  })

  it('jumps via breadcrumbs and switches folders', async () => {
    const { result } = setup()
    await waitFor(() => expect(result.current.folderId).toBe('t'))
    act(() => result.current.openDir('Album'))
    act(() => result.current.goTo(0))
    expect(result.current.path).toEqual(['Album'])
    act(() => result.current.selectFolder('t'))
    expect(result.current.path).toEqual([])
  })

  it('opens a search result into its folder', async () => {
    const { result } = setup()
    await waitFor(() => expect(result.current.folderId).toBe('t'))
    act(() => result.current.openResult({ name: 'x', path: 'A/B', dir: false, size: 0 }))
    expect(result.current.path).toEqual(['A', 'B'])
  })

  it('creates a directory and enters it', async () => {
    const { result } = setup()
    await waitFor(() => expect(result.current.folderId).toBe('t'))
    await act(async () => {
      await result.current.createDirectory('New')
    })
    expect(result.current.path).toEqual(['New'])
  })

  it('searches after a debounce', async () => {
    const { result } = setup()
    await waitFor(() => expect(result.current.folderId).toBe('t'))
    act(() => result.current.setQuery('a'))
    await waitFor(() => expect(result.current.results).not.toBeNull(), { timeout: 1000 })
    expect(result.current.results).toHaveLength(1)
  })

  it('handles having no granted folders', async () => {
    const { result } = setup(fakeUseCases({ getFolders: async () => [] }))
    await waitFor(() => expect(result.current.folders).toEqual([]))
    act(() => result.current.setQuery('a'))
    await waitFor(() => expect(result.current.results).toBeNull())
    expect(result.current.listing).toEqual({ dirs: [], files: [] })
  })

  it('deletes a file', async () => {
    const deleteEntry = vi.fn(async () => ({ ok: true }))
    const { result } = setup(fakeUseCases({ deleteEntry }))
    await waitFor(() => expect(result.current.folderId).toBe('t'))
    await act(async () => {
      await result.current.deleteFile('a.flac')
    })
    expect(deleteEntry).toHaveBeenCalled()
  })
})
