'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'

interface TextRotatorProps {
  words: string[]
  intervalMs?: number
}

export default function TextRotator({ words, intervalMs = 2500 }: TextRotatorProps) {
  const [index, setIndex] = useState(0)
  const [text1, setText1] = useState(words[0])
  const [text2, setText2] = useState("")
  const [isText1Active, setIsText1Active] = useState(true)

  const text1Ref = useRef<HTMLSpanElement>(null)
  const text2Ref = useRef<HTMLSpanElement>(null)
  const containerRef = useRef<HTMLSpanElement>(null)

  // Find the longest word dynamically to prevent container width jumping
  const longestWord = words.reduce((a, b) => (a.length > b.length ? a : b), "")

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length)
    }, intervalMs)

    return () => clearInterval(timer)
  }, [words.length, intervalMs])

  useEffect(() => {
    // Skip initial setup trigger
    if (index === 0 && text1 === words[0] && text2 === "") {
      return
    }

    const nextWord = words[index]

    if (isText1Active) {
      setText2(nextWord)
      setIsText1Active(false)
    } else {
      setText1(nextWord)
      setIsText1Active(true)
    }
  }, [index, words])

  // GSAP animation triggered when active state switches
  useGSAP(
    () => {
      // Set initial width only on initial mount/render
      if (index === 0 && text2 === "") {
        if (containerRef.current && text1Ref.current) {
          gsap.set(containerRef.current, { width: text1Ref.current.offsetWidth })
        }
        return
      }

      // Animate container width to match the incoming active word smoothly
      const activeTextRef = !isText1Active ? text2Ref : text1Ref
      if (activeTextRef.current && containerRef.current) {
        const targetWidth = activeTextRef.current.offsetWidth
        gsap.to(containerRef.current, {
          width: targetWidth,
          duration: 0.5,
          ease: 'power2.inOut',
        })
      }

      if (!isText1Active) {
        // Text 1 moves UP out of view
        gsap.to(text1Ref.current, {
          y: -20,
          opacity: 0,
          duration: 0.5,
          ease: 'power2.inOut',
        })

        // Text 2 enters from BELOW to center
        gsap.fromTo(
          text2Ref.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power2.inOut' }
        )
      } else {
        // Text 2 moves UP out of view
        gsap.to(text2Ref.current, {
          y: -20,
          opacity: 0,
          duration: 0.5,
          ease: 'power2.inOut',
        })

        // Text 1 enters from BELOW to center
        gsap.fromTo(
          text1Ref.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power2.inOut' }
        )
      }
    },
    { dependencies: [isText1Active], scope: containerRef }
  )

  return (
    <span
      ref={containerRef}
      className="relative inline-flex overflow-hidden align-bottom text-left"
      style={{ height: '1.2em', verticalAlign: 'bottom' }}
    >
      {/* Invisible spacer to reserve width (renders active text so DOM width behaves predictably before GSAP takes over) */}
      <span className="invisible select-none pointer-events-none pr-1">
        {isText1Active ? text1 : text2}
      </span>

      {/* Primary animating text slot */}
      <span
        ref={text1Ref}
        className="absolute left-0 top-0 whitespace-nowrap"
        style={{ color: 'var(--accent-gold)', transform: 'translateY(0px)', opacity: 1 }}
      >
        {text1}
      </span>

      {/* Secondary animating text slot */}
      <span
        ref={text2Ref}
        className="absolute left-0 top-0 whitespace-nowrap"
        style={{ color: 'var(--accent-gold)', transform: 'translateY(20px)', opacity: 0 }}
      >
        {text2}
      </span>
    </span>
  )
}
