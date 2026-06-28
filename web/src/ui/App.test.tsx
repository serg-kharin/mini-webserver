import { fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '@/ui/App'
import { fakeUseCases, renderWith } from '@/test/fakes'

function setLanguages(languages: string[]) {
  Object.defineProperty(window.navigator, 'languages', { value: languages, configurable: true })
}

describe('App', () => {
  afterEach(() => {
    setLanguages(['en-US'])
    vi.restoreAllMocks()
  })

  it('renders and lists the granted folder', async () => {
    renderWith(<App />)
    expect(screen.getByText('Mini Webserver')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('Internal: Music')).toBeInTheDocument())
  })

  it('shows a notice when no folders are granted', async () => {
    renderWith(<App />, fakeUseCases({ getFolders: async () => [] }))
    await waitFor(() => expect(screen.getByText(/No folders granted/)).toBeInTheDocument())
  })

  it('asks for a language when none is detected', () => {
    setLanguages(['fr-FR'])
    renderWith(<App />)
    expect(screen.getByText(/Choose language/)).toBeInTheDocument()
    fireEvent.click(screen.getByText('Русский'))
    expect(screen.getByText('Mini Webserver')).toBeInTheDocument()
  })

  it('alerts when creating a folder fails', async () => {
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {})
    renderWith(<App />, fakeUseCases({ createDirectory: async () => ({ ok: false, error: 'mkdir_failed' }) }))
    await waitFor(() => expect(screen.getByText('Internal: Music')).toBeInTheDocument())
    fireEvent.change(screen.getByPlaceholderText(/New folder/), { target: { value: 'X' } })
    fireEvent.click(screen.getByText('Create folder'))
    await waitFor(() => expect(alert).toHaveBeenCalled())
  })

  it('creates a folder without alerting on success', async () => {
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {})
    renderWith(<App />)
    await waitFor(() => expect(screen.getByText('Internal: Music')).toBeInTheDocument())
    fireEvent.change(screen.getByPlaceholderText(/New folder/), { target: { value: 'X' } })
    fireEvent.click(screen.getByText('Create folder'))
    await new Promise((r) => setTimeout(r, 50))
    expect(alert).not.toHaveBeenCalled()
  })

  it('deletes without alerting on success', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {})
    renderWith(<App />)
    await waitFor(() => expect(screen.getByText('a.flac')).toBeInTheDocument())
    fireEvent.click(screen.getAllByText('Delete')[1])
    await new Promise((r) => setTimeout(r, 50))
    expect(alert).not.toHaveBeenCalled()
  })

  it('does not delete when the user cancels', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const deleteEntry = vi.fn(async () => ({ ok: true }))
    renderWith(<App />, fakeUseCases({ deleteEntry }))
    await waitFor(() => expect(screen.getByText('a.flac')).toBeInTheDocument())
    fireEvent.click(screen.getAllByText('Delete')[0])
    expect(deleteEntry).not.toHaveBeenCalled()
  })

  it('falls back to a generic message when no error code is given', async () => {
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {})
    renderWith(<App />, fakeUseCases({ createDirectory: async () => ({ ok: false }) }))
    await waitFor(() => expect(screen.getByText('Internal: Music')).toBeInTheDocument())
    fireEvent.change(screen.getByPlaceholderText(/New folder/), { target: { value: 'X' } })
    fireEvent.click(screen.getByText('Create folder'))
    await waitFor(() => expect(alert).toHaveBeenCalled())
  })

  it('alerts when deleting fails', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {})
    renderWith(<App />, fakeUseCases({ deleteEntry: async () => ({ ok: false }) }))
    await waitFor(() => expect(screen.getByText('a.flac')).toBeInTheDocument())
    fireEvent.click(screen.getAllByText('Delete')[0])
    await waitFor(() => expect(alert).toHaveBeenCalled())
  })
})
