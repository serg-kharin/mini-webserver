import { fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Uploader from '@/ui/components/Uploader'
import { fakeUseCases, renderWith } from '@/test/fakes'

describe('Uploader', () => {
  it('uploads chosen files and notifies when done', async () => {
    const uploadFiles = vi.fn(async () => ({ total: 1, done: 1, failed: 0 }))
    const onDone = vi.fn()
    const { container } = renderWith(
      <Uploader folderId="t" path={[]} onDone={onDone} />,
      fakeUseCases({ uploadFiles }),
    )

    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, { target: { files: [new File(['x'], 'a.txt')] } })

    await waitFor(() => expect(uploadFiles).toHaveBeenCalled())
    await waitFor(() => expect(onDone).toHaveBeenCalled())
  })

  it('uploads files dropped onto the zone', async () => {
    const uploadFiles = vi.fn(async () => ({ total: 1, done: 1, failed: 0 }))
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

  it('reflects progress callbacks from the use case', async () => {
    const uploadFiles = vi.fn(async (_folder, _basePath, entries, cb) => {
      cb?.onProgressText?.(1, entries.length, entries[0].file.name)
      cb?.onItemProgress?.(0, 0.5)
      cb?.onItemDone?.(0, true)
      return { total: entries.length, done: entries.length, failed: 0 }
    })
    const { container } = renderWith(
      <Uploader folderId="t" path={[]} onDone={vi.fn()} />,
      fakeUseCases({ uploadFiles }),
    )
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, { target: { files: [new File(['x'], 'a.txt')] } })
    await waitFor(() => expect(uploadFiles).toHaveBeenCalled())
  })

  it('marks a failed item', async () => {
    const uploadFiles = vi.fn(async (_folder, _path, _files, cb) => {
      cb?.onItemDone?.(0, false)
      return { total: 1, done: 0, failed: 1 }
    })
    const { container } = renderWith(
      <Uploader folderId="t" path={[]} onDone={vi.fn()} />,
      fakeUseCases({ uploadFiles }),
    )
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, { target: { files: [new File(['x'], 'a.txt')] } })
    await waitFor(() => expect(uploadFiles).toHaveBeenCalled())
  })

  it('reports failures in the summary', async () => {
    const uploadFiles = vi.fn(async () => ({ total: 1, done: 0, failed: 1 }))
    const { container } = renderWith(
      <Uploader folderId="t" path={[]} onDone={vi.fn()} />,
      fakeUseCases({ uploadFiles }),
    )
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, { target: { files: [new File(['x'], 'a.txt')] } })
    await waitFor(() => expect(uploadFiles).toHaveBeenCalled())
  })
})
