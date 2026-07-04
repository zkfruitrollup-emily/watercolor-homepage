'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useIsMobile } from '@/lib/useIsMobile'

// ─── Your projects ──────────────────────────────────────────────────────────
// Each project is a soft watercolor tile (circle on desktop, rectangle on
// mobile). Three kinds:
//   • LINK tile     → give it an `href`. Clicking opens the project's website.
//   • GALLERY tile  → give it `images` (+ optional `caption`). Clicking opens
//                     a lightbox that pages through the images.
//   • ROUTE tile    → give it a `to` (internal route, used by the graveyard).
// `color` is the [r,g,b] watercolor wash. `size` sets the diameter in px on
// desktop, so the cluster feels hand-scattered rather than grid-perfect.
//
// Gallery images live in public/images/projects/.
// ─────────────────────────────────────────────────────────────────────────────

interface Project {
  id: string
  label: string        // use \n for a two-line label
  rgb: [number, number, number]
  size: number         // circle diameter in px (desktop only)
  tilt: number         // small rotation in deg (desktop only)
  href?: string        // present → link tile
  images?: string[]    // present → gallery tile, opens a lightbox
  caption?: string     // note shown under the lightbox image
  grey?: boolean       // renders muted (used by the graveyard tile)
  to?: string          // internal route (used by the graveyard tile)
}

const PROJECTS: Project[] = [
  {
    id: 'deliverables-tracker',
    label: 'deliverables\ntracker',
    rgb: [227, 154, 74],
    size: 212, tilt: -1.5,
    href: 'https://deliverables-tracker.vercel.app/',
  },
  {
    id: 'timeline-generator',
    label: 'timeline\ngenerator',
    rgb: [232, 112, 158],
    size: 176, tilt: 1.8,
    href: 'https://campaign-timeline-20.vercel.app/',
  },
  {
    id: 'mini-travel-app',
    label: 'mini travel\napp',
    rgb: [157, 190, 90],
    size: 198, tilt: -0.6,
    href: 'https://project-1zj1p.vercel.app/',
  },
  {
    id: 'trashtalk-nyc',
    label: 'trashtalk\nnyc',
    rgb: [126, 90, 168],
    size: 204, tilt: 0.8,
    href: 'https://preview--nyc-street-draw.lovable.app/',
  },
  {
    id: 'study-guides',
    label: 'study\nguides',
    rgb: [91, 111, 192],
    size: 230, tilt: 1.1,
    images: [
      '/images/projects/econ-principles.jpg',
      '/images/projects/econ-elasticity.jpg',
      '/images/projects/econ-consumer-theory.jpg',
    ],
    caption: 'econ 101 study sheets i made and shared.',
  },
  {
    id: 'mba-rocketship',
    label: 'MBA\nRocketship',
    rgb: [122, 51, 80],
    size: 168, tilt: -1.4,
    images: [
      '/images/projects/mba-dashboard.jpg',
      '/images/projects/mba-input.jpg',
      '/images/projects/mba-school.jpg',
    ],
    caption: 'MBA Rocketship — my daily dashboard.',
  },
  {
    id: 'graveyard',
    label: 'graveyard',
    rgb: [150, 150, 146],
    size: 150, tilt: -1.8,
    grey: true,
    to: '/graveyard',
  },
]

// A soft, translucent watercolor wash so the white paper shows through.
const wash = (r: number, g: number, b: number) =>
  `radial-gradient(115% 115% at 34% 30%, rgba(${r},${g},${b},0.70) 0%, rgba(${r},${g},${b},0.48) 45%, rgba(${r},${g},${b},0.23) 76%, rgba(${r},${g},${b},0.06) 100%)`

