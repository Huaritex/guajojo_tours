'use client'

import { useRef, useEffect, type ComponentType } from 'react'
import { Mountain, Trees, Droplets, Wine, type LucideIcon } from 'lucide-react'
import { gsap } from '@/lib/gsap'

/* ─── Inline SVG landscape illustrations ─── */

function ArtFuerte() {
  return (
    <svg viewBox="0 0 400 160" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="gf-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#030a05" />
          <stop offset="100%" stopColor="#052e16" />
        </linearGradient>
        <radialGradient id="gf-glow" cx="50%" cy="55%" r="40%">
          <stop offset="0%" stopColor="#d4a574" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#d4a574" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="160" fill="url(#gf-sky)" />
      <rect width="400" height="160" fill="url(#gf-glow)" />
      {([
        [42, 14, 1.1, 0.9], [118, 9, 0.8, 0.7], [197, 13, 1.3, 0.85],
        [278, 7, 0.9, 0.65], [348, 21, 1.0, 0.75], [83, 32, 0.7, 0.5],
        [163, 26, 0.85, 0.6], [312, 38, 0.75, 0.8], [378, 11, 1.1, 0.55],
        [18, 42, 0.6, 0.45], [230, 19, 0.9, 0.7], [56, 55, 0.7, 0.4],
      ] as [number, number, number, number][]).map(([cx, cy, r, op], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill={i % 3 === 0 ? '#fafaf9' : '#d4a574'} opacity={op} />
      ))}
      <path d="M 0 110 Q 100 90 200 95 Q 300 100 400 88 L 400 160 L 0 160 Z" fill="#041209" opacity="0.7" />
      <path d="M 90 160 L 110 105 L 135 98 L 175 92 L 200 90 L 225 92 L 265 98 L 290 105 L 310 160 Z" fill="#020908" />
      <path d="M 118 160 L 132 118 L 155 112 L 200 109 L 245 112 L 268 118 L 282 160 Z" fill="#030c07" />
      <path d="M 140 160 L 150 130 L 175 124 L 200 122 L 225 124 L 250 130 L 260 160 Z" fill="#041009" />
      <line x1="152" y1="136" x2="248" y2="136" stroke="#0d3320" strokeWidth="1.2" opacity="0.7" />
      <line x1="160" y1="141" x2="240" y2="141" stroke="#0d3320" strokeWidth="0.8" opacity="0.5" />
      <line x1="170" y1="128" x2="230" y2="128" stroke="#0a2916" strokeWidth="0.9" opacity="0.45" />
      <path d="M 175 92 Q 200 88 225 92 Q 200 86 175 92 Z" fill="#d4a574" opacity="0.18" />
      <circle cx="200" cy="116" r="7" fill="none" stroke="#1a5c35" strokeWidth="0.8" opacity="0.45" />
      <line x1="193" y1="116" x2="207" y2="116" stroke="#1a5c35" strokeWidth="0.6" opacity="0.35" />
      <line x1="200" y1="109" x2="200" y2="123" stroke="#1a5c35" strokeWidth="0.6" opacity="0.35" />
    </svg>
  )
}

function ArtAmboro() {
  return (
    <svg viewBox="0 0 400 160" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="ga-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#040e07" />
          <stop offset="50%" stopColor="#052e16" />
          <stop offset="100%" stopColor="#064e3b" />
        </linearGradient>
        <linearGradient id="ga-mist" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f0fdf4" stopOpacity="0" />
          <stop offset="20%" stopColor="#f0fdf4" stopOpacity="0.06" />
          <stop offset="50%" stopColor="#f0fdf4" stopOpacity="0.09" />
          <stop offset="80%" stopColor="#f0fdf4" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#f0fdf4" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="400" height="160" fill="url(#ga-bg)" />
      <path d="M -10 160 L 0 115 L 20 100 L 45 90 L 70 95 L 90 82 L 115 78 L 140 85 L 160 72 L 185 68 L 210 74 L 230 65 L 255 70 L 275 60 L 300 66 L 320 72 L 345 62 L 370 70 L 395 65 L 410 75 L 410 160 Z" fill="#082013" />
      <path d="M -10 160 L 0 130 L 25 118 L 50 108 L 75 115 L 100 102 L 125 95 L 150 105 L 170 92 L 195 88 L 220 96 L 245 86 L 268 93 L 290 82 L 315 90 L 340 80 L 365 88 L 390 78 L 410 85 L 410 160 Z" fill="#0c3019" />
      <rect x="0" y="88" width="400" height="18" fill="url(#ga-mist)" />
      <path d="M -10 160 L 0 145 L 30 135 L 60 125 L 85 132 L 115 120 L 140 115 L 168 122 L 195 112 L 220 118 L 248 108 L 272 115 L 298 105 L 325 112 L 355 102 L 380 110 L 410 100 L 410 160 Z" fill="#103d22" />
      <rect x="0" y="110" width="400" height="14" fill="url(#ga-mist)" />
      <line x1="185" y1="60" x2="175" y2="160" stroke="#34d399" strokeWidth="0.6" opacity="0.06" />
      <line x1="210" y1="55" x2="205" y2="160" stroke="#34d399" strokeWidth="0.5" opacity="0.05" />
      <line x1="230" y1="58" x2="235" y2="160" stroke="#a7f3d0" strokeWidth="0.4" opacity="0.04" />
      {([
        [145, 105, 1.8], [190, 98, 2.2], [240, 102, 1.5],
        [310, 108, 1.9], [85, 118, 1.6], [355, 95, 1.7],
        [270, 95, 1.4],
      ] as [number, number, number][]).map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="#34d399" opacity={0.55 + (i % 3) * 0.1} />
      ))}
    </svg>
  )
}

