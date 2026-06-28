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

  it('shows a toast when creating a folder fails', async () => {
    renderWith(<App />, fakeUseCases({ createDirectory: async () => ({ ok: false, error: 'mkdir_failed' }) }))
    await waitFor(() => expect(screen.getByText('Internal: Music')).toBeInTheDocument())
    fireEvent.change(screen.getByPlaceholderText(/New folder/), { target: { value: 'X' } })
    fireEvent.click(screen.getByText('Create folder'))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Could not create folder'))
  })

  it('creates a folder without a toast on success', async () => {
    renderWith(<App />)
    await waitFor(() => expect(screen.getByText('Internal: Music')).toBeInTheDocument())
    fireEvent.change(screen.getByPlaceholderText(/New folder/), { target: { value: 'X' } })
    fireEvent.click(screen.getByText('Create folder'))
    await new Promise((r) => setTimeout(r, 50))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('deletes a file after inline confirmation', async () => {
    const deleteEntry = vi.fn(async () => ({ ok: true }))
    renderWith(<App />, fakeUseCases({ deleteEntry }))
    await waitFor(() => expect(screen.getByText('a.flac')).toBeInTheDocument())
    fireEvent.click(screen.getAllByText('Delete')[1])
    fireEvent.click(screen.getByText('Confirm'))
    await waitFor(() => expect(deleteEntry).toHaveBeenCalledWith('t', [], 'a.flac'))
  })

  it('does not delete when the user cancels', async () => {
    const deleteEntry = vi.fn(async () => ({ ok: true }))
    renderWith(<App />, fakeUseCases({ deleteEntry }))
    await waitFor(() => expect(screen.getByText('a.flac')).toBeInTheDocument())
    fireEvent.click(screen.getAllByText('Delete')[1])
    fireEvent.click(screen.getByText('Cancel'))
    expect(deleteEntry).not.toHaveBeenCalled()
  })

  it('falls back to a generic message when no error code is given', async () => {
    renderWith(<App />, fakeUseCases({ createDirectory: async () => ({ ok: false }) }))
    await waitFor(() => expect(screen.getByText('Internal: Music')).toBeInTheDocument())
    fireEvent.change(screen.getByPlaceholderText(/New folder/), { target: { value: 'X' } })
    fireEvent.click(screen.getByText('Create folder'))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('An error occurred'))
  })

  it('shows a toast when deleting fails', async () => {
    renderWith(<App />, fakeUseCases({ deleteEntry: async () => ({ ok: false }) }))
    await waitFor(() => expect(screen.getByText('a.flac')).toBeInTheDocument())
    fireEvent.click(screen.getAllByText('Delete')[1])
    fireEvent.click(screen.getByText('Confirm'))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('An error occurred'))
  })
})
