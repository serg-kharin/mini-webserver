import { useRef, useState, type DragEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useUseCases } from '@/app/UseCasesContext'
import type { UploadEntry, UploadSummary } from '@/domain/usecases/UploadFiles'
import { readDataTransfer } from '@/ui/dropEntries'

interface Props {
  folderId: string
  path: string[]
  onDone: () => void
}

type ItemState = 'uploading' | 'error' | 'conflict'

interface UploadItem {
  id: number
  entry: UploadEntry
  name: string
  pct: number
  state: ItemState
}

const filesToEntries = (files: FileList | null): UploadEntry[] =>
  Array.from(files ?? []).map((file) => ({ file, path: [] }))

export default function Uploader({ folderId, path, onDone }: Props) {
  const { t } = useTranslation()
  const { uploadFiles } = useUseCases()
  const inputRef = useRef<HTMLInputElement>(null)
  const idRef = useRef(0)
  const [over, setOver] = useState(false)
  const [items, setItems] = useState<UploadItem[]>([])
  const [summary, setSummary] = useState('')

  const updateItem = (id: number, patch: Partial<UploadItem>) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  const removeItem = (id: number) => setItems((prev) => prev.filter((it) => it.id !== id))

  const summaryText = (r: UploadSummary): string => {
    const errors = r.failed ? t('upload.errors', { failed: r.failed }) : ''
    const conflicts = r.conflicts ? t('upload.conflictsSummary', { conflicts: r.conflicts }) : ''
    return t('upload.done', { done: r.done, total: r.total }) + errors + conflicts
  }

  const run = async (batch: UploadItem[], overwrite: boolean) => {
    if (!folderId || batch.length === 0) return
    const ids = batch.map((it) => it.id)
    const entries = batch.map((it) => it.entry)
    const result = await uploadFiles(folderId, path, entries, {
      overwrite,
      onProgressText: (current, total, name) => setSummary(t('upload.progress', { current, total, name })),
      onItemProgress: (index, fraction) => updateItem(ids[index], { pct: fraction }),
      onItemDone: (index, status) => {
        // Drop finished rows so they don't pile up; keep failures and conflicts.
        if (status === 'done') removeItem(ids[index])
        else updateItem(ids[index], { state: status, pct: 1 })
      },
    })
    setSummary(summaryText(result))
    onDone()
  }

  const handle = (entries: UploadEntry[]) => {
    if (!folderId || entries.length === 0) return
    const batch: UploadItem[] = entries.map((entry) => ({
      id: idRef.current++,
      entry,
      name: entry.file.name,
      pct: 0,
      state: 'uploading',
    }))
    setItems(batch)
    void run(batch, false)
  }

  const restart = (item: UploadItem, overwrite: boolean) => {
    updateItem(item.id, { state: 'uploading', pct: 0 })
    void run([{ ...item, state: 'uploading', pct: 0 }], overwrite)
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setOver(false)
    void readDataTransfer(e.dataTransfer).then(handle)
  }

  return (
    <div>
      <div
        className={over ? 'drop over' : 'drop'}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          setOver(false)
        }}
        onDrop={onDrop}
      >
        {t('upload.drop')}
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        onChange={(e) => handle(filesToEntries(e.target.files))}
      />
      {summary && <p className="muted">{summary}</p>}
      {items.map((it) => (
        <div key={it.id} className="upload-item">
          <small className="name">{it.name}</small>
          {it.state === 'uploading' && <progress value={it.pct} max={1} />}
          {it.state === 'error' && (
            <span className="upload-actions">
              <small className="error">{t('upload.failed')}</small>
              <button className="outline" onClick={() => restart(it, false)}>
                {t('upload.retry')}
              </button>
            </span>
          )}
          {it.state === 'conflict' && (
            <span className="upload-actions">
              <small className="error">{t('upload.exists')}</small>
              <button className="outline" onClick={() => restart(it, true)}>
                {t('upload.replace')}
              </button>
              <button className="outline secondary" onClick={() => removeItem(it.id)}>
                {t('upload.skip')}
              </button>
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