function ArtCascadas() {
  return (
    <svg viewBox="0 0 400 160" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="gc-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#04090f" />
          <stop offset="100%" stopColor="#062236" />
        </linearGradient>
        <linearGradient id="gc-pool" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0e4a6e" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#072236" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <rect width="400" height="160" fill="url(#gc-bg)" />
      {([[90, 25, 0.7], [210, 18, 0.9], [320, 30, 0.7], [155, 12, 0.6], [270, 22, 0.8]] as [number, number, number][]).map(
        ([cx, cy, op], i) => (
          <circle key={i} cx={cx} cy={cy} r="0.8" fill="#e0f2fe" opacity={op} />
        )
      )}
      <path d="M 0 0 L 130 0 L 110 45 L 100 70 L 95 100 L 90 160 L 0 160 Z" fill="#03090f" />
      <path d="M 95 160 L 100 100 L 108 70 L 118 50 L 130 0 L 140 0 L 125 48 L 115 75 L 108 105 L 103 160 Z" fill="#06141f" />
      <path d="M 400 0 L 270 0 L 290 45 L 300 70 L 305 100 L 310 160 L 400 160 Z" fill="#03090f" />
      <path d="M 305 160 L 300 100 L 292 70 L 282 48 L 270 0 L 260 0 L 275 50 L 285 75 L 292 105 L 297 160 Z" fill="#06141f" />
      {(
        [
          [170, 0, 176, 115], [185, 0, 190, 118], [198, 0, 200, 120],
          [210, 0, 212, 118], [223, 0, 228, 115],
        ] as [number, number, number, number][]
      ).map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="#bae6fd" strokeWidth={i === 2 ? 1.5 : 0.9}
          opacity={i === 2 ? 0.45 : 0.28}
          strokeDasharray={i % 2 === 0 ? '' : '8 4'} />
      ))}
      <ellipse cx="200" cy="140" rx="80" ry="22" fill="url(#gc-pool)" />
      <ellipse cx="200" cy="138" rx="55" ry="12" fill="none" stroke="#38bdf8" strokeWidth="0.7" opacity="0.3" />
      <ellipse cx="200" cy="138" rx="35" ry="8" fill="none" stroke="#7dd3fc" strokeWidth="0.6" opacity="0.25" />
      <ellipse cx="200" cy="128" rx="18" ry="6" fill="#bae6fd" opacity="0.12" />
      <ellipse cx="200" cy="125" rx="60" ry="15" fill="#e0f2fe" opacity="0.06" />
    </svg>
  )
}

