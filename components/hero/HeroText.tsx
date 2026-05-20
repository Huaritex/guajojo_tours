'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'

function splitChars(text: string) {
  return text.split('').map((char, i) => (
    <span
      key={i}
      className="char inline-block"
      style={{ display: char === ' ' ? 'inline' : 'inline-block' }}
    >
      {char === ' ' ? ' ' : char}
    </span>
  ))
}

interface HeroTextProps {
  onComplete?: () => void
}

export default function HeroText({ onComplete }: HeroTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!containerRef.current) return

    const line1Chars = containerRef.current.querySelectorAll('.line-1 .char')
    const line2Chars = containerRef.current.querySelectorAll('.line-2 .char')
    const subtitle = containerRef.current.querySelector('.hero-subtitle')
    const cta = containerRef.current.querySelector('.hero-cta')

    gsap.set([line1Chars, line2Chars, subtitle, cta], {
      opacity: 0,
      y: 40,
    })

    const tl = gsap.timeline({ delay: 0.3 })

    tl.to(line1Chars, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.03,
      ease: 'power3.out',
    })
      .to(
        line2Chars,
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.025,
          ease: 'power3.out',
        },
        '-=0.2'
      )
      .to(
        subtitle,
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
        },
        '-=0.1'
      )
      .to(
        cta,
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'back.out(1.5)',
          onComplete,
        },
        '-=0.1'
      )
  }, { scope: containerRef })

  const scrollToConstructor = () => {
    const el = document.getElementById('constructor')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div
      ref={containerRef}
      className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto"
    >
      <div className="section-label mb-6">Samaipata · Bolivia · 1,650 msnm</div>

      <h1
        className="font-display leading-none tracking-tight mb-4"
        style={{
          fontSize: 'clamp(3.5rem, 8vw, 7rem)',
          color: 'var(--text-primary)',
        }}
      >
        <span className="block line-1">{splitChars('Descubrí lo')}</span>
        <span
          className="block line-2"
          style={{ color: 'var(--accent-gold)' }}
        >
          {splitChars('invisible.')}
        </span>
      </h1>

      <p
        className="hero-subtitle mt-6 max-w-2xl leading-relaxed"
        style={{
          fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          color: 'var(--text-secondary)',
        }}
      >
        Turismo de aventura, naturaleza y cultura en el corazón de Bolivia.
        <br className="hidden md:block" /> Selva nublada, ruinas incaicas y cascadas que no encontrarás en ningún mapa.
      </p>

      <button
        className="hero-cta mt-10 group flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-base transition-all duration-300"
        style={{
          background: 'var(--accent-emerald)',
          color: '#052e16',
          boxShadow: '0 0 40px rgba(52, 211, 153, 0.25)',
        }}
        onClick={scrollToConstructor}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLElement).style.boxShadow =
            '0 0 60px rgba(52, 211, 153, 0.4)'
          ;(e.currentTarget as HTMLElement).style.transform = 'scale(1.03)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLElement).style.boxShadow =
            '0 0 40px rgba(52, 211, 153, 0.25)'
          ;(e.currentTarget as HTMLElement).style.transform = 'scale(1)'
        }}
      >
        Diseñá tu viaje
        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
      </button>

      <div className="mt-16 flex items-center gap-2 animate-bounce" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>
        <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
          <rect x="1" y="1" width="14" height="22" rx="7" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8" cy="8" r="2" fill="currentColor">
            <animateTransform
              attributeName="transform"
              attributeType="XML"
              type="translate"
              values="0 0; 0 6; 0 0"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      </div>
    </div>
  )
}
