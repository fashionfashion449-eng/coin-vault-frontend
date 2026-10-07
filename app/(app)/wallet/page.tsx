'use client'

import { useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { Crown } from 'lucide-react'
import {
  ErrorState,
  GoldButton,
  LoadingState,
  Notice,
  PageHeader,
  Panel,
} from '@/components/ui-bits'
import { apiRequest, fetcher, formatDate, formatMoney, type Purchase, type Redemption } from '@/lib/api'

function isActive(p: Purchase) {
  const s = (p.status || 'active').toLowerCase()
  return s === 'active'
}

export default function WalletPage() {
  const purchases = useSWR<{ purchases: Purchase[] }>('/purchases', fetcher)
  const redemptions = useSWR<{ redemptions: Redemption[] }>('/redemptions', fetcher)
  const { mutate } = useSWRConfig()
  const [redeeming, setRedeeming] = useState<string | number | null>(null)
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; message: string } | null>(null)

  const active = (purchases.data?.purchases ?? []).filter(isActive)

  async function redeem(purchaseId: string | number) {
    setRedeeming(purchaseId)
    setNotice(null)
    try {
      await apiRequest('/redemptions', { method: 'POST', body: { purchase_id: purchaseId } })
      setNotice({ kind: 'success', message: 'Redemption submitted.' })
      purchases.mutate()
      redemptions.mutate()
      mutate('/dashboard')
      mutate('/deposits')
    } catch (err) {
      setNotice({ kind: 'error', message: err instanceof Error ? err.message : 'Redemption failed' })
    } finally {
      setRedeeming(null)
    }
  }

  return (
    <>
      <PageHeader title="Wallet" subtitle="Your active cards and redemption history" />
      {notice ? (
        <div className="mb-6">
          <Notice kind={notice.kind} message={notice.message} />
        </div>
      ) : null}

      <h2 className="mb-3 text-sm font-medium tracking-widest text-muted-foreground">ACTIVE CARDS</h2>
      {purchases.isLoading ? <LoadingState /> : null}
      {purchases.error ? <ErrorState message={purchases.error.message} /> : null}
      {purchases.data && active.length === 0 ? (
        <Panel>
          <p className="text-muted-foreground">You have no active cards. Purchase one from Home.</p>
        </Panel>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        {active.map((p) => {
          const earned = Number(p.current_earnings ?? p.earnings ?? 0)
          const target = Number(p.potential_earnings ?? 0)
          const pct = target > 0 ? Math.min(100, Math.round((earned / target) * 100)) : 0
          return (
            <Panel key={p.id}>
              <div className="flex items-start justify-between">
                <h3 className="font-serif text-lg font-semibold text-gold">Coin Vault — {p.tier}</h3>
                <Crown className="size-5 text-gold/70" aria-hidden="true" />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Purchased {formatDate(p.created_at)}
                {p.price !== undefined ? ` · ${formatMoney(p.price)}` : ''}
              </p>
              <div className="mt-5">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-muted-foreground">Earnings</span>
                  <span>
                    <span className="font-semibold text-gold">{formatMoney(earned)}</span>
                    <span className="text-muted-foreground"> / {formatMoney(target)}</span>
                  </span>
                </div>
                <div
                  className="mt-2 h-2 overflow-hidden rounded-full bg-bronze/60"
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Earnings progress"
                >
                  <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-1 text-right text-xs text-muted-foreground">{pct}%</p>
              </div>
              <GoldButton
                type="button"
                className="mt-4 w-full"
                loading={redeeming === p.id}
                onClick={() => redeem(p.id)}
              >
                Redeem
              </GoldButton>
            </Panel>
          )
        })}
      </div>

      <h2 className="mb-3 mt-10 text-sm font-medium tracking-widest text-muted-foreground">
        REDEMPTION HISTORY
      </h2>
      {redemptions.isLoading ? <LoadingState /> : null}
      {redemptions.error ? <ErrorState message={redemptions.error.message} /> : null}
      {redemptions.data ? (
        <Panel className="p-0">
          {redemptions.data.redemptions.length === 0 ? (
            <p className="p-5 text-muted-foreground">No redemptions yet.</p>
          ) : (
            <ul className="divide-y divide-bronze">
              {redemptions.data.redemptions.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="font-medium">{r.tier ? `Coin Vault — ${r.tier}` : `Purchase #${r.purchase_id}`}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(r.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gold">{formatMoney(r.amount)}</p>
                    {r.status ? (
                      <p className="text-xs capitalize text-muted-foreground">{r.status}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      ) : null}
    </>
  )
}
