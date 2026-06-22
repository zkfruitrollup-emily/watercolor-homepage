# house of zero

## Quick start

```bash
npm install
npm run dev
# → http://localhost:3000
```

---

## Images you need to add

Drop these files into `/public/images/`:

| File | Where it's used |
|------|----------------|
| `watercolor-room.jpg` | Homepage background (export from Paper) |
| `photography/firework.jpg` | Photo carousel slide 1 |
| `photography/shell-on-sand.jpg` | Photo carousel slide 2 |
| `photography/person-walking-beach.jpg` | Photo carousel slide 3 (vertical) |

---

## Adjusting hover zones (homepage)

Open `app/page.tsx` and find the `NAV_ITEMS` array.

Each item has a `zone` object with `top / left / width / height` in percentages of the viewport.
To **debug zone boundaries**, uncomment the two CSS lines inside the Link style:
```ts
// background: 'rgba(255,0,0,0.1)',
// border: '1px dashed red',
```
This shows red outlines so you can drag-adjust each percentage until zones line up perfectly with the illustration.

---

## Adding blog posts

Open `app/thoughts/page.tsx` and add entries to the `POSTS` array:
```ts
{
  id: 'unique-id',
  date: 'June 15, 2026',
  headline: 'your headline here',
  body: 'your post text here. use \\n\\n for paragraph breaks.',
}
```
Posts are shown newest-first (the array is reversed before rendering).

---

## Adding photography

1. Drop the image into `public/images/photography/`
2. Add an entry to the `PHOTOS` array in `app/photography/page.tsx`:
```ts
{
  id: 'unique-id',
  src: '/images/photography/your-photo.jpg',
  caption: 'Location — Year',        // or '' for no caption
  orientation: 'landscape',          // 'landscape' = cover, 'portrait' = contain
}
```

---

## Passwords

Set your passwords as environment variables so they aren't in the source code:

```bash
# .env.local
NEXT_PUBLIC_WRITE_PASSWORD=yourpassword
NEXT_PUBLIC_UPLOAD_PASSWORD=yourpassword
```

> Note: `NEXT_PUBLIC_` variables are visible in the browser bundle — this is fine for a personal site. For true security, check the password on the server via an API route.

---

## Linking the remaining nav items

In `app/page.tsx`, find the `NAV_ITEMS` for `portfolio`, `tiktok`, and `offbeat greets` and change `href: '#'` to the real URL when those pages are ready.
