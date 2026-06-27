import { beforeEach, describe, expect, it, vi } from 'vitest'
import HttpStorageRepository from '@/data/HttpStorageRepository'

describe('HttpStorageRepository', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('maps folders and storage kind', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: 't', name: 'Music', storage: 'sd' }],
    })
    vi.stubGlobal('fetch', fetchMock)

    const folders = await new HttpStorageRepository('/api').getFolders()

    expect(folders).toEqual([{ id: 't', name: 'Music', storage: 'sd' }])
    expect(fetchMock).toHaveBeenCalledWith('/api/folders')
  })

  it('encodes folder and path in the list URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ dirs: [], files: [] }) })
    vi.stubGlobal('fetch', fetchMock)

    await new HttpStorageRepository('/api').list('tree:internal', ['Artist', 'Album'])

    expect(fetchMock).toHaveBeenCalledWith('/api/list?folder=tree%3Ainternal&path=Artist%2FAlbum')
  })

  it('normalizes an unknown storage kind', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: 't', name: 'X', storage: 'weird' }],
    })
    vi.stubGlobal('fetch', fetchMock)

    const folders = await new HttpStorageRepository('/api').getFolders()

    expect(folders[0].storage).toBe('unknown')
  })

  it('returns the server error code on failure', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => '{"ok":false,"error":"mkdir_failed"}',
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await new HttpStorageRepository('/api').createDirectory('t', [], 'New')

    expect(result).toEqual({ ok: false, error: 'mkdir_failed' })
  })
})
