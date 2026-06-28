import HttpStorageRepository from '@/data/HttpStorageRepository'
import type { StorageRepository } from '@/domain/repositories/StorageRepository'
import { makeGetFolders } from '@/domain/usecases/GetFolders'
import { makeListDirectory } from '@/domain/usecases/ListDirectory'
import { makeSearchCatalog } from '@/domain/usecases/SearchCatalog'
import { makeCreateDirectory } from '@/domain/usecases/CreateDirectory'
import { makeDeleteEntry } from '@/domain/usecases/DeleteEntry'
import { makeUploadFiles } from '@/domain/usecases/UploadFiles'
import { makeDownloadUrl } from '@/domain/usecases/DownloadUrl'

export function createUseCases(repository: StorageRepository = new HttpStorageRepository('/api')) {
  return {
    getFolders: makeGetFolders(repository),
    listDirectory: makeListDirectory(repository),
    searchCatalog: makeSearchCatalog(repository),
    createDirectory: makeCreateDirectory(repository),
    deleteEntry: makeDeleteEntry(repository),
    uploadFiles: makeUploadFiles(repository),
    downloadUrl: makeDownloadUrl(repository),
  }
}

export type UseCases = ReturnType<typeof createUseCases>

export const useCases: UseCases = createUseCases()
