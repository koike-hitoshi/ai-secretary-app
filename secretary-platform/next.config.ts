import type { NextConfig } from 'next'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  turbopack: {
    root,
  },
  async redirects() {
    return [
      { source: '/tasks', destination: '/dashboard/tasks', permanent: false },
      {
        source: '/calendar',
        destination: '/dashboard/calendar',
        permanent: false,
      },
      {
        source: '/proofreading',
        destination: '/dashboard/documents/proofread',
        permanent: false,
      },
      {
        source: '/minutes',
        destination: '/dashboard/documents/minutes',
        permanent: false,
      },
      {
        source: '/research',
        destination: '/dashboard/documents/research',
        permanent: false,
      },
      {
        source: '/design-system',
        destination: '/dashboard/design-system',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
