import { useCallback, useEffect, useRef, useState } from 'react'
import { useUseCases } from '@/app/UseCasesContext'
import type { ActionResult, DirListing, Folder, SearchHit } from '@/domain/models/types'
import { splitPath } from '@/domain/util/path'

export function useFolderBrowser() {
  const useCases = useUseCases()

  const [folders, setFolders] = useState<Folder[]>([])
  const [folderId, setFolderId] = useState('')
  const [path, setPath] = useState<string[]>([])
  const [listing, setListing] = useState<DirListing>({ dirs: [], files: [] })
  const [results, setResults] = useState<SearchHit[] | null>(null)
  const [truncated, setTruncated] = useState(false)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  // ignore stale responses so fast clicks don't render an old list
  const requestId = useRef(0)

  useEffect(() => {
    void useCases.getFolders().then((fs) => {
      setFolders(fs)
      if (fs.length) setFolderId(fs[0].id)
    })
  }, [useCases])

  const refresh = useCallback(async () => {
    if (!folderId) {
      setListing({ dirs: [], files: [] })
      return
    }
    const seq = ++requestId.current
    setLoading(true)
    try {
      const data = await useCases.listDirectory(folderId, path)
      if (seq === requestId.current) setListing(data)
    } finally {
      if (seq === requestId.current) setLoading(false)
    }
  }, [useCases, folderId, path])

  useEffect(() => {
    if (!query) void refresh()
  }, [query, refresh])

  useEffect(() => {
    if (!query || !folderId) {
      setResults(null)
      setTruncated(false)
      return
    }
    const seq = ++requestId.current
    setLoading(true)
    const timer = setTimeout(() => {
      void useCases.searchCatalog(folderId, query).then((result) => {
        if (seq === requestId.current) {
          setResults(result.hits)
          setTruncated(result.truncated)
          setLoading(false)
        }
      })
    }, 250)
    return () => clearTimeout(timer)
  }, [useCases, query, folderId])

  const selectFolder = useCallback((id: string) => {
    setQuery('')
    setResults(null)
    setPath([])
    setFolderId(id)
  }, [])

  const openDir = useCallback((name: string) => {
    setQuery('')
    setResults(null)
    setPath((p) => [...p, name])
  }, [])

  const goUp = useCallback(() => setPath((p) => p.slice(0, -1)), [])

  const downloadUrl = useCallback(
    (entryPath: string[], name: string) => useCases.downloadUrl(folderId, entryPath, name),
    [useCases, folderId],
  )

  const goTo = useCallback(
    (index: number) => setPath((p) => (index < 0 ? [] : p.slice(0, index + 1))),
    [],
  )

  const openResult = useCallback((hit: SearchHit) => {
    const base = splitPath(hit.path)
    setQuery('')
    setResults(null)
    setPath(hit.dir ? [...base, hit.name] : base)
  }, [])

  const createDirectory = useCallback(
    async (name: string): Promise<ActionResult> => {
      const result = await useCases.createDirectory(folderId, path, name)
      if (result.ok) setPath((p) => [...p, name])
      return result
    },
    [useCases, folderId, path],
  )

  const deleteFile = useCallback(
    async (name: string): Promise<ActionResult> => {
      const result = await useCases.deleteEntry(folderId, path, name)
      if (result.ok) void refresh()
      return result
    },
    [useCases, folderId, path, refresh],
  )

  return {
    folders,
    folderId,
    path,
    listing,
    results,
    truncated,
    query,
    loading,
    setQuery,
    selectFolder,
    openDir,
    goUp,
    goTo,
    openResult,
    downloadUrl,
    createDirectory,
    deleteFile,
    refresh,
  }
}
