'use client'

import { useRef } from 'react'
import { Mountain, Trees, Droplets, Wine } from 'lucide-react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'

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

      {/* Sky */}
      <rect width="400" height="160" fill="url(#gf-sky)" />
      <rect width="400" height="160" fill="url(#gf-glow)" />

      {/* Stars */}
      {[
        [42, 14, 1.1, 0.9], [118, 9, 0.8, 0.7], [197, 13, 1.3, 0.85],
        [278, 7, 0.9, 0.65], [348, 21, 1.0, 0.75], [83, 32, 0.7, 0.5],
        [163, 26, 0.85, 0.6], [312, 38, 0.75, 0.8], [378, 11, 1.1, 0.55],
        [18, 42, 0.6, 0.45], [230, 19, 0.9, 0.7], [56, 55, 0.7, 0.4],
      ].map(([cx, cy, r, op], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill={i % 3 === 0 ? '#fafaf9' : '#d4a574'} opacity={op} />
      ))}

      {/* Distant ridge */}
      <path d="M 0 110 Q 100 90 200 95 Q 300 100 400 88 L 400 160 L 0 160 Z"
        fill="#041209" opacity="0.7" />

      {/* El Fuerte carved rock — flat mesa with stepped tiers */}
      <path d="M 90 160 L 110 105 L 135 98 L 175 92 L 200 90 L 225 92 L 265 98 L 290 105 L 310 160 Z"
        fill="#020908" />
      <path d="M 118 160 L 132 118 L 155 112 L 200 109 L 245 112 L 268 118 L 282 160 Z"
        fill="#030c07" />
      <path d="M 140 160 L 150 130 L 175 124 L 200 122 L 225 124 L 250 130 L 260 160 Z"
        fill="#041009" />

      {/* Carved channels — petroglyphs suggestion */}
      <line x1="152" y1="136" x2="248" y2="136" stroke="#0d3320" strokeWidth="1.2" opacity="0.7" />
      <line x1="160" y1="141" x2="240" y2="141" stroke="#0d3320" strokeWidth="0.8" opacity="0.5" />
      <line x1="170" y1="128" x2="230" y2="128" stroke="#0a2916" strokeWidth="0.9" opacity="0.45" />

      {/* Rock top — moonlight rim */}
      <path d="M 175 92 Q 200 88 225 92 Q 200 86 175 92 Z"
        fill="#d4a574" opacity="0.18" />

      {/* Ancient carved circle */}
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

      {/* Back canopy — deepest layer */}
      <path d="M -10 160 L 0 115 L 20 100 L 45 90 L 70 95 L 90 82 L 115 78 L 140 85 L 160 72 L 185 68 L 210 74 L 230 65 L 255 70 L 275 60 L 300 66 L 320 72 L 345 62 L 370 70 L 395 65 L 410 75 L 410 160 Z"
        fill="#082013" />

      {/* Mid canopy */}
      <path d="M -10 160 L 0 130 L 25 118 L 50 108 L 75 115 L 100 102 L 125 95 L 150 105 L 170 92 L 195 88 L 220 96 L 245 86 L 268 93 L 290 82 L 315 90 L 340 80 L 365 88 L 390 78 L 410 85 L 410 160 Z"
        fill="#0c3019" />

      {/* Mist band 1 */}
      <rect x="0" y="88" width="400" height="18" fill="url(#ga-mist)" />

      {/* Front canopy */}
      <path d="M -10 160 L 0 145 L 30 135 L 60 125 L 85 132 L 115 120 L 140 115 L 168 122 L 195 112 L 220 118 L 248 108 L 272 115 L 298 105 L 325 112 L 355 102 L 380 110 L 410 100 L 410 160 Z"
        fill="#103d22" />

      {/* Mist band 2 */}
      <rect x="0" y="110" width="400" height="14" fill="url(#ga-mist)" />

      {/* Light rays through canopy */}
      <line x1="185" y1="60" x2="175" y2="160" stroke="#34d399" strokeWidth="0.6" opacity="0.06" />
      <line x1="210" y1="55" x2="205" y2="160" stroke="#34d399" strokeWidth="0.5" opacity="0.05" />
      <line x1="230" y1="58" x2="235" y2="160" stroke="#a7f3d0" strokeWidth="0.4" opacity="0.04" />

      {/* Fireflies / bioluminescence */}
      {[
        [145, 105, 1.8], [190, 98, 2.2], [240, 102, 1.5],
        [310, 108, 1.9], [85, 118, 1.6], [355, 95, 1.7],
        [270, 95, 1.4],
      ].map(([cx, cy, r], i) => (
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

      {/* Stars / spray highlights */}
      {[[90, 25, 0.7], [210, 18, 0.9], [320, 30, 0.7], [155, 12, 0.6], [270, 22, 0.8]].map(
        ([cx, cy, op], i) => (
          <circle key={i} cx={cx} cy={cy} r="0.8" fill="#e0f2fe" opacity={op} />
        )
      )}

      {/* Left cliff */}
      <path d="M 0 0 L 130 0 L 110 45 L 100 70 L 95 100 L 90 160 L 0 160 Z"
        fill="#03090f" />
      {/* Left cliff face detail */}
      <path d="M 95 160 L 100 100 L 108 70 L 118 50 L 130 0 L 140 0 L 125 48 L 115 75 L 108 105 L 103 160 Z"
        fill="#06141f" />

      {/* Right cliff */}
      <path d="M 400 0 L 270 0 L 290 45 L 300 70 L 305 100 L 310 160 L 400 160 Z"
        fill="#03090f" />
      {/* Right cliff face detail */}
      <path d="M 305 160 L 300 100 L 292 70 L 282 48 L 270 0 L 260 0 L 275 50 L 285 75 L 292 105 L 297 160 Z"
        fill="#06141f" />

      {/* Waterfall streams */}
      {[
        [170, 0, 176, 115], [185, 0, 190, 118], [198, 0, 200, 120],
        [210, 0, 212, 118], [223, 0, 228, 115],
      ].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="#bae6fd" strokeWidth={i === 2 ? 1.5 : 0.9}
          opacity={i === 2 ? 0.45 : 0.28}
          strokeDasharray={i % 2 === 0 ? 'none' : '8 4'} />
      ))}

      {/* Pool at base */}
      <ellipse cx="200" cy="140" rx="80" ry="22" fill="url(#gc-pool)" />
      {/* Pool ripples */}
      <ellipse cx="200" cy="138" rx="55" ry="12" fill="none" stroke="#38bdf8" strokeWidth="0.7" opacity="0.3" />
      <ellipse cx="200" cy="138" rx="35" ry="8" fill="none" stroke="#7dd3fc" strokeWidth="0.6" opacity="0.25" />
      {/* Spray reflection */}
      <ellipse cx="200" cy="128" rx="18" ry="6" fill="#bae6fd" opacity="0.12" />

      {/* Mist at base of fall */}
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

      {/* Horizon glow */}
      <ellipse cx="290" cy="75" rx="70" ry="35" fill="#f59e0b" opacity="0.08" />

      {/* Back hills */}
      <path d="M -10 160 Q 60 98 130 104 Q 200 110 270 100 Q 340 90 410 102 L 410 160 Z"
        fill="#2d1000" />

      {/* Mid hills with vineyard rows */}
      <path d="M -10 160 Q 50 118 120 122 Q 190 126 260 116 Q 330 106 410 120 L 410 160 Z"
        fill="#4a1a00" />
      {/* Vineyard row curves on mid hill */}
      {[124, 128, 132, 136, 140].map((y, i) => (
        <path key={i}
          d={`M 40 ${y + i} Q 130 ${y - 4 + i} 230 ${y + i} Q 320 ${y + 4 + i} 380 ${y + 1 + i}`}
          fill="none" stroke="#7c3000" strokeWidth="0.8" opacity={0.35 - i * 0.04} />
      ))}

      {/* Front hills with vineyard rows */}
      <path d="M -10 160 Q 70 138 150 140 Q 220 142 300 132 Q 360 124 410 138 L 410 160 Z"
        fill="#6b2800" />
      {/* Vineyard row curves on front hill */}
      {[143, 147, 151, 155].map((y, i) => (
        <path key={i}
          d={`M 20 ${y + i} Q 110 ${y - 3 + i} 210 ${y + i} Q 300 ${y + 3 + i} 395 ${y + 1 + i}`}
          fill="none" stroke="#a04010" strokeWidth="0.9" opacity={0.4 - i * 0.05} />
      ))}

      {/* Village lights (dots) on mid hill */}
      {[[155, 120], [170, 118], [185, 116], [320, 110], [335, 112]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="1.2" fill="#d4a574" opacity={0.7 + (i % 2) * 0.15} />
      ))}

      {/* A few stars near horizon */}
      {[[60, 88], [120, 80], [340, 78], [390, 90]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="0.8" fill="#d4a574" opacity={0.5 + (i % 2) * 0.2} />
      ))}
    </svg>
  )
}

