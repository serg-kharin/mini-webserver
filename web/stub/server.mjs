// In-memory stub of the device HTTP API for local UI development.
// Run with `npm run stub`; the Vite dev server proxies /api to it.
import { createServer } from 'node:http'

const PORT = 8787

const dir = (children = {}) => ({ type: 'dir', children })
const file = (size) => ({ type: 'file', size })

const store = {
  'tree:internal': {
    name: 'Music',
    storage: 'internal',
    root: dir({
      'Pink Floyd': dir({
        'The Wall': dir({
          '01 - In the Flesh.flac': file(28_000_000),
          '02 - The Thin Ice.flac': file(15_000_000),
        }),
      }),
      'readme.txt': file(124),
    }),
  },
  'tree:sd': {
    name: 'Music',
    storage: 'sd',
    root: dir({
      'Daft Punk': dir({ Discovery: dir({ '01 - One More Time.flac': file(42_000_000) }) }),
    }),
  },
}

const resolve = (folderId, path) => {
  let node = store[folderId]?.root
  for (const segment of path) {
    node = node?.children?.[segment]
    if (node?.type !== 'dir') return null
  }
  return node
}

const search = (node, query, base, hits) => {
  for (const [name, child] of Object.entries(node.children)) {
    if (name.toLowerCase().includes(query)) {
      hits.push({ name, path: base, dir: child.type === 'dir', size: child.size ?? 0 })
    }
    if (child.type === 'dir') search(child, query, base ? `${base}/${name}` : name, hits)
  }
  return hits
}

const handlers = {
  'GET /api/folders': () =>
    Object.entries(store).map(([id, f]) => ({ id, name: f.name, storage: f.storage })),
  'GET /api/list': (q) => {
    const node = resolve(q.get('folder'), splitPath(q.get('path')))
    if (!node) return { dirs: [], files: [] }
    const entries = Object.entries(node.children)
    return {
      dirs: entries.filter(([, n]) => n.type === 'dir').map(([name]) => name),
      files: entries
        .filter(([, n]) => n.type === 'file')
        .map(([name, n]) => ({ name, size: n.size })),
    }
  },
  'GET /api/search': (q) => {
    const node = store[q.get('folder')]?.root
    const query = (q.get('q') ?? '').toLowerCase()
    return node && query ? search(node, query, '', []) : []
  },
  'POST /api/mkdir': (q) => mutate(q, (parent, name) => (parent.children[name] = dir())),
  'POST /api/delete': (q) => mutate(q, (parent, name) => delete parent.children[name]),
  'POST /api/upload': (q, size) =>
    mutate(q, (parent, name) => (parent.children[name] = file(size))),
}

const splitPath = (raw) => (raw ? raw.split('/').filter(Boolean) : [])

const mutate = (q, apply) => {
  const parent = resolve(q.get('folder'), splitPath(q.get('path')))
  if (!parent) return { ok: false, error: 'folder_not_granted' }
  apply(parent, q.get('name'))
  return { ok: true }
}

createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const handler = handlers[`${req.method} ${url.pathname}`]
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  if (!handler) {
    res.writeHead(404).end('{}')
    return
  }
  let size = 0
  req.on('data', (chunk) => (size += chunk.length))
  req.on('end', () => res.end(JSON.stringify(handler(url.searchParams, size))))
}).listen(PORT, () => console.log(`Stub API on http://localhost:${PORT}`))