function ArtCultura() {
  return (
    <svg viewBox="0 0 400 160" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="gcu-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a0600" />
          <stop offset="60%" stopColor="#6b2500" />
          <stop offset="100%" stopColor="#3d1200" />
        </linearGradient>
        <radialGradient id="gcu-sun" cx="72%" cy="30%" r="35%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="160" fill="url(#gcu-sky)" />
      <rect width="400" height="160" fill="url(#gcu-sun)" />
      <ellipse cx="290" cy="75" rx="70" ry="35" fill="#f59e0b" opacity="0.08" />
      <path d="M -10 160 Q 60 98 130 104 Q 200 110 270 100 Q 340 90 410 102 L 410 160 Z" fill="#2d1000" />
      <path d="M -10 160 Q 50 118 120 122 Q 190 126 260 116 Q 330 106 410 120 L 410 160 Z" fill="#4a1a00" />
      {[124, 128, 132, 136, 140].map((y, i) => (
        <path key={i}
          d={`M 40 ${y + i} Q 130 ${y - 4 + i} 230 ${y + i} Q 320 ${y + 4 + i} 380 ${y + 1 + i}`}
          fill="none" stroke="#7c3000" strokeWidth="0.8" opacity={0.35 - i * 0.04} />
      ))}
      <path d="M -10 160 Q 70 138 150 140 Q 220 142 300 132 Q 360 124 410 138 L 410 160 Z" fill="#6b2800" />
      {[143, 147, 151, 155].map((y, i) => (
        <path key={i}
          d={`M 20 ${y + i} Q 110 ${y - 3 + i} 210 ${y + i} Q 300 ${y + 3 + i} 395 ${y + 1 + i}`}
          fill="none" stroke="#a04010" strokeWidth="0.9" opacity={0.4 - i * 0.05} />
      ))}
      {([[155, 120], [170, 118], [185, 116], [320, 110], [335, 112]] as [number, number][]).map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="1.2" fill="#d4a574" opacity={0.7 + (i % 2) * 0.15} />
      ))}
      {([[60, 88], [120, 80], [340, 78], [390, 90]] as [number, number][]).map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="0.8" fill="#d4a574" opacity={0.5 + (i % 2) * 0.2} />
      ))}
    </svg>
  )
}

/* ─── Types ─── */

interface WorldData {
  Art: ComponentType
  Icon: LucideIcon
  title: string
  body: string
  stat: string
  category: string
  accent: string
  bg: string
  atmosphere: string
  number: string
}

/* ─── World definitions ─── */

const WORLDS: WorldData[] = [
  {
    Art: ArtFuerte,
    Icon: Mountain,
    title: 'El Fuerte de Samaipata',
    body: 'Patrimonio UNESCO. La roca tallada más grande del mundo, testigo de civilizaciones preincaicas y del poderío inca.',
    stat: 'A 6km del pueblo',
    category: 'Cultura',
    accent: '#d4a574',
    bg: '#030a05',
    atmosphere: 'radial-gradient(ellipse at 65% 40%, rgba(212,165,116,0.14) 0%, transparent 65%)',
    number: '01',
  },
  {
    Art: ArtAmboro,
    Icon: Trees,
    title: 'Selva Nublada de Amboró',
    body: 'Uno de los parques más biodiversos del planeta. Hogar del oso jucumari, el gallito de las rocas y cientos de orquídeas.',
    stat: '+800 especies de aves',
    category: 'Naturaleza',
    accent: '#34d399',
    bg: '#040e07',
    atmosphere: 'radial-gradient(ellipse at 65% 60%, rgba(52,211,153,0.11) 0%, transparent 65%)',
    number: '02',
  },
  {
    Art: ArtCascadas,
    Icon: Droplets,
    title: 'Cascadas y Senderos',
    body: 'Cuevas, pozas naturales y senderos entre helechos gigantes. Pajcha, Las Cuevas, El Jardín — cada uno, un mundo.',
    stat: 'Rutas de 2h a 2 días',
    category: 'Aventura',
    accent: '#38bdf8',
    bg: '#04090f',
    atmosphere: 'radial-gradient(ellipse at 65% 40%, rgba(56,189,248,0.11) 0%, transparent 65%)',
    number: '03',
  },
  {
    Art: ArtCultura,
    Icon: Wine,
    title: 'Cultura Viva',
    body: 'Viñedos de altura, mercados artesanales, gastronomía valluna y la energía de un pueblo que vive despacio.',
    stat: '1,650 msnm de magia',
    category: 'Gastronomía',
    accent: '#f59e0b',
    bg: '#1a0600',
    atmosphere: 'radial-gradient(ellipse at 65% 50%, rgba(245,158,11,0.13) 0%, transparent 65%)',
    number: '04',
  },
]

/* ─── Component ─── */

