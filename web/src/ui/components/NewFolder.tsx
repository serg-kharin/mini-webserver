import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  onCreate: (name: string) => void
  disabled: boolean
}

export default function NewFolder({ onCreate, disabled }: Props) {
  const { t } = useTranslation()
  const [name, setName] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed) {
      onCreate(trimmed)
      setName('')
    }
  }

  return (
    <form onSubmit={submit} className="grid">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('newFolder.placeholder')}
        disabled={disabled}
      />
      <button type="submit" disabled={disabled || !name.trim()}>
        {t('newFolder.create')}
      </button>
    </form>
  )
}
