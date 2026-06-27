import type { StorageRepository } from '@/domain/repositories/StorageRepository'

export const makeGetFolders = (repo: StorageRepository) => () => repo.getFolders()
