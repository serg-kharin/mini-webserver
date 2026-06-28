import { UNKNOWN_ERROR } from '@/domain/models/errors'
import { StorageKind } from '@/domain/models/types'
import type { ActionResult, DirListing, Folder, SearchResult } from '@/domain/models/types'
import type { StorageRepository } from '@/domain/repositories/StorageRepository'

const Endpoint = {
  folders: '/folders',
  list: '/list',
  search: '/search',
  upload: '/upload',
  mkdir: '/mkdir',
  delete: '/delete',
  download: '/download',
  version: '/version',
} as const

const Param = {
  folder: 'folder',
  path: 'path',
  name: 'name',
  query: 'q',
  overwrite: 'overwrite',
} as const

// Custom header the server requires; blocks cross-site (no-cors/form) requests.
const REQUEST_HEADERS = { 'X-Requested-With': 'fetch' }

interface FolderDto {
  id: string
  name: string
  storage: string
}
interface ListingDto {
  dirs?: string[]
  files?: { name: string; size: number }[]
}
interface SearchHitDto {
  name: string
  path: string
  dir: boolean
  size: number
}
interface SearchResultDto {
  hits?: SearchHitDto[]
  truncated?: boolean
}
interface ResultDto {
  ok?: boolean
  error?: string
}
interface VersionDto {
  app?: string
}

// The server returns machine-readable error codes (no localized text); the UI
// maps them to messages via i18n.
export default class HttpStorageRepository implements StorageRepository {
  private readonly base: string

  constructor(baseUrl = '/api') {
    this.base = baseUrl
  }

  async getFolders(): Promise<Folder[]> {
    const r = await fetch(this.url(Endpoint.folders), { headers: REQUEST_HEADERS })
    if (!r.ok) return []
    const data = (await r.json()) as FolderDto[]
    return data.map((f) => ({ id: f.id, name: f.name, storage: toStorageKind(f.storage) }))
  }

  async list(folderId: string, path: string[]): Promise<DirListing> {
    const r = await fetch(this.url(Endpoint.list, locate(folderId, path)), { headers: REQUEST_HEADERS })
    if (!r.ok) return { dirs: [], files: [] }
    const d = (await r.json()) as ListingDto
    return {
      dirs: d.dirs ?? [],
      files: (d.files ?? []).map((f) => ({ name: f.name, size: f.size })),
    }
  }

  async search(folderId: string, query: string): Promise<SearchResult> {
    const r = await fetch(
      this.url(Endpoint.search, { [Param.folder]: folderId, [Param.query]: query }),
      { headers: REQUEST_HEADERS },
    )
    if (!r.ok) return { hits: [], truncated: false }
    const data = (await r.json()) as SearchResultDto
    return {
      hits: (data.hits ?? []).map((x) => ({ name: x.name, path: x.path, dir: !!x.dir, size: x.size })),
      truncated: data.truncated === true,
    }
  }

  createDirectory(folderId: string, path: string[], name: string): Promise<ActionResult> {
    return this.post(this.url(Endpoint.mkdir, { ...locate(folderId, path), [Param.name]: name }))
  }

  deleteEntry(folderId: string, path: string[], name: string): Promise<ActionResult> {
    return this.post(this.url(Endpoint.delete, { ...locate(folderId, path), [Param.name]: name }))
  }

  downloadUrl(folderId: string, path: string[], name: string): string {
    return this.url(Endpoint.download, { ...locate(folderId, path), [Param.name]: name })
  }

  async serverVersion(): Promise<string> {
    try {
      const r = await fetch(this.url(Endpoint.version), { headers: REQUEST_HEADERS })
      if (!r.ok) return ''
      const d = (await r.json()) as VersionDto
      return d.app ?? ''
    } catch {
      return ''
    }
  }

  uploadFile(
    folderId: string,
    path: string[],
    file: File,
    overwrite: boolean,
    onProgress?: (fraction: number) => void,
  ): Promise<ActionResult> {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest()
      const params: Record<string, string> = { ...locate(folderId, path), [Param.name]: file.name }
      if (overwrite) params[Param.overwrite] = 'true'
      xhr.open('POST', this.url(Endpoint.upload, params))
      xhr.setRequestHeader('X-Requested-With', 'fetch')
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total)
      }
      xhr.onload = () => resolve(toResult(xhr.status, xhr.responseText))
      xhr.onerror = () => resolve({ ok: false, error: UNKNOWN_ERROR })
      const form = new FormData()
      form.append('file', file, file.name)
      xhr.send(form)
    })
  }

  private url(path: string, params: Record<string, string> = {}): string {
    const query = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&')
    return query ? `${this.base}${path}?${query}` : `${this.base}${path}`
  }

  private async post(url: string): Promise<ActionResult> {
    try {
      const r = await fetch(url, { method: 'POST', headers: REQUEST_HEADERS })
      return toResult(r.status, await r.text())
    } catch {
      return { ok: false, error: UNKNOWN_ERROR }
    }
  }
}

const locate = (folderId: string, path: string[]): Record<string, string> => ({
  [Param.folder]: folderId,
  [Param.path]: path.join('/'),
})

const toStorageKind = (value: string): StorageKind =>
  value === StorageKind.Internal || value === StorageKind.Sd ? value : StorageKind.Unknown

function toResult(status: number, text: string): ActionResult {
  let body: ResultDto = {}
  try {
    body = text ? (JSON.parse(text) as ResultDto) : {}
  } catch {
    /* non-JSON body — fall back to status */
  }
  const ok = status >= 200 && status < 300 && body.ok !== false
  return { ok, error: body.error }
}
