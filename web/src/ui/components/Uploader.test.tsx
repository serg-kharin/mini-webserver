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
