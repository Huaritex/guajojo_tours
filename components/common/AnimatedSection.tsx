'use client'

import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
  y?: number
  once?: boolean
}

export default function AnimatedSection({
  children,
  className,
  delay = 0,
  y = 50,
  once = true,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!ref.current) return

    gsap.fromTo(
      ref.current,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 82%',
          once,
        },
      }
    )
  }, { scope: ref })

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
