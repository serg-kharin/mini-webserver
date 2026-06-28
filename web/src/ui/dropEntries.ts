import type { UploadEntry } from '@/domain/usecases/UploadFiles'

// Expand a drop into a flat list of files, recursing into dropped folders so the
// subfolder structure is preserved. Falls back to flat files if the entry API
// isn't available.
export async function readDataTransfer(dataTransfer: DataTransfer): Promise<UploadEntry[]> {
  const items = dataTransfer.items ? Array.from(dataTransfer.items) : []
  const roots = items
    .map((item) => item.webkitGetAsEntry?.() ?? null)
    .filter((entry): entry is FileSystemEntry => entry !== null)

  if (roots.length === 0) {
    return Array.from(dataTransfer.files).map((file) => ({ file, path: [] }))
  }

  const entries: UploadEntry[] = []
  for (const root of roots) {
    await walk(root, [], entries)
  }
  return entries
}

async function walk(entry: FileSystemEntry, dir: string[], out: UploadEntry[]): Promise<void> {
  if (entry.isFile) {
    out.push({ file: await fileOf(entry as FileSystemFileEntry), path: dir })
  } else if (entry.isDirectory) {
    for (const child of await readDir(entry as FileSystemDirectoryEntry)) {
      await walk(child, [...dir, entry.name], out)
    }
  }
}

function fileOf(entry: FileSystemFileEntry): Promise<File> {
  return new Promise((resolve, reject) => entry.file(resolve, reject))
}

function readDir(entry: FileSystemDirectoryEntry): Promise<FileSystemEntry[]> {
  const reader = entry.createReader()
  const all: FileSystemEntry[] = []
  return new Promise((resolve, reject) => {
    const read = () =>
      reader.readEntries((batch) => {
        if (batch.length === 0) resolve(all)
        else {
          all.push(...batch)
          read()
        }
      }, reject)
    read()
  })
}
