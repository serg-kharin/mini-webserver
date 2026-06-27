import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '@/ui/App'
import { fakeUseCases, renderWith } from '@/test/fakes'

describe('App', () => {
  it('renders and lists the granted folder', async () => {
    renderWith(<App />)
    expect(screen.getByText('Mini Webserver')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('Internal: Music')).toBeInTheDocument())
  })

  it('shows a notice when no folders are granted', async () => {
    renderWith(<App />, fakeUseCases({ getFolders: async () => [] }))
    await waitFor(() => expect(screen.getByText(/No folders granted/)).toBeInTheDocument())
  })
})
