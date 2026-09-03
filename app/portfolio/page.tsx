'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useIsMobile } from '@/lib/useIsMobile'

// ─── Product launches ────────────────────────────────────────────────────────
// Three case studies, each painted onto one of Emily's scanned watercolour
// washes. Desktop lays them out as a four-column grid — three launches plus an
// "other brands" rail — where the grid rows keep every title, paragraph block,
// photo and stat on a shared line no matter how long the copy runs. Mobile
// turns the same three cards plus the rail into a scroll-snap swipe deck.
//
// Copy is Emily's, verbatim. Wash + photo assets live in
// public/images/portfolio/. The washes sit at WASH_OPACITY behind the text.
// ─────────────────────────────────────────────────────────────────────────────

const WASH_OPACITY = 0.5
const INK = '#1F1F24'

interface CaseStudy {
  id: string
  title: string
  paragraphs: string[]
  stat: string
  statNote: string
  wash: string       // desktop wash slug
  washMobile: string
  photo: string
  photoAlt: string
}

const CASES: CaseStudy[] = [
  {
    id: 'high-noon',
    title: 'The Industry’s First Limited Time Only Product Drop',
    paragraphs: [
      'High Noon needed to separate themselves from their competitors.',
      'The answer:\nAll in on Golf.',
      'I was tasked with leading the team to launch the High Noon version of Transfusion, a Golfer’s favorite drink.',
      'I liaised between the client and creatives vision to come up with an unforgettable social first campaign complete with influencers, paid social, and organic to push the drink.',
      'The launch sent fans wild, and after two weeks it was 80% sold out. They sold out in half the time of their 90 day goal.',
    ],
    stat: '45 days',
    statNote: 'to sell out completely — half the 90-day goal they set.',
    wash: 'wash-high-noon',
    washMobile: 'wash-m-high-noon',
    photo: 'photo-high-noon',
    photoAlt: 'High Noon Transfusion can on a golf course',
  },
  {
    id: 'white-claw',
    title: 'Seeded White Claw in Culture',
    paragraphs: [
      'White Claw embedded itself so deeply in surf culture, that it’s branding wasn’t fully resonating with it’s audience.',
      'I oversaw and led our 360-campaign that landed White Claw for the first time into the fashion space.',
      'First we hosted a pop-up in the heart of New York Fashion Week. Then continued the capsule collection to Art Basel and hosted a concert.',
      'By the end of the campaign we had celebrities promoting us for free. Denzel Curry was wearing our items, T-Pain was asking for the collection, and one of the Migos showed up to our parties all proof we infiltrated culture.',
      'This helped turn White Claw to a +3.8% sales lift during a period of a 11% category decline bringing it to a 56% market share.',
    ],
    stat: '+3.8%',
    statNote: 'sales lift during an 11% category decline — bringing White Claw to 56% market share.',
    wash: 'wash-white-claw',
    washMobile: 'wash-m-white-claw',
    photo: 'photo-white-claw',
    photoAlt: 'White Claw concert crowd',
  },
  {
    id: 'spectrum',
    title: 'Launched Spectrum’s New TV Offering',
    paragraphs: [
      'One of Spectrum’s revenue drivers over the past 20 years was cable.\n\nAs cords continue to get cut, they created an app package that includes Disney+, ESPN, Fox Sports, Hulu, and many more in one bundle.',
      'Nothing like this was on the market, so landing the right messaging was key.',
      'I led the clients and team to Mexico City to shoot a multi-platform digital campaign. I orchestrated the producers, creative team, strategy and clients to get a $15M+ (in media spend) campaign live in four weeks.',
      'After launching in Q4 2025, it became the first quarterly pay-TV subscriber net-add in years. Spectrum cut its pay-TV subscriber losses by ~79% year-over-year (1.2M in 2024 → 255K in 2025).',
    ],
    stat: '~79%',
    statNote: 'cut in pay-TV subscriber losses year over year — 1.2M in 2024 to 255K in 2025, and the first quarterly net-add in years.',
    wash: 'wash-spectrum',
    washMobile: 'wash-m-spectrum',
    photo: 'photo-spectrum',
    photoAlt: 'Family watching football in a living room',
  },
]

const OTHER_BRANDS = [
  'Swiffer', 'Mike’s Hard Lemonade', 'Cayman Jack', 'Queens Public Library',
  'Mr. Clean', 'Más+ by Messi', 'Truist', '1-800-Flowers',
  'Nutribullet', 'ZocDoc', 'AWAY Luggage', 'Nethermind',
]

const HEADING = 'Product Launches'
const SUBHEAD =
  'Client Services at a Creative Advertising Agency involved clients & internal teams aligned, ' +
  'managing projects, and strategically planning what’s best for the business'

function Brand() {
  return (
    <Link href="/" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span className="stix" style={{ fontSize: 15, letterSpacing: '0.06em', color: '#111' }}>
        house of zero
      </span>
      <span style={{ fontFamily: 'Georgia', fontSize: 11, color: '#999', letterSpacing: '0.04em' }}>
        portfolio
      </span>
    </Link>
  )
}

