'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import {
  Landmark, Trees, Droplets, Wine, Star, Compass, Mountain, ShoppingBag,
} from 'lucide-react'
import type { Activity } from '@/store/tripStore'

const iconMap: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  Landmark, Trees, Droplets, Wine, Star, Compass, Mountain, ShoppingBag,
}

const difficultyLabel = ['', 'Fácil', 'Moderado', 'Desafiante']
const difficultyColor = ['', 'var(--accent-emerald)', 'var(--accent-amber)', '#f87171']

interface ActivityCardProps {
  activity: Activity
  compact?: boolean
}

export default function ActivityCard({ activity, compact = false }: ActivityCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: activity.id,
    data: { activity },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    zIndex: isDragging ? 999 : undefined,
  }

  const Icon = iconMap[activity.icon] ?? Mountain

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`glass-card rounded-xl select-none ${compact ? 'p-3' : 'p-4'}`}
      role="button"
      aria-label={`Arrastrar: ${activity.name}`}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 rounded-lg flex items-center justify-center"
          style={{
            width: compact ? 32 : 40,
            height: compact ? 32 : 40,
            background: 'rgba(52, 211, 153, 0.08)',
          }}
        >
          <Icon size={compact ? 14 : 18} style={{ color: 'var(--accent-emerald)' }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`category-badge badge-${activity.category}`}
            >
              {activity.category}
            </span>
          </div>
          <h4
            className="font-medium leading-snug truncate"
            style={{ fontSize: compact ? '0.8rem' : '0.9rem', color: 'var(--text-primary)' }}
          >
            {activity.name}
          </h4>

          {!compact && (
            <p
              className="text-xs mt-1 leading-relaxed line-clamp-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              {activity.description}
            </p>
          )}

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <span
                  key={i}
                  className="difficulty-dot"
                  style={{
                    background:
                      i < activity.difficulty
                        ? difficultyColor[activity.difficulty]
                        : 'rgba(255,255,255,0.1)',
                  }}
                />
              ))}
              <span className="text-xs ml-1" style={{ color: 'var(--text-secondary)' }}>
                {difficultyLabel[activity.difficulty]}
              </span>
            </div>

            <span
              className="text-sm font-semibold"
              style={{ color: 'var(--accent-gold)' }}
            >
              {activity.pricePerPerson} BOB
            </span>
          </div>

          {!compact && (
            <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              ⏱ {activity.duration}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
