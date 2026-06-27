import { useState } from 'react'
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

export default function App() {
  const { t } = useTranslation()
  const [lang, setLang] = useState<Lang | null>(() => detectLanguage())
  const browser = useFolderBrowser()

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

  const onCreateDirectory = async (name: string) => {
    const result = await browser.createDirectory(name)
    if (!result.ok) alert(t(`errors.${result.error ?? UNKNOWN_ERROR}`))
  }

  const onDeleteFile = async (name: string) => {
    if (!confirm(t('entry.confirmDelete', { name }))) return
    const result = await browser.deleteFile(name)
    if (!result.ok) alert(t(`errors.${result.error ?? UNKNOWN_ERROR}`))
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
      />
    </>
  )
}
