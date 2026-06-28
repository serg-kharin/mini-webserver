import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { UseCasesProvider } from '@/app/UseCasesContext'
import type { UseCases } from '@/app/container'

export function fakeUseCases(overrides: Partial<UseCases> = {}): UseCases {
  return {
    getFolders: async () => [{ id: 't', name: 'Music', storage: 'internal' }],
    listDirectory: async () => ({ dirs: ['Album'], files: [{ name: 'a.flac', size: 10 }] }),
    searchCatalog: async () => [{ name: 'a.flac', path: 'Album', dir: false, size: 10 }],
    createDirectory: async () => ({ ok: true }),
    deleteEntry: async () => ({ ok: true }),
    uploadFiles: async () => ({ total: 0, done: 0, failed: 0, conflicts: 0 }),
    downloadUrl: (_folderId, path, name) => `/api/download?path=${path.join('/')}&name=${name}`,
    getServerVersion: async () => '1.2.3',
    ...overrides,
  }
}

export function renderWith(ui: ReactElement, useCases: UseCases = fakeUseCases()) {
  return render(<UseCasesProvider useCases={useCases}>{ui}</UseCasesProvider>)
}
