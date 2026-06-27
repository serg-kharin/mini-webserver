import type { StorageRepository } from '@/domain/repositories/StorageRepository'

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

// Uploads run sequentially so progress reflects one file at a time.
export const makeUploadFiles =
  (repo: StorageRepository) =>
  async (
    folderId: string,
    path: string[],
    files: File[],
    callbacks: UploadCallbacks = {},
  ): Promise<UploadSummary> => {
    const { onItemProgress, onItemDone, onProgressText } = callbacks
    const total = files.length
    let done = 0
    let failed = 0
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      onProgressText?.(i + 1, total, file.name)
      const result = await repo.uploadFile(folderId, path, file, (fraction) =>
        onItemProgress?.(i, fraction),
      )
      onItemDone?.(i, result.ok)
      if (result.ok) done++
      else failed++
    }
    return { total, done, failed }
  }
