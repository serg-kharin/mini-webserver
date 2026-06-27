import { useTranslation } from 'react-i18next'

interface Props {
  path: string[]
  onGo: (index: number) => void
}

export default function Breadcrumbs({ path, onGo }: Props) {
  const { t } = useTranslation()
  return (
    <nav aria-label="breadcrumb">
      <ul>
        <li>
          <a onClick={() => onGo(-1)}>{t('list.root')}</a>
        </li>
        {path.map((segment, i) => (
          <li key={i}>
            <a onClick={() => onGo(i)}>{segment}</a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
