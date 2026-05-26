'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { AlertTriangle, MapPin, Clock, Moon, Flame } from 'lucide-react'
import { useTripStore } from '@/store/tripStore'
import { gsap, useGSAP } from '@/lib/gsap'

// Haversine distance formula
function getDistance(coord1: [number, number], coord2: [number, number]): number {
  const R = 6371 // Earth's radius in km
  const lat1 = (coord1[0] * Math.PI) / 180
  const lat2 = (coord2[0] * Math.PI) / 180
  const dLat = ((coord2[0] - coord1[0]) * Math.PI) / 180
  const dLon = ((coord2[1] - coord1[1]) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Convert "3 horas" or "3.5 horas" into a number
function parseDuration(durationStr: string): number {
  const match = durationStr.match(/(\d+(?:\.\d+)?)/)
  return match ? parseFloat(match[1]) : 0
}

interface RawAlert {
  type: 'traslado-largo' | 'jornada-extensa' | 'actividad-nocturna' | 'dificultad-alta'
  dayIndex: number
  details?: string
}

interface GroupedAlert {
  type: string
  title: string
  description: string
  daysText: string
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>
  color: string
  borderColor: string
  bgColor: string
}

export default function LogisticsAlerts() {
  const days = useTripStore((s) => s.days)
  const numberOfPeople = useTripStore((s) => s.numberOfPeople)
  const [isMounted, setIsMounted] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const groupedAlerts = useMemo(() => {
    const rawAlerts: RawAlert[] = []

    days.forEach((day, idx) => {
      // 1. Traslado largo (morning + afternoon have coordinates, distance > 18 km)
      if (day.morning && day.afternoon && day.morning.coordinates && day.afternoon.coordinates) {
        const dist = getDistance(day.morning.coordinates, day.afternoon.coordinates)
        if (dist > 18) {
          rawAlerts.push({
            type: 'traslado-largo',
            dayIndex: idx,
            details: `~${dist.toFixed(1)} km`,
          })
        }
      }

      // 2. Jornada extensa (activity >= 6h or day total >= 7h)
      const morningDur = day.morning ? parseDuration(day.morning.duration) : 0
      const afternoonDur = day.afternoon ? parseDuration(day.afternoon.duration) : 0
      const totalDur = morningDur + afternoonDur
      if (morningDur >= 6 || afternoonDur >= 6 || totalDur >= 7) {
        rawAlerts.push({
          type: 'jornada-extensa',
          dayIndex: idx,
          details: `~${totalDur} h`,
        })
      }

      // 3. Actividad nocturna (id contains "noche" or name includes "Noche")
      const isMorningNight =
        day.morning &&
        (day.morning.id.toLowerCase().includes('noche') ||
          day.morning.name.toLowerCase().includes('noche'))
      const isAfternoonNight =
        day.afternoon &&
        (day.afternoon.id.toLowerCase().includes('noche') ||
          day.afternoon.name.toLowerCase().includes('noche'))
      if (isMorningNight || isAfternoonNight) {
        rawAlerts.push({
          type: 'actividad-nocturna',
          dayIndex: idx,
        })
      }

      // 4. Dificultad alta (difficulty === 3)
      const isMorningHard = day.morning && day.morning.difficulty === 3
      const isAfternoonHard = day.afternoon && day.afternoon.difficulty === 3
      if (isMorningHard || isAfternoonHard) {
        rawAlerts.push({
          type: 'dificultad-alta',
          dayIndex: idx,
        })
      }
    })

    const grouped: GroupedAlert[] = []

    // Grouping & messages definitions
    const trasladoAlerts = rawAlerts.filter((a) => a.type === 'traslado-largo')
    if (trasladoAlerts.length > 0) {
      const daysStr = trasladoAlerts.map((a) => `Día ${a.dayIndex + 1}`).join(', ')
      const detailsStr = trasladoAlerts.map((a) => `Día ${a.dayIndex + 1} (${a.details})`).join(' y ')
      grouped.push({
        type: 'traslado-largo',
        title: 'Traslado largo',
        description: `Distancia considerable entre las actividades del mismo día: ${detailsStr}. Se recomienda coordinar transporte privado.`,
        daysText: daysStr,
        icon: MapPin,
        color: 'var(--accent-gold)',
        borderColor: 'rgba(212, 165, 116, 0.22)',
        bgColor: 'rgba(212, 165, 116, 0.05)',
      })
    }

    const jornadaAlerts = rawAlerts.filter((a) => a.type === 'jornada-extensa')
    if (jornadaAlerts.length > 0) {
      const daysStr = jornadaAlerts.map((a) => `Día ${a.dayIndex + 1}`).join(', ')
      const detailsStr = jornadaAlerts.map((a) => `Día ${a.dayIndex + 1} (${a.details})`).join(' y ')
      grouped.push({
        type: 'jornada-extensa',
        title: 'Jornada extensa',
        description: `El itinerario supera las horas recomendadas de actividad: ${detailsStr}. Considera intervalos de descanso entre actividades.`,
        daysText: daysStr,
        icon: Clock,
        color: 'var(--accent-amber)',
        borderColor: 'rgba(245, 158, 11, 0.22)',
        bgColor: 'rgba(245, 158, 11, 0.05)',
      })
    }

    const nocturnaAlerts = rawAlerts.filter((a) => a.type === 'actividad-nocturna')
    if (nocturnaAlerts.length > 0) {
      const daysStr = nocturnaAlerts.map((a) => `Día ${a.dayIndex + 1}`).join(', ')
      grouped.push({
        type: 'actividad-nocturna',
        title: 'Logística nocturna',
        description: `Incluye actividades de noche en ${daysStr}. Recuerda llevar ropa de abrigo muy abrigada y planificar el transporte de retorno.`,
        daysText: daysStr,
        icon: Moon,
        color: '#8b5cf6',
        borderColor: 'rgba(139, 92, 246, 0.22)',
        bgColor: 'rgba(139, 92, 246, 0.05)',
      })
    }

    const dificultadAlerts = rawAlerts.filter((a) => a.type === 'dificultad-alta')
    if (dificultadAlerts.length > 0) {
      const daysStr = dificultadAlerts.map((a) => `Día ${a.dayIndex + 1}`).join(', ')
      grouped.push({
        type: 'dificultad-alta',
        title: 'Dificultad alta',
        description: `Contiene actividades de nivel avanzado en ${daysStr}. Requiere una condición física óptima y calzado adecuado de trekking.`,
        daysText: daysStr,
        icon: Flame,
        color: '#ef4444',
        borderColor: 'rgba(239, 68, 68, 0.22)',
        bgColor: 'rgba(239, 68, 68, 0.05)',
      })
    }

    return grouped
  }, [days, numberOfPeople])

  // GSAP animation on changes
  useGSAP(() => {
    if (isMounted && listRef.current) {
      const cards = listRef.current.querySelectorAll('.alert-card')
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 12, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.06, ease: 'power2.out' }
        )
      }
    }
  }, { dependencies: [groupedAlerts.length, isMounted], scope: listRef })

  // Static/SSR empty state or while mounting to avoid hydration mismatch
  if (!isMounted || groupedAlerts.length === 0) {
    return (
      <div
        className="rounded-2xl p-5"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--glass-border)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={14} style={{ color: 'var(--text-secondary)' }} />
          <p
            className="text-xs font-mono uppercase tracking-[0.18em]"
            style={{ color: 'var(--accent-emerald)' }}
          >
            Alertas Logísticas
          </p>
        </div>
        <p className="text-xs italic" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Sin alertas logísticas
        </p>
      </div>
    )
  }

  return (
    <div
      ref={listRef}
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--glass-border)',
      }}
    >
      <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} style={{ color: 'var(--accent-gold)' }} />
          <p
            className="text-xs font-mono uppercase tracking-[0.18em]"
            style={{ color: 'var(--accent-emerald)' }}
          >
            Alertas Logísticas
          </p>
        </div>
        <span
          className="text-xs font-mono tabular-nums px-2 py-0.5 rounded-full"
          style={{
            background: 'rgba(212,165,116,0.1)',
            color: 'var(--accent-gold)',
            border: '1px solid rgba(212,165,116,0.2)',
          }}
        >
          {groupedAlerts.length}
        </span>
      </div>

      <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
        {groupedAlerts.map((alert) => {
          const Icon = alert.icon
          return (
            <div
              key={alert.type}
              className="alert-card p-3 rounded-xl border flex flex-col gap-1.5 transition-all duration-200 hover:scale-[1.01]"
              style={{
                borderColor: alert.borderColor,
                background: alert.bgColor,
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon size={14} style={{ color: alert.color }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {alert.title}
                  </span>
                </div>
                <span
                  className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                  style={{
                    background: alert.borderColor,
                    color: alert.color,
                  }}
                >
                  {alert.daysText}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {alert.description}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
