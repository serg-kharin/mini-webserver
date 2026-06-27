import type { ActionResult, DirListing, Folder, SearchHit } from '@/domain/models/types'

export interface StorageRepository {
  getFolders(): Promise<Folder[]>
  list(folderId: string, path: string[]): Promise<DirListing>
  search(folderId: string, query: string): Promise<SearchHit[]>
  createDirectory(folderId: string, path: string[], name: string): Promise<ActionResult>
  deleteEntry(folderId: string, path: string[], name: string): Promise<ActionResult>
  uploadFile(
    folderId: string,
    path: string[],
    file: File,
    onProgress?: (fraction: number) => void,
  ): Promise<ActionResult>
}
