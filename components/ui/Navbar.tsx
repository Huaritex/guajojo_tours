'use client'

import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    if (!navRef.current) return

    gsap.set(navRef.current, { y: -80, opacity: 0 })

    ScrollTrigger.create({
      start: 'top -80px',
      onEnter: () =>
        gsap.to(navRef.current, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }),
      onLeaveBack: () =>
        gsap.to(navRef.current, { y: -80, opacity: 0, duration: 0.4, ease: 'power3.in' }),
    })
  }, { scope: navRef })

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav
      ref={navRef}
      className="liquid-glass fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl"
      style={{ width: 'min(92vw, 720px)' }}
    >
      <div className="flex items-center justify-between">
        <span
          className="font-display text-lg font-bold tracking-tight"
          style={{ color: 'var(--accent-gold)' }}
        >
          Guajojó
        </span>

        <div className="hidden md:flex items-center gap-6">
          {['Experiencias', 'Constructor', 'Contacto'].map((item) => (
            <button
              key={item}
              onClick={() => scrollTo(item.toLowerCase())}
              className="text-sm font-medium transition-colors duration-200 cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--text-primary)')}
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.color = 'var(--text-secondary)')
              }
            >
              {item}
            </button>
          ))}
        </div>

        <button
          onClick={() => scrollTo('constructor')}
          className="text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200"
          style={{
            background: 'var(--accent-emerald)',
            color: '#0a0a0a',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.85')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
        >
          Diseñá tu viaje
        </button>
      </div>
    </nav>
  )
}
