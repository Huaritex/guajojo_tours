'use client'

import { useState, useMemo } from 'react'
import { useTripStore } from '@/store/tripStore'

interface PackItem {
  id: string
  label: string
  category: string
}

const CATEGORY_ITEMS: Record<string, PackItem[]> = {
  aventura: [
    { id: 'boots', label: 'Botas de trekking', category: 'aventura' },
    { id: 'windbreaker', label: 'Rompevientos', category: 'aventura' },
    { id: 'poles', label: 'Bastones de trekking (opcional)', category: 'aventura' },
    { id: 'backpack', label: 'Mochila pequeña (15-20 L)', category: 'aventura' },
    { id: 'gloves', label: 'Guantes ligeros', category: 'aventura' },
  ],
  naturaleza: [
    { id: 'repellent', label: 'Repelente de insectos', category: 'naturaleza' },
    { id: 'sunscreen', label: 'Protector solar FPS 50+', category: 'naturaleza' },
    { id: 'binoculars', label: 'Binoculares (opcional)', category: 'naturaleza' },
    { id: 'poncho', label: 'Poncho impermeable', category: 'naturaleza' },
  ],
  cultura: [
    { id: 'comfortable-shoes', label: 'Calzado cómodo para caminar', category: 'cultura' },
    { id: 'hat', label: 'Sombrero o gorra', category: 'cultura' },
    { id: 'camera', label: 'Cámara fotográfica', category: 'cultura' },
  ],
  gastronomia: [
    { id: 'casual-wear', label: 'Ropa casual de tarde', category: 'gastronomia' },
    { id: 'light-jacket', label: 'Chaqueta ligera (noches)', category: 'gastronomia' },
  ],
  nocturno: [
    { id: 'headlamp', label: 'Linterna frontal', category: 'nocturno' },
    { id: 'thermal', label: 'Ropa térmica (base layer)', category: 'nocturno' },
    { id: 'warm-coat', label: 'Abrigo de montaña', category: 'nocturno' },
    { id: 'neck-gaiter', label: 'Cuello / buff térmico', category: 'nocturno' },
  ],
  agua: [
    { id: 'swimsuit', label: 'Traje de baño', category: 'agua' },
    { id: 'water-sandals', label: 'Sandalias acuáticas', category: 'agua' },
    { id: 'quick-dry-towel', label: 'Toalla de secado rápido', category: 'agua' },
    { id: 'dry-bag', label: 'Bolsa impermeable', category: 'agua' },
  ],
}

const ALWAYS_ITEMS: PackItem[] = [
  { id: 'water', label: 'Agua (mínimo 1.5 L)', category: 'base' },
  { id: 'snacks', label: 'Snacks energéticos', category: 'base' },
  { id: 'id', label: 'Documento de identidad', category: 'base' },
  { id: 'cash', label: 'Efectivo (Bolivianos)', category: 'base' },
  { id: 'phone', label: 'Teléfono cargado', category: 'base' },
]

const CATEGORY_LABEL: Record<string, string> = {
  aventura: 'Aventura / Trekking',
  naturaleza: 'Naturaleza',
  cultura: 'Cultura',
  gastronomia: 'Gastronomía',
  nocturno: 'Actividades Nocturnas',
  agua: 'Agua / Cascadas',
  base: 'Esenciales',
}

function detectNocturno(categories: string[], activityIds: string[]): boolean {
  return activityIds.some((id) => id.includes('noche') || id.includes('estrellas'))
}

function detectAgua(categories: string[], activityIds: string[]): boolean {
  return activityIds.some((id) => id.includes('cascada') || id.includes('kayak') || id.includes('titicaca')) ||
    categories.includes('agua')
}

