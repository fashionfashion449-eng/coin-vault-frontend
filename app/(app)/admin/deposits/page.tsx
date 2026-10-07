'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { StatusBadge, TableShell, tdClass, thClass } from '@/components/admin/admin-ui'
import { ErrorState, LoadingState, PageHeader, Panel } from '@/components/ui-bits'
import { asArray, type AdminDeposit } from '@/lib/admin'
import { apiRequest, fetcher, formatDate, formatMoney } from '@/lib/api'

const FILTERS = ['all', 'pending', 'approved', 'rejected'] as const
type Filter = (typeof FILTERS)[number]

export default function AdminDepositsPage() {
  const [filter, setFilter] = useState<Filter>('pending')
  const key = filter === 'all' ? '/admin/deposits' : `/admin/deposits?status=${filter}`
  const { data, error, isLoading, mutate } = useSWR<unknown>(key, fetcher)
  const [busy, setBusy] = useState<{ id: string | number; action: 'approve' | 'reject' } | null>(null)

  const deposits = asArray<AdminDeposit>(data, 'deposits', 'data').filter(
    (d) => filter === 'all' || (d.status || '').toLowerCase() === filter,
  )

  async function act(id: string | number, action: 'approve' | 'reject') {
    setBusy({ id, action })
    try {
      await apiRequest(`/admin/deposits/${id}/${action}`, { method: 'POST' })
      toast.success(action === 'approve' ? 'Deposit approved' : 'Deposit rejected')
      await mutate()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Could not ${action} deposit`)
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      <PageHeader title="Deposits" subtitle="Review and approve user deposits" />
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`rounded-full border px-4 py-1.5 text-sm capitalize transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
              filter === f
                ? 'border-gold bg-gold text-black'
                : 'border-bronze text-muted-foreground hover:border-gold hover:text-gold'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <Panel className="p-0">
        {isLoading ? <div className="px-5"><LoadingState /></div> : null}
        {error ? <div className="p-5"><ErrorState message={error.message} /></div> : null}
        {data ? (
          <TableShell empty={deposits.length === 0}>
            <thead>
              <tr>
                <th scope="col" className={thClass}>User email</th>
                <th scope="col" className={`${thClass} text-right`}>Amount</th>
                <th scope="col" className={thClass}>Method</th>
                <th scope="col" className={thClass}>Reference</th>
                <th scope="col" className={thClass}>Date</th>
                <th scope="col" className={thClass}>Status</th>
                <th scope="col" className={thClass}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bronze">
              {deposits.map((d) => {
                const pending = (d.status || '').toLowerCase() === 'pending'
                const rowBusy = busy?.id === d.id
                return (
                  <tr key={d.id}>
                    <td className={`${tdClass} max-w-[14rem] truncate`}>{d.email || d.user_email || '—'}</td>
                    <td className={`${tdClass} whitespace-nowrap text-right font-semibold text-gold`}>
                      {formatMoney(d.amount)}
                    </td>
                    <td className={`${tdClass} capitalize`}>{d.method || '—'}</td>
                    <td className={`${tdClass} max-w-[10rem] truncate text-muted-foreground`}>{d.reference || '—'}</td>
                    <td className={`${tdClass} whitespace-nowrap text-muted-foreground`}>{formatDate(d.created_at)}</td>
                    <td className={tdClass}><StatusBadge status={d.status} /></td>
                    <td className={tdClass}>
                      {pending ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={rowBusy}
                            onClick={() => act(d.id, 'approve')}
                            className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/60 px-3 py-1.5 text-xs text-emerald-400 transition hover:bg-emerald-500/10 disabled:opacity-50"
                          >
                            {rowBusy && busy?.action === 'approve' ? (
                              <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                            ) : null}
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={rowBusy}
                            onClick={() => act(d.id, 'reject')}
                            className="inline-flex items-center gap-1.5 rounded-md border border-red-500/60 px-3 py-1.5 text-xs text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                          >
                            {rowBusy && busy?.action === 'reject' ? (
                              <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                            ) : null}
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </TableShell>
        ) : null}
      </Panel>
    </>
  )
}
