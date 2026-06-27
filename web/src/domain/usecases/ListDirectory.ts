import type { StorageRepository } from '@/domain/repositories/StorageRepository'

export const makeListDirectory = (repo: StorageRepository) => (folderId: string, path: string[]) =>
  repo.list(folderId, path)
