'use client'

import useSWR from 'swr'
import { StatCard } from '@/components/admin/admin-ui'
import { ErrorState, LoadingState, PageHeader } from '@/components/ui-bits'
import { pick } from '@/lib/admin'
import { fetcher, formatMoney } from '@/lib/api'

type StatsRes = Record<string, unknown> & { stats?: Record<string, unknown> }

function count(value: unknown) {
  const n = Number(value ?? 0)
  return (Number.isFinite(n) ? n : 0).toLocaleString('en-US')
}

export default function AdminDashboardPage() {
  const { data, error, isLoading } = useSWR<StatsRes>('/admin/stats', fetcher)
  const s = data?.stats ?? data

  const stats = [
    { label: 'USERS', value: count(pick(s, 'users', 'total_users', 'user_count')) },
    {
      label: 'PENDING DEPOSITS',
      value: count(pick(s, 'pending_deposits', 'pendingDeposits', 'pending')),
    },
    {
      label: 'TOTAL DEPOSITED',
      value: formatMoney(pick(s, 'total_deposited', 'totalDeposited', 'deposits_total')),
    },
    {
      label: 'TOTAL BALANCES',
      value: formatMoney(pick(s, 'total_balances', 'totalBalances', 'balances_total')),
    },
    { label: 'PURCHASES', value: count(pick(s, 'purchases', 'total_purchases', 'purchase_count')) },
    {
      label: 'REDEMPTIONS',
      value: count(pick(s, 'redemptions', 'total_redemptions', 'redemption_count')),
    },
  ]

  return (
    <>
      <PageHeader title="Admin" subtitle="Platform overview" />
      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={error.message} /> : null}
      {data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <StatCard key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </div>
      ) : null}
    </>
  )
}
