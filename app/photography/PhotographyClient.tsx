'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Photo } from '@/lib/photos'

// ─── Upload password ─────────────────────────────────────────────────────────
// Client-side check is just a fast UI gate — app/api/photos/route.ts
// re-validates this server-side before anything actually uploads.
const UPLOAD_PASSWORD = process.env.NEXT_PUBLIC_UPLOAD_PASSWORD ?? 'houseofzero'

// Vercel Functions cap request bodies at 4.5MB, and phone photos routinely
// blow past that. Resizing client-side (longest side -> maxDim, re-encoded
// as JPEG) keeps every upload comfortably under that limit and also means
// we're not serving multi-MB originals to site visitors. Orientation is
// detected from the same loaded image so we don't decode it twice.
async function prepareImage(
  file: File,
  maxDim = 2400,
  quality = 0.85
): Promise<{ blob: Blob; orientation: 'landscape' | 'portrait' }> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Could not read image file'))
    image.src = URL.createObjectURL(file)
  })

  const { naturalWidth: w, naturalHeight: h } = img
  const orientation: 'landscape' | 'portrait' = w >= h ? 'landscape' : 'portrait'
  const scale = Math.min(1, maxDim / Math.max(w, h))

  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(w * scale))
  canvas.height = Math.max(1, Math.round(h * scale))
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported in this browser')
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  URL.revokeObjectURL(img.src)

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Failed to encode image'))),
      'image/jpeg',
      quality
    )
  })

  return { blob, orientation }
}

