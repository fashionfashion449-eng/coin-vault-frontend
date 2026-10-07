export const API_BASE_URL = 'https://coin-vault-backend.onrender.com'
export const API_BASE = `${API_BASE_URL}/api`

const TOKEN_KEY = 'cv_token'
export const PAYSTACK_REFERENCE_KEY = 'cv_paystack_reference'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

function handleUnauthorized() {
  clearToken()
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
    window.location.href = '/login'
  }
}

export async function apiRequest<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const { method = 'GET', body, auth = true } = options
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(`Unable to reach the server at ${API_BASE}`, 0)
  }

  const data = await res.json().catch(() => ({}))

  if (res.status === 401 && auth) {
    handleUnauthorized()
  }
  if (!res.ok) {
    const message =
      (data && (data.error || data.message)) || `Request failed (${res.status})`
    throw new ApiError(String(message), res.status)
  }
  return data as T
}

export const fetcher = <T,>(path: string) => apiRequest<T>(path)

export function formatMoney(value: unknown, currency = 'GH₵') {
  const n = Number(value ?? 0)
  return `${currency}${(Number.isFinite(n) ? n : 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatDate(value: unknown) {
  if (!value) return '—'
  const d = new Date(String(value))
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export type Card = {
  id?: string | number
  tier: string
  card_number?: string
  masked_number?: string
  number?: string
  balance?: number | string
  expiry?: string
  expires_at?: string
  price: number | string
  potential_earnings?: number | string
}

export type Purchase = {
  id: string | number
  tier: string
  price?: number | string
  balance?: number | string
  earnings?: number | string
  current_earnings?: number | string
  potential_earnings?: number | string
  status?: string
  created_at?: string
  expires_at?: string
  card_number?: string
  masked_number?: string
}

export type Redemption = {
  id: string | number
  purchase_id?: string | number
  tier?: string
  amount?: number | string
  status?: string
  created_at?: string
}

export type Deposit = {
  id: string | number
  amount: number | string
  method?: string
  reference?: string
  status?: string
  created_at?: string
}
