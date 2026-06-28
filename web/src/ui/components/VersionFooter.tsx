import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useUseCases } from '@/app/UseCasesContext'

// Shows the app (APK) version reported by the device and the UI bundle version.
export default function VersionFooter() {
  const { t } = useTranslation()
  const { getServerVersion } = useUseCases()
  const [app, setApp] = useState('')

  useEffect(() => {
    void getServerVersion().then(setApp)
  }, [getServerVersion])

  const parts = []
  if (app) parts.push(t('footer.app', { version: app }))
  parts.push(t('footer.ui', { version: __UI_VERSION__ }))

  return <footer className="app-footer muted">{parts.join(' · ')}</footer>
}
