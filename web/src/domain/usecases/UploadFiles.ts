import type { StorageRepository } from '@/domain/repositories/StorageRepository'

export interface UploadEntry {
  file: File
  // Path relative to the destination folder (subfolders for dropped directories).
  path: string[]
}

export interface UploadCallbacks {
  onItemProgress?: (index: number, fraction: number) => void
  onItemDone?: (index: number, ok: boolean) => void
  onProgressText?: (current: number, total: number, name: string) => void
}

export interface UploadSummary {
  total: number
  done: number
  failed: number
}

// one file at a time, so progress is per-file
export const makeUploadFiles =
  (repo: StorageRepository) =>
  async (
    folderId: string,
    basePath: string[],
    entries: UploadEntry[],
    callbacks: UploadCallbacks = {},
  ): Promise<UploadSummary> => {
    const { onItemProgress, onItemDone, onProgressText } = callbacks
    const total = entries.length
    let done = 0
    let failed = 0
    for (let i = 0; i < entries.length; i++) {
      const { file, path } = entries[i]
      onProgressText?.(i + 1, total, file.name)
      const result = await repo.uploadFile(folderId, [...basePath, ...path], file, (fraction) =>
        onItemProgress?.(i, fraction),
      )
      onItemDone?.(i, result.ok)
      if (result.ok) done++
      else failed++
    }
    return { total, done, failed }
  }