export default function StorytellingCards() {
  const stickyRef   = useRef<HTMLDivElement>(null)
  const worldRefs   = useRef<(HTMLDivElement | null)[]>([])
  const artRefs     = useRef<(HTMLDivElement | null)[]>([])
  const dotRefs     = useRef<(HTMLDivElement | null)[]>([])
  const counterRefs = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    const sticky = stickyRef.current
    if (!sticky) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      const worlds   = worldRefs.current.filter((r): r is HTMLDivElement => r !== null)
      const arts     = artRefs.current.filter((r): r is HTMLDivElement => r !== null)
      const dots     = dotRefs.current.filter((r): r is HTMLDivElement => r !== null)
      const counters = counterRefs.current.filter((r): r is HTMLSpanElement => r !== null)

      if (worlds.length < WORLDS.length) return

      // ── Initial state ──
      gsap.set(worlds.slice(1), { opacity: 0, y: 60 })
      gsap.set(counters.slice(1), { opacity: 0 })
      gsap.set(dots.slice(1), { opacity: 0.2, scaleY: 0.25, transformOrigin: 'center' })

      // ── Art micro-float — GPU only, continuous (skipped for reduced-motion) ──
      if (!reducedMotion) arts.forEach((art, i) => {
        gsap.to(art, {
          y: -18,
          duration: 3.8 + i * 0.65,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })

        // SVG circles — organic pulse (stars / canopy dots / fireflies)
        const circles = Array.from(art.querySelectorAll<SVGCircleElement>('circle'))
        if (circles.length > 0) {
          gsap.to(circles, {
            opacity: '+=0.22',
            duration: 1.6 + i * 0.45,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            stagger: { each: 0.28, from: 'random' },
          })
          gsap.to(circles, {
            scale: 1.25,
            transformOrigin: 'center center',
            duration: 2.4 + i * 0.5,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            stagger: { each: 0.45, from: 'edges' },
          })
        }

        // SVG paths — foreground terrain layers drift subtly
        const paths = Array.from(art.querySelectorAll<SVGPathElement>('path'))
        const foreground = paths.slice(-3)
        if (foreground.length > 0) {
          gsap.to(foreground, {
            y: -5,
            duration: 5.2 + i * 0.9,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            stagger: 0.6,
          })
        }

        // SVG lines — waterfall / light streaks flicker
        const lines = Array.from(art.querySelectorAll<SVGLineElement>('line'))
        if (lines.length > 0) {
          gsap.to(lines, {
            opacity: '+=0.15',
            duration: 2.8 + i * 0.4,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            stagger: 0.35,
          })
        }
      }) // end arts.forEach

      // ── Scroll-driven transition timeline ──
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sticky,
          start: 'top top',
          end: '+=300%',
          pin: true,
          pinSpacing: false,
          scrub: 1,
        },
      })

      // Initial dwell on world 0
      tl.to({}, { duration: 1.5 })

      WORLDS.slice(0, -1).forEach((_, i) => {
        // Out: current world exits upward
        tl.to(worlds[i],   { opacity: 0, y: -60, ease: 'power2.inOut', duration: 1 })
        tl.to(counters[i], { opacity: 0,          duration: 0.4 }, '<')
        tl.to(dots[i],     { opacity: 0.2, scaleY: 0.25, duration: 0.4 }, '<')

        // In: next world rises up from below
        tl.to(worlds[i + 1],   { opacity: 1, y: 0, ease: 'power2.inOut', duration: 1 }, '<')
        tl.to(counters[i + 1], { opacity: 1,        duration: 0.4 }, '<')
        tl.to(dots[i + 1],     { opacity: 1, scaleY: 1, duration: 0.4 }, '<')

        // Dwell between transitions (skip after last)
        if (i < WORLDS.length - 2) tl.to({}, { duration: 1.5 })
      })
    }, sticky)

    return () => ctx.revert()
  }, [])

  return (
    <section id="experiencias" className="relative h-[400vh]">
      <div
        ref={stickyRef}
        className="h-screen w-full overflow-hidden"
      >

        {/* ── World slides (stacked, absolute, GPU-composited) ── */}
        {WORLDS.map((world, i) => {
          const Icon = world.Icon
          const Art  = world.Art
          return (
            <div
              key={i}
              ref={el => { worldRefs.current[i] = el }}
              className="absolute inset-0"
            >
              {/* Solid background */}
              <div className="absolute inset-0" style={{ background: world.bg }} />

              {/* Atmospheric radial glow */}
              <div className="absolute inset-0" style={{ background: world.atmosphere }} />

              {/* Ghost world number — large typographic bg element */}
              <div
                className="absolute inset-0 flex items-end justify-end pointer-events-none overflow-hidden"
                aria-hidden="true"
              >
                <span
                  className="font-mono font-bold select-none leading-none pr-[5%] pb-[3%]"
                  style={{
                    fontSize: 'clamp(10rem, 28vw, 20rem)',
                    color: `${world.accent}07`,
                    letterSpacing: '-0.06em',
                  }}
                >
                  {world.number}
                </span>
              </div>

              {/* Art panel — right 55%, full height, floated by GSAP */}
              <div className="absolute right-0 top-0 w-[55%] h-full overflow-hidden">
                <div
                  ref={el => { artRefs.current[i] = el }}
                  className="w-full"
                  style={{
                    height: 'calc(100% + 36px)',
                    marginTop: '-18px',
                    willChange: 'transform',
                  }}
                >
                  <Art />
                </div>

                {/* Art → text feather */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(to right, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.42) 36%, transparent 68%)',
                  }}
                />
                {/* Top/bottom vignette */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(to bottom, rgba(0,0,0,0.32) 0%, transparent 28%, transparent 72%, rgba(0,0,0,0.5) 100%)',
                  }}
                />
              </div>

              {/* Left-side legibility gradient */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(to right, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.4) 44%, transparent 70%)',
                }}
              />

              {/* ── Text content ── */}
              <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 lg:px-24">
                <div style={{ maxWidth: '40ch' }}>

                  {/* Mundo label + horizontal rule */}
                  <div className="mb-7 flex items-center gap-4">
                    <span
                      className="text-[9px] font-mono uppercase tracking-[0.38em]"
                      style={{ color: `${world.accent}65` }}
                    >
                      Mundo
                    </span>
                    <span
                      className="text-[9px] font-mono tabular-nums tracking-[0.2em]"
                      style={{ color: `${world.accent}85` }}
                    >
                      {world.number}
                    </span>
                    <span
                      className="flex-1 h-px"
                      style={{ background: `${world.accent}22` }}
                    />
                  </div>

                  {/* Category chip */}
                  <div className="mb-6">
                    <span
                      className="text-[9px] font-mono uppercase tracking-[0.3em] px-3 py-1.5 rounded-full border"
                      style={{
                        color: world.accent,
                        borderColor: `${world.accent}28`,
                        background: `${world.accent}0a`,
                      }}
                    >
                      {world.category}
                    </span>
                  </div>

                  {/* Icon badge */}
                  <div
                    className="mb-5 w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${world.accent}14` }}
                  >
                    <Icon size={16} style={{ color: world.accent }} />
                  </div>

                  {/* Title */}
                  <h3
                    className="font-display leading-tight mb-4"
                    style={{
                      fontSize: 'clamp(2rem, 3.5vw, 3rem)',
                      color: 'var(--text-primary)',
                      letterSpacing: '-0.015em',
                    }}
                  >
                    {world.title}
                  </h3>

                  {/* Accent divider */}
                  <div
                    className="mb-5 w-8 h-px"
                    style={{ background: `${world.accent}55` }}
                  />

                  {/* Body */}
                  <p
                    className="text-sm leading-loose mb-6"
                    style={{
                      color: 'var(--text-secondary)',
                      letterSpacing: '0.012em',
                    }}
                  >
                    {world.body}
                  </p>

                  {/* Stat */}
                  <div
                    className="flex items-center gap-2.5 text-[10px] font-mono uppercase tracking-[0.18em]"
                    style={{ color: world.accent }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: world.accent }}
                    />
                    {world.stat}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* ── Static header — always visible ── */}
        <div className="absolute top-8 left-8 md:left-16 lg:left-24 z-20 pointer-events-none">
          <p
            className="text-[9px] font-mono uppercase tracking-[0.32em] mb-1.5"
            style={{ color: 'rgba(168,162,158,0.6)' }}
          >
            Por qué Samaipata
          </p>
          <h2
            className="font-display text-sm md:text-base font-normal"
            style={{
              color: 'rgba(250,250,249,0.38)',
              letterSpacing: '0.04em',
            }}
          >
            Cuatro mundos en un solo lugar
          </h2>
        </div>

        {/* ── World counter — bottom left ── */}
        <div className="absolute bottom-8 left-8 md:left-16 lg:left-24 z-20 pointer-events-none">
          <div className="relative h-4 overflow-hidden">
            {WORLDS.map((_, i) => (
              <span
                key={i}
                ref={el => { counterRefs.current[i] = el }}
                className="absolute inset-0 text-[9px] font-mono tabular-nums tracking-[0.18em]"
                style={{
                  color: 'var(--text-secondary)',
                  opacity: i === 0 ? 1 : 0,
                }}
              >
                {String(i + 1).padStart(2, '0')}&nbsp;/&nbsp;{String(WORLDS.length).padStart(2, '0')}
              </span>
            ))}
          </div>
        </div>

        {/* ── Progress dots — right edge ── */}
        <div className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3 pointer-events-none">
          {WORLDS.map((world, i) => (
            <div
              key={i}
              ref={el => { dotRefs.current[i] = el }}
              className="w-[2px] rounded-full"
              style={{
                height: '2.5rem',
                background: world.accent,
                opacity: i === 0 ? 1 : 0.2,
                transform: `scaleY(${i === 0 ? 1 : 0.25})`,
                transformOrigin: 'center',
              }}
            />
          ))}
        </div>

      </div>
    </section>
  )
}
