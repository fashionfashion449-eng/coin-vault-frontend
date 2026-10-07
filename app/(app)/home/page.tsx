'use client'

import { useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { InvestmentCard } from '@/components/investment-card'
import { ErrorState, LoadingState, Notice, PageHeader } from '@/components/ui-bits'
import { apiRequest, fetcher, type Card } from '@/lib/api'

export default function HomePage() {
  const { data, error, isLoading } = useSWR<{ cards: Card[] }>('/cards', fetcher)
  const { mutate } = useSWRConfig()
  const [pendingTier, setPendingTier] = useState<string | null>(null)
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; message: string } | null>(null)

  async function purchase(tier: string) {
    setPendingTier(tier)
    setNotice(null)
    try {
      await apiRequest('/purchases', { method: 'POST', body: { tier } })
      setNotice({ kind: 'success', message: `Coin Vault — ${tier} purchased successfully.` })
      mutate('/purchases')
      mutate('/dashboard')
      mutate('/deposits')
    } catch (err) {
      setNotice({ kind: 'error', message: err instanceof Error ? err.message : 'Purchase failed' })
    } finally {
      setPendingTier(null)
    }
  }

  const cards = (data?.cards ?? []).slice(0, 6)

  return (
    <>
      <PageHeader title="Vault Cards" subtitle="Choose a card tier to add to your portfolio" />
      {notice ? (
        <div className="mb-6">
          <Notice kind={notice.kind} message={notice.message} />
        </div>
      ) : null}
      {isLoading ? <LoadingState label="Loading cards…" /> : null}
      {error ? <ErrorState message={error.message} /> : null}
      {data && cards.length === 0 ? (
        <p className="text-muted-foreground">No cards available right now.</p>
      ) : null}
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        {cards.map((card) => (
          <InvestmentCard
            key={card.id ?? card.tier}
            card={card}
            onPurchase={purchase}
            purchasing={pendingTier === card.tier}
          />
        ))}
      </div>
    </>
  )
}
