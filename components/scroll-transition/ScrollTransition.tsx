'use client'

import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import StorytellingCards from './StorytellingCards'

export default function ScrollTransition() {
  const sectionRef = useRef<HTMLElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!sectionRef.current || !bgRef.current) return

    gsap.fromTo(
      bgRef.current,
      { opacity: 0 },
      {
        opacity: 1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 90%',
          end: 'top 30%',
          scrub: 1,
        },
      }
    )
  }, { scope: sectionRef })

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Color field transition */}
      <div
        ref={bgRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)',
          opacity: 0,
        }}
      />

      <div className="relative z-10">
        <StorytellingCards />
      </div>
    </section>
  )
}
