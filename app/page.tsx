'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Dithering, GodRays } from '@paper-design/shaders-react'

// ─── Source image dimensions ──────────────────────────────────────────────────
const IMG_W = 1452
const IMG_H = 1070

// Container is sized to match the image's natural cover dimensions so that
// % positions on the container === % positions in the image. No math hook needed.
// height = max(100vh, 73.68vw) shows the full image on desktop and lets you
// scroll to see the bottom (yoga mat/tiktok) when the viewport is short.
const RATIO_PCT = `${((IMG_H / IMG_W) * 100).toFixed(2)}vw` // 73.68vw

// Short-hand: image pixel → % of image dimension
const ix = (px: number) => `${(px / IMG_W * 100).toFixed(3)}%`
const iy = (px: number) => `${(px / IMG_H * 100).toFixed(3)}%`

// ─── Nav items ─────────────────────────────────────────────────────────────────
// imgX/imgY:    top-left of the pill, in image pixels (from Paper)
// pillW/pillH:  pill size in image pixels
// zoneBox:      clickable hit area in image pixels [x, y, w, h]
// revealDelay:  CSS transition-delay for left-to-right stagger
const NAV_ITEMS = [
  {
    id: 'offbeat',
    label: 'offbeat\ngreets',
    href: '#',
    imgX: 516,  imgY: 326,
    pillW: 133, pillH: 50,
    zoneBox: [350, 240, 260, 220] as [number, number, number, number],
    revealDelay: '0s',
    revealThreshold: 0.05,
  },
  {
    id: 'portfolio',
    label: 'portfolio',
    href: '#',
    imgX: 711,  imgY: 322,
    pillW: 130, pillH: 33,
    zoneBox: [580, 240, 250, 220] as [number, number, number, number],
    revealDelay: '0.15s',
    revealThreshold: 0.15,
  },
  {
    id: 'blog',
    label: 'blog',
    href: '/thoughts',
    imgX: 976,  imgY: 119,
    pillW: 95,  pillH: 33,
    zoneBox: [900, 0, 320, 480] as [number, number, number, number],
    revealDelay: '0.3s',
    revealThreshold: 0.25,
  },
  {
    id: 'photo',
    label: 'photo',
    href: '/photography',
    imgX: 1324, imgY: 187,
    pillW: 95,  pillH: 33,
    zoneBox: [1200, 80, 252, 570] as [number, number, number, number],
    revealDelay: '0.45s',
    revealThreshold: 0.35,
  },
  {
    id: 'tiktok',
    label: 'tiktok',
    href: '#',
    imgX: 1117, imgY: 870, // yoga mat center — raised from 1002 so it's visible
    pillW: 95,  pillH: 33,
    zoneBox: [900, 820, 330, 240] as [number, number, number, number],
    revealDelay: '0s',
    revealThreshold: 0.65, // appears when user has scrolled well into the page
  },
  {
    // Blank wall just right of the picture frame, directly above the couch
    // back cushions. Placeholder — no destination yet.
    id: 'about',
    label: 'about',
    href: '#',
    imgX: 460, imgY: 390,
    pillW: 95,  pillH: 33,
    zoneBox: [430, 360, 160, 110] as [number, number, number, number],
    revealDelay: '0.1s',
    revealThreshold: 0.1,
  },
  {
    // Overlays the framed abstract painting on the wall. Placeholder — no
    // destination yet.
    id: 'projects',
    label: 'projects',
    href: '/projects',
    imgX: 266, imgY: 176,
    pillW: 128, pillH: 33,
    zoneBox: [215, 20, 230, 345] as [number, number, number, number],
    revealDelay: '0.2s',
    revealThreshold: 0.2,
  },
]

// ─── Shader video overlays ─────────────────────────────────────────────────────
// Drop screen recordings into public/videos/
//   lava-lamp.mp4   blendMode: multiply  (dark lava blobs)
// God rays + disco dots use the real Paper shader components (GodRays,
// Dithering) below instead of recorded video — the recordings baked in
// Paper's white canvas background, which defeated both blend modes. The
// live shaders render with true alpha (colorBack is transparent) so they
// composite correctly with no blend-mode trickery needed.
interface ShaderVideo {
  id: string; src: string
  imgX: number; imgY: number; imgW: number; imgH: number
  rotate?: number; clipPath?: string
  blendMode: 'screen' | 'multiply'
  opacity: number; filter?: string
}

