import type { StorageRepository } from '@/domain/repositories/StorageRepository'

export const makeDeleteEntry =
  (repo: StorageRepository) => (folderId: string, path: string[], name: string) =>
    repo.deleteEntry(folderId, path, name)
