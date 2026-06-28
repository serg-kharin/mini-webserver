import { describe, expect, it } from 'vitest'
import { readDataTransfer } from '@/ui/dropEntries'

function fileEntry(name: string): FileSystemEntry {
  return {
    isFile: true,
    isDirectory: false,
    name,
    file: (cb: (f: File) => void) => cb(new File(['x'], name)),
  } as unknown as FileSystemEntry
}

function dirEntry(name: string, children: FileSystemEntry[]): FileSystemEntry {
  let done = false
  return {
    isFile: false,
    isDirectory: true,
    name,
    createReader: () => ({
      readEntries: (cb: (entries: FileSystemEntry[]) => void) => {
        const batch = done ? [] : children
        done = true
        cb(batch)
      },
    }),
  } as unknown as FileSystemEntry
}

function transfer(root: FileSystemEntry): DataTransfer {
  return { items: [{ webkitGetAsEntry: () => root }], files: [] } as unknown as DataTransfer
}

describe('readDataTransfer', () => {
  it('flattens a dropped folder, keeping subfolder paths', async () => {
    const root = dirEntry('Album', [fileEntry('a.flac'), dirEntry('CD2', [fileEntry('b.flac')])])
    const entries = await readDataTransfer(transfer(root))
    expect(entries).toHaveLength(2)
    expect(entries.find((e) => e.file.name === 'a.flac')?.path).toEqual(['Album'])
    expect(entries.find((e) => e.file.name === 'b.flac')?.path).toEqual(['Album', 'CD2'])
  })

  it('falls back to flat files without the entry API', async () => {
    const dt = { files: [new File(['x'], 'c.flac')] } as unknown as DataTransfer
    const entries = await readDataTransfer(dt)
    expect(entries).toEqual([{ file: expect.any(File), path: [] }])
  })

  it('ignores items that have no filesystem entry', async () => {
    const dt = {
      items: [{ webkitGetAsEntry: () => null }],
      files: [new File(['x'], 'd.flac')],
    } as unknown as DataTransfer
    const entries = await readDataTransfer(dt)
    expect(entries).toEqual([{ file: expect.any(File), path: [] }])
  })
})
