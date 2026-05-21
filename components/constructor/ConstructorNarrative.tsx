'use client'

import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'

// ─────────────────────────────────────────────────────────
// Step data
// ─────────────────────────────────────────────────────────
const STEPS = [
  {
    phase: '01',
    label: 'Tu experiencia',
    title: 'Tus días.\nTu aventura.',
    body: 'Samaipata no tiene un guión. Aquí diseñás exactamente la experiencia que querés — desde el Fuerte hasta el atardecer en el valle.',
    accent: '#34d399',
  },
  {
    phase: '02',
    label: 'Catálogo',
    title: 'Explorá\nactividades únicas.',
    body: 'Cultura, aventura, naturaleza y gastronomía. Cada opción diseñada con guías locales que conocen cada sendero y cada sabor.',
    accent: '#d4a574',
  },
  {
    phase: '03',
    label: 'Itinerario',
    title: 'Arrastrá.\nConstruí tu ruta.',
    body: 'Asignás actividades a mañanas y tardes. Costos y tiempos calculados en tiempo real — sin complicaciones.',
    accent: '#8b5cf6',
  },
  {
    phase: '04',
    label: 'Listo',
    title: 'Guardá,\ncalculá, partí.',
    body: 'El presupuesto se actualiza al instante. Descuentos por grupo incluidos. Compartí el link o imprimí tu itinerario antes de salir.',
    accent: '#f59e0b',
  },
]

// ─────────────────────────────────────────────────────────
// SVG node graph data
// ─────────────────────────────────────────────────────────
const SVG_CENTER = 260
const NODE_RADIUS = 165

const NODES = [
  { id: 'fuerte',      label: 'El Fuerte',   angleDeg: -90,  category: 'cultura'      },
  { id: 'amboro',      label: 'Amboró',      angleDeg: -30,  category: 'aventura'     },
  { id: 'cascadas',    label: 'Cascadas',    angleDeg:  30,  category: 'naturaleza'   },
  { id: 'bodega',      label: 'Bodega',      angleDeg:  90,  category: 'gastronomia'  },
  { id: 'mirador',     label: 'Mirador',     angleDeg:  150, category: 'aventura'     },
  { id: 'artesanias',  label: 'Artesanías',  angleDeg:  210, category: 'cultura'      },
]

const CAT_COLOR: Record<string, string> = {
  cultura:     '#d4a574',
  aventura:    '#34d399',
  naturaleza:  '#60a5fa',
  gastronomia: '#f59e0b',
}

function toRad(deg: number) { return (deg * Math.PI) / 180 }
function nodeXY(angleDeg: number, r: number) {
  return {
    x: SVG_CENTER + Math.cos(toRad(angleDeg)) * r,
    y: SVG_CENTER + Math.sin(toRad(angleDeg)) * r,
  }
}

function spokePath(angleDeg: number, r: number) {
  const { x, y } = nodeXY(angleDeg, r)
  const mx = SVG_CENTER + Math.cos(toRad(angleDeg)) * r * 0.42
  const my = SVG_CENTER + Math.sin(toRad(angleDeg)) * r * 0.42
  return `M ${SVG_CENTER} ${SVG_CENTER} Q ${mx} ${my} ${x} ${y}`
}

function routeArc(fromIdx: number, toIdx: number) {
  const from = nodeXY(NODES[fromIdx].angleDeg, NODE_RADIUS)
  const to = nodeXY(NODES[toIdx].angleDeg, NODE_RADIUS)
  const cx = (from.x + to.x) / 2
  const cy = (from.y + to.y) / 2
  const cpx = cx + (SVG_CENTER - cx) * 0.25
  const cpy = cy + (SVG_CENTER - cy) * 0.25
  return `M ${from.x} ${from.y} Q ${cpx} ${cpy} ${to.x} ${to.y}`
}

// ─────────────────────────────────────────────────────────
// Phase card data & component
// ─────────────────────────────────────────────────────────
interface PhaseCard {
  name: string
  category: string
  price: number
  duration: string
  accent: string
  emoji: string
  badge?: string
}

