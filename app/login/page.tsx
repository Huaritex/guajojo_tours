import type { Metadata } from 'next'
import LoginForm from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Iniciar sesión — Guajojó Tours',
  description: 'Accedé a tu cuenta y continuá construyendo tu aventura en Samaipata, Bolivia.',
}

export default function LoginPage() {
  return <LoginForm />
}
