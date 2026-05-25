'use client'

import { useRef, useState } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { getUsers, saveSession } from '@/lib/auth-storage'

// ── Animation CSS ──────────────────────────────────────────────────────────
const ANIM_CSS = `
  @keyframes auth-blob-1 {
    0%,100%{transform:translate(0,0) scale(1)}
    25%{transform:translate(70px,-45px) scale(1.12)}
    50%{transform:translate(110px,30px) scale(0.92)}
    75%{transform:translate(25px,75px) scale(1.07)}
  }
  @keyframes auth-blob-2 {
    0%,100%{transform:translate(0,0) scale(1)}
    33%{transform:translate(-90px,60px) scale(1.18)}
    66%{transform:translate(55px,-70px) scale(0.89)}
  }
  @keyframes auth-blob-3 {
    0%,100%{transform:translate(0,0) scale(1)}
    50%{transform:translate(-60px,-90px) scale(1.1)}
  }
  @keyframes auth-blob-r1 {
    0%,100%{transform:translate(0,0) scale(1)}
    50%{transform:translate(40px,-30px) scale(1.08)}
  }
  @keyframes auth-blob-r2 {
    0%,100%{transform:translate(0,0) scale(1)}
    50%{transform:translate(-30px,40px) scale(0.93)}
  }
  @keyframes auth-badge-1 {
    0%,100%{transform:translateY(0px) rotate(-1deg)}
    50%{transform:translateY(-10px) rotate(1deg)}
  }
  @keyframes auth-badge-2 {
    0%,100%{transform:translateY(0px) rotate(1deg)}
    50%{transform:translateY(-12px) rotate(-1deg)}
  }
  @keyframes auth-badge-3 {
    0%,100%{transform:translateY(0px) rotate(-0.5deg)}
    50%{transform:translateY(-8px) rotate(0.5deg)}
  }
  @keyframes auth-line-scan {
    0%{transform:translateY(-100%);opacity:0}
    10%{opacity:1}
    90%{opacity:1}
    100%{transform:translateY(100vh);opacity:0}
  }
  @keyframes auth-glow-pulse {
    0%,100%{opacity:0.4}
    50%{opacity:0.9}
  }
`

// ── Types ──────────────────────────────────────────────────────────────────
interface FormState {
  email: string
  password: string
  remember: boolean
}

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

function validate(f: FormState): FormErrors {
  const e: FormErrors = {}
  if (!f.email.trim()) e.email = 'Ingresá tu correo electrónico'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Correo inválido'
  if (!f.password) e.password = 'Ingresá tu contraseña'
  else if (f.password.length < 6) e.password = 'Mínimo 6 caracteres'
  return e
}

// ── Icons ──────────────────────────────────────────────────────────────────
function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

// ── Input Field ────────────────────────────────────────────────────────────
interface InputFieldProps {
  id: string
  label: string
  type: string
  value: string
  error?: string
  onChange: (v: string) => void
  rightSlot?: React.ReactNode
  autoComplete?: string
}