export default function PackingChecklist() {
  const days = useTripStore((s) => s.days)
  const [checked, setChecked] = useState<Set<string>>(new Set())

  const { items, total } = useMemo(() => {
    const activities = days.flatMap((d) =>
      [d.morning, d.afternoon].filter((a): a is NonNullable<typeof a> => a !== null)
    )

    const categories = [...new Set(activities.map((a) => a.category))]
    const ids = activities.map((a) => a.id)

    const dynamicItems: PackItem[] = []

    for (const cat of categories) {
      const catItems = CATEGORY_ITEMS[cat]
      if (catItems) dynamicItems.push(...catItems)
    }

    if (detectNocturno(categories, ids)) {
      const nocItems = CATEGORY_ITEMS.nocturno ?? []
      for (const item of nocItems) {
        if (!dynamicItems.some((i) => i.id === item.id)) dynamicItems.push(item)
      }
    }

    if (detectAgua(categories, ids)) {
      const aguaItems = CATEGORY_ITEMS.agua ?? []
      for (const item of aguaItems) {
        if (!dynamicItems.some((i) => i.id === item.id)) dynamicItems.push(item)
      }
    }

    const allItems = [...ALWAYS_ITEMS, ...dynamicItems]
    return { items: allItems, total: allItems.length }
  }, [days])

  const checkedCount = items.filter((i) => checked.has(i.id)).length
  const progress = total === 0 ? 0 : Math.round((checkedCount / total) * 100)

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (items.length === ALWAYS_ITEMS.length) {
    return (
      <div
        className="rounded-2xl p-5"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)' }}
      >
        <p className="text-xs font-mono uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--accent-emerald)' }}>
          Checklist de Equipaje
        </p>
        <p className="text-xs italic" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Agrega actividades para ver el equipaje recomendado
        </p>
      </div>
    )
  }

  const groupedItems = items.reduce<Record<string, PackItem[]>>((acc, item) => {
    const key = item.category
    ;(acc[key] ??= []).push(item)
    return acc
  }, {})

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-mono uppercase tracking-[0.18em]" style={{ color: 'var(--accent-emerald)' }}>
          Checklist de Equipaje
        </p>
        <span className="text-xs font-medium tabular-nums" style={{ color: 'var(--text-secondary)' }}>
          {checkedCount}/{total}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="w-full rounded-full mb-5 overflow-hidden"
        style={{ height: 4, background: 'rgba(255,255,255,0.06)' }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            background: progress === 100
              ? 'var(--accent-emerald)'
              : 'linear-gradient(90deg, var(--accent-emerald), var(--accent-gold))',
          }}
        />
      </div>

      <div
        className="flex flex-col gap-5 max-h-60 overflow-y-auto pr-1"
        style={{ scrollbarWidth: 'thin' }}
        data-lenis-prevent
      >
        {Object.entries(groupedItems).map(([cat, catItems]) => (
          <div key={cat}>
            <p className="text-[10px] font-mono uppercase tracking-[0.15em] mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {CATEGORY_LABEL[cat] ?? cat}
            </p>
            <div className="flex flex-col gap-1.5">
              {catItems.map((item) => {
                const isChecked = checked.has(item.id)
                return (
                  <label
                    key={item.id}
                    className="flex items-center gap-2.5 cursor-pointer group/item"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggle(item.id)}
                      className="sr-only"
                    />
                    <span
                      className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center transition-all duration-200"
                      style={{
                        background: isChecked ? 'var(--accent-emerald)' : 'transparent',
                        border: `1.5px solid ${isChecked ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.2)'}`,
                      }}
                    >
                      {isChecked && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                          <path d="M2 5l2.5 2.5L8 3" stroke="#052e16" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span
                      className="text-xs transition-colors duration-200"
                      style={{
                        color: isChecked ? 'rgba(255,255,255,0.3)' : 'var(--text-secondary)',
                        textDecoration: isChecked ? 'line-through' : 'none',
                      }}
                    >
                      {item.label}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {progress === 100 && (
        <p className="text-xs text-center mt-4 font-medium" style={{ color: 'var(--accent-emerald)' }}>
          ¡Todo listo para tu aventura! 🌿
        </p>
      )}
    </div>
  )
}
