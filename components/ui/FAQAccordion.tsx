'use client'

import { useRef, useState } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'

interface FAQItem {
  question: string
  answer: string
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: '¿Qué nivel de condición física necesito?',
    answer:
      'Depende de la ruta. El Fuerte de Samaipata requiere una caminata leve/moderada de acceso. Rutas como Amboró: Ruta del Día o el Circuito de Cascadas exigen una condición física media debido a terrenos irregulares, pendientes y caminatas de hasta 5 a 8 horas en selva húmeda.',
  },
  {
    question: '¿Cómo me aclimo a la altitud en Samaipata?',
    answer:
      'Samaipata se encuentra a unos 1.600–1.650 metros sobre el nivel del mar, una altitud bastante cómoda. Sin embargo, si planeas ascender hacia zonas altas del Parque Nacional Amboró, te recomendamos hidratarte bien el primer día, evitar comidas pesadas y moderar el esfuerzo físico las primeras horas.',
  },
  {
    question: '¿Cuál es la política de reembolso y cancelación?',
    answer:
      'Podés cancelar o modificar tu itinerario sin penalización hasta 48 horas antes del inicio de tu primera actividad programada. Las cancelaciones dentro de las 24 horas previas están sujetas a un cargo del 50% por logística local y reserva de guías nativos.',
  },
  {
    question: '¿Qué equipo debo traer para las actividades?',
    answer:
      'Para caminatas y naturaleza, es imprescindible calzado de trekking con buen agarre, rompevientos, repelente de insectos amigable con el ecosistema, protector solar y una mochila pequeña de 15–20 L con agua (mínimo 1.5 L). Si visitás los viñedos, ropa cómoda y casual es suficiente.',
  },
]

function FAQRow({ item, index }: { item: FAQItem; index: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const chevronRef = useRef<SVGSVGElement>(null)

  function handleToggle() {
    const content = contentRef.current
    if (!content) return

    if (isOpen) {
      gsap.to(content, { height: 0, opacity: 0, duration: 0.3, ease: 'power2.inOut' })
      gsap.to(chevronRef.current, { rotation: 0, duration: 0.3, ease: 'power2.inOut' })
    } else {
      const fullH = content.scrollHeight
      gsap.fromTo(
        content,
        { height: 0, opacity: 0 },
        {
          height: fullH,
          opacity: 1,
          duration: 0.4,
          ease: 'power3.out',
          onComplete: () => { content.style.height = 'auto' },
        },
      )
      gsap.to(chevronRef.current, { rotation: 180, duration: 0.35, ease: 'power2.out' })
    }

    setIsOpen((prev) => !prev)
  }

  const borderColor = isOpen
    ? 'rgba(52, 211, 153, 0.2)'
    : isHovered
      ? 'rgba(255,255,255,0.1)'
      : 'rgba(255,255,255,0.05)'

  return (
    <div
      className="faq-item mb-3 rounded-xl"
      style={{
        background: isOpen ? 'rgba(255,255,255,0.04)' : isHovered ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${borderColor}`,
        boxShadow: isOpen ? '0 0 28px rgba(52,211,153,0.06)' : 'none',
        transition: 'background 0.2s ease, border-color 0.2s ease, box-shadow 0.3s ease',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <div className="flex items-center gap-4 min-w-0">
          <span
            className="font-mono text-xs tabular-nums flex-shrink-0"
            style={{
              color: isOpen ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.2)',
              transition: 'color 0.2s ease',
            }}
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <span
            className="font-sans font-medium text-sm md:text-base leading-snug"
            style={{ color: 'var(--text-primary)' }}
          >
            {item.question}
          </span>
        </div>
        <svg
          ref={chevronRef}
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          aria-hidden="true"
          style={{
            flexShrink: 0,
            color: isOpen ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.3)',
            transition: 'color 0.2s ease',
          }}
        >
          <path
            d="M4.5 6.75 9 11.25l4.5-4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div ref={contentRef} style={{ height: 0, overflow: 'hidden', opacity: 0 }}>
        <p
          className="text-sm leading-relaxed pb-6 pr-6"
          style={{ color: 'var(--text-secondary)', paddingLeft: '3.75rem' }}
        >
          {item.answer}
        </p>
      </div>
    </div>
  )
}

export default function FAQAccordion() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>('.faq-item')
      gsap.from(items, {
        opacity: 0,
        y: 28,
        stagger: 0.1,
        duration: 0.65,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      })
    },
    { scope: sectionRef },
  )

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="py-24 md:py-32 px-6 md:px-10"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="max-w-3xl mx-auto">
        <header className="mb-14">
          <p
            className="text-xs font-mono uppercase tracking-[0.3em] mb-4"
            style={{ color: 'var(--accent-emerald)' }}
          >
            Preguntas Frecuentes
          </p>
          <h2
            className="font-display leading-tight"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--text-primary)' }}
          >
            Todo lo que necesitás{' '}
            <span style={{ color: 'var(--text-secondary)' }}>saber antes de ir</span>
          </h2>
        </header>

        <div>
          {FAQ_ITEMS.map((item, i) => (
            <FAQRow key={i} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
