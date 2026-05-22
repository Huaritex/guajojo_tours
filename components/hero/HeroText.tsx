'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { ArrowRight } from 'lucide-react'

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
  const buttonRef = useRef<HTMLButtonElement>(null)
  const glowRef = useRef<HTMLSpanElement>(null)

  // Spotlight & magnetic hover effects using GSAP
  const handleMouseEnter = () => {
    gsap.to(glowRef.current, {
      opacity: 1,
      duration: 0.35,
      ease: 'power2.out',
    })
    gsap.to(buttonRef.current, {
      scale: 1.05,
      borderColor: 'rgba(52, 211, 153, 0.6)',
      boxShadow: '0 0 50px rgba(52, 211, 153, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      backgroundColor: 'rgba(4, 47, 22, 0.6)',
      color: '#fafaf9',
      duration: 0.3,
      ease: 'power2.out',
    })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = buttonRef.current
    const glow = glowRef.current
    if (!btn || !glow) return

    const rect = btn.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Center the spotlight on cursor coordinates
    gsap.to(glow, {
      left: x,
      top: y,
      duration: 0.15,
      ease: 'power2.out',
    })

    // Magnet effect: subtle translation towards cursor
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const deltaX = x - centerX
    const deltaY = y - centerY

    gsap.to(btn, {
      x: deltaX * 0.12,
      y: deltaY * 0.2,
      duration: 0.25,
      ease: 'power2.out',
    })
  }

  const handleMouseLeave = () => {
    gsap.to(glowRef.current, {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.out',
    })
    gsap.to(buttonRef.current, {
      x: 0,
      y: 0,
      scale: 1,
      borderColor: 'rgba(52, 211, 153, 0.25)',
      boxShadow: '0 0 30px rgba(52, 211, 153, 0.12)',
      backgroundColor: 'rgba(5, 46, 22, 0.3)',
      color: 'rgba(250, 250, 249, 0.85)',
      duration: 0.65,
      ease: 'elastic.out(1.1, 0.5)',
    })
  }

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
        ref={buttonRef}
        className="hero-cta mt-24 md:mt-28 relative overflow-hidden group flex items-center gap-3 px-9 py-4.5 rounded-2xl font-semibold text-base border backdrop-blur-md transition-shadow duration-300 select-none cursor-pointer"
        style={{
          borderColor: 'rgba(52, 211, 153, 0.25)',
          backgroundColor: 'rgba(5, 46, 22, 0.3)',
          color: 'rgba(250, 250, 249, 0.85)',
          boxShadow: '0 0 30px rgba(52, 211, 153, 0.12)',
        }}
        onClick={scrollToConstructor}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Spotlight cursor glow */}
        <span
          ref={glowRef}
          className="absolute pointer-events-none rounded-full"
          style={{
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(52, 211, 153, 0.3) 0%, transparent 70%)',
            left: '0px',
            top: '0px',
            transform: 'translate(-50%, -50%)',
            opacity: 0,
            willChange: 'transform, opacity',
          }}
        />

        {/* Shimmer sweep animation overlay */}
        <span
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(52, 211, 153, 0.1) 40%, rgba(52, 211, 153, 0.25) 50%, rgba(52, 211, 153, 0.1) 60%, transparent)',
            width: '200%',
            height: '100%',
            left: '-100%',
            top: '0',
            opacity: 0.4,
            animation: 'shimmerSweep 4s infinite linear',
          }}
        />

        <style>{`
          @keyframes shimmerSweep {
            0% { transform: translateX(0%); }
            100% { transform: translateX(100%); }
          }
        `}</style>

        <span className="relative z-10 flex items-center gap-3">
          Diseñá tu viaje
          <ArrowRight
            size={18}
            className="transition-transform duration-300 group-hover:translate-x-1.5"
            style={{ color: 'var(--accent-gold)' }}
          />
        </span>
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