// ─── Lightbox ────────────────────────────────────────────────────────────────
function Lightbox({
  images,
  caption,
  onClose,
}: {
  images: string[]
  caption?: string
  onClose: () => void
}) {
  const [index, setIndex] = useState(0)
  const total = images.length

  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), [])
  const next = useCallback(() => setIndex((i) => Math.min(total - 1, i + 1)), [total])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, prev, next])

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.88)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: '48px 16px',
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: 'absolute', top: 16, right: 20,
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 26, color: '#fff', lineHeight: 1, padding: 8,
        }}
      >
        ×
      </button>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[index]}
        alt={caption ?? ''}
        style={{ maxWidth: '92vw', maxHeight: '78vh', objectFit: 'contain' }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <button
          onClick={prev}
          disabled={index === 0}
          aria-label="Previous image"
          style={{
            background: 'none', border: 'none', cursor: index === 0 ? 'default' : 'pointer',
            fontSize: 22, color: '#fff', opacity: index === 0 ? 0.25 : 0.85, padding: 8,
          }}
        >
          ←
        </button>
        <span style={{ fontFamily: 'Georgia', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
          {index + 1} / {total}
        </span>
        <button
          onClick={next}
          disabled={index === total - 1}
          aria-label="Next image"
          style={{
            background: 'none', border: 'none', cursor: index === total - 1 ? 'default' : 'pointer',
            fontSize: 22, color: '#fff', opacity: index === total - 1 ? 0.25 : 0.85, padding: 8,
          }}
        >
          →
        </button>
      </div>

      {caption && (
        <p
          style={{
            margin: 0, fontFamily: 'Georgia', fontStyle: 'italic',
            fontSize: 13, color: 'rgba(255,255,255,0.75)', textAlign: 'center',
          }}
        >
          {caption}
        </p>
      )}
    </div>
  )
}

// ─── One watercolor tile — circle on desktop, flat rectangle on mobile ──────
function Tile({
  project,
  isMobile,
  onOpenGallery,
}: {
  project: Project
  isMobile: boolean
  onOpenGallery: (p: Project) => void
}) {
  const [hover, setHover] = useState(false)
  const isLink = !!project.href
  const isRoute = !!project.to
  const isGallery = !!project.images
  const [r, g, b] = project.rgb

  const discBase: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius: isMobile ? 16 : '50%',
    backgroundImage: wash(r, g, b),
    boxShadow:
      'inset 0 8px 24px rgba(255,255,255,0.45), inset 0 -12px 26px rgba(0,0,0,0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  const pill = (
    <span
      className="stix"
      style={{
        background: '#ffffff',
        color: project.grey ? '#333' : '#111',
        padding: '5px 15px',
        fontSize: project.grey ? 15 : 17,
        lineHeight: '21px',
        whiteSpace: 'pre',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      {project.label}
    </span>
  )

  const inner = (
    <div
      onClick={() => isGallery && onOpenGallery(project)}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        transform: `
          rotate(${isMobile ? 0 : project.tilt}deg)
          translateY(${hover ? -8 : 0}px)
          scale(${hover ? 1.04 : 1})
        `,
      }}
    >
      {isLink ? (
        <Link href={project.href!} target="_blank" rel="noopener noreferrer" style={discBase}>
          {pill}
        </Link>
      ) : isRoute ? (
        <Link href={project.to!} style={discBase}>
          {pill}
        </Link>
      ) : (
        <div style={discBase}>
          {pill}
          <span
            style={{
              position: 'absolute', bottom: '11%',
              fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 11,
              color: 'rgba(0,0,0,0.45)',
              // No hover on touch screens — keep the hint visible on mobile.
              opacity: hover || isMobile ? 1 : 0, transition: 'opacity 0.3s ease',
            }}
          >
            tap to view
          </span>
        </div>
      )}
    </div>
  )

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        // Mobile: straight, uniform, thinner cards stacked full-width.
        width: isMobile ? '100%' : project.size,
        maxWidth: isMobile ? 350 : undefined,
        height: isMobile ? 120 : project.size,
        cursor: 'pointer',
      }}
    >
      {inner}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const isMobile = useIsMobile()
  const [gallery, setGallery] = useState<Project | null>(null)

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#fff' }}>
      {/* Brand, links home */}
      <div style={{ position: 'absolute', top: isMobile ? 20 : 28, left: isMobile ? 20 : 56, zIndex: 20 }}>
        <Link href="/" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span className="stix" style={{ fontSize: 15, letterSpacing: '0.06em', color: '#111' }}>
            house of zero
          </span>
          <span style={{ fontFamily: 'Georgia', fontSize: 11, color: '#AAAAAA', letterSpacing: '0.04em' }}>
            projects
          </span>
        </Link>
      </div>

      {/* Heading */}
      <div style={{ padding: isMobile ? '84px 20px 0' : '96px 56px 8px', textAlign: 'center' }}>
        <h1 className="stix" style={{ fontSize: 'clamp(48px, 8vw, 92px)', fontWeight: 400, lineHeight: 1, color: '#1a1a1a' }}>
          Projects
        </h1>
        <p style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: isMobile ? 13 : 15, color: '#8a8a8a', marginTop: 14 }}>
          things i&rsquo;ve made — {isMobile ? 'tap a card to visit, or a soft one to view.' : 'click a circle to visit, or tap a soft one to view.'}
        </p>
      </div>

      {/* Desktop: scattered circle cluster. Mobile: straight vertical stack. */}
      <main
        style={{
          display: 'flex',
          flexWrap: isMobile ? 'nowrap' : 'wrap',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: isMobile ? 28 : 'clamp(28px, 5vw, 64px)',
          padding: isMobile ? '40px 20px 80px' : '56px clamp(24px, 8vw, 120px) 120px',
          maxWidth: 1240, margin: '0 auto',
        }}
      >
        {PROJECTS.map((p) => (
          <Tile key={p.id} project={p} isMobile={isMobile} onOpenGallery={setGallery} />
        ))}
      </main>

      {/* Footer */}
      <footer style={{ padding: '28px 56px', textAlign: 'center', fontFamily: 'Georgia', fontSize: 13, color: '#b3b3b3' }}>
        © Emily — house of zero
      </footer>

      {gallery?.images && (
        <Lightbox
          images={gallery.images}
          caption={gallery.caption}
          onClose={() => setGallery(null)}
        />
      )}
    </div>
  )
}
