'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { BrandMark, NoticeBanner } from '@/components/brand'
import { ErrorState, GoldButton, inputClass } from '@/components/ui-bits'
import { apiRequest, setToken } from '@/lib/api'

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const isRegister = mode === 'register'

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)
    const body: Record<string, string> = {
      email: String(form.get('email') || '').trim(),
      password: String(form.get('password') || ''),
    }
    if (isRegister) {
      const fullName = String(form.get('full_name') || '').trim()
      const phone = String(form.get('phone') || '').trim()
      if (fullName) body.full_name = fullName
      if (phone) body.phone = phone
    }
    setLoading(true)
    try {
      const res = await apiRequest<{ token: string }>(`/auth/${mode}`, {
        method: 'POST',
        body,
        auth: false,
      })
      setToken(res.token)
      router.replace('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <NoticeBanner />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <BrandMark className="[&_span]:text-2xl" />
            <h1 className="font-serif text-2xl font-semibold text-foreground">
              {isRegister ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isRegister ? 'Register to start building your vault.' : 'Sign in to access your vault.'}
            </p>
          </div>
          <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-xl border border-bronze bg-card p-6">
            {error ? <ErrorState message={error} /> : null}
            {isRegister ? (
              <Field label="Full name" name="full_name" autoComplete="name" />
            ) : null}
            <Field label="Email" name="email" type="email" autoComplete="email" required />
            {isRegister ? (
              <Field label="Phone" name="phone" type="tel" autoComplete="tel" />
            ) : null}
            <Field
              label="Password"
              name="password"
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              required
              minLength={isRegister ? 6 : undefined}
            />
            <GoldButton type="submit" loading={loading} className="mt-2 w-full">
              {isRegister ? 'Create account' : 'Sign in'}
            </GoldButton>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <Link href={isRegister ? '/login' : '/register'} className="text-gold hover:underline">
              {isRegister ? 'Sign in' : 'Register'}
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}

function Field({
  label,
  name,
  ...props
}: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <input name={name} className={inputClass} {...props} />
    </label>
  )
}
