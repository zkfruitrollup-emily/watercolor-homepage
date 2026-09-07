'use client'

import Link from 'next/link'
import { useIsMobile } from '@/lib/useIsMobile'

// ─── About ───────────────────────────────────────────────────────────────────
// Bio on the left, the watercolour plant on the right. The plant is a cut-out
// (transparent PNG/WebP, no paper rectangle) so it floats on the white page —
// its painted cast shadow is what grounds it, which is why the asset is wider
// than the plant itself. Mobile stacks: heading, plant, bio.
// ─────────────────────────────────────────────────────────────────────────────

const PLANT_W = 1500
const PLANT_H = 2326

const BIO = [
  "In the AI era where everything starts to look the same, sound the same and feel the same, it’s the perfect place for creativity to come and play. When simple and complicated tasks can be completed with a text-prompt it leaves the most room for creativity especially imperfect creativity to flourish.",
  "As an Entrepreneur, my specialty is seeing how systems work and inserting a creative mindset to see where there's opportunities for growth. This led me to get my Cornell Johnson MBA with a focus on AI and new technology. There, I was elected Big Red Tech Club President, the professional community to connect MBA’s wider tech ecosystem.",
  "Some projects I’m working on now are Offbeat Greets, a digital greeting card company where you can send crypto with your card. I have a few TikTok channels I’m working on and I’m developing new solutions to improve fitness and recreation.",
  "With over 8+ years of marketing experience I’ve worked on many different brands, and led cross-functional teams. I turned dying brands into ones that culture loves, and launched new products that sold out in record amounts of time.",
  "When I’m not creating, I’m competing in calisthenics, traveling, or playing basketball.",
]

const CAPTION = "this site is the aggregation of everything I'm working on and achieved"

export default function AboutPage() {
  const isMobile = useIsMobile()

  const plant = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/about-plant-cutout.webp"
      alt="A watercolour painting of a potted plant"
      width={PLANT_W}
      height={PLANT_H}
      style={{
        display: 'block',
        width: '100%',
        height: 'auto',
        opacity: 0,
        animation: 'about-in 1.1s ease-out 0.25s both',
      }}
    />
  )

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
        @keyframes about-in {
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
            about
          </span>
        </Link>
      </div>

      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 1200,
          margin: '0 auto',
          padding: isMobile ? '92px 32px 0' : '170px 24px 0',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'flex-start',
          gap: isMobile ? 0 : 'clamp(48px, 6vw, 82px)',
        }}
      >
        {/* Heading + bio */}
        <div
          style={{
            flex: '1 1 0',
            minWidth: 0,
            maxWidth: isMobile ? '100%' : 600,
            display: 'flex',
            flexDirection: 'column',
            alignItems: isMobile ? 'center' : 'flex-start',
            gap: 24,
          }}
        >
          <h1
            className="stix"
            style={{
              fontSize: isMobile ? 'clamp(44px, 14vw, 56px)' : 'clamp(60px, 6.2vw, 88px)',
              fontWeight: 400,
              lineHeight: 1.04,
              letterSpacing: '-0.01em',
              color: '#1a1a1a',
              opacity: 0,
              animation: 'about-in 0.8s ease-out 0.05s both',
            }}
          >
            About
          </h1>

          <p
            style={{
              fontFamily: 'Georgia',
              fontStyle: 'italic',
              fontSize: isMobile ? 14 : 16,
              lineHeight: 1.35,
              color: '#8a8a8a',
              textAlign: isMobile ? 'center' : 'left',
              opacity: 0,
              animation: 'about-in 0.8s ease-out 0.15s both',
            }}
          >
            {CAPTION}
          </p>

          {/* On mobile the plant sits between the caption and the bio */}
          {isMobile && (
            <div style={{ width: '100%', maxWidth: 350, paddingTop: 20, paddingBottom: 6 }}>
              {plant}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? 20 : 22,
              paddingTop: isMobile ? 6 : 14,
              maxWidth: 560,
            }}
          >
            {BIO.map((para, i) => (
              <p
                key={i}
                style={{
                  fontFamily: 'Georgia',
                  fontSize: isMobile ? 16 : 17,
                  lineHeight: isMobile ? '29px' : '31px',
                  color: '#333333',
                  opacity: 0,
                  animation: `about-in 0.8s ease-out ${(0.3 + i * 0.07).toFixed(2)}s both`,
                }}
              >
                {para}
              </p>
            ))}
          </div>
        </div>

        {/* The plant, floating on the page */}
        {!isMobile && (
          <div style={{ flex: '0 0 auto', width: 'clamp(360px, 38vw, 518px)' }}>
            {plant}
          </div>
        )}
      </main>

      <footer
        style={{
          padding: '72px 24px 26px',
          textAlign: 'center',
          fontFamily: 'Georgia',
          fontSize: 13,
          color: '#9a9aa0',
        }}
      >
        © Emily — house of zero
      </footer>
    </div>
  )
}
