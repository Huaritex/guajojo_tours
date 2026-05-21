'use client'

import { useState, useRef, useEffect } from 'react'
import { Search } from 'lucide-react'
import ActivityCard from './ActivityCard'
import activitiesData from '@/data/activities.json'
import type { Activity } from '@/store/tripStore'
import { gsap } from '@/lib/gsap'

const categories = ['todos', 'aventura', 'cultura', 'naturaleza', 'gastronomia']

const CATEGORY_ICONS: Record<string, string> = {
  todos: '✦',
  aventura: '⛰',
  cultura: '🏛',
  naturaleza: '🌿',
  gastronomia: '🍷',
}

export default function ActivityCatalog() {
  const [filter, setFilter] = useState('todos')
  const [search, setSearch] = useState('')

  const cardsListRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<gsap.core.Tween | null>(null)
  const isFirstMount = useRef(true)

  const activities = activitiesData.activities as Activity[]
  const filtered = activities.filter((a) => {
    const matchCat = filter === 'todos' || a.category === filter
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  // Blur-in entrance on first mount
  useEffect(() => {
    const list = cardsListRef.current
    if (!list) return
    const items = list.querySelectorAll<HTMLElement>('.ac-item')
    if (!items.length) return
    gsap.set(items, { opacity: 0, y: 14, filter: 'blur(5px)' })
    gsap.to(items, {
      opacity: 1, y: 0, filter: 'blur(0px)',
      duration: 0.45, stagger: 0.07, ease: 'power3.out',
      delay: 0.25,
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Stagger on filter/search change
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }
    const list = cardsListRef.current
    if (!list) return
    const items = list.querySelectorAll<HTMLElement>('.ac-item')
    if (!items.length) return

    animRef.current?.kill()
    gsap.set(items, { opacity: 0, y: 10, filter: 'blur(3px)' })
    animRef.current = gsap.to(items, {
      opacity: 1, y: 0, filter: 'blur(0px)',
      duration: 0.3, stagger: 0.05, ease: 'power2.out',
    })
  }, [filter, search])

  return (
    <div className="flex flex-col h-full gap-4">
      <div>
        <h3
          className="font-display text-xl font-semibold tracking-wide text-center mb-1"
          style={{ color: 'var(--text-primary)' }}
        >
          Actividades
        </h3>
        <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
          Arrastrá al timeline →
        </p>
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--glass-border)',
        }}
      >
        <Search size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Buscar actividad..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-sm outline-none w-full placeholder-stone-600"
          style={{ color: 'var(--text-primary)' }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-xs flex-shrink-0 transition-opacity hover:opacity-60"
            style={{ color: 'rgba(255,255,255,0.3)' }}
            aria-label="Limpiar búsqueda"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category filters */}
      <div className="flex gap-1.5 flex-wrap">
        {categories.map((cat) => {
          const isActive = filter === cat
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg capitalize"
              style={{
                background: isActive ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.05)',
                color: isActive ? '#052e16' : 'var(--text-secondary)',
                border: `1px solid ${isActive ? 'transparent' : 'rgba(255,255,255,0.07)'}`,
                fontWeight: isActive ? 600 : 400,
                transition: 'background 0.18s ease, color 0.18s ease, border-color 0.18s ease',
              }}
            >
              <span className="text-[10px]">{CATEGORY_ICONS[cat]}</span>
              {cat}
            </button>
          )
        })}
      </div>

      {/* Cards list */}
      <div
        ref={cardsListRef}
        className="flex flex-col gap-3 overflow-y-auto flex-1 pr-1"
        style={{ maxHeight: '55vh', scrollbarWidth: 'thin' }}
        data-lenis-prevent
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <span className="text-2xl opacity-30">🔍</span>
            <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
              Sin resultados para <span style={{ color: 'var(--text-primary)' }}>&ldquo;{search}&rdquo;</span>
            </p>
            <button
              onClick={() => { setSearch(''); setFilter('todos') }}
              className="text-xs px-3 py-1 rounded-lg transition-opacity hover:opacity-70"
              style={{ color: 'var(--accent-emerald)', border: '1px solid rgba(52,211,153,0.2)' }}
            >
              Ver todas
            </button>
          </div>
        ) : (
          filtered.map((activity) => (
            <div key={activity.id} className="ac-item">
              <ActivityCard activity={activity} />
            </div>
          ))
        )}
      </div>

      {/* Footer count */}
      {filtered.length > 0 && (
        <p
          className="text-[10px] text-center font-mono tabular-nums"
          style={{ color: 'rgba(255,255,255,0.18)' }}
        >
          {filtered.length} {filtered.length === 1 ? 'actividad' : 'actividades'}
          {filter !== 'todos' ? ` · ${filter}` : ''}
        </p>
      )}
    </div>
  )
}
