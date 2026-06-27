import { useTranslation } from 'react-i18next'
import { StorageKind } from '@/domain/models/types'
import type { Folder } from '@/domain/models/types'

interface Props {
  folders: Folder[]
  value: string
  onChange: (id: string) => void
}

export default function FolderSelect({ folders, value, onChange }: Props) {
  const { t } = useTranslation()
  return (
    <label>
      {t('folders.label')}
      <select value={value} onChange={(e) => onChange(e.target.value)} disabled={!folders.length}>
        {folders.map((f) => (
          <option key={f.id} value={f.id}>
            {f.storage === StorageKind.Unknown ? f.name : `${t(`storage.${f.storage}`)}: ${f.name}`}
          </option>
        ))}
      </select>
    </label>
  )
}
