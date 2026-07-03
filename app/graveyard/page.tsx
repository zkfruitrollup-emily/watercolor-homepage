'use client'

import Link from 'next/link'

// ─── The graveyard ──────────────────────────────────────────────────────────
// Ideas you loved and left behind. Each one is a little white paper tag,
// scattered at a loose angle. Add a headstone by copying a block below.
// `x` / `y` are percentages across the page, `tilt` is the rotation in deg.
// ─────────────────────────────────────────────────────────────────────────────

interface DeadIdea {
  id: string
  name: string
  x: number    // % from left
  y: number    // % from top of the tag field
  tilt: number // rotation in deg
}

const IDEAS: DeadIdea[] = [
  { id: 'lemon-water', name: 'On-Chain Lemon Water', x: 16, y: 22, tilt: -5 },
  { id: 'hair-tie', name: 'Hair Tie Holder', x: 54, y: 12, tilt: 4 },
  { id: 'kalshi', name: 'Weather Predicting Kalshi Agent', x: 38, y: 52, tilt: -3 },
  { id: 'firewood', name: 'Firewood with custom-text', x: 68, y: 40, tilt: 6 },
]

function Tag({ idea }: { idea: DeadIdea }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${idea.x}%`,
        top: `${idea.y}%`,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: '#ffffff',
        padding: '14px 22px 14px 16px',
        borderRadius: 6,
        border: '1px solid #EFEBE3',
        boxShadow: '0 8px 20px rgba(0,0,0,0.10)',
        transform: `rotate(${idea.tilt}deg)`,
        whiteSpace: 'nowrap',
      }}
    >
      {/* punched hole */}
      <div
        style={{
          width: 12, height: 12, borderRadius: '50%',
          background: '#EDE7DC',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.28)',
          flexShrink: 0,
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span className="stix" style={{ fontSize: 17, color: '#2A2A2A' }}>
          {idea.name}
        </span>
        <span
          style={{
            fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 11,
            letterSpacing: '0.08em', color: '#B4AEA4',
          }}
        >
          r.i.p.
        </span>
      </div>
    </div>
  )
}

export default function GraveyardPage() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#fff', overflow: 'hidden' }}>
      {/* Brand, links home */}
      <div style={{ position: 'absolute', top: 28, left: 56, zIndex: 20 }}>
        <Link href="/" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span className="stix" style={{ fontSize: 15, letterSpacing: '0.06em', color: '#111' }}>
            house of zero
          </span>
          <span style={{ fontFamily: 'Georgia', fontSize: 11, color: '#AAAAAA', letterSpacing: '0.04em' }}>
            graveyard
          </span>
        </Link>
      </div>

      {/* Heading */}
      <div style={{ padding: '96px 56px 8px', textAlign: 'center' }}>
        <h1 className="stix" style={{ fontSize: 'clamp(48px, 8vw, 92px)', fontWeight: 400, lineHeight: 1, color: '#3a3a3a' }}>
          Graveyard
        </h1>
        <p style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 15, color: '#9A968E', marginTop: 14 }}>
          ideas i loved, then left behind. rest easy.
        </p>
      </div>

      {/* Tag field — the scattered headstones */}
      <div style={{ position: 'relative', width: '100%', height: 620, maxWidth: 1240, margin: '32px auto 0' }}>
        {IDEAS.map((idea) => (
          <Tag key={idea.id} idea={idea} />
        ))}
      </div>

      {/* Footer */}
      <footer style={{ padding: '28px 56px', textAlign: 'center', fontFamily: 'Georgia', fontSize: 13, color: '#b3b3b3' }}>
        © Emily — house of zero
      </footer>
    </div>
  )
}
