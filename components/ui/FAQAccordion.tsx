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
      'Las actividades están clasificadas en tres niveles de dificultad. Nivel 1 (Suave): apto para cualquier persona sin experiencia previa, incluidos adultos mayores y niños. Nivel 2 (Moderado): requiere buena condición física básica y comodidad al caminar por terrenos irregulares durante 3-5 horas. Nivel 3 (Exigente): requiere experiencia en trekking y excelente condición física. Cada actividad en el planificador muestra su nivel claramente.',
  },
  {
    question: '¿Cómo me aclimato a la altitud en Samaipata?',
    answer:
      'Samaipata se encuentra a 1.650 m.s.n.m., una altitud manejable para la mayoría. Si vienes desde el nivel del mar, recomendamos llegar un día antes de iniciar actividades intensas, mantenerte hidratado (al menos 2 litros de agua/día), evitar alcohol las primeras 24 horas y consumir mate de coca si lo deseas. Para el Altiplano (Uyuni, 3.650 m.s.n.m.), el proceso de aclimatación es más importante y te asesoramos con un protocolo específico.',
  },
  {
    question: '¿Cuál es la política de reembolso y cancelación?',
    answer:
      'Cancelación con más de 72 horas de anticipación: reembolso completo. Entre 24 y 72 horas: reembolso del 50%. Menos de 24 horas o no-show: sin reembolso. En casos de clima extremo que impida la actividad, ofrecemos reprogramación sin costo o reembolso completo según tu preferencia. Para grupos de más de 8 personas aplican condiciones especiales — contáctanos directamente.',
  },
  {
    question: '¿Qué equipo debo traer para las actividades?',
    answer:
      'Lo esencial para cualquier actividad: calzado cómodo de suela antideslizante, protector solar FPS 50+, repelente, agua (al menos 1.5 litros), y ropa en capas (mañanas frescas, tardes calurosas). Para trekking: bastones opcionales y mochila pequeña. Para actividades nocturnas: linterna frontal y ropa térmica. Para cascadas: traje de baño y sandalias acuáticas. El checklist de equipaje personalizado en el planificador se actualiza según tus actividades elegidas.',
  },
]

function FAQRow({ item }: { item: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false)
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

  return (
    <div className="faq-item border-b" style={{ borderColor: 'var(--glass-border)' }}>
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        style={{ color: 'var(--text-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <span className="font-sans font-medium text-sm md:text-base leading-snug">
          {item.question}
        </span>
        <svg
          ref={chevronRef}
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          aria-hidden="true"
          style={{ flexShrink: 0, color: 'var(--accent-emerald)' }}
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
        <p className="text-sm leading-relaxed pb-5" style={{ color: 'var(--text-secondary)' }}>
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
        y: 16,
        stagger: 0.07,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 82%',
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
        <header className="mb-12">
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
            <FAQRow key={i} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
