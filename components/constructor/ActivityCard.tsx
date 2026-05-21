'use client'

import { useRef } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import {
  Landmark, Trees, Droplets, Wine, Star, Compass, Mountain, ShoppingBag,
} from 'lucide-react'
import type { Activity } from '@/store/tripStore'
import { gsap, useGSAP } from '@/lib/gsap'

const iconMap: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  Landmark, Trees, Droplets, Wine, Star, Compass, Mountain, ShoppingBag,
}

const difficultyLabel = ['', 'Fácil', 'Moderado', 'Desafiante']
const difficultyColor = ['', 'var(--accent-emerald)', 'var(--accent-amber)', '#f87171']

const categoryAccent: Record<string, string> = {
  cultura: 'rgba(212,165,116,0.55)',
  aventura: 'rgba(52,211,153,0.55)',
  gastronomia: 'rgba(245,158,11,0.55)',
  naturaleza: 'rgba(96,165,250,0.55)',
}

interface ActivityCardProps {
  activity: Activity
  compact?: boolean
}

export default function ActivityCard({ activity, compact = false }: ActivityCardProps) {
  const magnetRef = useRef<HTMLDivElement>(null)
  const iconBoxRef = useRef<HTMLDivElement>(null)

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: activity.id,
    data: { activity },
  })

  const { contextSafe } = useGSAP({ scope: magnetRef })

  const handleMouseMove = contextSafe((e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging || !magnetRef.current) return
    const rect = magnetRef.current.getBoundingClientRect()
    const dx = e.clientX - (rect.left + rect.width / 2)
    const dy = e.clientY - (rect.top + rect.height / 2)
    gsap.to(magnetRef.current, {
      x: dx * 0.08,
      y: dy * 0.065,
      rotateX: (dy / rect.height) * -10,
      rotateY: (dx / rect.width) * 10,
      duration: 0.3,
      ease: 'power2.out',
    })
  })

  const handleMouseEnter = contextSafe(() => {
    if (isDragging) return
    gsap.to(iconBoxRef.current, {
      scale: 1.2, rotation: 7, duration: 0.3, ease: 'back.out(2)',
    })
  })

  const handleMouseLeave = contextSafe(() => {
    gsap.to(magnetRef.current, {
      x: 0, y: 0, rotateX: 0, rotateY: 0,
      duration: 0.65, ease: 'elastic.out(1, 0.4)',
    })
    gsap.to(iconBoxRef.current, {
      scale: 1, rotation: 0, duration: 0.55, ease: 'elastic.out(1, 0.4)',
    })
  })

  const Icon = iconMap[activity.icon] ?? Mountain

  return (
    <div
      ref={magnetRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ willChange: 'transform', perspective: '700px' }}
    >
      <div
        ref={setNodeRef}
        style={{
          transform: CSS.Translate.toString(transform),
          opacity: isDragging ? 0.3 : 1,
          cursor: isDragging ? 'grabbing' : 'grab',
          zIndex: isDragging ? 999 : undefined,
          borderLeftColor: categoryAccent[activity.category] ?? 'rgba(52,211,153,0.55)',
          borderLeftWidth: 2,
          transformStyle: 'preserve-3d',
        }}
        {...listeners}
        {...attributes}
        className={`glass-card activity-card-wrap rounded-xl select-none ${compact ? 'p-3' : 'p-4'}`}
        role="button"
        aria-label={`Arrastrar: ${activity.name}`}
      >
        {/* Shimmer sweep overlay */}
        <span className="activity-card-shimmer" aria-hidden="true" />
        <div className="flex items-start gap-3">
          <div
            ref={iconBoxRef}
            className="flex-shrink-0 rounded-lg flex items-center justify-center"
            style={{
              width: compact ? 32 : 40,
              height: compact ? 32 : 40,
              background: 'rgba(52, 211, 153, 0.08)',
              transformOrigin: 'center',
            }}
          >
            <Icon size={compact ? 14 : 18} style={{ color: 'var(--accent-emerald)' }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`category-badge badge-${activity.category}`}>
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

              <span className="text-sm font-semibold" style={{ color: 'var(--accent-gold)' }}>
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
    </div>
  )
}

