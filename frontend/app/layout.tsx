import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'StyleGenie - AI Fashion Designer',
  description: 'Generate custom fashion designs and find similar products or ateliers',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  themeColor: '#ec4899',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className="font-sans">
      <body>{children}</body>
    </html>
  )
}
