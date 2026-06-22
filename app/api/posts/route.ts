import { NextRequest, NextResponse } from 'next/server'
import { getPosts, addPost } from '@/lib/posts'

// Same password used for the client-side gate in WriteButton.tsx. Re-checked
// here because the client-side check alone is just a UI nicety — anyone
// could otherwise POST directly to this endpoint without it.
const WRITE_PASSWORD = process.env.NEXT_PUBLIC_WRITE_PASSWORD ?? 'houseofzero'

export async function GET() {
  const posts = await getPosts()
  return NextResponse.json({ posts })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { password, headline, body: postBody } = body as {
    password?: string
    headline?: string
    body?: string
  }

  if (password !== WRITE_PASSWORD) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  if (!headline?.trim() || !postBody?.trim()) {
    return NextResponse.json({ error: 'Headline and body are required' }, { status: 400 })
  }

  try {
    const post = await addPost({ headline: headline.trim(), body: postBody })
    return NextResponse.json({ post }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to save post'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
