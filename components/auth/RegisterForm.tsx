'use client'

import { useRef, useState } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { getUsers, saveUsers, saveSession } from '@/lib/auth-storage'

// ── Animation CSS ──────────────────────────────────────────────────────────
const ANIM_CSS = `
  @keyframes reg-blob-1 {
    0%,100%{transform:translate(0,0) scale(1)}
    25%{transform:translate(-70px,45px) scale(1.13)}
    50%{transform:translate(-110px,-25px) scale(0.91)}
    75%{transform:translate(-30px,-70px) scale(1.08)}
  }
  @keyframes reg-blob-2 {
    0%,100%{transform:translate(0,0) scale(1)}
    33%{transform:translate(85px,-55px) scale(1.16)}
    66%{transform:translate(-45px,65px) scale(0.9)}
  }
  @keyframes reg-blob-3 {
    0%,100%{transform:translate(0,0) scale(1)}
    50%{transform:translate(65px,85px) scale(1.1)}
  }
  @keyframes reg-blob-r1 {
    0%,100%{transform:translate(0,0) scale(1)}
    50%{transform:translate(-35px,30px) scale(1.07)}
  }
  @keyframes reg-blob-r2 {
    0%,100%{transform:translate(0,0) scale(1)}
    50%{transform:translate(25px,-45px) scale(0.94)}
  }
  @keyframes reg-badge-1 {
    0%,100%{transform:translateY(0px) rotate(-1deg)}
    50%{transform:translateY(-11px) rotate(1deg)}
  }
  @keyframes reg-badge-2 {
    0%,100%{transform:translateY(0px) rotate(1deg)}
    50%{transform:translateY(-9px) rotate(-1.5deg)}
  }
  @keyframes reg-badge-3 {
    0%,100%{transform:translateY(0px)}
    50%{transform:translateY(-13px)}
  }
  @keyframes reg-line-scan {
    0%{transform:translateX(-100%);opacity:0}
    10%{opacity:1}
    90%{opacity:1}
    100%{transform:translateX(100vw);opacity:0}
  }
  @keyframes reg-glow-pulse {
    0%,100%{opacity:0.35}
    50%{opacity:0.8}
  }
`

