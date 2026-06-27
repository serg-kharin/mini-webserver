import { useTranslation } from 'react-i18next'

interface Props {
  value: string
  onChange: (value: string) => void
}

export default function SearchBar({ value, onChange }: Props) {
  const { t } = useTranslation()
  return (
    <input
      type="search"
      placeholder={t('search.placeholder')}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}
