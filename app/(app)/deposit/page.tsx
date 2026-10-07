'use client'

import { useState } from 'react'
import useSWR from 'swr'
import {
  ErrorState,
  GoldButton,
  LoadingState,
  Notice,
  PageHeader,
  Panel,
  inputClass,
} from '@/components/ui-bits'
import {
  PAYSTACK_REFERENCE_KEY,
  apiRequest,
  fetcher,
  formatDate,
  formatMoney,
  type Deposit,
} from '@/lib/api'

type DepositsRes = { balance: number | string; deposits: Deposit[] }
type InitializeRes = {
  authorization_url?: string
  reference?: string
  data?: { authorization_url?: string; reference?: string }
}

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000]

export default function DepositPage() {
  const { data, error, isLoading } = useSWR<DepositsRes>('/deposits', fetcher)
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) {
      setErrorMessage('Enter a valid amount greater than 0.')
      return
    }
    setSubmitting(true)
    setErrorMessage(null)
    try {
      const res = await apiRequest<InitializeRes>('/paystack/initialize', {
        method: 'POST',
        body: { amount: value },
      })
      const authorizationUrl = res.authorization_url ?? res.data?.authorization_url
      const reference = res.reference ?? res.data?.reference
      if (!authorizationUrl) throw new Error('Paystack did not return a payment link.')
      if (reference) window.localStorage.setItem(PAYSTACK_REFERENCE_KEY, reference)
      window.location.href = authorizationUrl
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Could not start payment')
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader title="Deposit" subtitle="Fund your wallet securely with Paystack" />
      <div className="grid gap-6 md:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col gap-6">
          <Panel>
            <p className="text-xs tracking-widest text-muted-foreground">CURRENT BALANCE</p>
            <p className="mt-3 font-serif text-3xl font-semibold text-gold">
              {data ? formatMoney(data.balance) : '—'}
            </p>
          </Panel>
          <Panel>
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              {errorMessage ? <Notice kind="error" message={errorMessage} /> : null}
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-muted-foreground">Amount (GH₵)</span>
                <input
                  name="amount"
                  type="number"
                  inputMode="decimal"
                  min="1"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={inputClass}
                />
              </label>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Quick select amount">
                {QUICK_AMOUNTS.map((q) => {
                  const active = Number(amount) === q
                  return (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setAmount(String(q))}
                      aria-pressed={active}
                      className={`rounded-lg border px-3 py-1.5 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                        active
                          ? 'border-gold bg-gold/15 text-gold'
                          : 'border-bronze text-muted-foreground hover:border-gold hover:text-gold'
                      }`}
                    >
                      GH₵{q.toLocaleString('en-US')}
                    </button>
                  )
                })}
              </div>
              <GoldButton type="submit" loading={submitting} className="w-full">
                Pay with Paystack
              </GoldButton>
              <p className="text-xs text-muted-foreground">
                {"You'll be redirected to Paystack to complete payment via MoMo, card, or bank."}
              </p>
            </form>
          </Panel>
        </div>

        <Panel className="p-0">
          <h2 className="border-b border-bronze px-5 py-4 text-sm font-medium tracking-widest text-muted-foreground">
            DEPOSIT HISTORY
          </h2>
          {isLoading ? <div className="px-5"><LoadingState /></div> : null}
          {error ? <div className="p-5"><ErrorState message={error.message} /></div> : null}
          {data && data.deposits.length === 0 ? (
            <p className="p-5 text-muted-foreground">No deposits yet.</p>
          ) : null}
          {data && data.deposits.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-medium">Date</th>
                    <th scope="col" className="px-5 py-3 font-medium">Method</th>
                    <th scope="col" className="px-5 py-3 font-medium">Reference</th>
                    <th scope="col" className="px-5 py-3 font-medium">Status</th>
                    <th scope="col" className="px-5 py-3 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bronze">
                  {data.deposits.map((d) => (
                    <tr key={d.id}>
                      <td className="whitespace-nowrap px-5 py-3">{formatDate(d.created_at)}</td>
                      <td className="px-5 py-3 capitalize">{d.method || '—'}</td>
                      <td className="max-w-[10rem] truncate px-5 py-3 text-muted-foreground">{d.reference || '—'}</td>
                      <td className="px-5 py-3 capitalize">{d.status || '—'}</td>
                      <td className="whitespace-nowrap px-5 py-3 text-right font-semibold text-gold">
                        {formatMoney(d.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </Panel>
      </div>
    </>
  )
}
