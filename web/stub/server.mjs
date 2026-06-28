// In-memory stub of the device HTTP API for local UI development.
// Run with `npm run stub`; the Vite dev server proxies /api to it.
import { createServer } from 'node:http'
import { splitPath } from '../src/domain/util/path.ts'

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
    return { hits: node && query ? search(node, query, '', []) : [], truncated: false }
  },
  'GET /api/version': () => ({ app: '0.0.0-stub' }),
  'POST /api/mkdir': (q) => mutate(q, (parent, name) => (parent.children[name] = dir())),
  'POST /api/delete': (q) => mutate(q, (parent, name) => delete parent.children[name]),
  'POST /api/upload': (q, size) => {
    const parent = resolve(q.get('folder'), splitPath(q.get('path')))
    if (!parent) return { ok: false, error: 'folder_not_granted' }
    const name = q.get('name')
    if (q.get('overwrite') !== 'true' && parent.children[name]) {
      return { ok: false, error: 'file_exists' }
    }
    parent.children[name] = file(size)
    return { ok: true }
  },
}

const mutate = (q, apply) => {
  const parent = resolve(q.get('folder'), splitPath(q.get('path')))
  if (!parent) return { ok: false, error: 'folder_not_granted' }
  apply(parent, q.get('name'))
  return { ok: true }
}

const sendDownload = (q, res) => {
  const node = resolve(q.get('folder'), splitPath(q.get('path')))
  const name = q.get('name')
  const child = node?.children?.[name]
  if (!child || child.type !== 'file') {
    res.writeHead(404).end('{}')
    return
  }
  res.setHeader('Content-Type', 'application/octet-stream')
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(name)}`)
  res.end(`stub content for ${name}`)
}

createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  if (req.method === 'GET' && url.pathname === '/api/download') {
    sendDownload(url.searchParams, res)
    return
  }
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
