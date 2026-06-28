import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import FolderSelect from '@/ui/components/FolderSelect'
import SearchBar from '@/ui/components/SearchBar'
import NewFolder from '@/ui/components/NewFolder'
import Breadcrumbs from '@/ui/components/Breadcrumbs'
import LanguageGate from '@/ui/components/LanguageGate'
import LanguageSwitch from '@/ui/components/LanguageSwitch'
import EntryList from '@/ui/components/EntryList'
import Toast from '@/ui/components/Toast'
import VersionFooter from '@/ui/components/VersionFooter'
import { fakeUseCases, renderWith } from '@/test/fakes'

describe('FolderSelect', () => {
  it('shows storage-prefixed labels and reports changes', () => {
    const onChange = vi.fn()
    render(
      <FolderSelect
        folders={[
          { id: 'a', name: 'Music', storage: 'internal' },
          { id: 'b', name: 'Music', storage: 'sd' },
          { id: 'c', name: 'Card', storage: 'unknown' },
        ]}
        value="a"
        onChange={onChange}
      />,
    )
    expect(screen.getByText('Internal: Music')).toBeInTheDocument()
    expect(screen.getByText('Card')).toBeInTheDocument()
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'b' } })
    expect(onChange).toHaveBeenCalledWith('b')
  })
})

describe('SearchBar', () => {
  it('reports typed text', () => {
    const onChange = vi.fn()
    render(<SearchBar value="" onChange={onChange} />)
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'hi' } })
    expect(onChange).toHaveBeenCalledWith('hi')
  })
})