const PHASE_CARDS: PhaseCard[][] = [
  [
    { name: 'El Fuerte Samaipata', category: 'cultura', price: 120, duration: '4 hrs', accent: '#d4a574', emoji: '🏛' },
    { name: 'Cañón Los Helechos',  category: 'naturaleza', price: 80, duration: '3 hrs', accent: '#60a5fa', emoji: '🌿' },
  ],
  [
    { name: 'Trek Amboró',         category: 'aventura',    price: 180, duration: '6 hrs', accent: '#34d399', emoji: '⛰' },
    { name: 'Bodega El Valle',     category: 'gastronomia', price: 90,  duration: '2 hrs', accent: '#f59e0b', emoji: '🍷' },
  ],
  [
    { name: 'Cascadas Cuevas',     category: 'naturaleza',  price: 110, duration: '5 hrs', accent: '#60a5fa', emoji: '💧', badge: '← Arrastrá' },
    { name: 'Mirador El Arenal',   category: 'aventura',    price: 75,  duration: '2 hrs', accent: '#34d399', emoji: '🗻' },
  ],
  [
    { name: 'El Fuerte Samaipata', category: 'cultura',     price: 120, duration: '4 hrs', accent: '#d4a574', emoji: '🏛', badge: '✓ Guardado' },
    { name: 'Trek Amboró',         category: 'aventura',    price: 180, duration: '6 hrs', accent: '#34d399', emoji: '⛰', badge: '✓ Guardado' },
  ],
]

