import { useTranslation } from 'react-i18next'
import type { DirListing, SearchHit } from '@/domain/models/types'
import { humanSize } from '@/ui/format'

interface Props {
  loading: boolean
  listing: DirListing
  results: SearchHit[] | null
  path: string[]
  onOpenDir: (name: string) => void
  onUp: () => void
  onDelete: (name: string) => void
  onOpenResult: (hit: SearchHit) => void
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
}: Props) {
  const { t } = useTranslation()

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
          </li>
        ))}
      </ul>
    )
  }

  const isEmpty = listing.dirs.length === 0 && listing.files.length === 0 && path.length === 0

  return (
    <ul className="entries">
      {path.length > 0 && (
        <li className="entry dir" onClick={onUp}>
          <span className="name">⬆ {t('list.up')}</span>
        </li>
      )}
      {listing.dirs.map((dir) => (
        <li key={`d:${dir}`} className="entry dir" onClick={() => onOpenDir(dir)}>
          <span className="name">📁 {dir}</span>
        </li>
      ))}
      {listing.files.map((file) => (
        <li key={`f:${file.name}`} className="entry">
          <span className="name">{file.name}</span>
          <span className="size">{humanSize(file.size)}</span>
          <button className="outline secondary" onClick={() => onDelete(file.name)}>
            {t('entry.delete')}
          </button>
        </li>
      ))}
      {isEmpty && <li className="muted">{t('list.empty')}</li>}
    </ul>
  )
}
