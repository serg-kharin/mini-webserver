import type { ActionResult, DirListing, Folder, SearchHit } from '@/domain/models/types'

export interface StorageRepository {
  getFolders(): Promise<Folder[]>
  list(folderId: string, path: string[]): Promise<DirListing>
  search(folderId: string, query: string): Promise<SearchHit[]>
  createDirectory(folderId: string, path: string[], name: string): Promise<ActionResult>
  deleteEntry(folderId: string, path: string[], name: string): Promise<ActionResult>
  exists(folderId: string, path: string[], name: string): Promise<boolean>
  downloadUrl(folderId: string, path: string[], name: string): string
  uploadFile(
    folderId: string,
    path: string[],
    file: File,
    overwrite: boolean,
    onProgress?: (fraction: number) => void,
  ): Promise<ActionResult>
}
