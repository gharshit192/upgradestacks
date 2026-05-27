// app/layout.tsx
import type { Metadata } from 'next'
import { DM_Sans, Sora } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500'],
})

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '600', '700', '800'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://upgradestacks.com'),
  title: {
    default: 'UpgradeStacks — The Complete Stack for Every Type of Person',
    template: '%s | UpgradeStacks',
  },
  description: 'Find the exact tools, apps, and resources used by people in your profession. Curated, rated, and verified by the community. Free forever.',
  keywords: ['tools', 'apps', 'resources', 'profession', 'stack', 'productivity', 'india'],
  authors: [{ name: 'UpgradeStacks' }],
  openGraph: {
    type: 'website',
    siteName: 'UpgradeStacks',
    title: 'UpgradeStacks — The Complete Stack for Every Type of Person',
    description: 'Find the exact tools, apps, and resources used by people in your profession.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UpgradeStacks',
    description: 'The complete stack for every type of person.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${sora.variable}`}>
      <body className="bg-[#fafaf8] text-[#0F0E17] font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
