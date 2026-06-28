import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { DirListing, SearchHit } from '@/domain/models/types'
import { splitPath } from '@/domain/util/path'
import { humanSize } from '@/ui/format'

const PAGE_SIZE = 20

interface Props {
  loading: boolean
  listing: DirListing
  results: SearchHit[] | null
  path: string[]
  onOpenDir: (name: string) => void
  onUp: () => void
  onDelete: (name: string) => void
  onOpenResult: (hit: SearchHit) => void
  downloadUrl: (path: string[], name: string) => string
}

export default function EntryList({
  loading,
  listing,
  results,
  path,
  onOpenDir,
  onUp,
  onDelete,
  onOpenResult,
  downloadUrl,
}: Props) {
  const { t } = useTranslation()
  const [page, setPage] = useState(0)
  const [confirm, setConfirm] = useState<string | null>(null)

  // Reset paging and any pending delete confirmation when the view changes.
  useEffect(() => {
    setPage(0)
    setConfirm(null)
  }, [listing, results])

  const downloadLink = (target: string[], name: string) => (
    <a
      className="outline secondary"
      role="button"
      href={downloadUrl(target, name)}
      download={name}
      onClick={(e) => e.stopPropagation()}
    >
      {t('entry.download')}
    </a>
  )

  const deleteControl = (name: string, key: string) =>
    confirm === key ? (
      <span className="confirm">
        <button
          className="outline secondary"
          onClick={(e) => {
            e.stopPropagation()
            setConfirm(null)
          }}
        >
          {t('entry.cancel')}
        </button>
        <button
          className="outline"
          onClick={(e) => {
            e.stopPropagation()
            setConfirm(null)
            onDelete(name)
          }}
        >
          {t('entry.confirm')}
        </button>
      </span>
    ) : (
      <button
        className="outline secondary"
        onClick={(e) => {
          e.stopPropagation()
          setConfirm(key)
        }}
      >
        {t('entry.delete')}
      </button>
    )

  if (loading) {
    return (
      <ul className="entries">
        <li className="muted">{t('list.loading')}</li>
      </ul>
    )
  }

  if (results !== null) {
    if (results.length === 0) {
      return (
        <ul className="entries">
          <li className="muted">{t('list.notFound')}</li>
        </ul>
      )
    }
    return (
      <ul className="entries">
        {results.map((hit, i) => (
          <li key={i} className={hit.dir ? 'entry dir' : 'entry'} onClick={() => onOpenResult(hit)}>
            <span className="name">
              {hit.dir ? '📁 ' : ''}
              {hit.name}
              <br />
              <small className="muted">{hit.path || t('list.root')}</small>
            </span>
            {!hit.dir && <span className="size">{humanSize(hit.size)}</span>}
            {!hit.dir && downloadLink(splitPath(hit.path), hit.name)}
          </li>
        ))}
      </ul>
    )
  }

  const isEmpty = listing.dirs.length === 0 && listing.files.length === 0 && path.length === 0
  const entries = [
    ...listing.dirs.map((name) => ({ kind: 'dir' as const, name, size: 0 })),
    ...listing.files.map((f) => ({ kind: 'file' as const, name: f.name, size: f.size })),
  ]
  const pageCount = Math.max(1, Math.ceil(entries.length / PAGE_SIZE))
  const current = Math.min(page, pageCount - 1)
  const visible = entries.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE)

  return (
    <ul className="entries">
      {path.length > 0 && (
        <li className="entry dir" onClick={onUp}>
          <span className="name">⬆ {t('list.up')}</span>
        </li>
      )}
      {visible.map((entry) =>
        entry.kind === 'dir' ? (
          <li key={`d:${entry.name}`} className="entry dir" onClick={() => onOpenDir(entry.name)}>
            <span className="name">📁 {entry.name}</span>
            {deleteControl(entry.name, `d:${entry.name}`)}
          </li>
        ) : (
          <li key={`f:${entry.name}`} className="entry">
            <span className="name">{entry.name}</span>
            <span className="size">{humanSize(entry.size)}</span>
            {downloadLink(path, entry.name)}
            {deleteControl(entry.name, `f:${entry.name}`)}
          </li>
        ),
      )}
      {isEmpty && <li className="muted">{t('list.empty')}</li>}
      {pageCount > 1 && (
        <li className="pager">
          <button className="outline" disabled={current === 0} onClick={() => setPage(current - 1)}>
            {t('list.prev')}
          </button>
          <span className="muted">{t('list.page', { page: current + 1, pages: pageCount })}</span>
          <button
            className="outline"
            disabled={current >= pageCount - 1}
            onClick={() => setPage(current + 1)}
          >
            {t('list.next')}
          </button>
        </li>
      )}
    </ul>
  )
}