/* ─── Card data ─── */

const cards = [
  {
    Art: ArtFuerte,
    icon: Mountain,
    title: 'El Fuerte de Samaipata',
    body: 'Patrimonio UNESCO. La roca tallada más grande del mundo, testigo de civilizaciones preincaicas y del poderío inca.',
    stat: 'A 6km del pueblo',
    category: 'Cultura',
    accent: '#d4a574',
  },
  {
    Art: ArtAmboro,
    icon: Trees,
    title: 'Selva Nublada de Amboró',
    body: 'Uno de los parques más biodiversos del planeta. Hogar del oso jucumari, el gallito de las rocas y cientos de orquídeas.',
    stat: '+800 especies de aves',
    category: 'Naturaleza',
    accent: '#34d399',
  },
  {
    Art: ArtCascadas,
    icon: Droplets,
    title: 'Cascadas y Senderos',
    body: 'Cuevas, pozas naturales y senderos entre helechos gigantes. Pajcha, Las Cuevas, El Jardín — cada uno, un mundo.',
    stat: 'Rutas de 2h a 2 días',
    category: 'Aventura',
    accent: '#38bdf8',
  },
  {
    Art: ArtCultura,
    icon: Wine,
    title: 'Cultura Viva',
    body: 'Viñedos de altura, mercados artesanales, gastronomía valluna y la energía de un pueblo que vive despacio.',
    stat: '1,650 msnm de magia',
    category: 'Gastronomía',
    accent: '#f59e0b',
  },
]

