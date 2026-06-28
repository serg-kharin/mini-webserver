import { describe, expect, it, vi } from 'vitest'
import { makeGetFolders } from '@/domain/usecases/GetFolders'
import { makeListDirectory } from '@/domain/usecases/ListDirectory'
import { makeSearchCatalog } from '@/domain/usecases/SearchCatalog'
import { makeCreateDirectory } from '@/domain/usecases/CreateDirectory'
import { makeDeleteEntry } from '@/domain/usecases/DeleteEntry'
import { makeUploadFiles } from '@/domain/usecases/UploadFiles'
import type { StorageRepository } from '@/domain/repositories/StorageRepository'

const repo = (over: Partial<StorageRepository> = {}): StorageRepository => ({
  getFolders: vi.fn(async () => []),
  list: vi.fn(async () => ({ dirs: [], files: [] })),
  search: vi.fn(async () => []),
  createDirectory: vi.fn(async () => ({ ok: true })),
  deleteEntry: vi.fn(async () => ({ ok: true })),
  uploadFile: vi.fn(async () => ({ ok: true })),
  ...over,
})

describe('use cases', () => {
  it('delegate to the repository', async () => {
    const r = repo()
    await makeGetFolders(r)()
    await makeListDirectory(r)('f', ['a'])
    await makeSearchCatalog(r)('f', 'q')
    await makeCreateDirectory(r)('f', [], 'n')
    await makeDeleteEntry(r)('f', [], 'n')
    expect(r.getFolders).toHaveBeenCalled()
    expect(r.list).toHaveBeenCalledWith('f', ['a'])
    expect(r.search).toHaveBeenCalledWith('f', 'q')
  })

  it('uploadFiles reports per-file callbacks and a summary', async () => {
    const r = repo()
    const onItemDone = vi.fn()
    const onProgressText = vi.fn()
    const entries = [
      { file: new File(['x'], 'a.txt'), path: [] },
      { file: new File(['y'], 'b.txt'), path: [] },
    ]

    const summary = await makeUploadFiles(r)('f', [], entries, { onItemDone, onProgressText })

    expect(summary).toEqual({ total: 2, done: 2, failed: 0 })
    expect(onItemDone).toHaveBeenCalledTimes(2)
    expect(onProgressText).toHaveBeenCalledTimes(2)
  })

  it('uploadFiles counts failures', async () => {
    const r = repo({ uploadFile: vi.fn(async () => ({ ok: false, error: 'x' })) })
    const summary = await makeUploadFiles(r)('f', [], [{ file: new File(['z'], 'c.txt'), path: [] }])
    expect(summary).toEqual({ total: 1, done: 0, failed: 1 })
  })
})
