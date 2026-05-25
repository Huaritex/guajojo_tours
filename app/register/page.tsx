import type { Metadata } from 'next'
import RegisterForm from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: 'Crear cuenta — Guajojó Tours',
  description: 'Registrate y comenzá a construir tu aventura en Samaipata, Bolivia.',
}

export default function RegisterPage() {
  return <RegisterForm />
}
