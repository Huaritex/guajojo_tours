'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import ActivityCard from './ActivityCard'
import activitiesData from '@/data/activities.json'
import type { Activity } from '@/store/tripStore'

const categories = ['todos', 'aventura', 'cultura', 'naturaleza', 'gastronomia']

export default function ActivityCatalog() {
  const [filter, setFilter] = useState('todos')
  const [search, setSearch] = useState('')

  const activities = activitiesData.activities as Activity[]
  const filtered = activities.filter((a) => {
    const matchCat = filter === 'todos' || a.category === filter
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="flex flex-col h-full gap-4">
      <div>
        <h3 className="font-display text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
          Actividades
        </h3>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          Arrastrá al timeline →
        </p>
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)' }}
      >
        <Search size={14} style={{ color: 'var(--text-secondary)' }} />
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-sm outline-none w-full placeholder-stone-600"
          style={{ color: 'var(--text-primary)' }}
        />
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className="text-xs px-3 py-1.5 rounded-lg capitalize transition-all duration-200"
            style={{
              background: filter === cat ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.05)',
              color: filter === cat ? '#052e16' : 'var(--text-secondary)',
              border: `1px solid ${filter === cat ? 'transparent' : 'var(--glass-border)'}`,
              fontWeight: filter === cat ? 600 : 400,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3 overflow-y-auto flex-1 pr-1" style={{ maxHeight: '60vh' }}>
        {filtered.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: 'var(--text-secondary)' }}>
            Sin resultados
          </p>
        )}
        {filtered.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  )
}
