'use client'

import { useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { gsap, useGSAP } from '@/lib/gsap'
import ActivityCatalog from './ActivityCatalog'
import Timeline from './Timeline'
import BudgetPanel from './BudgetPanel'
import PackingChecklist from './PackingChecklist'
import ConstructorBackground from './ConstructorBackground'
import { useTripStore, type Activity } from '@/store/tripStore'
import {
  Landmark, Trees, Droplets, Wine, Star, Compass, Mountain, ShoppingBag,
} from 'lucide-react'

const iconMap: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  Landmark, Trees, Droplets, Wine, Star, Compass, Mountain, ShoppingBag,
}

function DragPreview({ activity }: { activity: Activity }) {
  const Icon = iconMap[activity.icon] ?? Mountain
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl pointer-events-none select-none"
      style={{
        minWidth: 210,
        background: 'rgba(5, 46, 22, 0.96)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(52, 211, 153, 0.5)',
        boxShadow: '0 0 30px rgba(52,211,153,0.22), 0 12px 40px rgba(0,0,0,0.6)',
      }}
    >
      <Icon size={15} style={{ color: 'var(--accent-emerald)' }} />
      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
        {activity.name}
      </span>
    </div>
  )
}

const STEPS = [
  { n: '01', label: 'Explorá', sub: 'Elegí actividades' },
  { n: '02', label: 'Construí', sub: 'Armá tu itinerario' },
  { n: '03', label: 'Calculá', sub: 'Presupuesto en vivo' },
]

