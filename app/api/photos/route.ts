import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { getPhotos, addPhoto } from '@/lib/photos'

// Same password used for the client-side gate in PhotographyClient.tsx.
// Re-checked here so the real enforcement happens server-side.
const UPLOAD_PASSWORD = process.env.NEXT_PUBLIC_UPLOAD_PASSWORD ?? 'houseofzero'

export async function GET() {
  const photos = await getPhotos()
  return NextResponse.json({ photos })
}

export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null)
  if (!form) {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const password = form.get('password')
  if (password !== UPLOAD_PASSWORD) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
  }

  const caption = (form.get('caption') as string | null) ?? ''
  const orientation = form.get('orientation') === 'portrait' ? 'portrait' : 'landscape'

  try {
    const blob = await put(`photography/${crypto.randomUUID()}-${file.name}`, file, {
      access: 'public',
      contentType: file.type,
    })
    const photo = await addPhoto({ url: blob.url, caption, orientation })
    return NextResponse.json({ photo }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to upload photo'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
