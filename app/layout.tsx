import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'house of zero',
  description: 'a cozy corner of the internet',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