const SHADER_VIDEOS: ShaderVideo[] = [
  {
    id: 'lava-lamp',
    src: '/videos/lava-lamp.mp4',
    imgX: 861, imgY: 274, imgW: 43, imgH: 52,
    clipPath: 'polygon(67.4% 1%, 33.3% 0%, 0% 100%, 100% 97.1%)',
    blendMode: 'multiply', opacity: 1,
  },
]

// ── God rays ───────────────────────────────────────────────────────────────────
// Real Paper shader (GodRays, node B-0). Position/rotation converted from
// Paper canvas coords the same way as everywhere else:
//   imgX = canvasLeft + 534, imgY = canvasTop + 735
const GOD_RAYS_BOX = { imgX: 1199, imgY: 93, imgW: 312.48, imgH: 690.63, rotate: 31.77 }

// ── Disco-ball sparkles ────────────────────────────────────────────────────────
// Real Paper shader (Dithering, node F-0) — colorBack is transparent so it
// composites correctly over the watercolor with no blend-mode trickery needed.
const DISCO_BOX = { imgX: 952, imgY: 65, imgW: 336, imgH: 230 }

// Set to true to see videos without blend modes + red outlines for positioning
const DEBUG_VIDEOS = false

// ─── Page ───────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handle = () => {
      const el = containerRef.current
      if (!el) return
      const maxScroll = Math.max(1, el.offsetHeight - window.innerHeight)
      setScrollProgress(window.scrollY / maxScroll)
    }
    window.addEventListener('scroll', handle, { passive: true })
    handle()
    return () => window.removeEventListener('scroll', handle)
  }, [])

  const isVisible = (item: typeof NAV_ITEMS[0]) =>
    scrollProgress >= item.revealThreshold || hoveredId === item.id

  return (
    // Container sized to the image's natural display height so the full painting
    // is revealed by scrolling. % positions on children == % positions in image.
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: `max(100vh, ${RATIO_PCT})`,
        backgroundImage: 'url(/images/watercolor-room.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        overflow: 'hidden',
      }}
    >
      {/* Subtle top vignette */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.04) 0%, transparent 30%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Shader video overlays ──────────────────────────────────────────── */}
      {SHADER_VIDEOS.map((v) => (
        <video
          key={v.id}
          src={v.src}
          autoPlay loop muted playsInline
          style={{
            position: 'absolute',
            left: ix(v.imgX), top: iy(v.imgY),
            width: ix(v.imgW), height: iy(v.imgH),
            transform: v.rotate ? `rotate(${v.rotate}deg)` : undefined,
            transformOrigin: '0 0',
            clipPath: DEBUG_VIDEOS ? undefined : v.clipPath,
            mixBlendMode: DEBUG_VIDEOS ? 'normal' : v.blendMode,
            opacity: DEBUG_VIDEOS ? 1 : v.opacity,
            filter: DEBUG_VIDEOS ? undefined : v.filter,
            outline: DEBUG_VIDEOS ? '2px solid red' : undefined,
            pointerEvents: 'none',
            objectFit: 'cover',
            zIndex: 5,
          }}
        />
      ))}

      {/* ── God rays: real Paper GodRays shader (B-0) ─────────────────────── */}
      {/* Same fix as the disco ball: GodRays needs width/height as actual
          PROPS to size its canvas and animate. The wrapper div handles our
          responsive %-based position/size + the rotation; the shader inside
          stays unrotated so its own width/height stay simple. */}
      <div
        style={{
          position: 'absolute',
          left: ix(GOD_RAYS_BOX.imgX), top: iy(GOD_RAYS_BOX.imgY),
          width: ix(GOD_RAYS_BOX.imgW), height: iy(GOD_RAYS_BOX.imgH),
          transform: `rotate(${GOD_RAYS_BOX.rotate}deg)`,
          transformOrigin: '0 0',
          pointerEvents: 'none',
          zIndex: 4,
          outline: DEBUG_VIDEOS ? '2px solid blue' : undefined,
        }}
      >
        <GodRays
          width="100%"
          height="100%"
          offsetX={0.2}
          offsetY={-0.8}
          intensity={0.58}
          spotty={0.25}
          midSize={0.1}
          midIntensity={0.75}
          density={0.22}
          bloom={1}
          speed={2.42}
          scale={1}
          colorBack="#00000000"
          colors={['#FFFFFF1F', '#FFFFFF24', '#FFFFFF24']}
          colorBloom="#EEEEEE"
          style={{ opacity: 0.75, filter: 'blur(4px)' }}
        />
      </div>

      {/* ── Disco ball sparkles: real Paper Dithering shader (F-0) ───────── */}
      {/* Outer div handles responsive %-based position/size (our ix/iy system).
          Dithering needs width/height as actual PROPS (not just CSS style) —
          it uses them to size its internal canvas and drive the animation
          loop. Passing them only via `style` left the canvas with no valid
          render size, which is why it painted once but never animated. */}
      <div
        style={{
          position: 'absolute',
          left: ix(DISCO_BOX.imgX), top: iy(DISCO_BOX.imgY),
          width: ix(DISCO_BOX.imgW), height: iy(DISCO_BOX.imgH),
          pointerEvents: 'none',
          zIndex: 5,
          outline: DEBUG_VIDEOS ? '2px solid lime' : undefined,
        }}
      >
        <Dithering
          width="100%"
          height="100%"
          speed={0.93}
          shape="sphere"
          type="4x4"
          size={4.8}
          scale={0.59}
          colorBack="#00000000"
          colorFront="#FFFFFF52"
          style={{ filter: 'blur(4px)' }}
        />
      </div>

      {/* ── House of Zero title ────────────────────────────────────────────── */}
      <div style={{ position: 'absolute', top: '3.5%', left: '3.3%', zIndex: 10, pointerEvents: 'none' }}>
        <span
          className="stix"
          style={{ fontSize: 'clamp(14px, 1.6vw, 26px)', letterSpacing: '0.06em', color: '#111' }}
        >
          house of zero
        </span>
      </div>

      {/* ── Nav zones + white pill labels ─────────────────────────────────── */}
      {NAV_ITEMS.map((item) => {
        const visible = isVisible(item)
        const hasLink = item.href !== '#'
        const [zx, zy, zw, zh] = item.zoneBox

        return (
          <div key={item.id}>
            {/* Large invisible hit zone */}
            <Link
              href={item.href}
              onClick={hasLink ? undefined : (e) => e.preventDefault()}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                position: 'absolute',
                left: ix(zx), top: iy(zy),
                width: ix(zw), height: iy(zh),
                zIndex: 20,
                cursor: hasLink ? 'pointer' : 'default',
                // Uncomment to debug zone outlines:
                // background: 'rgba(255,0,0,0.1)',
                // border: '1px dashed red',
              }}
              aria-label={item.label.replace('\n', ' ')}
            />

            {/* White pill — text centered inside ── */}
            <div
              style={{
                position: 'absolute',
                left: ix(item.imgX),
                top: iy(item.imgY),
                width: ix(item.pillW),
                height: iy(item.pillH),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#ffffff',
                zIndex: 15,
                pointerEvents: 'none',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(5px)',
                transition: `opacity 0.45s ease ${item.revealDelay}, transform 0.45s ease ${item.revealDelay}`,
              }}
            >
              <span
                className="stix"
                style={{
                  fontSize: 'clamp(10px, 1.38vw, 20px)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                  color: '#000',
                  whiteSpace: item.id === 'offbeat' ? 'pre' : 'nowrap',
                  textAlign: 'center',
                }}
              >
                {item.label}
              </span>
            </div>
          </div>
        )
      })}

      {/* ── Scroll hint ────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'fixed',   // fixed so it stays visible at the bottom of viewport
          bottom: 28,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          pointerEvents: 'none',
          opacity: scrollProgress < 0.03 ? 0.45 : 0,
          transition: 'opacity 0.6s ease',
        }}
      >
        <span style={{ fontSize: 11, letterSpacing: '0.12em', color: '#555' }}>scroll</span>
      </div>
    </div>
  )
}
