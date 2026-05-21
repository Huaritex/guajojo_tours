'use client'

import { useRef, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { gsap } from '@/lib/gsap'
import { useTripStore, Activity as StoreActivity } from '@/store/tripStore'
import activitiesData from '@/data/activities.json'
import { Check, Calendar, MapPin, Clock, ArrowRight } from 'lucide-react'

// Dynamic import of R3F Canvas to prevent SSR hydration warnings
const ActivityParticlesCanvas = dynamic(() => import('./ActivityParticlesCanvas'), { ssr: false })

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
  duration: string
  difficulty: string
}

const ACTIVITIES: Activity[] = [
  {
    id: 'trek-samaipata',
    title: 'Trekking en\nSamaipata',
    category: 'Montaña',
    categoryBg: 'bg-emerald-950/50',
    categoryText: 'text-emerald-400',
    categoryBorder: 'border-emerald-500/20',
    location: 'Samaipata, Santa Cruz',
    price: 'desde $45 USD',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    duration: '8 horas',
    difficulty: 'Moderada',
  },
  {
    id: 'fogata-nocturna',
    title: 'Noche de\nFogata Sagrada',
    category: 'Experiencia',
    categoryBg: 'bg-amber-950/50',
    categoryText: 'text-amber-400',
    categoryBorder: 'border-amber-500/20',
    location: 'Valle Sagrado, Samaipata',
    price: 'desde $35 USD',
    imageUrl: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?auto=format&fit=crop&w=800&q=80',
    duration: '3 horas',
    difficulty: 'Fácil',
  },
  {
    id: 'rappel-luna',
    title: 'Rappel Valle\ndel Luna',
    category: 'Adrenalina',
    categoryBg: 'bg-rose-950/50',
    categoryText: 'text-rose-400',
    categoryBorder: 'border-rose-500/20',
    location: 'Valle de la Luna, Samaipata',
    price: 'desde $60 USD',
    imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80',
    duration: '4 horas',
    difficulty: 'Alta',
  },
  {
    id: 'amboro-cloud',
    title: 'Cloud Forest\nAmboró',
    category: 'Naturaleza',
    categoryBg: 'bg-emerald-950/50',
    categoryText: 'text-emerald-400',
    categoryBorder: 'border-emerald-500/20',
    location: 'Amboró, Santa Cruz',
    price: 'desde $55 USD',
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80',
    duration: '8 horas',
    difficulty: 'Media-Alta',
  },
  {
    id: 'titicaca-kayak',
    title: 'Kayak en\nTiticaca',
    category: 'Agua',
    categoryBg: 'bg-sky-950/50',
    categoryText: 'text-sky-400',
    categoryBorder: 'border-sky-500/20',
    location: 'Lago Titicaca, La Paz',
    price: 'desde $70 USD',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
    duration: '5 horas',
    difficulty: 'Media',
  },
  {
    id: 'stargazing-uyuni',
    title: 'Stargazing\nAltiplano',
    category: 'Nocturno',
    categoryBg: 'bg-violet-950/50',
    categoryText: 'text-violet-400',
    categoryBorder: 'border-violet-500/20',
    location: 'Salar de Uyuni, Potosí',
    price: 'desde $80 USD',
    imageUrl: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=800&q=80',
    duration: '3 horas',
    difficulty: 'Fácil',
  },
]

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export default function GuajojoActivityGrid() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const scrollProgress = useRef({ val: 0 })
  const [mounted, setMounted] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

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

  // Detect component mounting and screen size
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // GSAP ScrollTrigger timeline configuration inside hook lifecycle
  useEffect(() => {
    if (!mounted) return

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.activity-card-step')
      if (cards.length === 0) return

      // Initial layout settings for step cards
      gsap.set(cards.slice(1), { opacity: 0, y: 50, filter: 'blur(10px)', pointerEvents: 'none' })
      gsap.set(cards[0], { opacity: 1, y: 0, filter: 'blur(0px)', pointerEvents: 'auto' })

      // Main GSAP Timeline bound to scroll port
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        },
      })

      // Interpolate the 3D particles val from 0 to 5 over scrollport
      tl.to(
        scrollProgress.current,
        {
          val: 5,
          ease: 'none',
          duration: 5,
        },
        0
      )

      // Animate step cards & step indicator dots
      const stepDuration = 1
      for (let i = 0; i < 5; i++) {
        const start = i * stepDuration

        // Card Fade Out
        tl.to(
          cards[i],
          {
            opacity: 0,
            y: -50,
            filter: 'blur(10px)',
            pointerEvents: 'none',
            duration: 0.45,
            ease: 'power2.inOut',
          },
          start + 0.1
        )

        // Card Fade In
        tl.to(
          cards[i + 1],
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            pointerEvents: 'auto',
            duration: 0.45,
            ease: 'power2.inOut',
          },
          start + 0.55
        )

        // React Active State Callback
        tl.call(
          () => {
            setActiveIndex(i + 1)
          },
          [],
          start + 0.5
        )

        // Reset to previous state if scrolling back
        tl.call(
          () => {
            setActiveIndex(i)
          },
          [],
          start + 0.1
        )

        // Inactive progress dot
        tl.to(
          `.step-dot-inner-${i}`,
          {
            backgroundColor: '#44403c', // stone-700
            scale: 1,
            duration: 0.3,
          },
          start + 0.2
        )

        // Active progress dot
        tl.to(
          `.step-dot-inner-${i + 1}`,
          {
            backgroundColor: '#34d399', // emerald-400
            scale: 1.35,
            duration: 0.3,
          },
          start + 0.45
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [mounted])

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
        addActivity(d, 'morning', catalogActivity as StoreActivity)
        targetDay = d + 1
        targetSlot = 'morning'
        added = true
        break
      } else if (!days[d].afternoon) {
        addActivity(d, 'afternoon', catalogActivity as StoreActivity)
        targetDay = d + 1
        targetSlot = 'afternoon'
        added = true
        break
      }
    }

    if (added) {
      setToast({
        show: true,
        message: `Agregado al Planificador: Día ${targetDay} (${targetSlot === 'morning' ? 'Mañana' : 'Tarde'})`,
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
      gsap.fromTo(
        '#constructor',
        { outline: '2px solid rgba(52, 211, 153, 0)' },
        { outline: '2px solid rgba(52, 211, 153, 0.5)', duration: 0.3, repeat: 3, yoyo: true }
      )
    }
  }

  const scrollToStep = (idx: number) => {
    if (!sectionRef.current) return
    const rect = sectionRef.current.getBoundingClientRect()
    const scrollTop = window.scrollY || document.documentElement.scrollTop
    const sectionTop = rect.top + scrollTop
    const sectionHeight = rect.height
    // Divide section scroll height into 6 steps
    const stepHeight = sectionHeight / 6
    window.scrollTo({
      top: sectionTop + stepHeight * idx + 10,
      behavior: 'smooth',
    })
  }

  return (
    <div ref={sectionRef} id="actividades" className="relative h-[600vh] bg-stone-950 overflow-visible">
      {/* Sticky Inner Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col md:flex-row bg-[#020503]">
        {/* Background Overlay Glows */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25 z-0 transition-all duration-1000"
          style={{
            background: `radial-gradient(circle at 35% 45%, 
              ${
                activeIndex === 0
                  ? 'rgba(52,211,153,0.1)'
                  : activeIndex === 1
                    ? 'rgba(245,158,11,0.1)'
                    : activeIndex === 2
                      ? 'rgba(244,63,94,0.1)'
                      : activeIndex === 3
                        ? 'rgba(16,185,129,0.1)'
                        : activeIndex === 4
                          ? 'rgba(56,189,248,0.1)'
                          : 'rgba(139,92,246,0.1)'
              } 0%, transparent 65%)`,
          }}
        />

        {/* Floating HUD Header */}
        <header className="absolute top-6 left-6 md:left-12 z-30 pointer-events-none">
          <span className="text-[10px] font-mono uppercase tracking-[0.28em] text-emerald-400/90">
            Actividades Modulares
          </span>
          <h2 className="text-xs font-sans font-medium tracking-[0.15em] text-stone-400 uppercase mt-1">
            Storytelling Interactivo
          </h2>
        </header>

        {/* Planner Navigation HUD */}
        <div className="absolute top-6 right-6 md:right-12 z-30 flex items-center gap-4">
          <button
            onClick={scrollToConstructor}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-mono uppercase tracking-wider text-emerald-400 border border-emerald-500/20 bg-emerald-950/20 backdrop-blur-md hover:bg-emerald-500/10 transition-all duration-300 cursor-pointer"
          >
            <Calendar size={12} />
            Ir al Planificador
          </button>
        </div>

        {/* 1. Left Side: WebGL Particle Visualizer */}
        <div className="w-full md:w-[45%] h-[36vh] md:h-full relative border-b md:border-b-0 md:border-r border-stone-900 bg-stone-950/30 flex flex-col justify-center items-center z-10">
          {mounted && (
            <div className="absolute inset-0 z-0">
              <ActivityParticlesCanvas scrollProgressRef={scrollProgress} isMobile={isMobile} />
            </div>
          )}

          {/* Active step tag indicator */}
          <div className="absolute bottom-5 left-6 md:left-12 z-20 pointer-events-none hidden md:block">
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-stone-500 block mb-1">
              Estado Geométrico
            </span>
            <div className="text-xs font-mono font-medium text-emerald-400 tracking-[0.2em] uppercase">
              {ACTIVITIES[activeIndex]?.category || 'ACTIVIDAD'}
            </div>
          </div>
        </div>

        {/* 2. Right Side: Card Narratives overlay */}
        <div className="w-full md:w-[55%] h-[64vh] md:h-full flex items-center justify-center p-4 md:p-12 relative bg-stone-950/15 z-10">
          <div className="relative w-full max-w-md h-[380px] md:h-[450px] flex items-center justify-center">
            {ACTIVITIES.map((activity, i) => (
              <article
                key={activity.id}
                className="activity-card-step absolute w-full h-full flex flex-col justify-between"
                aria-label={activity.title.replace(/\n/g, ' ')}
              >
                <div className="liquid-glass border border-stone-800/70 rounded-3xl p-6 md:p-8 flex flex-col justify-between h-full relative overflow-hidden backdrop-blur-xl shadow-2xl group transition-all duration-500 hover:border-emerald-500/25 hover:shadow-[0_20px_50px_rgba(52,211,153,0.06)]">
                  {/* Decorative background image overlay */}
                  <div
                    className="absolute inset-0 opacity-[0.08] mix-blend-luminosity bg-cover bg-center pointer-events-none group-hover:scale-105 transition-transform duration-[2000ms]"
                    style={{ backgroundImage: `url(${activity.imageUrl})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent pointer-events-none z-0" />

                  {/* Top card header */}
                  <div className="flex items-center justify-between z-10 relative">
                    <span className="inline-block text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-stone-700/60 bg-stone-900/40 text-stone-300">
                      {activity.category}
                    </span>
                    <span className="text-[10px] font-mono text-stone-500 font-semibold tracking-wider">
                      {String(i + 1).padStart(2, '0')} / 06
                    </span>
                  </div>

                  {/* Body information */}
                  <div className="z-10 mt-auto mb-5 space-y-3.5 relative">
                    <h3 className="text-stone-50 font-sans font-semibold text-2xl md:text-3xl leading-[1.18] tracking-tight whitespace-pre-line group-hover:text-emerald-300 transition-colors duration-300">
                      {activity.title}
                    </h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1.5 text-[10px] font-mono text-stone-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1">
                        <MapPin size={11} className="text-emerald-400" />
                        {activity.location.split(',')[0]}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} className="text-emerald-400" />
                        {activity.duration}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400/90 leading-relaxed font-sans font-light mt-2 max-w-sm">
                      {activity.id === 'trek-samaipata' &&
                        'Recorre senderos milenarios entre montañas imponentes y bosques templados, descubriendo la geografía y vistas panorámicas de Samaipata.'}
                      {activity.id === 'fogata-nocturna' &&
                        'Reúnete en torno a una fogata ancestral bajo las estrellas, compartiendo leyendas locales y música en una experiencia mística.'}
                      {activity.id === 'rappel-luna' &&
                        'Desciende en rappel por los acantilados verticales esculpidos por el viento y el tiempo en el enigmático Valle de la Luna.'}
                      {activity.id === 'amboro-cloud' &&
                        'Adéntrate en uno de los ecosistemas más puros de Bolivia, caminando rodeado de helechos gigantes prehistóricos y neblina mágica.'}
                      {activity.id === 'titicaca-kayak' &&
                        'Navega en kayak por las sagradas y cristalinas aguas del Titicaca, experimentando la inmensidad del Altiplano andino.'}
                      {activity.id === 'stargazing-uyuni' &&
                        'Contempla el infinito cosmos reflejado en el suelo del Salar o brillando en el Altiplano, con la mayor nitidez del hemisferio.'}
                    </p>
                  </div>

                  {/* Actions footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-stone-900 z-10 relative">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-mono uppercase tracking-wider text-stone-500">Precio</span>
                      <span className="text-xs font-mono text-stone-200 font-semibold mt-0.5">
                        {activity.price}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddActivity(activity)}
                      className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-full text-[10px] font-mono uppercase tracking-wider text-stone-950 bg-emerald-400 hover:bg-emerald-300 active:scale-95 transition-all duration-300 cursor-pointer shadow-lg shadow-emerald-400/5 hover:shadow-emerald-400/20"
                    >
                      Añadir +
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* 3. Floating Vertical Step Indicators / Dots */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center gap-5.5 z-40">
          <span className="font-mono text-[8px] uppercase tracking-widest text-stone-500 vertical-text mb-2 select-none">
            AVANCE
          </span>
          {ACTIVITIES.map((act, idx) => (
            <button
              key={act.id}
              onClick={() => scrollToStep(idx)}
              className="group relative flex items-center justify-center w-7 h-7 rounded-full focus:outline-none cursor-pointer"
              aria-label={`Ir al paso ${idx + 1}`}
            >
              <div
                className={`absolute inset-0 rounded-full border border-emerald-500/30 scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300`}
              />
              <div
                className={`step-dot-inner-${idx} w-2 h-2 rounded-full transition-all duration-500 ${
                  idx === 0 ? 'bg-emerald-400 scale-[1.35]' : 'bg-stone-700'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* ── Premium Toast Notification ───────────────────────── */}
      <div
        className={[
          'fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl transition-all duration-500 max-w-sm',
          'liquid-glass border-emerald-500/20 flex flex-col gap-2.5 backdrop-blur-2xl',
          toast.show ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none',
        ].join(' ')}
      >
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
            <Check size={12} className="stroke-[3]" />
          </div>
          <div>
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">
              {toast.message}
            </h4>
            <p className="text-xs text-stone-100 mt-1 font-semibold">
              {toast.activityName}
            </p>
          </div>
        </div>
        {toast.activityName !== 'Límite alcanzado' && (
          <button
            onClick={scrollToConstructor}
            className="text-[9px] font-mono uppercase tracking-widest text-left text-stone-400 hover:text-emerald-400 transition-colors duration-200 w-fit cursor-pointer flex items-center gap-1"
          >
            Ver en el planificador <ArrowRight size={10} />
          </button>
        )}
      </div>
    </div>
  )
}