function CardMockup({ card, tilt = 0 }: { card: PhaseCard; tilt?: number }) {
  return (
    <div
      style={{
        background: 'rgba(8, 8, 8, 0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: `1px solid ${card.accent}35`,
        borderRadius: 18,
        padding: '16px 18px',
        boxShadow: [
          '0 8px 40px rgba(0,0,0,0.55)',
          `0 0 0 1px ${card.accent}10`,
          'inset 0 1px 0 rgba(255,255,255,0.06)',
          `0 0 60px ${card.accent}08`,
        ].join(', '),
        transform: `rotate(${tilt}deg)`,
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div
          style={{
            width: 40, height: 40,
            borderRadius: 12,
            background: `${card.accent}14`,
            border: `1px solid ${card.accent}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 19,
            flexShrink: 0,
          }}
        >
          {card.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              display: 'block',
              fontSize: 8.5,
              fontFamily: 'ui-monospace, monospace',
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              color: card.accent,
              fontWeight: 600,
              marginBottom: 2,
            }}
          >
            {card.category}
          </span>
          <h4
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.92)',
              lineHeight: 1.35,
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontFamily: 'var(--font-display)',
            }}
          >
            {card.name}
          </h4>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span
          style={{
            fontSize: 10,
            color: 'rgba(255,255,255,0.32)',
            fontFamily: 'ui-monospace, monospace',
          }}
        >
          ⏱ {card.duration}
        </span>
        <span
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: card.accent,
            letterSpacing: '-0.02em',
          }}
        >
          {card.price}
          <span style={{ fontSize: 9, fontWeight: 500, opacity: 0.65, marginLeft: 3 }}>BOB</span>
        </span>
      </div>

      {/* Glow separator */}
      <div
        style={{
          height: 1,
          background: `linear-gradient(90deg, transparent, ${card.accent}50, transparent)`,
          marginBottom: card.badge ? 10 : 0,
        }}
      />

      {/* Optional badge */}
      {card.badge && (
        <div
          style={{
            marginTop: 8,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            background: `${card.accent}15`,
            border: `1px solid ${card.accent}30`,
            borderRadius: 99,
            padding: '3px 9px',
            fontSize: 9,
            fontFamily: 'ui-monospace, monospace',
            color: card.accent,
            fontWeight: 600,
            letterSpacing: '0.06em',
          }}
        >
          {card.badge}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
export default function ConstructorNarrative() {
  const wrapRef  = useRef<HTMLDivElement>(null)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])
  const svgRef   = useRef<SVGSVGElement>(null)

  const spokeRefs  = useRef<(SVGPathElement | null)[]>([])
  const arcRefs    = useRef<(SVGPathElement | null)[]>([])
  const nodeRefs   = useRef<(SVGGElement | null)[]>([])
  const centerRef  = useRef<SVGGElement | null>(null)
  const dotRefs    = useRef<(HTMLDivElement | null)[]>([])
  const scrollHintRef = useRef<HTMLDivElement | null>(null)

  // Phase card group refs (4 groups)
  const cardGroupRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null])
  // Inner card float refs (4 groups × 2 cards)
  const cardFloatRefs = useRef<(HTMLDivElement | null)[][]>([[], [], [], []])

  useGSAP(
    () => {
      if (!wrapRef.current) return

      // ── Initial hidden state ──
      gsap.set(stepRefs.current.slice(1), { opacity: 0, y: 28 })
      gsap.set(stepRefs.current[0],        { opacity: 1, y: 0  })
      gsap.set(nodeRefs.current,  { opacity: 0, scale: 0, transformOrigin: 'center' })
      gsap.set(spokeRefs.current, { opacity: 0 })
      gsap.set(arcRefs.current,   { opacity: 0, strokeDashoffset: 80 })
      gsap.set(centerRef.current, { opacity: 0, scale: 0.7, transformOrigin: `${SVG_CENTER}px ${SVG_CENTER}px` })
      gsap.set(dotRefs.current,   { scale: 1, backgroundColor: 'rgba(255,255,255,0.15)' })

      // ── Initial card state: hide all groups, start with x offset ──
      const allGroups = cardGroupRefs.current.filter(Boolean) as HTMLDivElement[]
      gsap.set(allGroups, { opacity: 0, x: 55 })

      // Float animation for card inner elements (independent of scroll)
      cardFloatRefs.current.forEach((group, gi) => {
        group.forEach((el, ci) => {
          if (!el) return
          gsap.to(el, {
            y: ci === 0 ? -11 : -7,
            duration: ci === 0 ? 2.6 + gi * 0.15 : 3.1 + gi * 0.12,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: ci * 0.9 + gi * 0.3,
          })
        })
      })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.9,
        },
      })

      // ── Card group 0 enters early ──
      tl.to(cardGroupRefs.current[0], { opacity: 1, x: 0, duration: 0.35, ease: 'power3.out' }, 0.08)

      // ── Step 0 zone: t=0 → t=1 ──
      tl.to(centerRef.current,
        { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(1.6)' },
        0,
      )
      tl.to([nodeRefs.current[0], nodeRefs.current[1], nodeRefs.current[2]],
        { opacity: 1, scale: 1, duration: 0.4, stagger: 0.07, ease: 'back.out(1.8)' },
        0.2,
      )
      tl.to([spokeRefs.current[0], spokeRefs.current[1], spokeRefs.current[2]],
        { opacity: 1, duration: 0.35, stagger: 0.07 },
        0.35,
      )
      activateDot(tl, 0, STEPS[0].accent, 0)

      // Step 0→1 text + cards
      textOut(tl, 0, 0.72)
      tl.to(cardGroupRefs.current[0], { opacity: 0, x: -48, duration: 0.22, ease: 'power2.in' }, 0.72)
      textIn(tl,  1, 0.84)
      tl.to(cardGroupRefs.current[1], { opacity: 1, x: 0, duration: 0.32, ease: 'power3.out' }, 0.84)

      // ── Step 1: last 3 nodes + arcs ──
      tl.to([nodeRefs.current[3], nodeRefs.current[4], nodeRefs.current[5]],
        { opacity: 1, scale: 1, duration: 0.4, stagger: 0.07, ease: 'back.out(1.8)' },
        1.1,
      )
      tl.to([spokeRefs.current[3], spokeRefs.current[4], spokeRefs.current[5]],
        { opacity: 1, duration: 0.35, stagger: 0.07 },
        1.25,
      )
      tl.to([arcRefs.current[0], arcRefs.current[1], arcRefs.current[2]],
        { opacity: 1, strokeDashoffset: 0, duration: 0.35, stagger: 0.06 },
        1.35,
      )
      deactivateDot(tl, 0, 1)
      activateDot(tl,   1, STEPS[1].accent, 1)

      // Step 1→2 text + cards
      textOut(tl, 1, 1.72)
      tl.to(cardGroupRefs.current[1], { opacity: 0, x: -48, duration: 0.22, ease: 'power2.in' }, 1.72)
      textIn(tl,  2, 1.84)
      tl.to(cardGroupRefs.current[2], { opacity: 1, x: 0, duration: 0.32, ease: 'power3.out' }, 1.84)

      // ── Step 2: remaining arcs + node pulse ──
      tl.to([arcRefs.current[3], arcRefs.current[4], arcRefs.current[5]],
        { opacity: 1, strokeDashoffset: 0, duration: 0.35, stagger: 0.06 },
        2.05,
      )
      tl.to(nodeRefs.current,
        { scale: 1.12, duration: 0.25, stagger: 0.03, ease: 'sine.inOut' },
        2.3,
      )
      tl.to(nodeRefs.current,
        { scale: 1, duration: 0.22, stagger: 0.03, ease: 'sine.inOut' },
        2.58,
      )
      deactivateDot(tl, 1, 2)
      activateDot(tl,   2, STEPS[2].accent, 2)

      // Step 2→3 text + cards
      textOut(tl, 2, 2.72)
      tl.to(cardGroupRefs.current[2], { opacity: 0, x: -48, duration: 0.22, ease: 'power2.in' }, 2.72)
      textIn(tl,  3, 2.84)
      tl.to(cardGroupRefs.current[3], { opacity: 1, x: 0, duration: 0.32, ease: 'power3.out' }, 2.84)

      // ── Step 3: spokes glow + center pulse ──
      tl.to(spokeRefs.current,
        { strokeOpacity: 0.7, duration: 0.5 },
        3.05,
      )
      tl.to(centerRef.current,
        { scale: 1.08, duration: 0.3, ease: 'sine.inOut' },
        3.1,
      )
      tl.to(centerRef.current,
        { scale: 1, duration: 0.3, ease: 'sine.inOut' },
        3.45,
      )
      deactivateDot(tl, 2, 3)
      activateDot(tl,   3, STEPS[3].accent, 3)

      // Scroll hint fades out early
      if (scrollHintRef.current) {
        tl.to(scrollHintRef.current, { opacity: 0, duration: 0.3 }, 0.4)
      }
    },
    { scope: wrapRef, dependencies: [] },
  )

  // ── GSAP helper sub-functions ──
  function textOut(tl: gsap.core.Timeline, idx: number, at: number) {
    tl.to(stepRefs.current[idx], { opacity: 0, y: -22, duration: 0.22, ease: 'power2.in' }, at)
  }
  function textIn(tl: gsap.core.Timeline, idx: number, at: number) {
    tl.to(stepRefs.current[idx], { opacity: 1, y: 0, duration: 0.32, ease: 'power3.out' }, at)
  }
  function activateDot(tl: gsap.core.Timeline, idx: number, color: string, at: number) {
    tl.to(dotRefs.current[idx], { scale: 1.9, backgroundColor: color, duration: 0.25 }, at)
  }
  function deactivateDot(tl: gsap.core.Timeline, idx: number, at: number) {
    tl.to(dotRefs.current[idx], { scale: 1, backgroundColor: 'rgba(255,255,255,0.12)', duration: 0.18 }, at)
  }

  return (
    <div ref={wrapRef} className="relative cn-scroll-track">
      {/* ── Sticky pinned container ── */}
      <div
        className="sticky top-0 h-screen w-full overflow-hidden"
        style={{ background: 'var(--bg-primary)' }}
      >

        {/* Grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(52,211,153,0.022) 1px, transparent 1px),
              linear-gradient(90deg, rgba(52,211,153,0.022) 1px, transparent 1px)
            `,
            backgroundSize: '72px 72px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 40%, transparent 100%)',
          }}
        />

        {/* Ambient glow — emerald top-left */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '-10%', left: '-6%',
            width: 560, height: 560,
            background: 'radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 65%)',
          }}
        />
        {/* Ambient glow — gold bottom-right */}
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: '-12%', right: '-4%',
            width: 480, height: 480,
            background: 'radial-gradient(circle, rgba(212,165,116,0.05) 0%, transparent 65%)',
          }}
        />

        {/* ── Inner layout ── */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">

          {/* ── Text column (left) ── */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[36%] pl-10 md:pl-16 lg:pl-24"
            style={{ maxWidth: 500 }}
          >
            <div className="relative" style={{ minHeight: 260 }}>
              {STEPS.map((step, i) => (
                <div
                  key={step.phase}
                  ref={el => { stepRefs.current[i] = el }}
                  className="absolute inset-0 flex flex-col justify-center"
                  style={{ willChange: 'opacity, transform' }}
                >
                  {/* Phase tag */}
                  <div className="flex items-center gap-3 mb-5">
                    <span
                      className="font-mono text-xs font-semibold tracking-[0.32em]"
                      style={{ color: step.accent }}
                    >
                      {step.phase}
                    </span>
                    <div
                      className="h-px"
                      style={{ width: 40, background: `${step.accent}55` }}
                    />
                    <span
                      className="text-[9px] font-mono uppercase tracking-[0.24em]"
                      style={{ color: `${step.accent}70` }}
                    >
                      {step.label}
                    </span>
                  </div>

                  {/* Title */}
                  <h2
                    className="font-display leading-[1.08] mb-4"
                    style={{
                      fontSize: 'clamp(1.9rem, 3.2vw, 2.9rem)',
                      color: 'var(--text-primary)',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {step.title}
                  </h2>

                  {/* Body */}
                  <p
                    className="text-sm leading-relaxed"
                    style={{
                      color: 'var(--text-secondary)',
                      maxWidth: 360,
                      letterSpacing: '0.01em',
                    }}
                  >
                    {step.body}
                  </p>

                  {/* Accent underline */}
                  <div
                    className="mt-6 rounded-full"
                    style={{
                      width: 44,
                      height: 2,
                      background: step.accent,
                      boxShadow: `0 0 14px ${step.accent}BB`,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── Central SVG Node Graph (shifted slightly left) ── */}
          <div
            className="absolute top-1/2 pointer-events-none"
            style={{
              left: '46%',
              width: 'min(46vw, 480px)',
              height: 'min(46vw, 480px)',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <svg
              ref={svgRef}
              viewBox="0 0 520 520"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: '100%', height: '100%', overflow: 'visible' }}
              aria-hidden="true"
            >
              {/* Orbit decorative ring */}
              <circle
                cx={SVG_CENTER} cy={SVG_CENTER} r={NODE_RADIUS}
                stroke="rgba(255,255,255,0.03)"
                strokeWidth={1}
                fill="none"
                strokeDasharray="3 9"
              />
              <circle
                cx={SVG_CENTER} cy={SVG_CENTER} r={NODE_RADIUS + 22}
                stroke="rgba(255,255,255,0.015)"
                strokeWidth={1}
                fill="none"
                strokeDasharray="1 12"
              />

              {/* Spoke paths: center → each node */}
              {NODES.map((node, i) => (
                <path
                  key={`spoke-${node.id}`}
                  ref={el => { spokeRefs.current[i] = el }}
                  d={spokePath(node.angleDeg, NODE_RADIUS)}
                  stroke={CAT_COLOR[node.category]}
                  strokeWidth={1}
                  strokeOpacity={0.35}
                  strokeDasharray="5 4"
                />
              ))}

              {/* Arc paths: connecting adjacent nodes */}
              {NODES.map((_, i) => (
                <path
                  key={`arc-${i}`}
                  ref={el => { arcRefs.current[i] = el }}
                  d={routeArc(i, (i + 1) % NODES.length)}
                  stroke={CAT_COLOR[NODES[i].category]}
                  strokeWidth={1.2}
                  strokeOpacity={0.45}
                  strokeDasharray="80"
                  strokeDashoffset={80}
                  fill="none"
                />
              ))}

              {/* Center node */}
              <g
                ref={centerRef}
                style={{ transformOrigin: `${SVG_CENTER}px ${SVG_CENTER}px` }}
              >
                <circle
                  cx={SVG_CENTER} cy={SVG_CENTER} r={38}
                  stroke="rgba(52,211,153,0.12)"
                  strokeWidth={1}
                  fill="none"
                  strokeDasharray="6 5"
                />
                <circle
                  cx={SVG_CENTER} cy={SVG_CENTER} r={26}
                  stroke="rgba(52,211,153,0.3)"
                  strokeWidth={1.5}
                  fill="rgba(52,211,153,0.05)"
                />
                <circle
                  cx={SVG_CENTER} cy={SVG_CENTER} r={14}
                  fill="rgba(52,211,153,0.1)"
                  stroke="rgba(52,211,153,0.55)"
                  strokeWidth={1.5}
                />
                <line
                  x1={SVG_CENTER} y1={SVG_CENTER - 9}
                  x2={SVG_CENTER} y2={SVG_CENTER + 9}
                  stroke="rgba(52,211,153,0.75)" strokeWidth={1}
                />
                <line
                  x1={SVG_CENTER - 9} y1={SVG_CENTER}
                  x2={SVG_CENTER + 9} y2={SVG_CENTER}
                  stroke="rgba(52,211,153,0.75)" strokeWidth={1}
                />
                <circle cx={SVG_CENTER} cy={SVG_CENTER} r={2.5} fill="#34d399" />
              </g>

              {/* Activity nodes */}
              {NODES.map((node, i) => {
                const { x, y } = nodeXY(node.angleDeg, NODE_RADIUS)
                const color = CAT_COLOR[node.category]

                return (
                  <g
                    key={node.id}
                    ref={el => { nodeRefs.current[i] = el }}
                    style={{ transformOrigin: `${x}px ${y}px` }}
                  >
                    <circle
                      cx={x} cy={y} r={21}
                      fill="none"
                      stroke={color}
                      strokeWidth={1}
                      strokeOpacity={0.18}
                    />
                    <circle
                      cx={x} cy={y} r={13}
                      fill={`${color}12`}
                      stroke={color}
                      strokeWidth={1.5}
                      strokeOpacity={0.65}
                    />
                    <circle cx={x} cy={y} r={4} fill={color} opacity={0.85} />
                    <text
                      x={x}
                      y={y + 31}
                      textAnchor="middle"
                      fontSize={8.5}
                      fill="rgba(255,255,255,0.38)"
                      fontFamily="ui-monospace, monospace"
                      letterSpacing="0.12em"
                    >
                      {node.label.toUpperCase()}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>

          {/* ── RIGHT PANEL: Phase floating cards ── */}
          <div
            className="absolute top-1/2 -translate-y-1/2 hidden lg:block"
            style={{
              right: '5%',
              width: 'min(27vw, 275px)',
            }}
          >
            {/* Ambient glow behind cards */}
            <div
              className="absolute pointer-events-none"
              style={{
                inset: '-40px -30px',
                background: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(52,211,153,0.04) 0%, transparent 70%)',
              }}
            />

            {/* 4 card groups, stacked at same position, GSAP controls visibility */}
            {PHASE_CARDS.map((group, groupIdx) => (
              <div
                key={groupIdx}
                ref={el => { cardGroupRefs.current[groupIdx] = el }}
                className="absolute inset-0 flex flex-col gap-4"
                style={{ willChange: 'opacity, transform' }}
              >
                {group.map((card, cardIdx) => (
                  /* Rotation wrapper (static) */
                  <div
                    key={cardIdx}
                    style={{
                      transform: `rotate(${cardIdx === 0 ? -1.5 : 1.8}deg)`,
                      marginTop: cardIdx === 1 ? 6 : 0,
                    }}
                  >
                    {/* Float wrapper (GSAP y-tween target) */}
                    <div
                      ref={el => {
                        if (!cardFloatRefs.current[groupIdx]) cardFloatRefs.current[groupIdx] = []
                        cardFloatRefs.current[groupIdx][cardIdx] = el
                      }}
                      style={{ willChange: 'transform' }}
                    >
                      <CardMockup card={card} />
                    </div>
                  </div>
                ))}

                {/* Connector line between cards */}
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: 24,
                    top: 82,
                    width: 1,
                    height: 36,
                    background: `linear-gradient(to bottom, ${group[0].accent}40, ${group[1]?.accent ?? group[0].accent}20)`,
                  }}
                />
              </div>
            ))}

            {/* Phase label tag */}
            {STEPS.map((step, i) => (
              <div
                key={step.phase}
                className="absolute"
                style={{
                  bottom: -32,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  pointerEvents: 'none',
                }}
              >
                {/* Phase tag shows for each group — hidden by default, GSAP could target these too */}
              </div>
            ))}
          </div>

          {/* ── Progress dots (right edge) ── */}
          <div
            className="absolute right-5 md:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 items-center"
          >
            {STEPS.map((step, i) => (
              <div key={step.phase} className="relative flex items-center gap-2">
                <div
                  ref={el => { dotRefs.current[i] = el }}
                  className="rounded-full"
                  style={{
                    width: 7,
                    height: 7,
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    willChange: 'transform, background-color',
                  }}
                />
              </div>
            ))}
            {/* Vertical connector line */}
            <div
              className="absolute top-3 bottom-3 w-px pointer-events-none"
              style={{
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.08), transparent)',
                zIndex: -1,
              }}
            />
          </div>

          {/* ── Scroll hint ── */}
          <div
            ref={scrollHintRef}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            style={{ willChange: 'opacity' }}
          >
            <span
              className="font-mono text-[9px] uppercase tracking-[0.35em]"
              style={{ color: 'rgba(255,255,255,0.2)' }}
            >
              Scroll
            </span>
            <div className="cn-scroll-chevron" />
          </div>

        </div>
      </div>
    </div>
  )
}