function Paragraphs({ items, size, leading }: { items: string[]; size: number; leading: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: leading * 0.7 }}>
      {items.map((p, i) => (
        <p
          key={i}
          style={{
            margin: 0,
            fontFamily: 'Georgia, serif',
            fontSize: size,
            lineHeight: `${leading}px`,
            color: INK,
            whiteSpace: 'pre-wrap',
          }}
        >
          {p}
        </p>
      ))}
    </div>
  )
}

function Stat({ value, note, size, noteSize }: { value: string; note: string; size: number; noteSize: number }) {
  return (
    <div style={{ borderTop: '1px solid rgba(30,20,30,0.30)', paddingTop: 6 }}>
      <div className="stix" style={{ fontSize: size, lineHeight: `${size * 1.1}px`, color: '#141414' }}>
        {value}
      </div>
      <div style={{
        fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: noteSize,
        lineHeight: `${noteSize * 1.35}px`, color: '#33333B', marginTop: 4,
      }}>
        {note}
      </div>
    </div>
  )
}

// ─── Desktop: one grid, four columns, shared rows ────────────────────────────
function Desktop() {
  return (
    <>
      <div style={{ position: 'absolute', top: 28, left: 56, zIndex: 20 }}><Brand /></div>

      <header style={{ padding: '92px 56px 0', textAlign: 'center' }}>
        <h1 className="stix" style={{
          fontSize: 'clamp(52px, 5.5vw, 88px)', fontWeight: 400, lineHeight: 1,
          letterSpacing: '-0.012em', color: '#1A1A1A', margin: 0,
        }}>
          {HEADING}
        </h1>
        <p style={{
          fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 15,
          color: '#6E6E76', margin: '16px auto 0', maxWidth: 1120,
        }}>
          {SUBHEAD}
        </p>
      </header>

      <main
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr)) 230px',
          columnGap: 44,
          // title · copy · photo · stat — every card shares these four rows,
          // so the lines stay level however long a writeup gets.
          gridTemplateRows: 'auto auto auto auto',
          rowGap: 46,
          alignItems: 'start',
          maxWidth: 1600,
          margin: '0 auto',
          padding: '150px 60px 120px',
          width: '100%',
        }}
      >
        {CASES.map((c, i) => (
          <div
            key={`${c.id}-wash`}
            aria-hidden="true"
            style={{
              gridColumn: i + 1,
              gridRow: '2 / 5',
              alignSelf: 'stretch',
              margin: '-56px -24px -58px',
              backgroundImage: `url(/images/portfolio/${c.wash}.webp)`,
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
              opacity: WASH_OPACITY,
              pointerEvents: 'none',
            }}
          />
        ))}

        {CASES.map((c, i) => (
          <h2
            key={`${c.id}-title`}
            className="stix"
            style={{
              gridColumn: i + 1, gridRow: 1, margin: 0, padding: '0 29px',
              fontSize: 29, lineHeight: '35px', fontWeight: 400,
              letterSpacing: '-0.014em', color: '#111111',
            }}
          >
            {c.title}
          </h2>
        ))}

        {CASES.map((c, i) => (
          <div key={`${c.id}-copy`} style={{ gridColumn: i + 1, gridRow: 2, padding: '0 29px', position: 'relative' }}>
            <Paragraphs items={c.paragraphs} size={17} leading={25} />
          </div>
        ))}

        {CASES.map((c, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${c.id}-photo`}
            src={`/images/portfolio/${c.photo}.webp`}
            alt={c.photoAlt}
            style={{
              gridColumn: i + 1, gridRow: 3, width: 314, height: 314,
              objectFit: 'cover', justifySelf: 'start', marginLeft: 29,
              position: 'relative',
            }}
          />
        ))}

        {CASES.map((c, i) => (
          <div key={`${c.id}-stat`} style={{ gridColumn: i + 1, gridRow: 4, padding: '0 29px', position: 'relative' }}>
            <Stat value={c.stat} note={c.statNote} size={56} noteSize={14} />
          </div>
        ))}

        {/* Other brands — the fourth column, level with the titles */}
        <div style={{ gridColumn: 4, gridRow: 1, position: 'relative', height: 112 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/portfolio/swatch-green.webp"
            alt=""
            aria-hidden="true"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.85 }}
          />
          <div className="stix" style={{
            position: 'relative', height: '100%', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 27, letterSpacing: '-0.014em', color: '#14231A',
          }}>
            Other brands
          </div>
        </div>

        <ul style={{
          gridColumn: 4, gridRow: 2, listStyle: 'none', margin: 0, padding: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 11,
          fontFamily: 'Georgia, serif', fontSize: 15, lineHeight: '20px', color: '#26262C',
        }}>
          {OTHER_BRANDS.map((b) => <li key={b}>{b}</li>)}
        </ul>
      </main>

      <footer style={{
        padding: '20px 24px 40px', textAlign: 'center',
        fontFamily: 'Georgia, serif', fontSize: 13, color: '#9A9AA0',
      }}>
        © Emily — house of zero
      </footer>
    </>
  )
}

// ─── Mobile: a scroll-snap swipe deck, one screen per card ───────────────────
function MobileDeck() {
  const [active, setActive] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const total = CASES.length + 1

  // Which card is centred? Derived from scroll position, no library needed.
  const onScroll = () => {
    const el = trackRef.current
    if (!el) return
    setActive(Math.round(el.scrollLeft / el.clientWidth))
  }

  const Header = ({ index }: { index: number }) => (
    <>
      <div style={{ position: 'absolute', top: 16, left: 20 }}><Brand /></div>
      <div style={{
        position: 'absolute', top: 28, right: 20, display: 'flex', gap: 7,
      }}>
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} style={{
            width: 7, height: 7, borderRadius: '50%',
            background: i === index ? '#1A1A1A' : '#D2D2D6',
          }} />
        ))}
      </div>
      <h1 className="stix" style={{
        position: 'absolute', top: 52, left: 20, margin: 0, fontWeight: 400,
        fontSize: 26, lineHeight: '30px', letterSpacing: '-0.012em', color: '#1A1A1A',
      }}>
        {HEADING}
      </h1>
    </>
  )

  return (
    <div
      ref={trackRef}
      onScroll={onScroll}
      style={{
        display: 'flex',
        overflowX: 'auto',
        overflowY: 'hidden',
        scrollSnapType: 'x mandatory',
        height: '100dvh',
        width: '100%',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
      }}
    >
      {CASES.map((c, i) => (
        <section
          key={c.id}
          style={{
            position: 'relative', flex: '0 0 100%', height: '100%',
            scrollSnapAlign: 'start', background: '#fff', overflow: 'hidden',
          }}
        >
          <Header index={i} />

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/images/portfolio/${c.photo}.webp`}
            alt={c.photoAlt}
            style={{ position: 'absolute', left: 20, top: 100, width: 132, height: 132, objectFit: 'cover' }}
          />
          <h2 className="stix" style={{
            position: 'absolute', left: 186, top: 100, width: 184, margin: 0,
            fontWeight: 400, fontSize: 17, lineHeight: '21px',
            letterSpacing: '-0.014em', color: '#111111',
          }}>
            {c.title}
          </h2>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/images/portfolio/${c.washMobile}.webp`}
            alt=""
            aria-hidden="true"
            style={{
              position: 'absolute', left: 20, top: 244, width: 350, height: 571,
              opacity: WASH_OPACITY, pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'absolute', left: 44, top: 268, width: 302 }}>
            <Paragraphs items={c.paragraphs} size={14.5} leading={20.5} />
          </div>

          <div style={{ position: 'absolute', left: 44, top: 714, width: 302 }}>
            <Stat value={c.stat} note={c.statNote} size={32} noteSize={11.5} />
          </div>

          <div style={{
            position: 'absolute', left: 0, right: 0, top: 806, textAlign: 'center',
            fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, color: '#8A8A90',
          }}>
            {i < CASES.length - 1 ? `swipe for ${CASES[i + 1].id === 'white-claw' ? 'White Claw' : 'Spectrum'} →` : 'swipe for Other brands →'}
          </div>
        </section>
      ))}

      {/* Card four — other brands */}
      <section style={{
        position: 'relative', flex: '0 0 100%', height: '100%',
        scrollSnapAlign: 'start', background: '#fff', overflow: 'hidden',
      }}>
        <Header index={3} />

        <div style={{ position: 'absolute', left: 68, top: 130, width: 254, height: 124 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/portfolio/swatch-green.webp"
            alt=""
            aria-hidden="true"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.85 }}
          />
          <div className="stix" style={{
            position: 'relative', height: '100%', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 24, letterSpacing: '-0.014em', color: '#14231A',
          }}>
            Other brands
          </div>
        </div>

        <ul style={{
          position: 'absolute', left: 45, top: 300, width: 300, listStyle: 'none',
          margin: 0, padding: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 10, fontFamily: 'Georgia, serif',
          fontSize: 15, lineHeight: '20px', color: '#26262C',
        }}>
          {OTHER_BRANDS.map((b) => <li key={b}>{b}</li>)}
        </ul>

        <div style={{
          position: 'absolute', left: 0, right: 0, top: 700, textAlign: 'center',
          fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, color: '#8A8A90',
        }}>
          ← swipe back to the launches
        </div>
        <div style={{
          position: 'absolute', left: 0, right: 0, top: 790, textAlign: 'center',
          fontFamily: 'Georgia, serif', fontSize: 12, color: '#9A9AA0',
        }}>
          © Emily — house of zero
        </div>
      </section>
    </div>
  )
}

export default function PortfolioPage() {
  const isMobile = useIsMobile()

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', position: 'relative' }}>
      <style>{`
        main::-webkit-scrollbar, div::-webkit-scrollbar { display: none; }
      `}</style>
      {isMobile ? <MobileDeck /> : <Desktop />}
    </div>
  )
}
