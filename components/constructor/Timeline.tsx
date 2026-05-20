'use client'

import { useDroppable } from '@dnd-kit/core'
import { X } from 'lucide-react'
import {
  Landmark, Trees, Droplets, Wine, Star, Compass, Mountain, ShoppingBag,
} from 'lucide-react'
import { useTripStore, type Activity } from '@/store/tripStore'

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  Landmark, Trees, Droplets, Wine, Star, Compass, Mountain, ShoppingBag,
}

const dayNames = ['Día 1', 'Día 2', 'Día 3']
const slotNames = { morning: 'Mañana', afternoon: 'Tarde' }

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

  return (
    <div
      ref={setNodeRef}
      className={`relative rounded-xl p-3 min-h-[72px] flex flex-col justify-center transition-all duration-200 ${
        isOver ? 'drop-zone-active' : ''
      }`}
      style={{
        border: `1px dashed ${
          isOver ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.12)'
        }`,
        background: isOver ? 'rgba(52, 211, 153, 0.04)' : 'rgba(255,255,255,0.02)',
      }}
    >
      <div className="text-xs mb-1.5 font-medium" style={{ color: 'var(--text-secondary)' }}>
        {slotNames[slot]}
      </div>

      {activity ? (
        <div className="timeline-chip justify-between">
          <div className="flex items-center gap-2">
            {Icon && <Icon size={13} />}
            <span className="truncate max-w-[120px]" style={{ color: 'var(--text-primary)' }}>
              {activity.name}
            </span>
          </div>
          <button
            onClick={() => removeActivity(dayIndex, slot)}
            className="flex-shrink-0 p-0.5 rounded hover:opacity-70 transition-opacity"
            aria-label="Remover actividad"
          >
            <X size={12} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>
      ) : (
        <p className="text-xs italic" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Soltá una actividad aquí
        </p>
      )}
    </div>
  )
}

export default function Timeline() {
  const days = useTripStore((s) => s.days)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="font-display text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
          Tu itinerario
        </h3>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          3 días · Samaipata
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {days.map((day, dayIndex) => (
          <div
            key={dayIndex}
            className="rounded-2xl p-4"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <div
              className="text-sm font-semibold mb-3 flex items-center gap-2"
              style={{ color: 'var(--accent-gold)' }}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                style={{ background: 'rgba(212, 165, 116, 0.15)', color: 'var(--accent-gold)' }}
              >
                {dayIndex + 1}
              </span>
              {dayNames[dayIndex]}
            </div>

            <div className="flex flex-col gap-2">
              <DropZone dayIndex={dayIndex} slot="morning" activity={day.morning} />
              <DropZone dayIndex={dayIndex} slot="afternoon" activity={day.afternoon} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
