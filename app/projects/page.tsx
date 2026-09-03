'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useIsMobile } from '@/lib/useIsMobile'

// ─── The splotch wall ────────────────────────────────────────────────────────
// Each project is one of Emily's scanned watercolour splotches with a white
// museum pill sitting on it. Three kinds:
//   • LINK tile    → give it an `href`. Clicking opens the project's site.
//   • GALLERY tile → give it `images` (+ optional `caption`). Opens a lightbox.
//   • ROUTE tile   → give it a `to` (internal route — the graveyard).
// `w`/`h` are the desktop paint size in px and set the tile's aspect ratio;
// mobile reuses that ratio at MOBILE_W. `tilt` scatters them off-grid.
// Splotch cut-outs live in public/images/splotches/ (transparent WebP).
// ─────────────────────────────────────────────────────────────────────────────

const MOBILE_W = 300

interface Project {
  id: string
  label: string        // \n for a two-line label
  splotch: string
  w: number
  h: number
  tilt: number
  href?: string
  images?: string[]
  caption?: string
  to?: string
  muted?: boolean      // the graveyard sits back a little
}

const PROJECTS: Project[] = [
  {
    id: 'deliverables-tracker',
    label: 'deliverables\ntracker',
    splotch: 'teal',
    w: 270, h: 168, tilt: -1.5,
    href: 'https://deliverables-tracker.vercel.app/',
  },
  {
    id: 'timeline-generator',
    label: 'timeline\ngenerator',
    splotch: 'pink',
    w: 238, h: 135, tilt: 1.8,
    href: 'https://campaign-timeline-20.vercel.app/',
  },
  {
    id: 'mini-travel-app',
    label: 'mini travel\napp',
    splotch: 'green',
    w: 258, h: 157, tilt: -0.6,
    href: 'https://project-1zj1p.vercel.app/',
  },
  {
    id: 'study-guides',
    label: 'study\nguides',
    splotch: 'turquise',
    w: 270, h: 191, tilt: 1.1,
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
    splotch: 'rose',
    w: 232, h: 167, tilt: -1.4,
    images: [
      '/images/projects/mba-dashboard.jpg',
      '/images/projects/mba-input.jpg',
      '/images/projects/mba-school.jpg',
    ],
    caption: 'MBA Rocketship — my daily dashboard.',
  },
  {
    id: 'trashtalk-nyc',
    label: 'trashtalk nyc',
    splotch: 'purple-blue',
    w: 270, h: 188, tilt: 0.8,
    href: 'https://preview--nyc-street-draw.lovable.app/',
  },
  {
    id: 'graveyard',
    label: 'graveyard',
    splotch: 'cardinal',
    w: 215, h: 127, tilt: -1.8,
    to: '/graveyard',
    muted: true,
  },
]

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
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 100,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 16, padding: '48px 16px',
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: 'absolute', top: 16, right: 20, background: 'none',
          border: 'none', cursor: 'pointer', fontSize: 26, color: '#fff',
          lineHeight: 1, padding: 8,
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
            background: 'none', border: 'none',
            cursor: index === total - 1 ? 'default' : 'pointer',
            fontSize: 22, color: '#fff', opacity: index === total - 1 ? 0.25 : 0.85, padding: 8,
          }}
        >
          →
        </button>
      </div>

      {caption && (
        <p style={{
          margin: 0, fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 13,
          color: 'rgba(255,255,255,0.75)', textAlign: 'center',
        }}>
          {caption}
        </p>
      )}
    </div>
  )
}

