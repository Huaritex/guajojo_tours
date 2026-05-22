'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'
import { Mountain, Trees, Droplets, Wine, type LucideIcon } from 'lucide-react'
import { gsap } from '@/lib/gsap'

/* ─── Types ─── */

interface WorldData {
  imageSrc: string
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
    imageSrc: '/images/activities/Samaipata-Fuerte.png',
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
    imageSrc: '/images/activities/Bosque-Nublado.png',
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
    imageSrc: '/images/activities/Cascada-senderos.png',
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
    imageSrc: '/images/activities/Cultura.png',
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
                  className="w-full relative"
                  style={{
                    height: 'calc(100% + 36px)',
                    marginTop: '-18px',
                    willChange: 'transform',
                  }}
                >
                  <Image
                    src={world.imageSrc}
                    alt={world.title}
                    fill
                    sizes="55vw"
                    priority={i === 0}
                    className="object-cover"
                  />
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
