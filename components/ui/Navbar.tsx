'use client'

import { useRef, useState, useEffect } from 'react'
import { Session, getSession, clearSession } from '@/lib/auth-storage'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  useEffect(() => {
    setSession(getSession())

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useGSAP(() => {
    if (!navRef.current) return

    gsap.set(navRef.current, { y: -80, opacity: 0 })

    ScrollTrigger.create({
      start: 'top -80px',
      onEnter: () =>
        gsap.to(navRef.current, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }),
      onLeaveBack: () =>
        gsap.to(navRef.current, { y: -80, opacity: 0, duration: 0.4, ease: 'power3.in' }),
    })
  }, { scope: navRef })

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const handleLogout = () => {
    clearSession()
    setSession(null)
    setIsDropdownOpen(false)
    window.location.reload()
  }

  return (
    <nav
      ref={navRef}
      className="liquid-glass fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl"
      style={{ width: 'min(92vw, 720px)' }}
    >
      <div className="flex items-center justify-between">
        <span
          className="font-display text-lg font-bold tracking-tight"
          style={{ color: 'var(--accent-gold)' }}
        >
          Guajojó
        </span>

        <div className="hidden md:flex items-center gap-6">
          {['Experiencias', 'Constructor', 'Contacto'].map((item) => (
            <button
              key={item}
              onClick={() => scrollTo(item.toLowerCase())}
              className="text-sm font-medium transition-colors duration-200 cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--text-primary)')}
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.color = 'var(--text-secondary)')
              }
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 relative" ref={dropdownRef}>
          {session ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200 border cursor-pointer text-sm font-medium"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderColor: isDropdownOpen ? 'rgba(212,165,116,0.4)' : 'rgba(255, 255, 255, 0.08)',
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={(e) => {
                  if (!isDropdownOpen) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.15)'
                }}
                onMouseLeave={(e) => {
                  if (!isDropdownOpen) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.08)'
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: 'var(--accent-gold)' }}
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span className="max-w-[100px] truncate">{session.name.split(' ')[0]}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    transform: isDropdownOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s ease',
                    opacity: 0.6,
                  }}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div
                  className="liquid-glass absolute right-0 mt-2 py-2 rounded-xl shadow-xl z-50 flex flex-col min-w-[200px]"
                  style={{
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  <div className="px-4 py-2 border-b border-[rgba(255,255,255,0.06)] mb-1">
                    <p className="text-[10px] font-semibold text-[var(--accent-gold)] tracking-wide uppercase">
                      Mi Perfil
                    </p>
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate mt-1">
                      {session.name}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] truncate">
                      {session.email}
                    </p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors duration-150 hover:bg-[rgba(255,255,255,0.03)] cursor-pointer w-full"
                    style={{ color: '#ff6b6b' }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <a
                href="/login"
                className="hidden md:inline-flex text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200"
                style={{ color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.08)' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'
                }}
              >
                Ingresar
              </a>
              <a
                href="/register"
                className="hidden md:inline-flex text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200"
                style={{ background: 'rgba(212,165,116,0.12)', color: 'var(--accent-gold)', border: '1px solid rgba(212,165,116,0.2)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(212,165,116,0.2)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(212,165,116,0.12)' }}
              >
                Registrate
              </a>
            </>
          )}
          <button
            onClick={() => scrollTo('constructor')}
            className="text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200"
            style={{
              background: 'var(--accent-emerald)',
              color: '#0a0a0a',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.85')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
          >
            Diseñá tu viaje
          </button>
        </div>
      </div>
    </nav>
  )
}
