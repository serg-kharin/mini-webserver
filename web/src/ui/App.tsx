import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UNKNOWN_ERROR } from '@/domain/models/errors'
import { detectLanguage, setLanguage, type Lang } from '@/i18n/i18n'
import { useFolderBrowser } from '@/ui/hooks/useFolderBrowser'
import LanguageGate from '@/ui/components/LanguageGate'
import LanguageSwitch from '@/ui/components/LanguageSwitch'
import FolderSelect from '@/ui/components/FolderSelect'
import Breadcrumbs from '@/ui/components/Breadcrumbs'
import SearchBar from '@/ui/components/SearchBar'
import NewFolder from '@/ui/components/NewFolder'
import Uploader from '@/ui/components/Uploader'
import EntryList from '@/ui/components/EntryList'
import Toast from '@/ui/components/Toast'
import VersionFooter from '@/ui/components/VersionFooter'

const TOAST_MS = 4000

export default function App() {
  const { t } = useTranslation()
  const [lang, setLang] = useState<Lang | null>(() => detectLanguage())
  const [toast, setToast] = useState<string | null>(null)
  const browser = useFolderBrowser()

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), TOAST_MS)
    return () => clearTimeout(timer)
  }, [toast])

  if (!lang) {
    return (
      <LanguageGate
        onChoose={(l) => {
          setLanguage(l)
          setLang(l)
        }}
      />
    )
  }

  const notifyError = (error?: string) => setToast(t(`errors.${error ?? UNKNOWN_ERROR}`))

  const onCreateDirectory = async (name: string) => {
    const result = await browser.createDirectory(name)
    if (!result.ok) notifyError(result.error)
  }

  const onDeleteFile = async (name: string) => {
    const result = await browser.deleteFile(name)
    if (!result.ok) notifyError(result.error)
  }

  return (
    <>
      <header className="app-header">
        <hgroup>
          <h1>{t('app.title')}</h1>
          <p>{t('app.subtitle')}</p>
        </hgroup>
        <LanguageSwitch />
      </header>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {browser.folders.length === 0 && <p className="muted">{t('folders.none')}</p>}
      <FolderSelect
        folders={browser.folders}
        value={browser.folderId}
        onChange={browser.selectFolder}
      />

      <Uploader folderId={browser.folderId} path={browser.path} onDone={browser.refresh} />

      <h2>{t('content.title')}</h2>
      <SearchBar value={browser.query} onChange={browser.setQuery} />
      {!browser.query && (
        <>
          <Breadcrumbs path={browser.path} onGo={browser.goTo} />
          <NewFolder onCreate={onCreateDirectory} disabled={!browser.folderId} />
        </>
      )}
      <EntryList
        loading={browser.loading}
        listing={browser.listing}
        results={browser.results}
        path={browser.path}
        onOpenDir={browser.openDir}
        onUp={browser.goUp}
        onDelete={onDeleteFile}
        onOpenResult={browser.openResult}
        downloadUrl={browser.downloadUrl}
      />
      <VersionFooter />
    </>
  )
}
