'use client'

import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface MicroActivity {
  icon: string
  label: string
  duration: string
}

const MICRO_ACTIVITIES: MicroActivity[] = [
  { icon: '🏔️', label: 'Trekking Samaipata', duration: '2 días' },
  { icon: '🌿', label: 'Amboró Cloud Forest', duration: '1 día' },
  { icon: '🦅', label: 'Rapelling Waterfalls', duration: 'Medio día' },
]

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/**
 * Splits text into individual <span> elements for word-level stagger.
 * Each word is wrapped in an overflow-hidden container so the reveal
 * looks like the text pushes up through a mask.
 */
function SplitWords({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(' ').map((word, i) => (
        <span
          key={i}
          className="word-mask inline-block overflow-hidden leading-[1.1]"
          aria-hidden="true"
        >
          <span className="word-inner inline-block" style={{ opacity: 0, transform: 'translateY(40px)' }}>
            {word}
          </span>
          {i < text.split(' ').length - 1 && ' '}
        </span>
      ))}
    </span>
  )
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function GuajojoInmersiveHero() {
  const sectionRef = useRef<HTMLElement>(null)
  const imageCardRef = useRef<HTMLDivElement>(null)
  const imageInnerRef = useRef<HTMLDivElement>(null)
  const manifestoRef = useRef<HTMLDivElement>(null)
  const microBuilderRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLButtonElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (
        !sectionRef.current ||
        !imageCardRef.current ||
        !imageInnerRef.current ||
        !manifestoRef.current ||
        !microBuilderRef.current ||
        !ctaRef.current ||
        !overlayRef.current
      )
        return

      // ── Master timeline scrubbed to scroll ──────────────────────────
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=250%',
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      })

      // ── Phase 1: Image card expands to full viewport ─────────────────
      // Start values are set inline on the element (see JSX below).
      // We animate to full-screen via scale + clip-path (GPU only).
      tl.to(
        imageCardRef.current,
        {
          width: '100vw',
          height: '100vh',
          borderRadius: 0,
          ease: 'power2.inOut',
          duration: 1,
        },
        0
      )
        // Subtle counter-scale on the inner image so it looks parallax
        .to(
          imageInnerRef.current,
          {
            scale: 1.12,
            ease: 'power2.inOut',
            duration: 1,
          },
          0
        )
        // Darken overlay so text pops over the expanded image
        .to(
          overlayRef.current,
          {
            opacity: 0.55,
            ease: 'power2.inOut',
            duration: 0.6,
          },
          0.4
        )

      // ── Phase 2: Manifesto text reveals word by word ─────────────────
      const wordInners = gsap.utils.toArray<HTMLElement>(
        manifestoRef.current.querySelectorAll('.word-inner')
      )

      tl.set(manifestoRef.current, { autoAlpha: 1 }, 0.7)
        .to(
          wordInners,
          {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            ease: 'power3.out',
            duration: 0.6,
          },
          0.8
        )

      // ── Phase 3: Micro-builder slides up, then CTA blooms ────────────
      tl.fromTo(
        microBuilderRef.current,
        { autoAlpha: 0, y: 60, filter: 'blur(8px)' },
        {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
          ease: 'power3.out',
          duration: 0.7,
        },
        1.8
      ).fromTo(
        ctaRef.current,
        { autoAlpha: 0, scale: 0.88, filter: 'blur(6px)' },
        {
          autoAlpha: 1,
          scale: 1,
          filter: 'blur(0px)',
          ease: 'back.out(1.4)',
          duration: 0.6,
        },
        2.3
      )

      // Slight parallax push on the manifesto during phase 3 scroll
      tl.to(
        manifestoRef.current,
        {
          y: -32,
          ease: 'none',
          duration: 0.6,
        },
        1.7
      )

      return () => {
        ScrollTrigger.getAll().forEach((t) => t.kill())
      }
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      id="guajojo-pin-section"
      className="relative w-full h-screen overflow-hidden flex items-center justify-center"
      style={{ background: '#020c06' }}
      aria-label="Guajojó Tours — Diseña tu ruta en Bolivia"
    >
      {/* ── Phase 1: Cinematic image card ─────────────────────────── */}
      <div
        ref={imageCardRef}
        className="absolute overflow-hidden will-change-transform"
        style={{
          width: '52vw',
          height: '62vh',
          borderRadius: '20px',
          boxShadow: '0 40px 120px rgba(0,0,0,0.8)',
        }}
      >
        {/* Inner image (GPU counter-scale) */}
        <div
          ref={imageInnerRef}
          className="absolute inset-0 w-full h-full will-change-transform"
          style={{
            backgroundImage: `url('/images/hero-bolivia.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            // CSS gradient fallback when no image is available
            background: `
              linear-gradient(
                160deg,
                #0a2e12 0%,
                #082010 25%,
                #041509 50%,
                #06240e 75%,
                #0a3015 100%
              )
            `,
          }}
        >
          {/* Fallback SVG landscape — renders below a real bg image */}
          <svg
            viewBox="0 0 800 600"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            {/* Sky gradient */}
            <defs>
              <radialGradient id="sky-glow" cx="50%" cy="30%" r="60%">
                <stop offset="0%" stopColor="#0d3b1e" />
                <stop offset="100%" stopColor="#020c06" />
              </radialGradient>
              <radialGradient id="moon-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fafaf9" stopOpacity="1" />
                <stop offset="70%" stopColor="#d4a574" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#d4a574" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="800" height="600" fill="url(#sky-glow)" />
            {/* Stars */}
            {(
              [
                [100, 60, 1.2], [250, 40, 0.9], [420, 55, 1.4], [600, 35, 1.0],
                [720, 75, 0.8], [170, 95, 1.1], [530, 80, 0.7], [680, 110, 1.3],
                [55, 130, 0.9], [330, 115, 1.0], [760, 50, 0.8], [450, 20, 1.1],
              ] as [number, number, number][]
            ).map(([cx, cy, r], i) => (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                fill={i % 3 === 0 ? '#fafaf9' : '#d4a574'}
                opacity={0.45 + (i % 4) * 0.15}
              />
            ))}
            {/* Moon */}
            <circle cx="680" cy="80" r="32" fill="url(#moon-grad)" />
            {/* Mountains back */}
            <path d="M0 600 L0 280 L100 200 L200 160 L280 140 L360 155 L440 135 L520 150 L600 170 L700 190 L800 210 L800 600Z" fill="#041209" />
            <path d="M0 600 L0 320 L80 260 L160 230 L240 215 L320 225 L400 210 L480 220 L560 235 L660 255 L760 275 L800 285 L800 600Z" fill="#061810" />
            {/* Mountains mid */}
            <path d="M0 600 L0 370 L100 320 L200 300 L300 310 L400 295 L500 305 L600 315 L700 330 L800 345 L800 600Z" fill="#082214" />
            {/* Treeline */}
            <path d="M0 600 L0 440 L40 430 L80 418 L120 425 L160 412 L200 405 L240 415 L280 408 L320 400 L360 410 L400 402 L440 412 L480 406 L520 415 L560 408 L600 418 L640 410 L680 422 L720 415 L760 425 L800 418 L800 600Z" fill="#0a2c18" />
            {/* Foreground */}
            <path d="M0 600 L0 500 L60 488 L120 478 L180 485 L240 472 L300 468 L360 476 L420 470 L480 480 L540 472 L600 480 L660 488 L720 478 L780 488 L800 492 L800 600Z" fill="#0c3520" />
          </svg>
        </div>

        {/* Dark overlay that intensifies on phase 1 completion */}
        <div
          ref={overlayRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgba(2,12,6,0.85) 0%, rgba(2,12,6,0.1) 60%, transparent 100%)',
            opacity: 0.2,
          }}
        />

        {/* Small label that fades with the card */}
        <div
          className="absolute bottom-5 left-5 section-label"
          style={{ color: 'rgba(52,211,153,0.7)', fontSize: '0.6rem', letterSpacing: '0.25em' }}
        >
          Bolivia · Samaipata · El Fuerte UNESCO
        </div>
      </div>

      {/* ── Phase 2: Manifesto ────────────────────────────────────── */}
      <div
        ref={manifestoRef}
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
        style={{ opacity: 0, zIndex: 10 }}
        aria-live="polite"
      >
        {/* Eyebrow */}
        <p
          className="section-label mb-5"
          style={{ opacity: 0, transform: 'translateY(20px)' }}
          aria-hidden="true"
        >
          <span className="word-mask inline-block overflow-hidden">
            <span className="word-inner inline-block" style={{ opacity: 0, transform: 'translateY(40px)' }}>
              Turismo
            </span>
          </span>
          {' '}
          <span className="word-mask inline-block overflow-hidden">
            <span className="word-inner inline-block" style={{ opacity: 0, transform: 'translateY(40px)' }}>
              de Autor
            </span>
          </span>
        </p>

        {/* Primary headline */}
        <h2
          className="font-display text-center mb-4"
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 5rem)',
            lineHeight: 1.05,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            maxWidth: '800px',
          }}
        >
          <SplitWords text="Tu viaje no debería" />
          <br />
          <SplitWords
            text="ser una plantilla."
            className="italic"
          />
        </h2>

        {/* Sub-headline */}
        <p
          className="mt-3"
          style={{
            fontSize: 'clamp(1rem, 1.8vw, 1.5rem)',
            color: 'var(--accent-gold)',
            fontFamily: 'var(--font-dm-sans)',
            fontWeight: 300,
            letterSpacing: '0.04em',
          }}
        >
          <SplitWords text="Arma tu propia ruta." />
        </p>
      </div>

      {/* ── Phase 3: Micro-builder preview + CTA ─────────────────── */}
      <div
        ref={microBuilderRef}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-5"
        style={{ opacity: 0, zIndex: 20, minWidth: '320px', maxWidth: '480px', width: '90vw' }}
      >
        {/* Micro-constructor card */}
        <div
          className="liquid-glass w-full rounded-2xl p-5"
          style={{ border: '1px solid rgba(52,211,153,0.15)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <span
              className="section-label"
              style={{ fontSize: '0.6rem' }}
            >
              Constructor de Ruta
            </span>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                background: 'rgba(52,211,153,0.12)',
                color: 'var(--accent-emerald)',
                border: '1px solid rgba(52,211,153,0.2)',
              }}
            >
              3 días · Editable
            </span>
          </div>

          {/* Activity preview chips */}
          <ul className="flex flex-col gap-2" aria-label="Actividades seleccionadas">
            {MICRO_ACTIVITIES.map((activity, i) => (
              <li
                key={activity.label}
                className="flex items-center gap-3 px-3 py-2 rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                <span className="text-lg" aria-hidden="true">{activity.icon}</span>
                <span
                  className="flex-1 text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {activity.label}
                </span>
                <span
                  className="text-xs"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {activity.duration}
                </span>
                {/* Drag handle hint */}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                  style={{ opacity: 0.3, flexShrink: 0 }}
                >
                  <circle cx="4" cy="3" r="1" fill="currentColor" />
                  <circle cx="8" cy="3" r="1" fill="currentColor" />
                  <circle cx="4" cy="6" r="1" fill="currentColor" />
                  <circle cx="8" cy="6" r="1" fill="currentColor" />
                  <circle cx="4" cy="9" r="1" fill="currentColor" />
                  <circle cx="8" cy="9" r="1" fill="currentColor" />
                </svg>
              </li>
            ))}
          </ul>

          {/* Add-more hint */}
          <div
            className="mt-3 flex items-center gap-2 text-xs"
            style={{ color: 'rgba(52,211,153,0.5)' }}
          >
            <span aria-hidden="true">＋</span>
            <span>Arrastrá más actividades · 40+ disponibles</span>
          </div>
        </div>

        {/* CTA button */}
        <button
          ref={ctaRef}
          type="button"
          className="w-full py-4 px-8 rounded-2xl font-medium text-base tracking-wide transition-all duration-300"
          style={{
            opacity: 0,
            background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
            color: '#020c06',
            boxShadow: '0 0 40px rgba(52,211,153,0.35), 0 8px 24px rgba(0,0,0,0.4)',
            fontFamily: 'var(--font-dm-sans)',
            fontWeight: 500,
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            gsap.to(e.currentTarget, {
              scale: 1.03,
              boxShadow: '0 0 60px rgba(52,211,153,0.55), 0 12px 32px rgba(0,0,0,0.5)',
              duration: 0.3,
              ease: 'power2.out',
            })
          }}
          onMouseLeave={(e) => {
            gsap.to(e.currentTarget, {
              scale: 1,
              boxShadow: '0 0 40px rgba(52,211,153,0.35), 0 8px 24px rgba(0,0,0,0.4)',
              duration: 0.3,
              ease: 'power2.out',
            })
          }}
          onClick={() => {
            document.getElementById('constructor')?.scrollIntoView({ behavior: 'smooth' })
          }}
          aria-label="Ir al constructor de rutas Guajojó"
        >
          Diseñar mi Ruta Guajojó
        </button>

        {/* Micro copy below CTA */}
        <p
          className="text-xs text-center"
          style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-dm-sans)' }}
        >
          Sin formularios · Sin paquetes fijos · 100% tuyo
        </p>
      </div>
    </section>
  )
}
