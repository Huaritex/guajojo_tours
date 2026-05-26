'use client'

import { useRef, useState } from 'react'
import { Users, Save, ChevronDown, ChevronUp, Share2, Printer, Check } from 'lucide-react'
import { useTripStore } from '@/store/tripStore'
import activitiesData from '@/data/activities.json'
import { gsap, useGSAP } from '@/lib/gsap'

export default function BudgetPanel() {
  const { days, numberOfPeople, setNumberOfPeople, getTotalPrice, saveItinerary, getShareUrl } = useTripStore()
  const [savedFeedback, setSavedFeedback] = useState(false)
  const [copiedFeedback, setCopiedFeedback] = useState(false)
  const totalBobRef = useRef<HTMLSpanElement>(null)
  const totalUsdRef = useRef<HTMLSpanElement>(null)
  const prevTotalRef = useRef(0)

  const saveBtnRef = useRef<HTMLButtonElement>(null)
  const saveIconRef = useRef<HTMLSpanElement>(null)
  const shareIconRef = useRef<HTMLSpanElement>(null)
  const shareRippleRef = useRef<HTMLSpanElement>(null)
  const printBeamRef = useRef<HTMLDivElement>(null)
  const saveTl = useRef<gsap.core.Timeline | null>(null)
  const shareTl = useRef<gsap.core.Timeline | null>(null)
  const printTl = useRef<gsap.core.Timeline | null>(null)

  function handleSave() {
    saveItinerary() // also sets mapVisible: true inside the store
    setSavedFeedback(true)
    setTimeout(() => setSavedFeedback(false), 2200)
    // Scroll to map after a brief delay for the animation to start
    setTimeout(() => {
      const mapEl = document.getElementById('route-map')
      if (mapEl) {
        mapEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 350)
  }

  function handleShare() {
    const url = getShareUrl()
    navigator.clipboard.writeText(url).then(() => {
      setCopiedFeedback(true)
      setTimeout(() => setCopiedFeedback(false), 2200)
    })
  }

  function handlePrint() {
    window.print()
  }
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

  // Count-up animation when total changes
  useGSAP(() => {
    const target = pricing.total
    if (target === prevTotalRef.current) return
    const obj = { val: prevTotalRef.current }
    gsap.to(obj, {
      val: target,
      duration: 0.75,
      ease: 'power2.out',
      onUpdate() {
        if (totalBobRef.current) {
          totalBobRef.current.textContent = Math.round(obj.val).toLocaleString() + ' BOB'
        }
        if (totalUsdRef.current) {
          totalUsdRef.current.textContent = '≈ $' + (Math.round(obj.val) / 6.96).toFixed(0) + ' USD'
        }
      },
      onComplete() {
        prevTotalRef.current = target
      },
    })
  }, { dependencies: [pricing.total] })

  useGSAP(() => {
    if (saveBtnRef.current && saveIconRef.current) {
      saveTl.current = gsap.timeline({ paused: true })
        .to(saveBtnRef.current, { scale: 1.05, duration: 0.2, ease: 'power2.out' }, 0)
        .to(saveIconRef.current, { rotationY: 360, transformPerspective: 600, duration: 0.5, ease: 'power2.inOut' }, 0)
    }
    if (shareIconRef.current && shareRippleRef.current) {
      shareTl.current = gsap.timeline({ paused: true })
        .to(shareIconRef.current, { x: 5, duration: 0.2, ease: 'power2.out' }, 0)
        .fromTo(shareRippleRef.current,
          { scale: 0.4, opacity: 0.6 },
          { scale: 2.8, opacity: 0, duration: 0.55, ease: 'power1.out' },
          0
        )
    }
    if (printBeamRef.current) {
      printTl.current = gsap.timeline({ paused: true })
        .fromTo(printBeamRef.current,
          { yPercent: -120, opacity: 0.85 },
          { yPercent: 130, opacity: 0.4, duration: 0.38, ease: 'power1.inOut' }
        )
    }
  })

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="font-display text-xl font-semibold tracking-wide text-center mb-1" style={{ color: 'var(--text-primary)' }}>
          Presupuesto
        </h3>
        <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
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
      <div
        className="flex flex-col gap-2 overflow-y-auto pr-1"
        style={{ maxHeight: '110px', scrollbarWidth: 'thin' }}
        data-lenis-prevent
      >
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
              <span ref={totalBobRef}>{pricing.total.toLocaleString()} BOB</span>
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span ref={totalUsdRef}>≈ ${pricing.totalUSD.toFixed(0)} USD</span>
            </div>
          </div>
        </div>
        <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Por grupo · {activitiesData.logistics.includes}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-2.5">
        <button
          ref={saveBtnRef}
          onClick={handleSave}
          onMouseEnter={() => { if (!savedFeedback && selectedActivities.length > 0) saveTl.current?.restart() }}
          onMouseLeave={() => saveTl.current?.reverse()}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-semibold text-sm transition-colors duration-200"
          style={{
            minHeight: 52,
            background: selectedActivities.length > 0 ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.05)',
            color: selectedActivities.length > 0 ? '#052e16' : 'rgba(255,255,255,0.3)',
            cursor: selectedActivities.length > 0 ? 'pointer' : 'not-allowed',
            willChange: 'transform',
          }}
          disabled={selectedActivities.length === 0}
          suppressHydrationWarning
        >
          <span ref={saveIconRef} style={{ display: 'inline-block' }}>
            {savedFeedback ? <Check size={16} /> : <Save size={16} />}
          </span>
          {savedFeedback ? '¡Guardado!' : 'Guardar itinerario'}
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleShare}
            onMouseEnter={() => { if (!copiedFeedback && selectedActivities.length > 0) shareTl.current?.restart() }}
            onMouseLeave={() => shareTl.current?.reverse()}
            disabled={selectedActivities.length === 0}
            suppressHydrationWarning
            className="relative flex items-center justify-center gap-1.5 py-3.5 rounded-xl text-xs font-medium transition-colors duration-200"
            style={{
              minHeight: 48,
              background: 'rgba(255,255,255,0.06)',
              color: selectedActivities.length > 0 ? 'var(--text-primary)' : 'rgba(255,255,255,0.25)',
              border: '1px solid rgba(255,255,255,0.08)',
              cursor: selectedActivities.length > 0 ? 'pointer' : 'not-allowed',
            }}
          >
            <span
              ref={shareRippleRef}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 36, height: 36,
                top: '50%', left: '50%',
                marginTop: -18, marginLeft: -18,
                border: '1.5px solid var(--accent-emerald)',
                opacity: 0,
              }}
            />
            <span ref={shareIconRef} style={{ display: 'inline-block', position: 'relative' }}>
              {copiedFeedback ? <Check size={13} style={{ color: 'var(--accent-emerald)' }} /> : <Share2 size={13} />}
            </span>
            {copiedFeedback ? '¡Copiado!' : 'Compartir'}
          </button>

          <button
            onClick={handlePrint}
            onMouseEnter={() => { if (selectedActivities.length > 0) printTl.current?.restart() }}
            disabled={selectedActivities.length === 0}
            suppressHydrationWarning
            className="relative flex items-center justify-center gap-1.5 py-3.5 rounded-xl text-xs font-medium transition-colors duration-200 overflow-hidden"
            style={{
              minHeight: 48,
              background: 'rgba(255,255,255,0.06)',
              color: selectedActivities.length > 0 ? 'var(--text-primary)' : 'rgba(255,255,255,0.25)',
              border: '1px solid rgba(255,255,255,0.08)',
              cursor: selectedActivities.length > 0 ? 'pointer' : 'not-allowed',
            }}
          >
            <div
              ref={printBeamRef}
              className="absolute inset-x-0 pointer-events-none"
              style={{
                height: 28,
                top: 0,
                background: 'linear-gradient(180deg, transparent 0%, rgba(52,211,153,0.4) 50%, transparent 100%)',
                transform: 'translateY(-120%)',
                opacity: 0,
              }}
            />
            <Printer size={13} />
            Imprimir
          </button>
        </div>
      </div>
    </div>
  )
}
