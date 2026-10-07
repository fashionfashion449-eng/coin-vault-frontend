'use client'

import useSWR from 'swr'
import { CreditCard, TrendingUp, Ticket } from 'lucide-react'
import { ErrorState, LoadingState, PageHeader, Panel } from '@/components/ui-bits'
import { fetcher, formatMoney } from '@/lib/api'

type DashboardRes = {
  stats: { total_earnings: number | string; cards_owned: number; redeemed_cards: number }
  currency?: string
}

export default function DashboardPage() {
  const { data, error, isLoading } = useSWR<DashboardRes>('/dashboard', fetcher)
  const currency = data?.currency === 'GHS' || !data?.currency ? 'GH₵' : `${data.currency} `

  const stats = [
    {
      label: 'TOTAL EARNINGS',
      value: formatMoney(data?.stats.total_earnings, currency),
      icon: TrendingUp,
    },
    { label: 'CARDS OWNED', value: String(data?.stats.cards_owned ?? 0), icon: CreditCard },
    { label: 'REDEEMED CARDS', value: String(data?.stats.redeemed_cards ?? 0), icon: Ticket },
  ]

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Manage your investment portfolio" />
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={error.message} /> : null}
      {data ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <Panel key={s.label}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium tracking-widest text-muted-foreground">{s.label}</p>
                <s.icon className="size-4 text-gold" aria-hidden="true" />
              </div>
              <p className="mt-4 font-serif text-3xl font-semibold text-gold">{s.value}</p>
            </Panel>
          ))}
        </div>
      ) : null}
    </>
  )
}
