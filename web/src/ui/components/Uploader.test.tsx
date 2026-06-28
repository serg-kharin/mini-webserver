import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Uploader from '@/ui/components/Uploader'
import { fakeUseCases, renderWith } from '@/test/fakes'

const ok = { total: 1, done: 1, failed: 0, conflicts: 0 }

function pickFile(container: HTMLElement, name = 'a.txt') {
  const input = container.querySelector('input[type="file"]') as HTMLInputElement
  fireEvent.change(input, { target: { files: [new File(['x'], name)] } })
}

describe('Uploader', () => {
  it('uploads chosen files and notifies when done', async () => {
    const uploadFiles = vi.fn(async () => ok)
    const onDone = vi.fn()
    const { container } = renderWith(
      <Uploader folderId="t" path={[]} onDone={onDone} />,
      fakeUseCases({ uploadFiles }),
    )
    pickFile(container)
    await waitFor(() => expect(uploadFiles).toHaveBeenCalled())
    await waitFor(() => expect(onDone).toHaveBeenCalled())
  })

  it('uploads files dropped onto the zone', async () => {
    const uploadFiles = vi.fn(async () => ok)
    const { container } = renderWith(
      <Uploader folderId="t" path={[]} onDone={vi.fn()} />,
      fakeUseCases({ uploadFiles }),
    )
    const drop = container.querySelector('.drop') as HTMLElement
    fireEvent.dragOver(drop)
    fireEvent.dragLeave(drop)
    fireEvent.drop(drop, { dataTransfer: { files: [new File(['x'], 'a.txt')] } })
    await waitFor(() => expect(uploadFiles).toHaveBeenCalled())
  })

  it('clears a successful row and keeps the summary', async () => {
    const uploadFiles = vi.fn(async (_folder, _basePath, entries, cb) => {
      cb?.onProgressText?.(1, entries.length, entries[0].file.name)
      cb?.onItemProgress?.(0, 0.5)
      cb?.onItemDone?.(0, 'done')
      return { total: 1, done: 1, failed: 0, conflicts: 0 }
    })
    const { container } = renderWith(
      <Uploader folderId="t" path={[]} onDone={vi.fn()} />,
      fakeUseCases({ uploadFiles }),
    )
    pickFile(container, 'cleared.txt')
    await waitFor(() => expect(screen.getByText(/uploaded 1 of 1/)).toBeInTheDocument())
    expect(screen.queryByText('cleared.txt')).not.toBeInTheDocument()
  })

  it('offers a retry for a failed item', async () => {
    const uploadFiles = vi.fn(async (_folder, _path, _files, cb) => {
      cb?.onItemDone?.(0, 'error')
      return { total: 1, done: 0, failed: 1, conflicts: 0 }
    })
    const { container } = renderWith(
      <Uploader folderId="t" path={[]} onDone={vi.fn()} />,
      fakeUseCases({ uploadFiles }),
    )
    pickFile(container, 'bad.txt')
    await waitFor(() => expect(screen.getByText('Retry')).toBeInTheDocument())
    fireEvent.click(screen.getByText('Retry'))
    await waitFor(() => expect(uploadFiles).toHaveBeenCalledTimes(2))
  })

  it('offers replace and skip for a conflicting item', async () => {
    const uploadFiles = vi.fn(async (_folder, _path, _files, cb) => {
      cb?.onItemDone?.(0, 'conflict')
      return { total: 1, done: 0, failed: 0, conflicts: 1 }
    })
    const { container } = renderWith(
      <Uploader folderId="t" path={[]} onDone={vi.fn()} />,
      fakeUseCases({ uploadFiles }),
    )
    pickFile(container, 'dup.txt')
    await waitFor(() => expect(screen.getByText('Replace')).toBeInTheDocument())
    fireEvent.click(screen.getByText('Replace'))
    await waitFor(() =>
      expect(uploadFiles).toHaveBeenLastCalledWith(
        't',
        [],
        expect.any(Array),
        expect.objectContaining({ overwrite: true }),
      ),
    )
  })

  it('shows an oversized item with skip only', async () => {
    const uploadFiles = vi.fn(async (_folder, _path, _files, cb) => {
      cb?.onItemDone?.(0, 'toolarge')
      return { total: 1, done: 0, failed: 1, conflicts: 0 }
    })
    const { container } = renderWith(
      <Uploader folderId="t" path={[]} onDone={vi.fn()} />,
      fakeUseCases({ uploadFiles }),
    )
    pickFile(container, 'big.flac')
    await waitFor(() => expect(screen.getByText(/Too large/)).toBeInTheDocument())
    expect(screen.queryByText('Retry')).not.toBeInTheDocument()
  })

  it('skips a conflicting item', async () => {
    const uploadFiles = vi.fn(async (_folder, _path, _files, cb) => {
      cb?.onItemDone?.(0, 'conflict')
      return { total: 1, done: 0, failed: 0, conflicts: 1 }
    })
    const { container } = renderWith(
      <Uploader folderId="t" path={[]} onDone={vi.fn()} />,
      fakeUseCases({ uploadFiles }),
    )
    pickFile(container, 'dup.txt')
    await waitFor(() => expect(screen.getByText('Skip')).toBeInTheDocument())
    fireEvent.click(screen.getByText('Skip'))
    expect(screen.queryByText('dup.txt')).not.toBeInTheDocument()
  })
})