describe('NewFolder', () => {
  it('creates a folder on submit', () => {
    const onCreate = vi.fn()
    render(<NewFolder onCreate={onCreate} disabled={false} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Album' } })
    fireEvent.click(screen.getByText('Create folder'))
    expect(onCreate).toHaveBeenCalledWith('Album')
  })

  it('ignores a blank submit', () => {
    const onCreate = vi.fn()
    render(<NewFolder onCreate={onCreate} disabled={false} />)
    fireEvent.submit(screen.getByRole('textbox').closest('form') as HTMLFormElement)
    expect(onCreate).not.toHaveBeenCalled()
  })
})

describe('Breadcrumbs', () => {
  it('navigates by segment', () => {
    const onGo = vi.fn()
    render(<Breadcrumbs path={['A', 'B']} onGo={onGo} />)
    fireEvent.click(screen.getByText('root'))
    expect(onGo).toHaveBeenCalledWith(-1)
    fireEvent.click(screen.getByText('B'))
    expect(onGo).toHaveBeenCalledWith(1)
  })
})

describe('LanguageGate', () => {
  it('reports the chosen language', () => {
    const onChoose = vi.fn()
    render(<LanguageGate onChoose={onChoose} />)
    fireEvent.click(screen.getByText('English'))
    expect(onChoose).toHaveBeenCalledWith('en')
  })
})

describe('LanguageSwitch', () => {
  it('renders both languages', () => {
    render(<LanguageSwitch />)
    expect(screen.getByText('RU')).toBeInTheDocument()
    expect(screen.getByText('EN')).toBeInTheDocument()
    fireEvent.click(screen.getByText('RU'))
  })
})

describe('Toast', () => {
  it('shows a message and closes', () => {
    const onClose = vi.fn()
    render(<Toast message="Boom" onClose={onClose} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Boom')
    fireEvent.click(screen.getByLabelText('close'))
    expect(onClose).toHaveBeenCalled()
  })
})

describe('VersionFooter', () => {
  it('shows the app and UI versions', async () => {
    renderWith(<VersionFooter />, fakeUseCases({ getServerVersion: async () => '9.9.9' }))
    await screen.findByText(/App 9\.9\.9/)
    expect(screen.getByText(/UI /)).toBeInTheDocument()
  })

  it('omits the app version when the server does not report one', async () => {
    renderWith(<VersionFooter />, fakeUseCases({ getServerVersion: async () => '' }))
    await screen.findByText(/UI /)
    expect(screen.queryByText(/App /)).not.toBeInTheDocument()
  })
})

describe('EntryList', () => {
  const listing = { dirs: ['Album'], files: [{ name: 'a.flac', size: 10 }] }
  const downloadUrl = (path: string[], name: string) => `/api/download?path=${path.join('/')}&name=${name}`

  it('shows a loading state', () => {
    render(
      <EntryList
        loading
        listing={{ dirs: [], files: [] }}
        results={null}
        path={[]}
        onOpenDir={vi.fn()}
        onUp={vi.fn()}
        onDelete={vi.fn()}
        onOpenResult={vi.fn()}
        downloadUrl={downloadUrl}
      />,
    )
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('opens folders and deletes a file after inline confirmation', () => {
    const onOpenDir = vi.fn()
    const onDelete = vi.fn()
    render(
      <EntryList
        loading={false}
        listing={listing}
        results={null}
        path={['Artist']}
        onOpenDir={onOpenDir}
        onUp={vi.fn()}
        onDelete={onDelete}
        onOpenResult={vi.fn()}
        downloadUrl={downloadUrl}
      />,
    )
    fireEvent.click(screen.getByText(/Album/))
    expect(onOpenDir).toHaveBeenCalledWith('Album')

    fireEvent.click(screen.getAllByText('Delete')[1])
    fireEvent.click(screen.getByText('Confirm'))
    expect(onDelete).toHaveBeenCalledWith('a.flac')
  })

  it('cancels a pending delete', () => {
    const onDelete = vi.fn()
    render(
      <EntryList
        loading={false}
        listing={listing}
        results={null}
        path={[]}
        onOpenDir={vi.fn()}
        onUp={vi.fn()}
        onDelete={onDelete}
        onOpenResult={vi.fn()}
        downloadUrl={downloadUrl}
      />,
    )
    fireEvent.click(screen.getAllByText('Delete')[0])
    fireEvent.click(screen.getByText('Cancel'))
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('offers a download link for files', () => {
    render(
      <EntryList
        loading={false}
        listing={listing}
        results={null}
        path={['Artist']}
        onOpenDir={vi.fn()}
        onUp={vi.fn()}
        onDelete={vi.fn()}
        onOpenResult={vi.fn()}
        downloadUrl={downloadUrl}
      />,
    )
    const link = screen.getByText('Download')
    expect(link).toHaveAttribute('href', '/api/download?path=Artist&name=a.flac')
  })

  it('paginates long listings', () => {
    const many = { dirs: [], files: Array.from({ length: 25 }, (_, i) => ({ name: `f${i}.flac`, size: 1 })) }
    render(
      <EntryList
        loading={false}
        listing={many}
        results={null}
        path={[]}
        onOpenDir={vi.fn()}
        onUp={vi.fn()}
        onDelete={vi.fn()}
        onOpenResult={vi.fn()}
        downloadUrl={downloadUrl}
      />,
    )
    expect(screen.getByText('f0.flac')).toBeInTheDocument()
    expect(screen.queryByText('f20.flac')).not.toBeInTheDocument()
    fireEvent.click(screen.getByText(/Next/))
    expect(screen.getByText('f20.flac')).toBeInTheDocument()
  })

  it('renders search results with a download link', () => {
    const onOpenResult = vi.fn()
    render(
      <EntryList
        loading={false}
        listing={{ dirs: [], files: [] }}
        results={[{ name: 'a.flac', path: 'Album', dir: false, size: 1 }]}
        path={[]}
        onOpenDir={vi.fn()}
        onUp={vi.fn()}
        onDelete={vi.fn()}
        onOpenResult={onOpenResult}
        downloadUrl={downloadUrl}
      />,
    )
    expect(screen.getByText('Download')).toHaveAttribute('href', '/api/download?path=Album&name=a.flac')
    fireEvent.click(screen.getByText('a.flac'))
    expect(onOpenResult).toHaveBeenCalled()
  })

  it('paginates long search results', () => {
    const many = Array.from({ length: 25 }, (_, i) => ({
      name: `r${i}.flac`,
      path: 'A',
      dir: false,
      size: 1,
    }))
    render(
      <EntryList
        loading={false}
        listing={{ dirs: [], files: [] }}
        results={many}
        path={[]}
        onOpenDir={vi.fn()}
        onUp={vi.fn()}
        onDelete={vi.fn()}
        onOpenResult={vi.fn()}
        downloadUrl={downloadUrl}
      />,
    )
    expect(screen.getByText('r0.flac')).toBeInTheDocument()
    expect(screen.queryByText('r20.flac')).not.toBeInTheDocument()
    fireEvent.click(screen.getByText(/Next/))
    expect(screen.getByText('r20.flac')).toBeInTheDocument()
  })

  it('shows a note when search results are truncated', () => {
    render(
      <EntryList
        loading={false}
        listing={{ dirs: [], files: [] }}
        results={[{ name: 'a.flac', path: 'Album', dir: false, size: 1 }]}
        truncated
        path={[]}
        onOpenDir={vi.fn()}
        onUp={vi.fn()}
        onDelete={vi.fn()}
        onOpenResult={vi.fn()}
        downloadUrl={downloadUrl}
      />,
    )
    expect(screen.getByText(/Showing the first matches/)).toBeInTheDocument()
  })

  it('renders a folder search result', () => {
    const onOpenResult = vi.fn()
    render(
      <EntryList
        loading={false}
        listing={{ dirs: [], files: [] }}
        results={[{ name: 'Album', path: '', dir: true, size: 0 }]}
        path={[]}
        onOpenDir={vi.fn()}
        onUp={vi.fn()}
        onDelete={vi.fn()}
        onOpenResult={onOpenResult}
        downloadUrl={downloadUrl}
      />,
    )
    fireEvent.click(screen.getByText(/Album/))
    expect(onOpenResult).toHaveBeenCalled()
  })

  it('shows empty and not-found states and the up entry', () => {
    const onUp = vi.fn()
    const { rerender } = render(
      <EntryList
        loading={false}
        listing={{ dirs: [], files: [] }}
        results={null}
        path={['A']}
        onOpenDir={vi.fn()}
        onUp={onUp}
        onDelete={vi.fn()}
        onOpenResult={vi.fn()}
        downloadUrl={downloadUrl}
      />,
    )
    fireEvent.click(screen.getByText(/\.\./))
    expect(onUp).toHaveBeenCalled()

    rerender(
      <EntryList
        loading={false}
        listing={{ dirs: [], files: [] }}
        results={[]}
        path={[]}
        onOpenDir={vi.fn()}
        onUp={vi.fn()}
        onDelete={vi.fn()}
        onOpenResult={vi.fn()}
        downloadUrl={downloadUrl}
      />,
    )
    expect(screen.getByText('Nothing found')).toBeInTheDocument()
  })
})
