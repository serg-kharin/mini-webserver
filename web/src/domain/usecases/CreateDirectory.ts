import type { StorageRepository } from '@/domain/repositories/StorageRepository'

export const makeCreateDirectory =
  (repo: StorageRepository) => (folderId: string, path: string[], name: string) =>
    repo.createDirectory(folderId, path, name)
