import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import HttpStorageRepository from '@/data/HttpStorageRepository'

const repo = new HttpStorageRepository('/api')

function mockFetch(response: Partial<Response> & { json?: () => Promise<unknown>; text?: () => Promise<string> }) {
  const fetchMock = vi.fn().mockResolvedValue(response)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('HttpStorageRepository', () => {
  afterEach(() => vi.restoreAllMocks())

  it('maps folders and storage kinds', async () => {
    mockFetch({
      ok: true,
      json: async () => [
        { id: 'a', name: 'M', storage: 'internal' },
        { id: 'b', name: 'M', storage: 'sd' },
        { id: 'c', name: 'M', storage: 'weird' },
      ],
    })
    const folders = await repo.getFolders()
    expect(folders.map((f) => f.storage)).toEqual(['internal', 'sd', 'unknown'])
  })

  it('returns an empty list when folders request fails', async () => {
    mockFetch({ ok: false })
    expect(await repo.getFolders()).toEqual([])
  })

  it('encodes folder and path in the list URL', async () => {
    const fetchMock = mockFetch({ ok: true, json: async () => ({ dirs: ['A'], files: [{ name: 'x', size: 1 }] }) })
    const listing = await repo.list('tree:internal', ['Artist', 'Album'])
    expect(fetchMock.mock.calls[0][0]).toBe('/api/list?folder=tree%3Ainternal&path=Artist%2FAlbum')
    expect(listing.dirs).toEqual(['A'])
  })

  it('maps search hits', async () => {
    mockFetch({ ok: true, json: async () => [{ name: 'x', path: 'A', dir: false, size: 2 }] })
    const hits = await repo.search('f', 'x')
    expect(hits[0]).toEqual({ name: 'x', path: 'A', dir: false, size: 2 })
  })

  it('returns defaults when list or search fails', async () => {
    mockFetch({ ok: false })
    expect(await repo.list('f', [])).toEqual({ dirs: [], files: [] })
    expect(await repo.search('f', 'x')).toEqual([])
  })

  it('handles a listing without dirs or files', async () => {
    mockFetch({ ok: true, json: async () => ({}) })
    expect(await repo.list('f', [])).toEqual({ dirs: [], files: [] })
  })

  it('returns ok on a successful action', async () => {
    mockFetch({ ok: true, status: 200, text: async () => '{"ok":true}' })
    expect(await repo.createDirectory('t', [], 'New')).toEqual({ ok: true, error: undefined })
  })

  it('returns the server error code on a failed action', async () => {
    mockFetch({ ok: false, status: 400, text: async () => '{"ok":false,"error":"mkdir_failed"}' })
    expect(await repo.createDirectory('t', [], 'New')).toEqual({ ok: false, error: 'mkdir_failed' })
  })

  it('treats a non-JSON body as failure', async () => {
    mockFetch({ ok: false, status: 500, text: async () => 'oops' })
    expect(await repo.deleteEntry('t', [], 'x')).toEqual({ ok: false, error: undefined })
  })
})

describe('HttpStorageRepository.uploadFile', () => {
  class FakeXhr {
    upload: Record<string, unknown> = {}
    status = 200
    responseText = '{"ok":true}'
    onload: (() => void) | null = null
    onerror: (() => void) | null = null
    open() {}
    setRequestHeader() {}
    send() {
      this.onload?.()
    }
  }

  beforeEach(() => vi.stubGlobal('XMLHttpRequest', FakeXhr))
  afterEach(() => vi.restoreAllMocks())

  it('resolves ok on a 200 response', async () => {
    const result = await repo.uploadFile('t', [], new File(['x'], 'a.txt'))
    expect(result).toEqual({ ok: true, error: undefined })
  })

  it('resolves an error when the request fails', async () => {
    class ErrorXhr {
      upload: Record<string, unknown> = {}
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      open() {}
      setRequestHeader() {}
      send() {
        this.onerror?.()
      }
    }
    vi.stubGlobal('XMLHttpRequest', ErrorXhr)
    const result = await repo.uploadFile('t', [], new File(['x'], 'a.txt'))
    expect(result).toEqual({ ok: false, error: 'unknown' })
  })
})
