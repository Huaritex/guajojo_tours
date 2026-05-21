'use client'

import { useRef, useEffect, useState } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { useTripStore } from '@/store/tripStore'
import activitiesData from '@/data/activities.json'
import { Check, Calendar } from 'lucide-react'

// ─────────────────────────────────────────────────────────────
// Types & Data
// ─────────────────────────────────────────────────────────────

interface Activity {
  id: string
  title: string
  category: string
  categoryBg: string
  categoryText: string
  categoryBorder: string
  location: string
  price: string
  imageUrl: string
  aspectClass: string
  offsetClass: string
}

const ACTIVITIES: Activity[] = [
  {
    id: 'trek-samaipata',
    title: 'Trekking en\nSamaipata',
    category: 'Montaña',
    categoryBg: 'bg-emerald-950/40',
    categoryText: 'text-emerald-400',
    categoryBorder: 'border-emerald-800/40',
    location: 'Samaipata, Santa Cruz',
    price: 'desde $45 USD',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    aspectClass: 'aspect-[3/4]',
    offsetClass: '',
  },
  {
    id: 'fogata-nocturna',
    title: 'Noche de\nFogata Sagrada',
    category: 'Experiencia',
    categoryBg: 'bg-amber-950/40',
    categoryText: 'text-amber-400',
    categoryBorder: 'border-amber-800/40',
    location: 'Valle Sagrado',
    price: 'desde $35 USD',
    imageUrl: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?auto=format&fit=crop&w=800&q=80',
    aspectClass: 'aspect-[4/5]',
    offsetClass: 'lg:translate-y-16 md:translate-y-8',
  },
  {
    id: 'rappel-luna',
    title: 'Rappel Valle\ndel Luna',
    category: 'Adrenalina',
    categoryBg: 'bg-rose-950/40',
    categoryText: 'text-rose-400',
    categoryBorder: 'border-rose-900/40',
    location: 'Valle de la Luna',
    price: 'desde $60 USD',
    imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80',
    aspectClass: 'aspect-[3/4]',
    offsetClass: 'lg:translate-y-6',
  },
  {
    id: 'amboro-cloud',
    title: 'Cloud Forest\nAmboró',
    category: 'Naturaleza',
    categoryBg: 'bg-green-950/40',
    categoryText: 'text-green-400',
    categoryBorder: 'border-green-900/40',
    location: 'Amboró, Santa Cruz',
    price: 'desde $55 USD',
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80',
    aspectClass: 'aspect-[5/4]',
    offsetClass: 'lg:-translate-y-6 md:row-span-2',
  },
  {
    id: 'titicaca-kayak',
    title: 'Kayak en\nTiticaca',
    category: 'Agua',
    categoryBg: 'bg-sky-950/40',
    categoryText: 'text-sky-400',
    categoryBorder: 'border-sky-900/40',
    location: 'Lago Titicaca',
    price: 'desde $70 USD',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
    aspectClass: 'aspect-[3/4]',
    offsetClass: 'lg:translate-y-20 md:translate-y-10',
  },
  {
    id: 'stargazing-uyuni',
    title: 'Stargazing\nAltiplano',
    category: 'Nocturno',
    categoryBg: 'bg-violet-950/40',
    categoryText: 'text-violet-400',
    categoryBorder: 'border-violet-900/40',
    location: 'Salar de Uyuni',
    price: 'desde $80 USD',
    imageUrl: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=800&q=80',
    aspectClass: 'aspect-[4/5]',
    offsetClass: 'lg:translate-y-12',
  },
]

function DragDotsIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="2.5" cy="2.5" r="1" fill="rgb(161 161 170)" />
      <circle cx="7.5" cy="2.5" r="1" fill="rgb(161 161 170)" />
      <circle cx="2.5" cy="7.5" r="1" fill="rgb(161 161 170)" />
      <circle cx="7.5" cy="7.5" r="1" fill="rgb(161 161 170)" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export default function GuajojoActivityGrid() {
  const sectionRef = useRef<HTMLElement>(null)
  
  // Trip Planner Integration Store Actions
  const addActivity = useTripStore((s) => s.addActivity)
  const days = useTripStore((s) => s.days)

  // Floating Toast Notification State
  const [toast, setToast] = useState<{
    show: boolean
    message: string
    activityName: string
  }>({
    show: false,
    message: '',
    activityName: '',
  })

  // GSAP animation & strict cleanup inside lifecycle hook
  useEffect(() => {
    // Registering plugins inside the GSAP context
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.activity-card')

      // Set initial scale to allow parallax buffer without showing white edges
      gsap.set('.parallax-img', { scale: 1.25 })

      cards.forEach((card, i) => {
        const img = card.querySelector<HTMLElement>('.parallax-img')

        // ── Card Entry Animation: fade + lift, staggered ──
        gsap.from(card, {
          opacity: 0,
          y: 45,
          duration: 0.9,
          ease: 'power3.out',
          delay: (i % 3) * 0.1,
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        })

        // ── Parallax Image Scrub Animation ──
        if (!img) return
        gsap.fromTo(
          img,
          { yPercent: -15 },
          {
            yPercent: 15,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          },
        )
      })
    }, sectionRef)

    // Strict cleanup to prevent memory leaks
    return () => ctx.revert()
  }, [])

  // Action: Add to Trip Constructor
  const handleAddActivity = (act: Activity) => {
    // Map grid activities to catalog activities JSON
    const mapping: Record<string, string> = {
      'trek-samaipata': 'amboro-day',
      'fogata-nocturna': 'noche-estrellas',
      'rappel-luna': 'cascadas',
      'amboro-cloud': 'amboro-day',
      'titicaca-kayak': 'cascadas',
      'stargazing-uyuni': 'noche-estrellas',
    }

    const targetCatalogId = mapping[act.id] || 'fuerte'
    const catalogActivity = activitiesData.activities.find((a) => a.id === targetCatalogId)

    if (!catalogActivity) return

    // Find the first empty slot in the timeline
    let added = false
    let targetDay = 0
    let targetSlot: 'morning' | 'afternoon' = 'morning'

    for (let d = 0; d < days.length; d++) {
      if (!days[d].morning) {
        addActivity(d, 'morning', catalogActivity as any)
        targetDay = d + 1
        targetSlot = 'morning'
        added = true
        break
      } else if (!days[d].afternoon) {
        addActivity(d, 'afternoon', catalogActivity as any)
        targetDay = d + 1
        targetSlot = 'afternoon'
        added = true
        break
      }
    }

    if (added) {
      setToast({
        show: true,
        message: `Agregado al Constructor: Día ${targetDay} (${targetSlot === 'morning' ? 'Mañana' : 'Tarde'})`,
        activityName: catalogActivity.name,
      })

      // Auto-hide toast after 4.5 seconds
      setTimeout(() => {
        setToast((prev) => (prev.activityName === catalogActivity.name ? { ...prev, show: false } : prev))
      }, 4500)
    } else {
      setToast({
        show: true,
        message: 'El planificador está completo. Remueve una actividad para añadir otra.',
        activityName: 'Límite alcanzado',
      })
      setTimeout(() => {
        setToast((prev) => (prev.activityName === 'Límite alcanzado' ? { ...prev, show: false } : prev))
      }, 4500)
    }
  }

  const scrollToConstructor = () => {
    const el = document.getElementById('constructor')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
      setToast((prev) => ({ ...prev, show: false }))
      
      // Temporary animation on constructor container
      gsap.fromTo('#constructor', 
        { outline: '2px solid rgba(52, 211, 153, 0)' },
        { outline: '2px solid rgba(52, 211, 153, 0.5)', duration: 0.3, repeat: 3, yoyo: true }
      )
    }
  }

  return (
    <section
      ref={sectionRef}
      id="actividades"
      className="relative py-24 md:py-32 px-6 md:px-10 lg:px-16 bg-stone-950 overflow-hidden pb-44 lg:pb-56"
    >
      {/* Background gradients */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle at 10% 20%, rgba(52,211,153,0.06) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(212,165,116,0.06) 0%, transparent 50%)',
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* ── Header ─────────────────────────────────────────── */}
        <header className="mb-14 md:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-xs font-mono uppercase tracking-[0.3em] mb-4 text-emerald-400">
              Actividades Modulares
            </p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.08] text-stone-50">
              Elige tus bloques.{' '}
              <span className="text-stone-400 block sm:inline">
                Construye tu aventura.
              </span>
            </h2>
            <p className="text-sm md:text-base text-stone-400 mt-4 leading-relaxed">
              Cada actividad es un módulo independiente diseñado para integrarse. Combínalas a tu gusto y sincronízalas en tu planificador personalizado.
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={() => {
                const el = document.getElementById('constructor')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs font-mono uppercase tracking-wider text-emerald-400 border border-emerald-900/60 bg-emerald-950/10 hover:bg-emerald-950/30 transition-all duration-300 hover:border-emerald-500/50"
            >
              <Calendar size={14} />
              Ir al Planificador
            </button>
          </div>
        </header>

        {/* ── Asymmetric card grid ────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-start">
          {ACTIVITIES.map((activity, i) => (
            <article
              key={activity.id}
              className={[
                'activity-card group relative overflow-hidden rounded-2xl',
                'cursor-grab active:cursor-grabbing select-none',
                'border border-stone-900 bg-stone-900/10 hover:border-stone-800/80',
                'transition-[border-color,box-shadow] duration-500',
                'hover:shadow-[0_30px_70px_rgba(0,0,0,0.6)]',
                activity.aspectClass,
                activity.offsetClass,
              ].join(' ')}
              aria-label={activity.title.replace(/\n/g, ' ')}
            >
              {/* Parallax image — GSAP manages scale + yPercent */}
              <div className="parallax-img absolute inset-0 will-change-transform overflow-hidden">
                <img
                  src={activity.imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                  loading={i === 0 ? 'eager' : 'lazy'}
                  draggable={false}
                />
              </div>

              {/* Dark dramatic overlay */}
              <div
                className="absolute inset-0 z-10 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(to top, rgba(12, 10, 9, 0.95) 0%, rgba(12, 10, 9, 0.4) 50%, rgba(12, 10, 9, 0.05) 100%)',
                }}
              />

              {/* Hover sheen/glow */}
              <div className="absolute inset-0 z-10 pointer-events-none bg-white/0 group-hover:bg-white/[0.015] transition-colors duration-700" />

              {/* Content wrapper */}
              <div className="absolute inset-x-0 bottom-0 z-20 p-6 space-y-3.5">
                
                <div className="flex items-center justify-between">
                  {/* Category badge */}
                  <span className={`inline-block text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${activity.categoryBg} ${activity.categoryText} ${activity.categoryBorder}`}>
                    {activity.category}
                  </span>
                  
                  {/* Drag affordance badge */}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-950/60 border border-stone-800/40 backdrop-blur-sm">
                    <DragDotsIcon />
                    <span className="text-[8px] font-mono text-stone-400 uppercase tracking-wider leading-none">
                      Arrastrable
                    </span>
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-stone-50 font-sans font-semibold text-2xl leading-[1.2] tracking-tight whitespace-pre-line group-hover:text-emerald-300 transition-colors duration-300">
                  {activity.title}
                </h3>

                {/* Location */}
                <p className="text-[11px] font-mono uppercase tracking-widest text-stone-400">
                  📍 {activity.location}
                </p>

                {/* Footer bar */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-800/50">
                  <span className="text-xs font-mono text-stone-400 font-medium">
                    {activity.price}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddActivity(activity)}
                    aria-label={`Agregar ${activity.title.replace(/\n/g, ' ')} al planificador`}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-400 hover:text-stone-950 hover:border-emerald-400 transition-all duration-300 text-base font-semibold leading-none cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* ── Premium Toast Notification ───────────────────────── */}
      <div
        className={[
          'fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-2xl transition-all duration-500 max-w-sm',
          'liquid-glass border-emerald-500/30 flex flex-col gap-2.5',
          toast.show ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none',
        ].join(' ')}
      >
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
            <Check size={12} className="stroke-[3]" />
          </div>
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400">
              {toast.message}
            </h4>
            <p className="text-xs text-stone-300 mt-1 font-semibold">
              {toast.activityName}
            </p>
          </div>
        </div>
        {toast.activityName !== 'Límite alcanzado' && (
          <button
            onClick={scrollToConstructor}
            className="text-[10px] font-mono uppercase tracking-widest text-left text-stone-400 hover:text-emerald-400 transition-colors duration-200 w-fit cursor-pointer flex items-center gap-1"
          >
            Ver en calendario →
          </button>
        )}
      </div>
    </section>
  )
}
