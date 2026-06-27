import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@picocss/pico/css/pico.min.css'
import '@/ui/styles.css'
import '@/i18n/i18n'
import { UseCasesProvider } from '@/app/UseCasesContext'
import { useCases } from '@/app/container'
import App from '@/ui/App'

const container = document.getElementById('root')
if (!container) throw new Error('Root element #root not found')

createRoot(container).render(
  <StrictMode>
    <UseCasesProvider useCases={useCases}>
      <App />
    </UseCasesProvider>
  </StrictMode>,
)
