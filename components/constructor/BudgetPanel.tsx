'use client'

import { Users, Save, ChevronDown, ChevronUp } from 'lucide-react'
import { useTripStore } from '@/store/tripStore'
import activitiesData from '@/data/activities.json'

export default function BudgetPanel() {
  const { days, numberOfPeople, setNumberOfPeople, getTotalPrice, saveItinerary } = useTripStore()
  const pricing = getTotalPrice()

  const selectedActivities = days.flatMap((d, dayIndex) =>
    (['morning', 'afternoon'] as const)
      .map((slot) => (d[slot] ? { activity: d[slot]!, dayIndex, slot } : null))
      .filter(Boolean)
  ) as { activity: NonNullable<typeof days[0]['morning']>; dayIndex: number; slot: string }[]

  const discountRate =
    [...activitiesData.discounts]
      .reverse()
      .find((d) => numberOfPeople >= d.minPeople)?.percentage ?? 0

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="font-display text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
          Presupuesto
        </h3>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          Actualización en tiempo real
        </p>
      </div>

      {/* People selector */}
      <div
        className="rounded-xl p-4"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Users size={15} style={{ color: 'var(--accent-emerald)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Viajeros
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setNumberOfPeople(numberOfPeople - 1)}
            disabled={numberOfPeople <= 1}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: numberOfPeople <= 1 ? 'rgba(255,255,255,0.2)' : 'var(--text-primary)',
            }}
          >
            <ChevronDown size={16} />
          </button>
          <span
            className="font-display text-2xl font-bold w-8 text-center"
            style={{ color: 'var(--accent-gold)' }}
          >
            {numberOfPeople}
          </span>
          <button
            onClick={() => setNumberOfPeople(numberOfPeople + 1)}
            disabled={numberOfPeople >= 15}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: numberOfPeople >= 15 ? 'rgba(255,255,255,0.2)' : 'var(--text-primary)',
            }}
          >
            <ChevronUp size={16} />
          </button>
          <span className="text-xs ml-1" style={{ color: 'var(--text-secondary)' }}>
            personas
          </span>
        </div>

        {discountRate > 0 && (
          <div
            className="mt-3 text-xs px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(52, 211, 153, 0.1)', color: 'var(--accent-emerald)' }}
          >
            ✓ Descuento grupal: {discountRate}% aplicado
          </div>
        )}
      </div>

      {/* Activity list */}
      <div className="flex flex-col gap-2">
        {selectedActivities.length === 0 ? (
          <p className="text-xs italic text-center py-4" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Sin actividades seleccionadas
          </p>
        ) : (
          selectedActivities.map(({ activity }, i) => (
            <div key={i} className="flex items-center justify-between">
              <span
                className="text-xs flex-1 truncate pr-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                {activity.name}
              </span>
              <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                {(activity.pricePerPerson * numberOfPeople).toLocaleString()} BOB
              </span>
            </div>
          ))
        )}
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid var(--glass-border)' }} />

      {/* Price breakdown */}
      <div className="flex flex-col gap-2.5">
        <div className="flex justify-between text-sm">
          <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
          <span style={{ color: 'var(--text-primary)' }}>
            {pricing.subtotal.toLocaleString()} BOB
          </span>
        </div>

        {pricing.discount > 0 && (
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--accent-emerald)' }}>Descuento ({discountRate}%)</span>
            <span style={{ color: 'var(--accent-emerald)' }}>
              −{pricing.discount.toLocaleString()} BOB
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span style={{ color: 'var(--text-secondary)' }}>Transporte</span>
          <span style={{ color: 'var(--text-primary)' }}>
            {pricing.logistics.toLocaleString()} BOB
          </span>
        </div>
      </div>

      {/* Total */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: 'linear-gradient(135deg, rgba(52,211,153,0.08), rgba(212,165,116,0.08))',
          border: '1px solid rgba(52, 211, 153, 0.2)',
        }}
      >
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Total estimado
          </span>
          <div className="text-right">
            <div
              className="font-display text-2xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              {pricing.total.toLocaleString()} BOB
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              ≈ ${pricing.totalUSD.toFixed(0)} USD
            </div>
          </div>
        </div>
        <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Por grupo · {activitiesData.logistics.includes}
        </p>
      </div>

      {/* Save button */}
      <button
        onClick={saveItinerary}
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200"
        style={{
          background: selectedActivities.length > 0 ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.05)',
          color: selectedActivities.length > 0 ? '#052e16' : 'rgba(255,255,255,0.3)',
          cursor: selectedActivities.length > 0 ? 'pointer' : 'not-allowed',
        }}
        disabled={selectedActivities.length === 0}
      >
        <Save size={16} />
        Guardar itinerario
      </button>
    </div>
  )
}