export default function WorkspaceLayout() {
  const sectionRef = useRef<HTMLElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const beamRef = useRef<HTMLDivElement>(null)
  const addActivity = useTripStore((s) => s.addActivity)
  const [activeActivity, setActiveActivity] = useState<Activity | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  useGSAP(
    () => {
      if (!sectionRef.current) return

      // ── Transition curtain: wipes up on scroll, revealing the section ──
      if (overlayRef.current) {
        gsap.to(overlayRef.current, {
          scaleY: 0,
          transformOrigin: 'top center',
          ease: 'power4.inOut',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 90%',
            end: 'top 5%',
            scrub: 1.4,
          },
        })
      }

      // ── Beam scan on entry ──
      if (beamRef.current) {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: sectionRef.current, start: 'top 60%', once: true },
        })
        tl.fromTo(beamRef.current, { opacity: 0 }, { opacity: 1, duration: 0.15 })
          .to(beamRef.current, {
            x: () => window.innerWidth + 280,
            duration: 1.5,
            ease: 'sine.inOut',
          }, '<')
          .to(beamRef.current, { opacity: 0, duration: 0.2 }, '-=0.25')
      }

      // ── Steps entrance ──
      gsap.from('.c-step', {
        opacity: 0,
        y: 14,
        duration: 0.65,
        stagger: 0.09,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 72%',
          once: true,
        },
      })

      // ── Heading elements ──
      gsap.from('.c-heading-el', {
        opacity: 0,
        y: 26,
        duration: 0.9,
        stagger: 0.13,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 78%',
          once: true,
        },
      })

      // ── Panel directional entrances ──
      const catalog = sectionRef.current.querySelector('.p-catalog')
      const timeline = sectionRef.current.querySelector('.p-timeline')
      const sidebar = sectionRef.current.querySelector('.p-sidebar')

      if (catalog) {
        gsap.from(catalog, {
          opacity: 0, x: -50, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 62%', once: true },
        })
      }
      if (timeline) {
        gsap.from(timeline, {
          opacity: 0, y: 50, duration: 1, delay: 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 62%', once: true },
        })
      }
      if (sidebar) {
        gsap.from(sidebar, {
          opacity: 0, x: 50, duration: 1, delay: 0.16, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 62%', once: true },
        })
      }
    },
    { scope: sectionRef },
  )

  const handleDragStart = (event: DragStartEvent) => {
    const activity = event.active.data.current?.activity as Activity | undefined
    setActiveActivity(activity ?? null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveActivity(null)
    const { over, active } = event
    if (!over) return
    const match = (over.id as string).match(/^day-(\d+)-(morning|afternoon)$/)
    if (!match) return
    const activity = active.data.current?.activity as Activity | undefined
    if (activity) addActivity(parseInt(match[1]), match[2] as 'morning' | 'afternoon', activity)
  }

  return (
    <section
      ref={sectionRef}
      id="constructor"
      className="relative overflow-hidden"
      style={{ background: 'var(--bg-primary)', paddingBlock: '5rem 7rem' }}
    >
      {/* Three.js ambient background */}
      <ConstructorBackground />

      {/* Transition curtain — green-to-dark panel that wipes upward on scroll */}
      <div
        ref={overlayRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(160deg, #052e16 0%, #081508 45%, #0a0a0a 100%)',
          zIndex: 15,
          willChange: 'transform',
        }}
      />

      {/* Beam scan */}
      <div
        ref={beamRef}
        className="absolute top-0 bottom-0 pointer-events-none"
        style={{
          width: 240,
          background: 'linear-gradient(90deg, transparent 0%, rgba(52,211,153,0.07) 50%, transparent 100%)',
          zIndex: 16,
          left: -240,
        }}
      />

      {/* Ambient glows */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-8%', right: '-4%',
          width: 680, height: 680,
          background: 'radial-gradient(circle, rgba(52,211,153,0.055) 0%, transparent 65%)',
          zIndex: 1,
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '-10%', left: '-4%',
          width: 580, height: 580,
          background: 'radial-gradient(circle, rgba(212,165,116,0.045) 0%, transparent 65%)',
          zIndex: 1,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6" style={{ zIndex: 5 }}>
        {/* Step flow indicators */}
        <div className="flex items-center justify-center gap-3 md:gap-6 mb-14">
          {STEPS.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="c-step text-center">
                <p
                  className="font-mono text-[10px] font-bold mb-1"
                  style={{ color: 'var(--accent-emerald)', opacity: 0.65 }}
                >
                  {step.n}
                </p>
                <p
                  className="text-xs font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {step.label}
                </p>
                <p
                  className="text-[10px] hidden sm:block mt-0.5"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {step.sub}
                </p>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="hidden md:flex items-center gap-1 flex-shrink-0 mx-1"
                  style={{ color: 'var(--glass-border)' }}
                >
                  <div className="h-px w-8" style={{ background: 'var(--glass-border)' }} />
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>›</span>
                  <div className="h-px w-8" style={{ background: 'var(--glass-border)' }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Section heading */}
        <div className="text-center mb-14">
          <p
            className="c-heading-el text-xs font-mono uppercase tracking-[0.3em] mb-4"
            style={{ color: 'var(--accent-emerald)' }}
          >
            Constructor de Viajes
          </p>
          <h2
            className="c-heading-el font-display"
            style={{
              fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)',
              color: 'var(--text-primary)',
              lineHeight: 1.1,
            }}
          >
            Diseñá tu aventura{' '}
            <span style={{ color: 'var(--accent-gold)' }}>perfecta</span>
          </h2>
          <p
            className="c-heading-el mt-4 max-w-md mx-auto text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            Arrastrá actividades al calendario · el presupuesto se actualiza al instante
          </p>
        </div>

        {/* Workspace */}
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr_1fr] gap-5 items-start">
            {/* Catalog */}
            <div className="p-catalog glass-card rounded-2xl p-5" style={{ minHeight: 540 }}>
              <ActivityCatalog />
            </div>

            {/* Timeline — center, elevated visual treatment */}
            <div
              className="p-timeline rounded-2xl p-6"
              style={{
                minHeight: 540,
                background: 'rgba(255,255,255,0.035)',
                backdropFilter: 'blur(18px) saturate(1.5)',
                WebkitBackdropFilter: 'blur(18px) saturate(1.5)',
                border: '1px solid rgba(52, 211, 153, 0.18)',
                boxShadow:
                  '0 0 60px rgba(52,211,153,0.05), 0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(52,211,153,0.08)',
              }}
            >
              <Timeline />
            </div>

            {/* Budget + Packing */}
            <div className="p-sidebar lg:sticky lg:top-24 flex flex-col gap-4">
              <div className="glass-card rounded-2xl p-5">
                <BudgetPanel />
              </div>
              <PackingChecklist />
            </div>
          </div>

          <DragOverlay>
            {activeActivity && <DragPreview activity={activeActivity} />}
          </DragOverlay>
        </DndContext>
      </div>
    </section>
  )
}
