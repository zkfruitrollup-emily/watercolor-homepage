'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// ─── Write password ─────────────────────────────────────────────────────────
// This client-side check is just a fast UI gate. The real enforcement
// happens server-side in app/api/posts/route.ts, which re-checks the
// password before writing anything.
const WRITE_PASSWORD = process.env.NEXT_PUBLIC_WRITE_PASSWORD ?? 'houseofzero'

export default function WriteButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          fontFamily: 'Georgia',
          fontSize: 13,
          background: 'none',
          border: '1px solid #000',
          padding: '8px 20px',
          cursor: 'pointer',
          letterSpacing: '0.02em',
        }}
      >
        ✎ write
      </button>

      {open && <WriteModal onClose={() => setOpen(false)} />}
    </>
  )
}

function WriteModal({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [step, setStep] = useState<'auth' | 'write'>('auth')
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  const [headline, setHeadline] = useState('')
  const [body, setBody] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === WRITE_PASSWORD) {
      setStep('write')
      setPasswordError(false)
    } else {
      setPasswordError(true)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveError('')
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, headline, body }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Failed to save post')
      }
      setSaved(true)
      router.refresh() // re-fetch the server component's post list
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save post')
    } finally {
      setSaving(false)
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
      <div style={{ width: 540, padding: '48px 0' }}>
        {step === 'auth' && (
          <form onSubmit={handleAuth}>
            <p style={{ fontFamily: 'Georgia', fontSize: 14, marginBottom: 20, color: '#555' }}>
              password required
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
                color: '#111',
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

        {step === 'write' && !saved && (
          <form onSubmit={handleSave}>
            <input
              autoFocus
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="headline"
              required
              style={{
                fontFamily: "'STIX Two Text', Georgia, serif",
                fontSize: 32,
                fontWeight: 400,
                border: 'none',
                outline: 'none',
                width: '100%',
                background: 'transparent',
                color: '#111',
                marginBottom: 24,
              }}
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="write something…"
              required
              rows={10}
              style={{
                fontFamily: 'Georgia',
                fontSize: 16,
                lineHeight: 1.75,
                border: 'none',
                outline: 'none',
                width: '100%',
                background: 'transparent',
                color: '#111',
                resize: 'vertical',
              }}
            />
            <div style={{ display: 'flex', gap: 12, marginTop: 32, alignItems: 'center' }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  fontFamily: 'Georgia',
                  fontSize: 13,
                  background: '#000',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 24px',
                  cursor: saving ? 'default' : 'pointer',
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? 'saving…' : 'save'}
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
            {saveError && (
              <p style={{ marginTop: 20, fontFamily: 'Georgia', fontSize: 13, color: '#c00' }}>
                {saveError}
              </p>
            )}
          </form>
        )}

        {saved && (
          <div>
            <p style={{ fontFamily: 'Georgia', fontSize: 16, color: '#111' }}>
              saved.
            </p>
            <button
              onClick={() => { onClose(); }}
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
