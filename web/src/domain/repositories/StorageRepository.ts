import type { ActionResult, DirListing, Folder, SearchResult } from '@/domain/models/types'

export interface StorageRepository {
  getFolders(): Promise<Folder[]>
  list(folderId: string, path: string[]): Promise<DirListing>
  search(folderId: string, query: string): Promise<SearchResult>
  createDirectory(folderId: string, path: string[], name: string): Promise<ActionResult>
  deleteEntry(folderId: string, path: string[], name: string): Promise<ActionResult>
  downloadUrl(folderId: string, path: string[], name: string): string
  serverVersion(): Promise<string>
  uploadFile(
    folderId: string,
    path: string[],
    file: File,
    overwrite: boolean,
    onProgress?: (fraction: number) => void,
  ): Promise<ActionResult>
}
