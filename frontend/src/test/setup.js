import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

const PUBLIC_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../../public')

/**
 * Serve static assets from `public/` for code that fetches them at runtime.
 *
 * This deliberately reads the real files rather than returning hand-written
 * stubs: the tour tests exist to validate the content that actually ships, so
 * a stub would make them assert against themselves and pass regardless of what
 * is in `public/tours/`.
 */
global.fetch = async (url) => {
  const pathname = String(url).split('?')[0].replace(/^https?:\/\/[^/]+/, '')
  const filePath = join(PUBLIC_DIR, pathname)

  // Keep reads inside public/ — a traversing path is a bug in the caller.
  if (!filePath.startsWith(PUBLIC_DIR) || !existsSync(filePath)) {
    return {
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => {
        throw new Error(`Not found: ${pathname}`)
      },
      text: async () => '',
    }
  }

  const body = readFileSync(filePath, 'utf-8')

  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => JSON.parse(body),
    text: async () => body,
  }
}