// ─── Upload modal ────────────────────────────────────────────────────────────
function UploadModal({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [step, setStep] = useState<'auth' | 'upload'>('auth')
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === UPLOAD_PASSWORD) {
      setStep('upload')
      setPasswordError(false)
    } else {
      setPasswordError(true)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (files.length === 0) {
      setError('Choose at least one photo first.')
      return
    }
    setUploading(true)
    setError('')
    try {
      for (let i = 0; i < files.length; i++) {
        setProgress(files.length > 1 ? `uploading ${i + 1} of ${files.length}…` : 'uploading…')
        const file = files[i]
        const { blob, orientation } = await prepareImage(file)
        const form = new FormData()
        form.set('password', password)
        form.set('file', blob, file.name.replace(/\.\w+$/, '') + '.jpg')
        form.set('caption', files.length === 1 ? caption : '')
        form.set('orientation', orientation)

        const res = await fetch('/api/photos', { method: 'POST', body: form })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error ?? 'Failed to upload photo')
        }
      }
      setDone(true)
      router.refresh() // re-fetch the server component's photo list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photo')
    } finally {
      setUploading(false)
      setProgress('')
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ width: 480, padding: '48px 0' }}>
        {step === 'auth' && (
          <form onSubmit={handleAuth}>
            <p style={{ fontFamily: 'Georgia', fontSize: 14, marginBottom: 20, color: '#555' }}>
              password required to upload
            </p>
            <input
              autoFocus
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                fontFamily: 'Georgia',
                fontSize: 16,
                border: 'none',
                borderBottom: `1px solid ${passwordError ? '#c00' : '#ccc'}`,
                outline: 'none',
                padding: '6px 0',
                width: '100%',
                background: 'transparent',
              }}
            />
            {passwordError && (
              <p style={{ fontFamily: 'Georgia', fontSize: 13, color: '#c00', marginTop: 8 }}>
                incorrect password
              </p>
            )}
            <button
              type="submit"
              style={{
                marginTop: 24,
                fontFamily: 'Georgia',
                fontSize: 13,
                background: 'none',
                border: '1px solid #000',
                padding: '8px 20px',
                cursor: 'pointer',
              }}
            >
              enter
            </button>
          </form>
        )}

        {step === 'upload' && !done && (
          <form onSubmit={handleUpload}>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              style={{ fontFamily: 'Georgia', fontSize: 14, display: 'block', marginBottom: 20 }}
            />
            {files.length === 1 && (
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="caption (optional)"
                style={{
                  fontFamily: 'Georgia',
                  fontSize: 14,
                  fontStyle: 'italic',
                  border: 'none',
                  borderBottom: '1px solid #ccc',
                  outline: 'none',
                  padding: '6px 0',
                  width: '100%',
                  background: 'transparent',
                  marginBottom: 20,
                }}
              />
            )}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button
                type="submit"
                disabled={uploading}
                style={{
                  fontFamily: 'Georgia',
                  fontSize: 13,
                  background: '#000',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 24px',
                  cursor: uploading ? 'default' : 'pointer',
                  opacity: uploading ? 0.6 : 1,
                }}
              >
                {uploading ? progress || 'uploading…' : 'upload'}
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  fontFamily: 'Georgia',
                  fontSize: 13,
                  background: 'none',
                  border: '1px solid #ccc',
                  padding: '10px 24px',
                  cursor: 'pointer',
                  color: '#555',
                }}
              >
                cancel
              </button>
            </div>
            {error && (
              <p style={{ marginTop: 20, fontFamily: 'Georgia', fontSize: 13, color: '#c00' }}>
                {error}
              </p>
            )}
          </form>
        )}

        {done && (
          <div>
            <p style={{ fontFamily: 'Georgia', fontSize: 16, color: '#111' }}>
              uploaded.
            </p>
            <button
              onClick={onClose}
              style={{
                marginTop: 24,
                fontFamily: 'Georgia',
                fontSize: 13,
                background: 'none',
                border: '1px solid #000',
                padding: '8px 20px',
                cursor: 'pointer',
              }}
            >
              close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function PhotographyClient({ photos }: { photos: Photo[] }) {
  const [current, setCurrent] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)

  const total = photos.length

  const goTo = useCallback((index: number) => {
    if (isAnimating || index === current) return
    setIsAnimating(true)
    setCurrent(index)
    setTimeout(() => setIsAnimating(false), 500)
  }, [current, isAnimating])

  const prev = useCallback(() => goTo(Math.max(0, current - 1)), [current, goTo])
  const next = useCallback(() => goTo(Math.min(total - 1, current + 1)), [current, total, goTo])

  // Scroll wheel: scroll up = next (slide left), scroll down = prev (slide right)
  useEffect(() => {
    let cooldown = false
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (cooldown || isAnimating) return
      cooldown = true
      if (e.deltaY > 0) next()
      else prev()
      setTimeout(() => { cooldown = false }, 600)
    }
    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [next, prev, isAnimating])

  // Arrow keys
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next()
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prev()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [next, prev])

  const photo = photos[current]

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: '#fff',
          overflow: 'hidden',
        }}
      >
        {/* ── Top-left label ──────────────────────────────────────────── */}
        <div
          style={{
            position: 'absolute',
            top: 28,
            left: 56,
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <Link href="/">
            <span
              className="stix"
              style={{ fontSize: 13, letterSpacing: '0.06em', color: '#111', display: 'block' }}
            >
              photography
            </span>
            <span
              style={{
                fontFamily: 'Georgia',
                fontSize: 11,
                color: '#AAAAAA',
                letterSpacing: '0.04em',
                display: 'block',
              }}
            >
              house of zero
            </span>
          </Link>
        </div>

        {/* ── Upload button ────────────────────────────────────────────── */}
        <button
          onClick={() => setUploadOpen(true)}
          style={{
            position: 'absolute',
            top: 28,
            right: 56,
            zIndex: 20,
            fontFamily: 'Georgia',
            fontSize: 12,
            background: 'none',
            border: '1px solid #000',
            padding: '8px 16px',
            cursor: 'pointer',
            letterSpacing: '0.03em',
          }}
        >
          ↑ upload
        </button>

        {/* ── Photo slides ─────────────────────────────────────────────── */}
        {/* Slides are stacked; we cross-fade between them for a clean feel.
            Alternatively swap to a translate for a sliding feel (see comment). */}
        <div
          style={{
            position: 'absolute',
            left: 56,
            top: 80,
            width: 1260,
            height: 740,
          }}
        >
          {photos.map((p, i) => (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${p.src})`,
                backgroundSize: p.orientation === 'portrait' ? 'contain' : 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundColor: '#EFEFEF',
                opacity: i === current ? 1 : 0,
                transition: 'opacity 0.5s ease',
                // For a sliding effect instead of cross-fade, replace the above
                // opacity with: transform: `translateX(${(i - current) * 100}%)`
                // and transition: 'transform 0.5s ease'
              }}
            />
          ))}
        </div>

        {/* Peek sliver of next photo */}
        {current < total - 1 && (
          <div
            style={{
              position: 'absolute',
              left: 1336,
              top: 80,
              width: 48,
              height: 740,
              backgroundImage: `url(${photos[current + 1].src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'left center',
              opacity: 0.5,
              cursor: 'pointer',
            }}
            onClick={next}
          />
        )}

        {/* ── Caption ──────────────────────────────────────────────────── */}
        {photo.caption && (
          <p
            style={{
              position: 'absolute',
              bottom: 36,
              right: 56,
              fontFamily: 'Georgia',
              fontStyle: 'italic',
              fontSize: 13,
              color: '#999',
              whiteSpace: 'nowrap',
              zIndex: 10,
              transition: 'opacity 0.4s ease',
              opacity: 1,
            }}
          >
            {photo.caption}
          </p>
        )}

        {/* ── Dot indicators ───────────────────────────────────────────── */}
        <div
          style={{
            position: 'absolute',
            bottom: 28,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 10,
            zIndex: 20,
          }}
        >
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to photo ${i + 1}`}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                border: i === current ? 'none' : '1.5px solid #AAAAAA',
                background: i === current ? '#000' : 'transparent',
                padding: 0,
                cursor: 'pointer',
                transition: 'background 0.3s ease, border 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* ── Keyboard / click nav arrows (subtle, only on hover) ──────── */}
        <button
          onClick={prev}
          disabled={current === 0}
          aria-label="Previous photo"
          style={{
            position: 'absolute',
            left: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            fontSize: 20,
            color: '#ccc',
            cursor: current === 0 ? 'default' : 'pointer',
            opacity: current === 0 ? 0 : 0.4,
            transition: 'opacity 0.2s',
            padding: 12,
            zIndex: 20,
          }}
        >
          ←
        </button>
        <button
          onClick={next}
          disabled={current === total - 1}
          aria-label="Next photo"
          style={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            fontSize: 20,
            color: '#ccc',
            cursor: current === total - 1 ? 'default' : 'pointer',
            opacity: current === total - 1 ? 0 : 0.4,
            transition: 'opacity 0.2s',
            padding: 12,
            zIndex: 20,
          }}
        >
          →
        </button>
      </div>

      {uploadOpen && <UploadModal onClose={() => setUploadOpen(false)} />}
    </>
  )
}