function InputField({ id, label, type, value, error, onChange, rightSlot, autoComplete }: InputFieldProps) {
  const [focused, setFocused] = useState(false)
  const floating = focused || value.length > 0

  return (
    <div>
      <div
        className="relative rounded-2xl overflow-hidden transition-all duration-200"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${error ? 'rgba(248,113,113,0.45)' : focused ? 'rgba(52,211,153,0.5)' : 'rgba(255,255,255,0.08)'}`,
          boxShadow: focused
            ? error
              ? '0 0 0 3px rgba(248,113,113,0.1)'
              : '0 0 0 3px rgba(52,211,153,0.08), 0 8px 32px rgba(0,0,0,0.3)'
            : 'none',
        }}
      >
        <label
          htmlFor={id}
          className="absolute left-5 pointer-events-none transition-all duration-200 select-none"
          style={{
            top: floating ? '9px' : '50%',
            transform: floating ? 'translateY(0) scale(0.75)' : 'translateY(-50%)',
            transformOrigin: 'left center',
            fontSize: floating ? '0.7rem' : '0.9rem',
            color: error ? 'rgba(248,113,113,0.85)' : focused ? 'var(--accent-emerald)' : 'var(--text-secondary)',
            letterSpacing: floating ? '0.1em' : '0',
            fontWeight: floating ? 500 : 400,
          }}
        >
          {label}
        </label>
        <input
          id={id}
          type={type}
          value={value}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent outline-none text-base"
          style={{
            paddingTop: '28px',
            paddingBottom: '12px',
            paddingLeft: '20px',
            paddingRight: rightSlot ? '48px' : '20px',
            color: 'var(--text-primary)',
            caretColor: 'var(--accent-emerald)',
          }}
        />
        {rightSlot && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">{rightSlot}</div>
        )}
      </div>

      <div
        className="overflow-hidden transition-all duration-250"
        style={{ maxHeight: error ? '28px' : '0', opacity: error ? 1 : 0 }}
      >
        <p className="flex items-center gap-1.5 text-xs mt-2 pl-1" style={{ color: 'rgba(248,113,113,0.85)' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </p>
      </div>
    </div>
  )
}

// ── Left Visual Panel ──────────────────────────────────────────────────────
function VisualPanel() {
  return (
    <div
      className="hidden lg:flex relative flex-shrink-0 flex-col justify-between overflow-hidden"
      style={{
        width: '55%',
        background: 'linear-gradient(160deg, #030a04 0%, #071a0e 55%, #040d07 100%)',
      }}
    >
      {/* Animated gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute rounded-full"
          style={{
            width: '640px', height: '640px',
            top: '-180px', left: '-180px',
            background: 'radial-gradient(circle, rgba(52,211,153,0.2) 0%, rgba(52,211,153,0.05) 45%, transparent 70%)',
            filter: 'blur(70px)',
            animation: 'auth-blob-1 20s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '700px', height: '700px',
            bottom: '-250px', right: '-200px',
            background: 'radial-gradient(circle, rgba(5,78,22,0.7) 0%, rgba(5,46,22,0.3) 50%, transparent 75%)',
            filter: 'blur(55px)',
            animation: 'auth-blob-2 25s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '400px', height: '400px',
            top: '40%', right: '15%',
            background: 'radial-gradient(circle, rgba(212,165,116,0.1) 0%, transparent 70%)',
            filter: 'blur(50px)',
            animation: 'auth-blob-3 17s ease-in-out infinite',
          }}
        />
        {/* Vertical scan line */}
        <div
          className="absolute left-[35%] top-0 w-px h-full"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, rgba(52,211,153,0.15) 30%, rgba(52,211,153,0.3) 50%, rgba(52,211,153,0.15) 70%, transparent 100%)',
            animation: 'auth-line-scan 8s ease-in-out infinite',
          }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(52,211,153,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.025) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
          }}
        />
        {/* Corner glow */}
        <div
          className="absolute"
          style={{
            width: '300px', height: '300px',
            bottom: '10%', left: '10%',
            background: 'radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%)',
            filter: 'blur(40px)',
            animation: 'auth-glow-pulse 4s ease-in-out infinite',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between h-full p-16">
        {/* Brand */}
        <div>
          <p className="font-display text-4xl font-bold tracking-tight" style={{ color: 'var(--accent-gold)' }}>
            Guajojó
          </p>
          <p className="text-xs mt-1.5 tracking-[0.35em] uppercase" style={{ color: 'var(--accent-emerald)' }}>
            Tours · Bolivia
          </p>
        </div>

        {/* Central quote */}
        <div>
          <div
            className="mb-8"
            style={{
              width: '64px', height: '2px',
              background: 'linear-gradient(90deg, var(--accent-gold), transparent)',
            }}
          />
          <h2
            className="font-display font-bold leading-none mb-6"
            style={{ fontSize: 'clamp(3rem, 5vw, 5rem)', color: 'var(--text-primary)' }}
          >
            Descubrí<br />lo invisible.
          </h2>
          <p className="leading-relaxed" style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '320px' }}>
            Cada ruta es una historia. Ingresá a tu cuenta y continuá construyendo tu próxima aventura en el corazón de Bolivia.
          </p>
        </div>

        {/* Bottom: stats + badges */}
        <div className="flex items-end justify-between">
          <div className="flex gap-10">
            {[['12+', 'Destinos'], ['800+', 'Viajeros'], ['8', 'Años']].map(([v, l]) => (
              <div key={l}>
                <p className="font-display text-3xl font-bold" style={{ color: 'var(--accent-emerald)' }}>{v}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{l}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 items-end">
            {(
              [
                { icon: '🏔️', label: 'El Fuerte UNESCO', anim: 'auth-badge-1 3s ease-in-out infinite' },
                { icon: '🌿', label: 'Parque Amboró', anim: 'auth-badge-2 3.8s ease-in-out infinite' },
                { icon: '💧', label: 'Cascadas', anim: 'auth-badge-3 2.6s ease-in-out infinite' },
              ] as const
            ).map(({ icon, label, anim }) => (
              <div
                key={label}
                className="glass-card flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
                style={{ animation: anim }}
              >
                <span>{icon}</span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right separator */}
      <div
        className="absolute right-0 top-0 bottom-0 w-px"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(52,211,153,0.18) 30%, rgba(52,211,153,0.18) 70%, transparent)',
        }}
      />
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function LoginForm() {
  const formPanelRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const errorBannerRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  const [form, setForm] = useState<FormState>({ email: '', password: '', remember: false })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useGSAP(() => {
    if (!formPanelRef.current) return
    const ctx = gsap.context(() => {
      gsap.from('.auth-form-content', {
        y: 36,
        opacity: 0,
        duration: 0.9,
        delay: 0.1,
        ease: 'expo.out',
      })
      gsap.from('.auth-field', {
        y: 18,
        opacity: 0,
        duration: 0.7,
        stagger: 0.07,
        delay: 0.35,
        ease: 'power3.out',
      })
    }, formPanelRef)
    return () => ctx.revert()
  }, { scope: formPanelRef })

  function shakeForm() {
    if (!formRef.current) return
    const tl = gsap.timeline()
    tl.to(formRef.current, { x: -12, duration: 0.06 })
      .to(formRef.current, { x: 12, duration: 0.06 })
      .to(formRef.current, { x: -9, duration: 0.06 })
      .to(formRef.current, { x: 9, duration: 0.06 })
      .to(formRef.current, { x: -5, duration: 0.05 })
      .to(formRef.current, { x: 5, duration: 0.05 })
      .to(formRef.current, { x: 0, duration: 0.05 })
  }

  function revealErrorBanner() {
    if (!errorBannerRef.current) return
    gsap.fromTo(
      errorBannerRef.current,
      { height: 0, opacity: 0, marginBottom: 0 },
      { height: 'auto', opacity: 1, marginBottom: 20, duration: 0.4, ease: 'power2.out' }
    )
  }

  function hideErrorBanner() {
    if (!errorBannerRef.current) return
    gsap.to(errorBannerRef.current, {
      height: 0, opacity: 0, marginBottom: 0, duration: 0.25, ease: 'power2.in',
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationErrors = validate(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      shakeForm()
      return
    }

    setErrors({})
    hideErrorBanner()
    setIsLoading(true)

    await new Promise((r) => setTimeout(r, 1400))

    const DEMO_EMAIL = 'demo@guajojotours.bo'
    const isDemo = form.email === DEMO_EMAIL
    const users = getUsers()
    const matched = users.find((u) => u.email === form.email && u.password === form.password)

    if (!isDemo && !matched) {
      setIsLoading(false)
      setErrors({ general: 'Correo o contraseña incorrectos. Verificá tus datos o creá una cuenta.' })
      revealErrorBanner()
      shakeForm()
      return
    }

    if (matched) {
      saveSession({ id: matched.id, name: matched.name, email: matched.email, createdAt: matched.createdAt })
    } else {
      saveSession({ id: 'demo', name: 'Viajero Demo', email: DEMO_EMAIL, createdAt: new Date().toISOString() })
    }

    setIsLoading(false)
    setIsSuccess(true)

    if (btnRef.current) {
      gsap.to(btnRef.current, { scale: 1.04, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.inOut' })
    }

    setTimeout(() => { window.location.href = '/' }, 1100)
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }))
    }
  }

  return (
    <div className="min-h-screen flex flex-row" style={{ background: '#0a0a0a' }}>
      <style>{ANIM_CSS}</style>

      <VisualPanel />

      {/* Right: Form panel */}
      <div
        ref={formPanelRef}
        className="flex-1 flex flex-col items-center justify-center relative overflow-hidden min-h-screen"
        style={{ padding: 'clamp(2rem, 5vw, 4rem) clamp(1.5rem, 4vw, 3rem)' }}
      >
        {/* Subtle background orbs (right panel) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div
            className="absolute rounded-full"
            style={{
              width: '500px', height: '500px',
              top: '-150px', right: '-150px',
              background: 'radial-gradient(circle, rgba(52,211,153,0.04) 0%, transparent 70%)',
              filter: 'blur(60px)',
              animation: 'auth-blob-r1 22s ease-in-out infinite',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: '400px', height: '400px',
              bottom: '-120px', left: '-100px',
              background: 'radial-gradient(circle, rgba(212,165,116,0.04) 0%, transparent 70%)',
              filter: 'blur(50px)',
              animation: 'auth-blob-r2 18s ease-in-out infinite',
            }}
          />
        </div>

        {/* Back link */}
        <a
          href="/"
          className="absolute top-7 left-7 flex items-center gap-2 transition-all duration-200 group"
          style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Volver
        </a>

        {/* Form content */}
        <div
          className="auth-form-content relative z-10 w-full"
          style={{ maxWidth: '460px' }}
        >
          {/* Mobile brand */}
          <div className="lg:hidden text-center mb-10">
            <p className="font-display text-3xl font-bold" style={{ color: 'var(--accent-gold)' }}>Guajojó Tours</p>
            <p className="text-xs mt-1.5 tracking-[0.25em] uppercase" style={{ color: 'var(--accent-emerald)' }}>Bolivia</p>
          </div>

          {/* Heading */}
          <div className="auth-field mb-10">
            <h1 className="font-display font-bold leading-tight mb-2" style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', color: 'var(--text-primary)' }}>
              Bienvenido<br />de vuelta.
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Ingresá para continuar tu aventura
            </p>
          </div>

          {/* Error banner */}
          <div
            ref={errorBannerRef}
            className="overflow-hidden"
            style={{ height: 0, opacity: 0, marginBottom: 0 }}
          >
            <div
              className="rounded-2xl px-5 py-4 flex items-start gap-3"
              style={{
                background: 'rgba(248,113,113,0.07)',
                border: '1px solid rgba(248,113,113,0.2)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(248,113,113,0.9)" strokeWidth="2" className="mt-0.5 shrink-0">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <p className="text-sm leading-snug" style={{ color: 'rgba(248,113,113,0.85)' }}>
                {errors.general}
              </p>
            </div>
          </div>

          {/* Form */}
          <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div className="auth-field">
              <InputField
                id="email"
                label="Correo electrónico"
                type="email"
                value={form.email}
                error={errors.email}
                autoComplete="email"
                onChange={(v) => setField('email', v)}
              />
            </div>

            <div className="auth-field">
              <InputField
                id="password"
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                error={errors.password}
                autoComplete="current-password"
                onChange={(v) => setField('password', v)}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="transition-colors duration-150"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--accent-emerald)')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                }
              />
            </div>

            {/* Remember + Forgot */}
            <div className="auth-field flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={form.remember}
                    onChange={(e) => setField('remember', e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className="w-5 h-5 rounded-md transition-all duration-150 flex items-center justify-center"
                    style={{
                      background: form.remember ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.05)',
                      border: `1.5px solid ${form.remember ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.15)'}`,
                    }}
                  >
                    {form.remember && (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Recordarme</span>
              </label>

              <button
                type="button"
                className="text-sm transition-colors duration-150"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--accent-emerald)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Submit */}
            <div className="auth-field mt-2">
              <button
                ref={btnRef}
                type="submit"
                disabled={isLoading || isSuccess}
                className="w-full rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center gap-2.5"
                style={{
                  padding: '16px',
                  fontSize: '0.95rem',
                  background: isSuccess ? 'rgba(52,211,153,0.88)' : 'var(--accent-emerald)',
                  color: '#0a0a0a',
                  opacity: isLoading ? 0.8 : 1,
                  cursor: isLoading || isSuccess ? 'not-allowed' : 'pointer',
                  boxShadow: isSuccess
                    ? '0 0 40px rgba(52,211,153,0.5)'
                    : '0 6px 24px rgba(52,211,153,0.25)',
                }}
                onMouseEnter={(e) => { if (!isLoading && !isSuccess) (e.currentTarget as HTMLElement).style.opacity = '0.88' }}
                onMouseLeave={(e) => { if (!isLoading && !isSuccess) (e.currentTarget as HTMLElement).style.opacity = '1' }}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Verificando...
                  </>
                ) : isSuccess ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    ¡Bienvenido!
                  </>
                ) : (
                  'Iniciar sesión'
                )}
              </button>
            </div>

            {/* Register link */}
            <p className="auth-field text-center text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              ¿No tenés cuenta?{' '}
              <a
                href="/register"
                className="font-semibold transition-colors duration-150"
                style={{ color: 'var(--accent-emerald)' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.75')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
              >
                Registrate gratis
              </a>
            </p>
          </form>

          {/* Demo hint */}
          <div
            className="auth-field mt-8 px-4 py-3 rounded-2xl text-center"
            style={{
              background: 'rgba(52,211,153,0.04)',
              border: '1px solid rgba(52,211,153,0.1)',
            }}
          >
            <p className="text-xs" style={{ color: 'rgba(52,211,153,0.55)' }}>
              Demo:{' '}
              <span style={{ color: 'rgba(52,211,153,0.8)' }}>demo@guajojotours.bo</span>
              {' '}· cualquier contraseña
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
