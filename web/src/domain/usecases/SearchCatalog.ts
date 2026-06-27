import type { StorageRepository } from '@/domain/repositories/StorageRepository'

export const makeSearchCatalog = (repo: StorageRepository) => (folderId: string, query: string) =>
  repo.search(folderId, query)
