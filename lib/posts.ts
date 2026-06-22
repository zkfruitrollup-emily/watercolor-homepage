// ─── Posts persistence (server-only) ───────────────────────────────────────
// Posts are stored as a single JSON array in Upstash Redis. Unlike a JSON
// file on disk, this actually persists when deployed to a serverless host
// (Vercel, Netlify, etc.) — those platforms don't guarantee a writable,
// persistent filesystem between requests/deployments, so a file-based
// approach would silently lose every post you save in production.
//
// Setup (one-time): create a free Upstash Redis database — either via the
// Vercel Marketplace ("Upstash" integration, which auto-fills your project's
// env vars) or directly at upstash.com — then copy the REST URL + token into
// .env.local (and into your Vercel project's env vars when you deploy):
//   UPSTASH_REDIS_REST_URL=...
//   UPSTASH_REDIS_REST_TOKEN=...
// Free tier covers this easily (500k commands/month).

import { Redis } from '@upstash/redis'

export interface Post {
  id: string
  date: string // e.g. "June 16, 2026"
  headline: string
  body: string
}

const POSTS_KEY = 'house-of-zero:posts'

function getClient(): Redis | null {
  // Supports both Upstash's own env var names and the legacy Vercel KV
  // names (Vercel auto-migrated KV stores to Upstash and some integration
  // paths still produce the old KV_REST_API_* names).
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

export async function getPosts(): Promise<Post[]> {
  const redis = getClient()
  if (!redis) {
    console.warn(
      '[lib/posts] No Upstash Redis credentials configured — returning an empty post list. ' +
        'Set UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN in .env.local.'
    )
    return []
  }
  const posts = await redis.get<Post[]>(POSTS_KEY)
  return posts ?? []
}

export async function addPost(input: { headline: string; body: string }): Promise<Post> {
  const redis = getClient()
  if (!redis) {
    throw new Error(
      'No Upstash Redis credentials configured. Add UPSTASH_REDIS_REST_URL and ' +
        'UPSTASH_REDIS_REST_TOKEN to .env.local before saving posts.'
    )
  }

  const existing = await getPosts()
  const newPost: Post = {
    id: crypto.randomUUID(),
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    headline: input.headline,
    body: input.body,
  }

  await redis.set(POSTS_KEY, [...existing, newPost])
  return newPost
}