export default function StorytellingCards() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!sectionRef.current) return

    const cardEls = sectionRef.current.querySelectorAll('.story-card')
    const heading = sectionRef.current.querySelector('.story-heading')
    const label = sectionRef.current.querySelector('.story-label')

    gsap.set([label, heading, cardEls], { opacity: 0, y: 60 })

    gsap.to([label, heading], {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 75%',
        once: true,
      },
    })

    ScrollTrigger.batch(cardEls, {
      onEnter: (elements) =>
        gsap.to(elements, {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.13,
          ease: 'power3.out',
        }),
      start: 'top 80%',
      once: true,
    })
  }, { scope: sectionRef })

  return (
    <div ref={sectionRef} id="experiencias" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="section-label story-label mb-4">Por qué Samaipata</div>
          <h2
            className="story-heading font-display leading-tight"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: 'var(--text-primary)' }}
          >
            Cuatro mundos en un solo lugar
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((card, i) => {
            const Icon = card.icon
            const Art = card.Art
            return (
              <div
                key={i}
                className="story-card glass-card rounded-2xl overflow-hidden flex flex-col"
              >
                {/* SVG landscape art header */}
                <div className="relative w-full flex-shrink-0" style={{ height: 140 }}>
                  <Art />
                  {/* Gradient fade into card body */}
                  <div
                    className="absolute inset-x-0 bottom-0 h-10 pointer-events-none"
                    style={{
                      background: 'linear-gradient(to bottom, transparent, rgba(10,10,10,0.85))',
                    }}
                  />
                  {/* Category chip overlaid on art */}
                  <div className="absolute top-3 left-3">
                    <span
                      className="section-label text-xs px-2 py-1 rounded-lg"
                      style={{
                        background: 'rgba(0,0,0,0.45)',
                        backdropFilter: 'blur(8px)',
                        color: card.accent,
                        border: `1px solid ${card.accent}25`,
                      }}
                    >
                      {card.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: `${card.accent}15` }}
                    >
                      <Icon size={16} style={{ color: card.accent }} />
                    </div>
                    <h3
                      className="font-display leading-snug"
                      style={{ fontSize: '1rem', color: 'var(--text-primary)' }}
                    >
                      {card.title}
                    </h3>
                  </div>

                  <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--text-secondary)' }}>
                    {card.body}
                  </p>

                  <div
                    className="text-sm font-medium pt-3 border-t flex items-center gap-2"
                    style={{ borderColor: 'var(--glass-border)', color: card.accent }}
                  >
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: card.accent }}
                    />
                    {card.stat}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