// ── Types ──────────────────────────────────────────────────────────────────
interface FormState {
  name: string
  email: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

function validate(f: FormState): FormErrors {
  const e: FormErrors = {}
  if (!f.name.trim()) e.name = 'Ingresá tu nombre'
  else if (f.name.trim().length < 2) e.name = 'Mínimo 2 caracteres'
  if (!f.email.trim()) e.email = 'Ingresá tu correo electrónico'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Correo inválido'
  if (!f.password) e.password = 'Ingresá una contraseña'
  else if (f.password.length < 6) e.password = 'Mínimo 6 caracteres'
  if (!f.confirmPassword) e.confirmPassword = 'Confirmá tu contraseña'
  else if (f.password !== f.confirmPassword) e.confirmPassword = 'Las contraseñas no coinciden'
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

// ── Password strength ──────────────────────────────────────────────────────
function passwordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: 'transparent' }
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { score, label: 'Débil', color: 'rgba(248,113,113,0.8)' }
  if (score === 2) return { score, label: 'Regular', color: 'rgba(245,158,11,0.8)' }
  if (score === 3) return { score, label: 'Buena', color: 'rgba(52,211,153,0.7)' }
  return { score, label: 'Excelente', color: 'var(--accent-emerald)' }
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
        width: '45%',
        background: 'linear-gradient(160deg, #030008 0%, #0a0520 55%, #050310 100%)',
      }}
    >
      {/* Animated blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute rounded-full"
          style={{
            width: '580px', height: '580px',
            top: '-160px', right: '-160px',
            background: 'radial-gradient(circle, rgba(212,165,116,0.18) 0%, rgba(212,165,116,0.04) 45%, transparent 70%)',
            filter: 'blur(75px)',
            animation: 'reg-blob-1 22s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '650px', height: '650px',
            bottom: '-220px', left: '-180px',
            background: 'radial-gradient(circle, rgba(88,28,135,0.35) 0%, rgba(59,7,100,0.15) 50%, transparent 75%)',
            filter: 'blur(60px)',
            animation: 'reg-blob-2 28s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '380px', height: '380px',
            top: '35%', left: '20%',
            background: 'radial-gradient(circle, rgba(245,158,11,0.09) 0%, transparent 70%)',
            filter: 'blur(55px)',
            animation: 'reg-blob-3 19s ease-in-out infinite',
          }}
        />
        {/* Horizontal scan */}
        <div
          className="absolute top-[40%] left-0 h-px"
          style={{
            width: '100%',
            background: 'linear-gradient(to right, transparent, rgba(212,165,116,0.2) 30%, rgba(212,165,116,0.4) 50%, rgba(212,165,116,0.2) 70%, transparent)',
            animation: 'reg-line-scan 10s ease-in-out infinite',
          }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(212,165,116,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(212,165,116,0.02) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        {/* Glow */}
        <div
          className="absolute"
          style={{
            width: '280px', height: '280px',
            top: '15%', right: '15%',
            background: 'radial-gradient(circle, rgba(212,165,116,0.07) 0%, transparent 70%)',
            filter: 'blur(45px)',
            animation: 'reg-glow-pulse 5s ease-in-out infinite',
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
          <p className="text-xs mt-1.5 tracking-[0.35em] uppercase" style={{ color: 'rgba(212,165,116,0.6)' }}>
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
            style={{ fontSize: 'clamp(2.5rem, 4vw, 4.2rem)', color: 'var(--text-primary)' }}
          >
            Tu historia<br />empieza aquí.
          </h2>
          <p className="leading-relaxed" style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '300px' }}>
            Creá tu cuenta y accedé a rutas, experiencias y destinos únicos diseñados para vos en Samaipata.
          </p>
        </div>

        {/* Bottom: features */}
        <div className="flex flex-col gap-4">
          {(
            [
              { icon: '✦', label: 'Rutas personalizadas', anim: 'reg-badge-1 3.2s ease-in-out infinite' },
              { icon: '◈', label: 'Constructor de viajes', anim: 'reg-badge-2 2.8s ease-in-out infinite' },
              { icon: '⬡', label: 'Acceso exclusivo a destinos', anim: 'reg-badge-3 3.6s ease-in-out infinite' },
            ] as const
          ).map(({ icon, label, anim }) => (
            <div
              key={label}
              className="glass-card flex items-center gap-3 px-5 py-3.5 rounded-2xl"
              style={{ animation: anim }}
            >
              <span className="text-lg" style={{ color: 'var(--accent-gold)' }}>{icon}</span>
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right separator */}
      <div
        className="absolute right-0 top-0 bottom-0 w-px"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(212,165,116,0.15) 30%, rgba(212,165,116,0.15) 70%, transparent)',
        }}
      />
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function RegisterForm() {
  const formPanelRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const errorBannerRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  const [form, setForm] = useState<FormState>({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const strength = passwordStrength(form.password)

  useGSAP(() => {
    if (!formPanelRef.current) return
    const ctx = gsap.context(() => {
      gsap.from('.reg-form-content', {
        y: 36, opacity: 0, duration: 0.9, delay: 0.1, ease: 'expo.out',
      })
      gsap.from('.reg-field', {
        y: 18, opacity: 0, duration: 0.7, stagger: 0.07, delay: 0.35, ease: 'power3.out',
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
    gsap.to(errorBannerRef.current, { height: 0, opacity: 0, marginBottom: 0, duration: 0.25, ease: 'power2.in' })
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

    await new Promise((r) => setTimeout(r, 1200))

    const users = getUsers()
    const exists = users.some((u) => u.email === form.email)

    if (exists) {
      setIsLoading(false)
      setErrors({ general: 'Ya existe una cuenta con ese correo. Iniciá sesión.' })
      revealErrorBanner()
      shakeForm()
      return
    }

    const newUser = {
      id: `user_${Date.now()}`,
      name: form.name.trim(),
      email: form.email,
      password: form.password,
      createdAt: new Date().toISOString(),
    }

    saveUsers([...users, newUser])
    saveSession({ id: newUser.id, name: newUser.name, email: newUser.email, createdAt: newUser.createdAt })

    setIsLoading(false)
    setIsSuccess(true)

    if (btnRef.current) {
      gsap.to(btnRef.current, { scale: 1.04, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.inOut' })
    }

    setTimeout(() => { window.location.href = '/' }, 1100)
  }

  function setField<K extends keyof FormState>(key: K, value: string) {
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
        {/* Subtle background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div
            className="absolute rounded-full"
            style={{
              width: '480px', height: '480px',
              top: '-130px', right: '-130px',
              background: 'radial-gradient(circle, rgba(212,165,116,0.04) 0%, transparent 70%)',
              filter: 'blur(55px)',
              animation: 'reg-blob-r1 24s ease-in-out infinite',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: '380px', height: '380px',
              bottom: '-110px', left: '-90px',
              background: 'radial-gradient(circle, rgba(88,28,135,0.05) 0%, transparent 70%)',
              filter: 'blur(50px)',
              animation: 'reg-blob-r2 20s ease-in-out infinite',
            }}
          />
        </div>

        {/* Back link */}
        <a
          href="/login"
          className="absolute top-7 left-7 flex items-center gap-2 transition-all duration-200"
          style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Iniciar sesión
        </a>

        {/* Form content */}
        <div
          className="reg-form-content relative z-10 w-full"
          style={{ maxWidth: '480px' }}
        >
          {/* Mobile brand */}
          <div className="lg:hidden text-center mb-10">
            <p className="font-display text-3xl font-bold" style={{ color: 'var(--accent-gold)' }}>Guajojó Tours</p>
            <p className="text-xs mt-1.5 tracking-[0.25em] uppercase" style={{ color: 'rgba(212,165,116,0.6)' }}>Bolivia</p>
          </div>

          {/* Heading */}
          <div className="reg-field mb-8">
            <h1 className="font-display font-bold leading-tight mb-2" style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', color: 'var(--text-primary)' }}>
              Creá tu<br />cuenta.
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Unite a miles de viajeros que descubren Bolivia
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
            <div className="reg-field">
              <InputField
                id="name"
                label="Tu nombre"
                type="text"
                value={form.name}
                error={errors.name}
                autoComplete="name"
                onChange={(v) => setField('name', v)}
              />
            </div>

            <div className="reg-field">
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

            <div className="reg-field">
              <InputField
                id="password"
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                error={errors.password}
                autoComplete="new-password"
                onChange={(v) => setField('password', v)}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="transition-colors duration-150"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--accent-emerald)')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
                    aria-label={showPassword ? 'Ocultar' : 'Mostrar'}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                }
              />
              {/* Password strength */}
              {form.password.length > 0 && (
                <div className="mt-2 px-1">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-0.5 flex-1 rounded-full transition-all duration-300"
                        style={{
                          background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.08)',
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: strength.color }}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            <div className="reg-field">
              <InputField
                id="confirmPassword"
                label="Confirmá tu contraseña"
                type={showConfirm ? 'text' : 'password'}
                value={form.confirmPassword}
                error={errors.confirmPassword}
                autoComplete="new-password"
                onChange={(v) => setField('confirmPassword', v)}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowConfirm((p) => !p)}
                    className="transition-colors duration-150"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--accent-emerald)')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)')}
                    aria-label={showConfirm ? 'Ocultar' : 'Mostrar'}
                  >
                    <EyeIcon open={showConfirm} />
                  </button>
                }
              />
            </div>

            {/* Submit */}
            <div className="reg-field mt-2">
              <button
                ref={btnRef}
                type="submit"
                disabled={isLoading || isSuccess}
                className="w-full rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center gap-2.5"
                style={{
                  padding: '16px',
                  fontSize: '0.95rem',
                  background: isSuccess
                    ? 'rgba(212,165,116,0.9)'
                    : 'linear-gradient(135deg, var(--accent-gold) 0%, rgba(245,158,11,0.9) 100%)',
                  color: '#0a0a0a',
                  opacity: isLoading ? 0.8 : 1,
                  cursor: isLoading || isSuccess ? 'not-allowed' : 'pointer',
                  boxShadow: isSuccess
                    ? '0 0 40px rgba(212,165,116,0.5)'
                    : '0 6px 24px rgba(212,165,116,0.2)',
                }}
                onMouseEnter={(e) => { if (!isLoading && !isSuccess) (e.currentTarget as HTMLElement).style.opacity = '0.88' }}
                onMouseLeave={(e) => { if (!isLoading && !isSuccess) (e.currentTarget as HTMLElement).style.opacity = '1' }}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Creando cuenta...
                  </>
                ) : isSuccess ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    ¡Cuenta creada!
                  </>
                ) : (
                  'Crear cuenta gratis'
                )}
              </button>
            </div>

            {/* Login link */}
            <p className="reg-field text-center text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              ¿Ya tenés cuenta?{' '}
              <a
                href="/login"
                className="font-semibold transition-colors duration-150"
                style={{ color: 'var(--accent-gold)' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.75')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
              >
                Iniciá sesión
              </a>
            </p>
          </form>

          {/* Terms note */}
          <p
            className="reg-field text-center mt-8 leading-relaxed"
            style={{ fontSize: '0.75rem', color: 'rgba(168,162,158,0.5)' }}
          >
            Al registrarte aceptás nuestros términos de servicio y política de privacidad.
          </p>
        </div>
      </div>
    </div>
  )
}
