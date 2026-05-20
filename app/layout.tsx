import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'
import SmoothScroll from '@/components/ui/SmoothScroll'
import GrainOverlay from '@/components/ui/GrainOverlay'

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '700'],
})

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500'],
})

export const metadata: Metadata = {
  title: 'Guajojó Tours — Descubrí lo Invisible',
  description:
    'Turismo de aventura, naturaleza y cultura en Samaipata, Santa Cruz, Bolivia. El Fuerte UNESCO, Parque Amboró, cascadas y más.',
  keywords: 'Samaipata, Bolivia, turismo aventura, El Fuerte UNESCO, Amboró, naturaleza Bolivia',
  openGraph: {
    title: 'Guajojó Tours — Samaipata, Bolivia',
    description: 'Descubrí lo invisible. Turismo de aventura en el corazón de Bolivia.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-x-hidden">
        <GrainOverlay />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  )
}
