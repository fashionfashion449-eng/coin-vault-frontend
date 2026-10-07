'use client'

import useSWR from 'swr'
import { fetcher, getToken } from '@/lib/api'

export type Me = {
  id?: string | number
  email?: string
  full_name?: string
  is_admin?: number | boolean | string
}

export type AdminUser = {
  id: string | number
  email: string
  full_name?: string
  phone?: string
  balance?: number | string
  cards_owned?: number | string
  card_count?: number | string
  created_at?: string
}

export type AdminDeposit = {
  id: string | number
  user_id?: string | number
  email?: string
  user_email?: string
  amount: number | string
  method?: string
  reference?: string
  status?: string
  created_at?: string
}

export type BalanceLogEntry = {
  id: string | number
  delta?: number | string
  amount?: number | string
  reason?: string
  balance_after?: number | string
  created_at?: string
}

type MeRes = Me & { user?: Me }

export function isAdmin(user: Me | undefined | null) {
  if (!user) return false
  const flag = user.is_admin
  return flag === true || Number(flag) === 1
}

export function useMe() {
  const hasToken = typeof window !== 'undefined' && !!getToken()
  const { data, error, isLoading } = useSWR<MeRes>(hasToken ? '/auth/me' : null, fetcher)
  const user: Me | undefined = data ? (data.user ?? data) : undefined
  return { user, error, isLoading: isLoading || (hasToken && !data && !error) }
}

export function asArray<T>(value: unknown, ...keys: string[]): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === 'object') {
    for (const key of keys) {
      const v = (value as Record<string, unknown>)[key]
      if (Array.isArray(v)) return v as T[]
    }
  }
  return []
}

export function pick(obj: unknown, ...keys: string[]): unknown {
  if (!obj || typeof obj !== 'object') return undefined
  for (const key of keys) {
    const v = (obj as Record<string, unknown>)[key]
    if (v !== undefined && v !== null) return v
  }
  return undefined
}
