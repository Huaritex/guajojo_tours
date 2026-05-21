'use client'

import { useRef } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { X } from 'lucide-react'
import {
  Landmark, Trees, Droplets, Wine, Star, Compass, Mountain, ShoppingBag,
} from 'lucide-react'
import { useTripStore, type Activity } from '@/store/tripStore'
import { gsap, useGSAP } from '@/lib/gsap'

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  Landmark, Trees, Droplets, Wine, Star, Compass, Mountain, ShoppingBag,
}

const dayNames = ['Día 1', 'Día 2', 'Día 3']
const slotNames = { morning: 'Mañana', afternoon: 'Tarde' }
const dayAccent = [
  'rgba(52, 211, 153, 0.7)',
  'rgba(212, 165, 116, 0.7)',
  'rgba(139, 92, 246, 0.6)',
]

interface DropZoneProps {
  dayIndex: number
  slot: 'morning' | 'afternoon'
  activity: Activity | null
}

function DropZone({ dayIndex, slot, activity }: DropZoneProps) {
  const removeActivity = useTripStore((s) => s.removeActivity)
  const droppableId = `day-${dayIndex}-${slot}`
  const { isOver, setNodeRef } = useDroppable({ id: droppableId })
  const Icon = activity ? (iconMap[activity.icon] ?? Mountain) : null
  const chipRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (activity && chipRef.current) {
      gsap.fromTo(
        chipRef.current,
        { opacity: 0, scale: 0.82, y: 8 },
        { opacity: 1, scale: 1, y: 0, duration: 0.42, ease: 'back.out(1.8)' },
      )
    }
  }, { dependencies: [activity?.id ?? null] })

  return (
    <div
      ref={setNodeRef}
      className="relative rounded-xl p-3 min-h-[76px] flex flex-col justify-center"
      style={{
        border: `1px ${isOver ? 'solid' : 'dashed'} ${
          isOver ? 'rgba(52, 211, 153, 0.75)' : 'rgba(255,255,255,0.1)'
        }`,
        background: isOver
          ? 'rgba(52, 211, 153, 0.055)'
          : 'rgba(255,255,255,0.018)',
        boxShadow: isOver
          ? '0 0 24px rgba(52,211,153,0.12), inset 0 0 20px rgba(52,211,153,0.04)'
          : 'none',
        transform: isOver ? 'scale(1.015)' : 'scale(1)',
        transition: 'border 0.18s ease, background 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease',
      }}
    >
      <div className="text-xs mb-1.5 font-medium" style={{ color: 'var(--text-secondary)' }}>
        {slotNames[slot]}
      </div>

      {activity ? (
        <div ref={chipRef} className="timeline-chip flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Icon && <Icon size={12} />}
            <span className="truncate max-w-[120px] sm:max-w-[240px] lg:max-w-[180px] xl:max-w-[280px] text-xs" style={{ color: 'var(--text-primary)' }}>
              {activity.name}
            </span>
          </div>
          <button
            onClick={() => removeActivity(dayIndex, slot)}
            className="flex-shrink-0 p-0.5 rounded hover:opacity-60 transition-opacity"
            aria-label="Remover actividad"
          >
            <X size={12} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>
      ) : (
        <p
          className="text-xs italic"
          style={{ color: isOver ? 'rgba(52,211,153,0.6)' : 'rgba(255,255,255,0.18)' }}
        >
          {isOver ? 'Soltá aquí ↓' : 'Arrastrá una actividad'}
        </p>
      )}
    </div>
  )
}

export default function Timeline() {
  const days = useTripStore((s) => s.days)

  const filledSlots = days.reduce((acc, d) => acc + (d.morning ? 1 : 0) + (d.afternoon ? 1 : 0), 0)
  const totalSlots = days.length * 2
  const progress = totalSlots === 0 ? 0 : Math.round((filledSlots / totalSlots) * 100)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="flex items-center justify-between mb-0.5">
          <h3
            className="font-display text-xl font-semibold tracking-wide text-center flex-1"
            style={{ color: 'var(--text-primary)' }}
          >
            Tu itinerario
          </h3>
          <span
            className="text-xs font-mono tabular-nums"
            style={{
              color: filledSlots === totalSlots && totalSlots > 0
                ? 'var(--accent-emerald)'
                : 'var(--text-secondary)',
              transition: 'color 0.3s ease',
            }}
          >
            {filledSlots}/{totalSlots}
          </span>
        </div>
        <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
          3 días · Samaipata
        </p>
        {/* Progress bar */}
        <div
          className="mt-3 w-full rounded-full overflow-hidden"
          style={{ height: 3, background: 'rgba(255,255,255,0.06)' }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: progress === 100
                ? 'var(--accent-emerald)'
                : 'linear-gradient(90deg, var(--accent-emerald), rgba(212,165,116,0.7))',
              transition: 'width 0.5s cubic-bezier(0.16,1,0.3,1)',
            }}
          />
        </div>
      </div>

      {/* Vertical timeline */}
      <div className="relative flex flex-col gap-4">
        {/* Connecting line */}
        <div
          className="absolute left-[18px] top-8 bottom-8 w-px pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(52,211,153,0.25), rgba(212,165,116,0.2), rgba(139,92,246,0.15))' }}
        />

        {days.map((day, dayIndex) => (
          <div key={dayIndex} className="relative flex gap-4">
            {/* Day number bubble */}
            <div className="relative z-10 flex-shrink-0 mt-1">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  background: `rgba(${dayIndex === 0 ? '52,211,153' : dayIndex === 1 ? '212,165,116' : '139,92,246'}, 0.12)`,
                  border: `1.5px solid ${dayAccent[dayIndex]}`,
                  color: dayAccent[dayIndex],
                  fontFamily: 'var(--font-display)',
                }}
              >
                {dayIndex + 1}
              </div>
            </div>

            {/* Day content */}
            <div
              className="flex-1 rounded-2xl p-4"
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: `1px solid rgba(255,255,255,0.06)`,
              }}
            >
              <div
                className="text-xs font-semibold mb-3"
                style={{ color: dayAccent[dayIndex] }}
              >
                {dayNames[dayIndex]}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DropZone dayIndex={dayIndex} slot="morning" activity={day.morning} />
                <DropZone dayIndex={dayIndex} slot="afternoon" activity={day.afternoon} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
