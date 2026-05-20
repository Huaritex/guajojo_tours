'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState, useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import HeroText from './HeroText'

const ParticleBackground = dynamic(() => import('./ParticleBackground'), {
  ssr: false,
  loading: () => (
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(ellipse at 50% 60%, #052e16 0%, #0a0a0a 70%)',
      }}
    />
  ),
})

export default function HeroSection() {
  const [isMobile, setIsMobile] = useState(false)
  const heroRef = useRef<HTMLElement>(null)
  const canvasWrapRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useGSAP(() => {
    if (!heroRef.current || !canvasWrapRef.current) return

    gsap.to(canvasWrapRef.current, {
      scale: 1.15,
      scrollTrigger: {
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
      },
    })

    if (overlayRef.current) {
      gsap.to(overlayRef.current, {
        opacity: 1,
        scrollTrigger: {
          trigger: heroRef.current,
          start: '40% top',
          end: 'bottom top',
          scrub: 1,
        },
      })
    }
  }, { scope: heroRef })

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* 3D Background */}
      <div
        ref={canvasWrapRef}
        className="absolute inset-0 will-change-transform"
        style={{ transformOrigin: 'center center' }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 70%, rgba(5,46,22,0.6) 0%, transparent 65%)',
            zIndex: 1,
          }}
        />
        {!isMobile && (
          <ParticleBackground isMobile={false} />
        )}
        {isMobile && (
          <div className="absolute inset-0 overflow-hidden" style={{ background: '#0a0a0a' }}>
            <svg
              viewBox="0 0 390 844"
              xmlns="http://www.w3.org/2000/svg"
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
              style={{ position: 'absolute', inset: 0 }}
            >
              <defs>
                <radialGradient id="mob-glow" cx="50%" cy="45%" r="55%">
                  <stop offset="0%" stopColor="#064e3b" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#0a0a0a" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="mob-moon" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fafaf9" stopOpacity="1" />
                  <stop offset="60%" stopColor="#d4a574" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#d4a574" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="390" height="844" fill="#0a0a0a" />
              <rect width="390" height="844" fill="url(#mob-glow)" />
              {/* Stars */}
              {[
                [58, 80, 1.2], [140, 55, 1.0], [220, 70, 1.4], [310, 45, 1.1],
                [370, 90, 0.9], [95, 130, 0.8], [175, 105, 1.1], [255, 95, 0.9],
                [335, 115, 1.3], [42, 155, 0.7], [200, 140, 1.0], [360, 150, 0.8],
                [120, 175, 0.9], [280, 168, 1.1], [70, 200, 0.7], [320, 185, 0.8],
              ].map(([cx, cy, r], i) => (
                <circle key={i} cx={cx} cy={cy} r={r}
                  fill={i % 4 === 0 ? '#fafaf9' : '#d4a574'}
                  opacity={0.5 + (i % 3) * 0.2} />
              ))}
              {/* Moon */}
              <circle cx="310" cy="160" r="22" fill="url(#mob-moon)" />
              <circle cx="310" cy="160" r="18" fill="#fafaf9" opacity="0.06" />
              {/* Guajojó bird silhouette — branch + bird on branch */}
              <line x1="180" y1="300" x2="250" y2="290" stroke="#0d2e15" strokeWidth="3.5" />
              <path d="M 205 290 C 200 270, 195 260, 208 255 C 215 252, 220 258, 218 265 C 225 258, 232 252, 235 260 C 237 268, 230 274, 220 278 C 228 272, 232 278, 228 284 C 224 290, 212 290, 205 290 Z"
                fill="#071a0e" />
              {/* Back mountains */}
              <path d="M -20 844 L 0 580 L 60 490 L 130 440 L 195 430 L 260 445 L 330 475 L 390 510 L 410 844 Z"
                fill="#041209" />
              <path d="M -20 844 L 20 610 L 100 530 L 170 510 L 195 505 L 220 510 L 290 535 L 370 575 L 410 600 L 410 844 Z"
                fill="#06180f" />
              {/* Mid mountains */}
              <path d="M -20 844 L 0 660 L 70 590 L 150 560 L 195 555 L 240 562 L 310 595 L 390 640 L 410 844 Z"
                fill="#072010" />
              {/* Forest treeline */}
              <path d="M -20 844 L -10 730 L 20 720 L 50 710 L 80 718 L 110 705 L 140 698 L 170 706 L 195 700 L 220 706 L 248 697 L 278 704 L 308 712 L 335 705 L 365 715 L 390 710 L 410 724 L 410 844 Z"
                fill="#082614" />
              {/* Foreground forest detail */}
              <path d="M -20 844 L 0 780 L 40 765 L 80 755 L 120 762 L 160 748 L 195 744 L 230 750 L 270 755 L 310 748 L 350 758 L 390 752 L 410 762 L 410 844 Z"
                fill="#0a2f18" />
            </svg>
          </div>
        )}
      </div>

      {/* Fade-out overlay on scroll */}
      <div
        ref={overlayRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'var(--bg-secondary)',
          opacity: 0,
          zIndex: 2,
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.7) 100%)',
          zIndex: 3,
        }}
      />

      {/* Text content */}
      <div className="relative z-10 w-full flex items-center justify-center min-h-screen pt-20">
        <HeroText />
      </div>
    </section>
  )
}
