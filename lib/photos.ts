// ─── Photo persistence (server-only) ───────────────────────────────────────
// Uploaded photo files live in Vercel Blob storage; their metadata (url,
// caption, orientation) lives in the same Upstash Redis store as blog posts.
// "Seed" photos that ship in the repo (/public/images/photography/) stay
// hardcoded below and are merged in front of whatever's been uploaded.
//
// Setup: same Upstash Redis credentials as lib/posts.ts, plus a Vercel Blob
// store — create one via the Vercel dashboard (Storage tab) or `vercel blob`
// CLI, then paste BLOB_READ_WRITE_TOKEN into .env.local.

import { Redis } from '@upstash/redis'

export interface Photo {
  id: string
  src: string
  caption: string
  orientation: 'landscape' | 'portrait'
}

export const SEED_PHOTOS: Photo[] = [
  {
    id: 'firework',
    src: '/images/photography/firework.jpg',
    caption: 'Kyoto, Japan — 2023',
    orientation: 'landscape',
  },
  {
    id: 'shell',
    src: '/images/photography/shell-on-sand.jpg',
    caption: '',
    orientation: 'landscape',
  },
  {
    id: 'beach-walk',
    src: '/images/photography/person-walking-beach.jpg',
    caption: '',
    orientation: 'portrait',
  },
]

const PHOTOS_KEY = 'house-of-zero:photos'

function getClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

async function getUploadedPhotos(): Promise<Photo[]> {
  const redis = getClient()
  if (!redis) {
    console.warn(
      '[lib/photos] No Upstash Redis credentials configured — uploaded photos ' +
        "won't show up (seed photos still will). Set UPSTASH_REDIS_REST_URL / " +
        'UPSTASH_REDIS_REST_TOKEN in .env.local.'
    )
    return []
  }
  const photos = await redis.get<Photo[]>(PHOTOS_KEY)
  return photos ?? []
}

export async function getPhotos(): Promise<Photo[]> {
  const uploaded = await getUploadedPhotos()
  return [...SEED_PHOTOS, ...uploaded]
}

export async function addPhoto(input: {
  url: string
  caption: string
  orientation: 'landscape' | 'portrait'
}): Promise<Photo> {
  const redis = getClient()
  if (!redis) {
    throw new Error(
      'No Upstash Redis credentials configured. Add UPSTASH_REDIS_REST_URL and ' +
        'UPSTASH_REDIS_REST_TOKEN to .env.local before uploading photos.'
    )
  }

  const existing = await getUploadedPhotos()
  const newPhoto: Photo = {
    id: crypto.randomUUID(),
    src: input.url,
    caption: input.caption,
    orientation: input.orientation,
  }

  await redis.set(PHOTOS_KEY, [...existing, newPhoto])
  return newPhoto
}
