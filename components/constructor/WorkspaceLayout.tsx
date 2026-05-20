'use client'

import { useRef } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useState } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import ActivityCatalog from './ActivityCatalog'
import Timeline from './Timeline'
import BudgetPanel from './BudgetPanel'
import { useTripStore, type Activity } from '@/store/tripStore'
import activitiesData from '@/data/activities.json'
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
      className="glass-card rounded-xl px-4 py-3 flex items-center gap-3 pointer-events-none shadow-2xl"
      style={{ minWidth: 200, opacity: 0.95 }}
    >
      <Icon size={16} style={{ color: 'var(--accent-emerald)' }} />
      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
        {activity.name}
      </span>
    </div>
  )
}

export default function WorkspaceLayout() {
  const sectionRef = useRef<HTMLElement>(null)
  const addActivity = useTripStore((s) => s.addActivity)
  const [activeActivity, setActiveActivity] = useState<Activity | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  useGSAP(() => {
    if (!sectionRef.current) return
    const heading = sectionRef.current.querySelector('.workspace-heading')
    const label = sectionRef.current.querySelector('.workspace-label')
    const grid = sectionRef.current.querySelector('.workspace-grid')

    if (!heading || !label || !grid) return

    gsap.set([label, heading, grid], { opacity: 0, y: 40 })
    gsap.to([label, heading, grid], {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
        once: true,
      },
    })
  }, { scope: sectionRef })

  const handleDragStart = (event: DragStartEvent) => {
    const activity = event.active.data.current?.activity as Activity | undefined
    setActiveActivity(activity ?? null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveActivity(null)
    const { over, active } = event
    if (!over) return

    const overId = over.id as string
    const match = overId.match(/^day-(\d+)-(morning|afternoon)$/)
    if (!match) return

    const dayIndex = parseInt(match[1])
    const slot = match[2] as 'morning' | 'afternoon'
    const activity = active.data.current?.activity as Activity | undefined
    if (activity) {
      addActivity(dayIndex, slot, activity)
    }
  }

  return (
    <section
      ref={sectionRef}
      id="constructor"
      className="relative py-24 px-6"
      style={{ background: 'var(--bg-secondary)' }}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 70% 30%, rgba(52,211,153,0.04) 0%, transparent 60%)',
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-14">
          <div className="section-label workspace-label mb-4">Constructor de Viajes</div>
          <h2
            className="workspace-heading font-display leading-tight"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              color: 'var(--text-primary)',
            }}
          >
            Diseñá tu aventura
          </h2>
          <p
            className="mt-4 max-w-lg mx-auto text-base"
            style={{ color: 'var(--text-secondary)' }}
          >
            Arrastrá actividades al calendario. El presupuesto se actualiza al instante.
          </p>
        </div>

        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="workspace-grid grid grid-cols-1 lg:grid-cols-[320px_1fr_280px] gap-6 items-start">
            {/* Catalog */}
            <div
              className="glass-card rounded-2xl p-5"
              style={{ minHeight: 480 }}
            >
              <ActivityCatalog />
            </div>

            {/* Timeline */}
            <div
              className="glass-card rounded-2xl p-5"
              style={{ minHeight: 480 }}
            >
              <Timeline />
            </div>

            {/* Budget — sticky on desktop */}
            <div className="lg:sticky lg:top-24">
              <div className="glass-card rounded-2xl p-5">
                <BudgetPanel />
              </div>
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
