export const StorageKind = {
  Internal: 'internal',
  Sd: 'sd',
  Unknown: 'unknown',
} as const

export type StorageKind = (typeof StorageKind)[keyof typeof StorageKind]

export interface Folder {
  id: string
  name: string
  storage: StorageKind
}

export interface FileEntry {
  name: string
  size: number
}

export interface DirListing {
  dirs: string[]
  files: FileEntry[]
}

export interface SearchHit {
  name: string
  path: string
  dir: boolean
  size: number
}

export interface SearchResult {
  hits: SearchHit[]
  // True when the scan was cut short by the result/directory caps.
  truncated: boolean
}

export interface ActionResult {
  ok: boolean
  error?: string
}
