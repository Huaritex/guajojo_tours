'use client'

import { useRef, useState, Fragment } from 'react'
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
import ConstructorNarrative from './ConstructorNarrative'
import TextRotator from '../ui/TextRotator'
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

const ROLES = [
  "Perfecta",
  "Única",
  "Inolvidable",
  "Épica",
  "Auténtica",
  "Mágica",
  "Legendaria",
  "Extrema",
  "Insuperable",
  "Sin Límites"
]

const STEPS = [
  { label: 'Explorá', hint: 'el catálogo' },
  { label: 'Arrastrá', hint: 'al itinerario' },
  { label: 'Guardá', hint: 'y compartí' },
]

export default function WorkspaceLayout() {
  const sectionRef = useRef<HTMLElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const beamRef = useRef<HTMLDivElement>(null)
  const addActivity = useTripStore((s) => s.addActivity)
  const days = useTripStore((s) => s.days)
  const numberOfPeople = useTripStore((s) => s.numberOfPeople)
  const getTotalPrice = useTripStore((s) => s.getTotalPrice)
  const [activeActivity, setActiveActivity] = useState<Activity | null>(null)

  const pricing = getTotalPrice()
  const filledSlots = days.reduce((acc, d) => acc + (d.morning ? 1 : 0) + (d.afternoon ? 1 : 0), 0)
  const TOTAL_SLOTS = days.length * 2

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  useGSAP(
    () => {
      if (!sectionRef.current) return

      // ── Transition curtain: wipes up on scroll ──
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

      // ── Heading elements stagger ──
      gsap.from('.c-heading-el', {
        opacity: 0,
        y: 26,
        duration: 0.9,
        stagger: 0.11,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 78%',
          once: true,
        },
      })

      // ── Panel directional entrances — unified stagger with scale ──
      const catalog = sectionRef.current.querySelector('.p-catalog')
      const timeline = sectionRef.current.querySelector('.p-timeline')
      const sidebar = sectionRef.current.querySelector('.p-sidebar')

      const panelsArr = [catalog, timeline, sidebar].filter(Boolean) as Element[]
      if (panelsArr.length > 0) {
        gsap.fromTo(
          panelsArr,
          { opacity: 0, y: 36, scale: 0.975 },
          {
            opacity: 1, y: 0, scale: 1,
            duration: 0.88,
            stagger: 0.1,
            ease: 'expo.out',
            clearProps: 'transform',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 62%', once: true },
          }
        )
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
      className="relative"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Scroll-driven storytelling intro */}
      <ConstructorNarrative />

      {/* Three.js ambient background — wraps only the workspace grid below */}
      <div className="relative overflow-hidden" style={{ paddingBlock: '5rem 7rem' }}>
      <ConstructorBackground />

      {/* Transition curtain */}
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

      <div className="relative w-full" style={{ zIndex: 5 }}>
        {/* Section heading */}
        <div className="w-full flex flex-col items-center justify-center text-center px-4 mt-10 mb-16">

          {/* Section label */}
          <p
            className="c-heading-el text-xs font-mono uppercase tracking-[0.3em] mb-5"
            style={{ color: 'var(--accent-emerald)' }}
          >
            Constructor de Viaje
          </p>

          {/* Main title */}
          <h2
            className="c-heading-el font-display w-full flex flex-row flex-wrap items-center justify-center content-center text-center gap-x-3 mx-auto"
            style={{
              fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)',
              color: 'var(--text-primary)',
              lineHeight: 1.1,
            }}
          >
            <span>Diseñá tu aventura</span>
            <TextRotator words={ROLES} />
          </h2>

          {/* Step guide */}
          <div className="c-heading-el mt-7 flex items-center justify-center gap-2 flex-wrap">
            {STEPS.map(({ label, hint }, i) => (
              <Fragment key={label}>
                <div
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <span
                    className="font-mono text-[10px] font-semibold tabular-nums"
                    style={{ color: 'var(--accent-emerald)' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {label}
                  </span>
                  <span className="text-[10px] hidden sm:inline" style={{ color: 'rgba(255,255,255,0.22)' }}>
                    {hint}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.12)' }}>→</span>
                )}
              </Fragment>
            ))}
          </div>

          {/* Progress badge */}
          <div className="c-heading-el mt-5">
            <span
              className="inline-flex items-center gap-2 text-xs font-mono tabular-nums px-4 py-1.5 rounded-full"
              style={{
                background: filledSlots > 0 ? 'rgba(52,211,153,0.07)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${filledSlots > 0 ? 'rgba(52,211,153,0.18)' : 'rgba(255,255,255,0.06)'}`,
                color: filledSlots > 0 ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.22)',
                transition: 'color 0.35s ease, border-color 0.35s ease, background 0.35s ease',
              }}
            >
              {filledSlots > 0 && (
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: 'var(--accent-emerald)' }}
                />
              )}
              {filledSlots === 0
                ? 'Comenzá a armar tu viaje'
                : `${filledSlots} / ${TOTAL_SLOTS} actividades en tu itinerario`}
            </span>
          </div>
        </div>

        {/* Workspace */}
        <div className="w-full px-12 md:px-16 lg:px-20 mx-auto">
          <DndContext id="constructor-dnd" sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-12 gap-6 w-full items-start">

              {/* Catalog */}
              <div
                className="p-catalog rounded-2xl p-5 w-full col-span-12 lg:col-span-3 max-w-md md:max-w-xl lg:max-w-none mx-auto lg:mx-0"
                style={{
                  minHeight: 540,
                  background: 'rgba(255,255,255,0.024)',
                  backdropFilter: 'blur(14px) saturate(1.4)',
                  WebkitBackdropFilter: 'blur(14px) saturate(1.4)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  boxShadow: '0 4px 28px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
              >
                <ActivityCatalog />
              </div>

              {/* Timeline — center, elevated visual treatment */}
              <div
                className="p-timeline rounded-2xl p-6 w-full col-span-12 lg:col-span-6 max-w-md md:max-w-xl lg:max-w-none mx-auto lg:mx-0"
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
              <div className="p-sidebar lg:sticky lg:top-24 flex flex-col gap-4 w-full col-span-12 lg:col-span-3 max-w-md md:max-w-xl lg:max-w-none mx-auto lg:mx-0">
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
      </div>
      </div>{/* /relative overflow-hidden workspace wrapper */}

      {/* Print Report Template */}
      <div id="print-report" className="w-full max-w-4xl mx-auto p-12 bg-white text-[#1a1a1a] font-sans">
        {/* Cabecera */}
        <div className="border-b-2 border-emerald-850 pb-6 mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-emerald-950 font-display">
              Guajojó Tours
            </h1>
            <p className="text-sm font-semibold text-emerald-800 uppercase tracking-widest mt-1">
              Tu Itinerario de Viaje
            </p>
          </div>
          <div className="text-right text-xs text-gray-500 space-y-1">
            <p><strong className="text-gray-700">Destino:</strong> Samaipata, Bolivia</p>
            <p><strong className="text-gray-700">Viajeros:</strong> {numberOfPeople} {numberOfPeople === 1 ? 'persona' : 'personas'}</p>
            <p><strong className="text-gray-700">Fecha:</strong> {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        {/* Itinerario */}
        <div className="space-y-8 mb-12">
          <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">
            Itinerario Diario
          </h2>
          {days.map((day, dayIdx) => {
            const hasActivities = day.morning || day.afternoon
            return (
              <div key={dayIdx} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0" style={{ breakInside: 'avoid' }}>
                <h3 className="font-semibold text-emerald-900 text-lg mb-3 font-display">
                  Día {dayIdx + 1}
                </h3>
                {!hasActivities ? (
                  <p className="text-sm text-gray-400 italic">No hay actividades planificadas para este día.</p>
                ) : (
                  <div className="space-y-4">
                    {day.morning && (
                      <div className="flex gap-4 items-start">
                        <span className="text-xs font-semibold uppercase text-emerald-700 w-16 pt-0.5">Mañana</span>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-gray-800">{day.morning.name}</h4>
                          <p className="text-xs text-gray-600 mt-1">{day.morning.description}</p>
                          <div className="flex gap-4 mt-1.5 text-[11px] text-gray-500">
                            <span>Duración: {day.morning.duration}</span>
                            <span>Precio: {day.morning.pricePerPerson} BOB / pers.</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {day.afternoon && (
                      <div className="flex gap-4 items-start">
                        <span className="text-xs font-semibold uppercase text-emerald-700 w-16 pt-0.5">Tarde</span>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-gray-800">{day.afternoon.name}</h4>
                          <p className="text-xs text-gray-600 mt-1">{day.afternoon.description}</p>
                          <div className="flex gap-4 mt-1.5 text-[11px] text-gray-500">
                            <span>Duración: {day.afternoon.duration}</span>
                            <span>Precio: {day.afternoon.pricePerPerson} BOB / pers.</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Presupuesto */}
        <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200" style={{ breakInside: 'avoid' }}>
          <h2 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">
            Resumen de Presupuesto
          </h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal Actividades ({numberOfPeople} {numberOfPeople === 1 ? 'viajero' : 'viajeros'})</span>
              <span className="font-medium text-gray-900">{pricing.subtotal.toLocaleString()} BOB</span>
            </div>
            {pricing.discount > 0 && (
              <div className="flex justify-between text-emerald-750">
                <span>Descuento Aplicado ({pricing.discount > 0 ? (pricing.discount / pricing.subtotal * 100).toFixed(0) : 0}%)</span>
                <span className="font-medium">- {pricing.discount.toLocaleString()} BOB</span>
              </div>
            )}
            <div className="flex justify-between pb-3 border-b border-gray-200">
              <span>Logística y Transporte base</span>
              <span className="font-medium text-gray-900">{pricing.logistics.toLocaleString()} BOB</span>
            </div>
            <div className="flex justify-between items-baseline pt-3">
              <span className="text-base font-bold text-gray-900">Total Estimado</span>
              <div className="text-right">
                <span className="text-xl font-bold text-emerald-950">{pricing.total.toLocaleString()} BOB</span>
                <p className="text-xs text-gray-500 mt-0.5">≈ ${(pricing.total / 6.96).toFixed(0)} USD</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
          <p>Guajojó Tours · Samaipata, Santa Cruz, Bolivia · info@guajojotours.bo</p>
          <p className="mt-1">Generado automáticamente el {new Date().toLocaleDateString('es-ES')}</p>
        </div>
      </div>
    </section>
  )
}
