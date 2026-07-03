'use client'

import { useState } from 'react'
import Link from 'next/link'

// ─── Your projects ──────────────────────────────────────────────────────────
// Each project is a soft watercolor circle. Two kinds:
//   • LINK tile   → give it an `href`. Clicking opens the project's website.
//   • PHOTO tile  → leave `href` out and add `image` + `caption`. Clicking
//                   flips the circle over to show the photo and a note.
// `color` is the [r,g,b] watercolor wash. `size` sets the diameter in px, so
// the cluster feels hand-scattered rather than grid-perfect.
//
// To add a project: copy a block, change the fields. Photos live in
// public/images/projects/ — reference them as '/images/projects/your-file.jpg'.
// ─────────────────────────────────────────────────────────────────────────────

interface Project {
  id: string
  label: string        // use \n for a two-line label
  rgb: [number, number, number]
  size: number         // circle diameter in px
  tilt: number         // small rotation in deg
  href?: string        // present → link tile; absent → flip/photo tile
  image?: string       // photo shown on the back of a photo tile
  caption?: string     // note shown under the photo
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
    // photo tile — no href. Flips to show image + caption.
    image: '/images/projects/placeholder.jpg',
    caption: 'study guides i made and shared.',
  },
  {
    id: 'mba-rocketship',
    label: 'MBA\nRocketship',
    rgb: [122, 51, 80],
    size: 168, tilt: -1.4,
    image: '/images/projects/placeholder.jpg',
    caption: 'a little thing from the MBA days.',
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

// ─── One watercolor circle ──────────────────────────────────────────────────
function Tile({ project }: { project: Project }) {
  const [flipped, setFlipped] = useState(false)
  const [hover, setHover] = useState(false)
  const isLink = !!project.href
  const isRoute = !!project.to
  const isFlip = !isLink && !isRoute
  const [r, g, b] = project.rgb

  const discBase: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    backgroundImage: wash(r, g, b),
    boxShadow:
      'inset 0 8px 24px rgba(255,255,255,0.45), inset 0 -12px 26px rgba(0,0,0,0.04)',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
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
      onClick={() => isFlip && setFlipped((f) => !f)}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
        transform: `
          rotate(${project.tilt}deg)
          translateY(${hover && !flipped ? -8 : 0}px)
          scale(${hover && !flipped ? 1.04 : 1})
          rotateY(${flipped ? 180 : 0}deg)
        `,
      }}
    >
      {/* FRONT */}
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
              opacity: hover ? 1 : 0, transition: 'opacity 0.3s ease',
            }}
          >
            tap to peek
          </span>
        </div>
      )}

      {/* BACK (photo tiles only) */}
      {isFlip && (
        <div
          style={{
            ...discBase,
            backgroundImage: project.image ? `url(${project.image})` : wash(r, g, b),
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: '#EFEBE3',
            transform: 'rotateY(180deg)',
            overflow: 'hidden',
            alignItems: 'flex-end',
            boxShadow: `inset 0 0 0 5px rgba(${r},${g},${b},0.9)`,
          }}
        >
          {project.caption && (
            <span
              style={{
                width: '100%', padding: '20px 14px 16px',
                background: 'linear-gradient(to top, rgba(0,0,0,0.62), rgba(0,0,0,0))',
                fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 12.5,
                lineHeight: 1.4, color: '#fff', textAlign: 'center',
              }}
            >
              {project.caption}
            </span>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ width: project.size, height: project.size, perspective: 1000, cursor: 'pointer' }}
    >
      {inner}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function ProjectsPage() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#fff' }}>
      {/* Brand, links home */}
      <div style={{ position: 'absolute', top: 28, left: 56, zIndex: 20 }}>
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
      <div style={{ padding: '96px 56px 8px', textAlign: 'center' }}>
        <h1 className="stix" style={{ fontSize: 'clamp(48px, 8vw, 92px)', fontWeight: 400, lineHeight: 1, color: '#1a1a1a' }}>
          Projects
        </h1>
        <p style={{ fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 15, color: '#8a8a8a', marginTop: 14 }}>
          things i&rsquo;ve made — click a circle to visit, or tap a soft one to peek.
        </p>
      </div>

      {/* Circle cluster */}
      <main
        style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center',
          gap: 'clamp(28px, 5vw, 64px)',
          padding: '56px clamp(24px, 8vw, 120px) 120px',
          maxWidth: 1240, margin: '0 auto',
        }}
      >
        {PROJECTS.map((p) => (
          <Tile key={p.id} project={p} />
        ))}
      </main>

      {/* Footer */}
      <footer style={{ padding: '28px 56px', textAlign: 'center', fontFamily: 'Georgia', fontSize: 13, color: '#b3b3b3' }}>
        © Emily — house of zero
      </footer>
    </div>
  )
}
