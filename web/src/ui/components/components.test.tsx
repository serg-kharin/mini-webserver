import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import FolderSelect from '@/ui/components/FolderSelect'
import SearchBar from '@/ui/components/SearchBar'
import NewFolder from '@/ui/components/NewFolder'
import Breadcrumbs from '@/ui/components/Breadcrumbs'
import LanguageGate from '@/ui/components/LanguageGate'
import LanguageSwitch from '@/ui/components/LanguageSwitch'
import EntryList from '@/ui/components/EntryList'

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

describe('EntryList', () => {
  const listing = { dirs: ['Album'], files: [{ name: 'a.flac', size: 10 }] }

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
      />,
    )
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('opens folders and deletes files', () => {
    const onOpenDir = vi.fn()
    const onDelete = vi.fn()
    const onUp = vi.fn()
    render(
      <EntryList
        loading={false}
        listing={listing}
        results={null}
        path={['Artist']}
        onOpenDir={onOpenDir}
        onUp={onUp}
        onDelete={onDelete}
        onOpenResult={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByText(/Album/))
    expect(onOpenDir).toHaveBeenCalledWith('Album')
    fireEvent.click(screen.getByText('Delete'))
    expect(onDelete).toHaveBeenCalledWith('a.flac')
  })

  it('renders search results', () => {
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
      />,
    )
    fireEvent.click(screen.getByText('a.flac'))
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
      />,
    )
    expect(screen.getByText('Nothing found')).toBeInTheDocument()
  })
})
