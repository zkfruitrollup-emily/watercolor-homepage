import Link from 'next/link'
import { getPosts } from '@/lib/posts'
import WriteButton from './WriteButton'

// Always fetch fresh posts — never statically cache this page — so a saved
// post shows up immediately on refresh.
export const dynamic = 'force-dynamic'

export default async function ThoughtsPage() {
  const posts = await getPosts()

  // Sort newest first (assuming date strings are parseable)
  const sortedPosts = [...posts].reverse()

  return (
    <>
      <div style={{ position: 'relative', minHeight: '100vh', background: '#fff' }}>
        {/* ── Sticky nav ─────────────────────────────────────────────── */}
        <nav
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 clamp(20px, 6vw, 80px)',
            height: 65,
            borderBottom: '1px solid #E8E8E8',
            background: '#fff',
          }}
        >
          <Link href="/" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span
              className="stix"
              style={{ fontSize: 18, letterSpacing: '0.08em', color: '#111', display: 'block' }}
            >
              house of zero
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
              thoughts
            </span>
          </Link>

          <WriteButton />
        </nav>

        {/* ── Decorative hanging plant — tucks behind the nav, hangs in the
              right-side gutter next to the heading. Drop the exported PNG
              from the Paper mockup at public/images/potted-plant.png. ── */}
        <img
          src="/images/potted-plant.png"
          alt=""
          style={{
            position: 'absolute',
            top: 0,
            right: 'clamp(16px, 5vw, 64px)',
            width: 'clamp(120px, 26vw, 240px)',
            height: 'auto',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />

        {/* ── Page heading ────────────────────────────────────────────── */}
        <div style={{ padding: '80px clamp(20px, 6vw, 80px) 40px' }}>
          <h1
            className="stix"
            style={{ fontSize: 'clamp(52px, 13vw, 96px)', fontWeight: 400, lineHeight: 1, color: '#111' }}
          >
            Thoughts
          </h1>
        </div>

        {/* ── Post list ───────────────────────────────────────────────── */}
        <main style={{ padding: '0 clamp(20px, 6vw, 80px)', paddingBottom: 120 }}>
          {sortedPosts.length === 0 ? (
            // Empty state — hidden from readers, just structural placeholder
            <div style={{ paddingTop: 60 }} />
          ) : (
            sortedPosts.map((post, i) => (
              <article
                key={post.id}
                style={{
                  width: '100%',
                  maxWidth: 680,
                  paddingTop: i === 0 ? 60 : 0,
                  paddingBottom: 80,
                  borderBottom: i < sortedPosts.length - 1 ? '1px solid #E8E8E8' : 'none',
                  marginBottom: i < sortedPosts.length - 1 ? 80 : 0,
                }}
              >
                {/* Date */}
                <p
                  style={{
                    fontFamily: 'Georgia',
                    fontSize: 13,
                    color: '#999',
                    marginBottom: 16,
                    letterSpacing: '0.02em',
                  }}
                >
                  {post.date}
                </p>

                {/* Headline */}
                <h2
                  className="stix"
                  style={{
                    fontSize: 28,
                    fontWeight: 400,
                    lineHeight: 1.2,
                    color: '#111',
                    marginBottom: 20,
                  }}
                >
                  {post.headline}
                </h2>

                {/* Body */}
                <div
                  style={{
                    fontFamily: 'Georgia',
                    fontSize: 16,
                    lineHeight: 1.75,
                    color: '#222',
                  }}
                >
                  {post.body.split('\n').map((paragraph, j) =>
                    paragraph.trim() ? (
                      <p key={j} style={{ marginBottom: 16 }}>
                        {paragraph}
                      </p>
                    ) : null
                  )}
                </div>
              </article>
            ))
          )}
        </main>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <footer
          style={{
            padding: '32px clamp(20px, 6vw, 80px)',
            borderTop: '1px solid #E8E8E8',
            fontFamily: 'Georgia',
            fontSize: 13,
            color: '#aaa',
          }}
        >
          © Emily — all thoughts reserved
        </footer>
      </div>
    </>
  )
}
