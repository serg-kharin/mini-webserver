import type { StorageRepository } from '@/domain/repositories/StorageRepository'

export interface UploadEntry {
  file: File
  // Path relative to the destination folder (subfolders for dropped directories).
  path: string[]
}

export type UploadStatus = 'done' | 'error' | 'conflict'

export interface UploadCallbacks {
  onItemProgress?: (index: number, fraction: number) => void
  onItemDone?: (index: number, status: UploadStatus) => void
  onProgressText?: (current: number, total: number, name: string) => void
}

export interface UploadOptions extends UploadCallbacks {
  // Replace files that already exist instead of flagging them as conflicts.
  overwrite?: boolean
}

export interface UploadSummary {
  total: number
  done: number
  failed: number
  conflicts: number
}

// one file at a time, so progress is per-file
export const makeUploadFiles =
  (repo: StorageRepository) =>
  async (
    folderId: string,
    basePath: string[],
    entries: UploadEntry[],
    options: UploadOptions = {},
  ): Promise<UploadSummary> => {
    const { overwrite = false, onItemProgress, onItemDone, onProgressText } = options
    const total = entries.length
    const summary: UploadSummary = { total, done: 0, failed: 0, conflicts: 0 }
    for (let i = 0; i < entries.length; i++) {
      const { file, path } = entries[i]
      const fullPath = [...basePath, ...path]
      onProgressText?.(i + 1, total, file.name)

      // Don't clobber an existing file unless the caller asked to overwrite.
      if (!overwrite && (await repo.exists(folderId, fullPath, file.name))) {
        summary.conflicts++
        onItemDone?.(i, 'conflict')
        continue
      }

      const result = await repo.uploadFile(folderId, fullPath, file, overwrite, (fraction) =>
        onItemProgress?.(i, fraction),
      )
      const status: UploadStatus =
        result.ok ? 'done' : result.error === 'file_exists' ? 'conflict' : 'error'
      if (status === 'done') summary.done++
      else if (status === 'conflict') summary.conflicts++
      else summary.failed++
      onItemDone?.(i, status)
    }
    return summary
  }
