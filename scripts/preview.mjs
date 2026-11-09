import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname } from 'node:path'

const root = new URL('../dist/', import.meta.url)
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif'
}

await stat(new URL('index.html', root)).catch(() => {
  throw new Error('Run npm run build before starting the preview.')
})

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
    const path = new URL(`.${pathname}`, root)
    if (!path.href.startsWith(root.href)) throw new Error('Outside dist/')
    if ((await stat(path)).isDirectory() && !pathname.endsWith('/')) {
      response.writeHead(302, { Location: `${pathname}/` }).end()
      return
    }
    const file = pathname.endsWith('/') ? new URL('index.html', path) : path
    if (!(await stat(file)).isFile()) throw new Error('File not found')
    const stream = createReadStream(file)
    stream.on('error', () => response.destroy())
    response.writeHead(200, { 'Content-Type': types[extname(file.pathname).toLowerCase()] ?? 'application/octet-stream' })
    stream.pipe(response)
  } catch {
    response.writeHead(404).end('Not found')
  }
})

server.listen(4173, '127.0.0.1', () => console.log('http://127.0.0.1:4173/'))
