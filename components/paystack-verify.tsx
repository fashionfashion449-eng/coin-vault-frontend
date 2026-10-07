'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import useSWR, { useSWRConfig } from 'swr'
import { CheckCircle2, XCircle } from 'lucide-react'
import { LoadingState, Panel } from '@/components/ui-bits'
import { PAYSTACK_REFERENCE_KEY, apiRequest, formatMoney } from '@/lib/api'

type VerifyRes = {
  success?: boolean
  status?: string | boolean
  message?: string
  amount?: number | string
  deposit?: { amount?: number | string }
  data?: { amount?: number | string; status?: string }
}

const linkClass =
  'inline-flex items-center justify-center rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-black transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold'

function getAmount(res: VerifyRes) {
  return res.amount ?? res.deposit?.amount ?? res.data?.amount
}

function isFailed(res: VerifyRes) {
  if (res.success === false || res.status === false) return true
  const status = typeof res.status === 'string' ? res.status : res.data?.status
  return status ? ['failed', 'abandoned', 'reversed'].includes(status.toLowerCase()) : false
}

export function PaystackVerify() {
  const params = useSearchParams()
  const { mutate } = useSWRConfig()
  const storedReference =
    typeof window !== 'undefined' ? window.localStorage.getItem(PAYSTACK_REFERENCE_KEY) : null
  const reference = params.get('reference') || params.get('trxref') || storedReference

  const { data, error, isLoading } = useSWR<VerifyRes>(
    reference ? `/paystack/verify/${encodeURIComponent(reference)}` : null,
    async (path: string) => {
      const res = await apiRequest<VerifyRes>(path)
      if (isFailed(res)) throw new Error(res.message || 'Payment was not successful.')
      window.localStorage.removeItem(PAYSTACK_REFERENCE_KEY)
      mutate('/deposits')
      mutate('/dashboard')
      return res
    },
    { revalidateOnFocus: false, revalidateOnReconnect: false, shouldRetryOnError: false },
  )

  if (!reference) {
    return <Result ok={false} message="No payment reference was found." />
  }
  if (isLoading) return <LoadingState label="Verifying payment…" />
  if (error) return <Result ok={false} message={error.message} />
  if (data) {
    const amount = getAmount(data)
    return (
      <Result
        ok
        message={
          amount !== undefined
            ? `Payment received! ${formatMoney(amount)} credited to your account`
            : 'Payment received! Your account has been credited'
        }
      />
    )
  }
  return <LoadingState label="Verifying payment…" />
}

function Result({ ok, message }: { ok: boolean; message: string }) {
  return (
    <Panel className="mx-auto flex max-w-md flex-col items-center gap-4 py-10 text-center">
      {ok ? (
        <CheckCircle2 className="size-12 text-gold" aria-hidden="true" />
      ) : (
        <XCircle className="size-12 text-destructive" aria-hidden="true" />
      )}
      <p role={ok ? 'status' : 'alert'} className={`text-lg text-pretty ${ok ? 'text-foreground' : 'text-destructive'}`}>
        {ok ? message : `Payment failed: ${message}`}
      </p>
      {ok ? (
        <Link href="/dashboard" className={linkClass}>
          Back to dashboard
        </Link>
      ) : (
        <Link href="/deposit" className={linkClass}>
          Try again
        </Link>
      )}
    </Panel>
  )
}