// ─── One splotch ─────────────────────────────────────────────────────────────
function Splotch({
  project,
  index,
  isMobile,
  onOpenGallery,
}: {
  project: Project
  index: number
  isMobile: boolean
  onOpenGallery: (p: Project) => void
}) {
  const [hover, setHover] = useState(false)
  const isLink = !!project.href
  const isRoute = !!project.to
  const isGallery = !!project.images
  const lift = hover && !isMobile

  const w = isMobile ? MOBILE_W : project.w
  const h = Math.round(w * (project.h / project.w))

  const paint = (
    <div
      style={{
        position: 'relative',
        width: w,
        height: h,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: project.muted ? 0.72 : 1,
        // Straighten and lift when nudged.
        transform: lift
          ? 'rotate(0deg) translateY(-6px) scale(1.03)'
          : `rotate(${isMobile ? 0 : project.tilt}deg)`,
        transition: 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/images/splotches/${project.splotch}-splotch.webp`}
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'contain', pointerEvents: 'none',
        }}
      />
      <span
        className="stix"
        style={{
          position: 'relative',
          background: '#ffffff',
          color: project.muted ? '#333' : '#111',
          padding: isMobile ? '5px 15px' : '5px 15px',
          fontSize: project.muted ? 15 : 17,
          lineHeight: '21px',
          whiteSpace: 'pre',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        {project.label}
      </span>
    </div>
  )

  const hint = isLink ? 'visit ↗' : isGallery ? 'view →' : 'pay respects →'

  const body = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      {paint}
      <span
        style={{
          fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 11.5,
          color: '#4a5a8a',
          opacity: hover || isMobile ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        {hint}
      </span>
    </div>
  )

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        cursor: 'pointer',
        opacity: 0,
        animation: `splotch-in 0.7s ease-out ${(0.12 + index * 0.09).toFixed(2)}s both`,
      }}
    >
      {isLink ? (
        <Link href={project.href!} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
          {body}
        </Link>
      ) : isRoute ? (
        <Link href={project.to!} style={{ display: 'block' }}>
          {body}
        </Link>
      ) : (
        <div onClick={() => onOpenGallery(project)}>{body}</div>
      )}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const isMobile = useIsMobile()
  const [gallery, setGallery] = useState<Project | null>(null)

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff',
      }}
    >
      <style>{`
        @keyframes splotch-in {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Brand, links home */}
      <div style={{ position: 'absolute', top: isMobile ? 20 : 28, left: isMobile ? 20 : 56, zIndex: 20 }}>
        <Link href="/" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span className="stix" style={{ fontSize: 15, letterSpacing: '0.06em', color: '#111' }}>
            house of zero
          </span>
          <span style={{ fontFamily: 'Georgia', fontSize: 11, color: '#999', letterSpacing: '0.04em' }}>
            projects
          </span>
        </Link>
      </div>

      {/* Heading */}
      <div style={{ padding: isMobile ? '84px 20px 0' : '92px 56px 0', textAlign: 'center' }}>
        <h1 className="stix" style={{ fontSize: 'clamp(44px, 7vw, 84px)', fontWeight: 400, lineHeight: 1, color: '#1a1a1a' }}>
          Projects
        </h1>
        <p style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: isMobile ? 13 : 15, color: '#7d7d84', marginTop: 14 }}>
          things i&rsquo;ve made — {isMobile ? 'tap a splotch to visit, or a soft one to peek.' : 'click a splotch to visit, or a soft one to peek.'}
        </p>
      </div>

      {/* The wall of splotches */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexWrap: 'wrap',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'center',
          alignItems: 'center',
          alignContent: 'flex-start',
          columnGap: isMobile ? 0 : 44,
          rowGap: isMobile ? 40 : 56,
          padding: isMobile ? '56px 20px 80px' : '72px clamp(24px, 3vw, 64px) 96px',
          maxWidth: 1400,
          margin: '0 auto',
          width: '100%',
        }}
      >
        {PROJECTS.map((p, i) => (
          <Splotch key={p.id} project={p} index={i} isMobile={isMobile} onOpenGallery={setGallery} />
        ))}
      </main>

      <footer
        style={{
          padding: '30px 24px 26px',
          textAlign: 'center',
          fontFamily: 'Georgia',
          fontSize: 13,
          color: '#9a9aa0',
        }}
      >
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
