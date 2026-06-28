import type { StorageRepository } from '@/domain/repositories/StorageRepository'

// Builds the URL a browser can open directly to download a file.
export const makeDownloadUrl =
  (repo: StorageRepository) =>
  (folderId: string, path: string[], name: string): string =>
    repo.downloadUrl(folderId, path, name)
