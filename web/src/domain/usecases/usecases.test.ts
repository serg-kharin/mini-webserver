import { describe, expect, it, vi } from 'vitest'
import { makeGetFolders } from '@/domain/usecases/GetFolders'
import { makeListDirectory } from '@/domain/usecases/ListDirectory'
import { makeSearchCatalog } from '@/domain/usecases/SearchCatalog'
import { makeCreateDirectory } from '@/domain/usecases/CreateDirectory'
import { makeDeleteEntry } from '@/domain/usecases/DeleteEntry'
import { makeUploadFiles } from '@/domain/usecases/UploadFiles'
import { makeDownloadUrl } from '@/domain/usecases/DownloadUrl'
import { makeGetServerVersion } from '@/domain/usecases/GetServerVersion'
import type { StorageRepository } from '@/domain/repositories/StorageRepository'

const repo = (over: Partial<StorageRepository> = {}): StorageRepository => ({
  getFolders: vi.fn(async () => []),
  list: vi.fn(async () => ({ dirs: [], files: [] })),
  search: vi.fn(async () => []),
  createDirectory: vi.fn(async () => ({ ok: true })),
  deleteEntry: vi.fn(async () => ({ ok: true })),
  exists: vi.fn(async () => false),
  downloadUrl: vi.fn(() => '/api/download'),
  serverVersion: vi.fn(async () => '1.2.3'),
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

  it('downloadUrl delegates to the repository', () => {
    const r = repo()
    makeDownloadUrl(r)('f', ['a'], 'song.flac')
    expect(r.downloadUrl).toHaveBeenCalledWith('f', ['a'], 'song.flac')
  })

  it('getServerVersion delegates to the repository', async () => {
    const r = repo()
    expect(await makeGetServerVersion(r)()).toBe('1.2.3')
    expect(r.serverVersion).toHaveBeenCalled()
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

    expect(summary).toEqual({ total: 2, done: 2, failed: 0, conflicts: 0 })
    expect(onItemDone).toHaveBeenCalledTimes(2)
    expect(onProgressText).toHaveBeenCalledTimes(2)
  })

  it('uploadFiles counts failures', async () => {
    const r = repo({ uploadFile: vi.fn(async () => ({ ok: false, error: 'x' })) })
    const summary = await makeUploadFiles(r)('f', [], [{ file: new File(['z'], 'c.txt'), path: [] }])
    expect(summary).toEqual({ total: 1, done: 0, failed: 1, conflicts: 0 })
  })

  it('uploadFiles flags existing files as conflicts and skips the upload', async () => {
    const uploadFile = vi.fn(async () => ({ ok: true }))
    const r = repo({ exists: vi.fn(async () => true), uploadFile })
    const onItemDone = vi.fn()
    const summary = await makeUploadFiles(r)('f', [], [{ file: new File(['z'], 'c.txt'), path: [] }], {
      onItemDone,
    })
    expect(summary).toEqual({ total: 1, done: 0, failed: 0, conflicts: 1 })
    expect(uploadFile).not.toHaveBeenCalled()
    expect(onItemDone).toHaveBeenCalledWith(0, 'conflict')
  })

  it('uploadFiles overwrites without an existence check', async () => {
    const exists = vi.fn(async () => true)
    const uploadFile = vi.fn(async () => ({ ok: true }))
    const r = repo({ exists, uploadFile })
    const summary = await makeUploadFiles(r)('f', [], [{ file: new File(['z'], 'c.txt'), path: [] }], {
      overwrite: true,
    })
    expect(summary).toEqual({ total: 1, done: 1, failed: 0, conflicts: 0 })
    expect(exists).not.toHaveBeenCalled()
    expect(uploadFile).toHaveBeenCalledWith('f', [], expect.any(File), true, expect.any(Function))
  })
})
