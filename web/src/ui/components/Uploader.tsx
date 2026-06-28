import { useRef, useState, type DragEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useUseCases } from '@/app/UseCasesContext'
import type { UploadEntry } from '@/domain/usecases/UploadFiles'
import { readDataTransfer } from '@/ui/dropEntries'

interface Props {
  folderId: string
  path: string[]
  onDone: () => void
}

interface UploadItem {
  name: string
  pct: number
  ok: boolean | null
}

const filesToEntries = (files: FileList | null): UploadEntry[] =>
  Array.from(files ?? []).map((file) => ({ file, path: [] }))

export default function Uploader({ folderId, path, onDone }: Props) {
  const { t } = useTranslation()
  const { uploadFiles } = useUseCases()
  const inputRef = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  const [items, setItems] = useState<UploadItem[]>([])
  const [summary, setSummary] = useState('')

  const handle = async (entries: UploadEntry[]) => {
    if (!folderId || entries.length === 0) return

    setItems(entries.map((e) => ({ name: e.file.name, pct: 0, ok: null })))
    const result = await uploadFiles(folderId, path, entries, {
      onProgressText: (current, total, name) => setSummary(t('upload.progress', { current, total, name })),
      onItemProgress: (index, fraction) =>
        setItems((prev) => prev.map((it, i) => (i === index ? { ...it, pct: fraction } : it))),
      onItemDone: (index, ok) =>
        setItems((prev) => prev.map((it, i) => (i === index ? { ...it, pct: 1, ok } : it))),
    })

    const errors = result.failed ? t('upload.errors', { failed: result.failed }) : ''
    setSummary(t('upload.done', { done: result.done, total: result.total }) + errors)
    onDone()
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
        onChange={(e) => void handle(filesToEntries(e.target.files))}
      />
      {summary && <p className="muted">{summary}</p>}
      {items.map((it, i) => (
        <div key={i} className="upload-item">
          <small className="name">{it.name}</small>
          <progress value={it.pct} max={1} className={it.ok === false ? 'error' : ''} />
        </div>
      ))}
    </div>
  )
}
