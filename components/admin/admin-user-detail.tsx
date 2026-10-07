'use client'

import Link from 'next/link'
import { useState } from 'react'
import useSWR from 'swr'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { StatusBadge, TableShell, tdClass, thClass } from '@/components/admin/admin-ui'
import { ErrorState, GoldButton, LoadingState, Panel, inputClass } from '@/components/ui-bits'
import {
  asArray,
  pick,
  type AdminDeposit,
  type AdminUser,
  type BalanceLogEntry,
} from '@/lib/admin'
import {
  apiRequest,
  fetcher,
  formatDate,
  formatMoney,
  type Purchase,
  type Redemption,
} from '@/lib/api'

type DetailRes = Record<string, unknown> & { user?: AdminUser }

const TABS = ['Deposits', 'Purchases', 'Redemptions', 'Balance Log'] as const
type Tab = (typeof TABS)[number]

export function AdminUserDetail({ id }: { id: string }) {
  const key = `/admin/users/${id}`
  const { data, error, isLoading, mutate } = useSWR<DetailRes>(key, fetcher)
  const [tab, setTab] = useState<Tab>('Deposits')

  const user = (data?.user ?? data) as AdminUser | undefined
  const deposits = asArray<AdminDeposit>(pick(data, 'deposits') ?? pick(user, 'deposits'))
  const purchases = asArray<Purchase>(pick(data, 'purchases') ?? pick(user, 'purchases'))
  const redemptions = asArray<Redemption>(pick(data, 'redemptions') ?? pick(user, 'redemptions'))
  const balanceLog = asArray<BalanceLogEntry>(
    pick(data, 'balance_log', 'balanceLog', 'balance_logs', 'logs') ??
      pick(user, 'balance_log', 'balanceLog'),
  )

  return (
    <>
      <Link
        href="/admin/users"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-gold"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All users
      </Link>

      {isLoading ? <LoadingState /> : null}
      {error ? <ErrorState message={error.message} /> : null}

      {user ? (
        <div className="flex flex-col gap-6">
          <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
            <Panel>
              <h1 className="font-serif text-2xl font-semibold text-foreground text-balance">
                {user.full_name || user.email}
              </h1>
              <p className="mt-6 text-xs tracking-widest text-muted-foreground">BALANCE</p>
              <p className="mt-2 font-serif text-5xl font-semibold text-gold">
                {formatMoney(user.balance)}
              </p>
              <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-muted-foreground">Email</dt>
                  <dd className="mt-0.5 break-all">{user.email || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Phone</dt>
                  <dd className="mt-0.5">{user.phone || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Joined</dt>
                  <dd className="mt-0.5">{formatDate(user.created_at)}</dd>
                </div>
              </dl>
            </Panel>
            <AdjustBalanceForm id={id} onApplied={() => mutate()} />
          </div>

          <Panel className="p-0">
            <div role="tablist" aria-label="User activity" className="flex overflow-x-auto border-b border-bronze">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className={`-mb-px whitespace-nowrap border-b-2 px-5 py-3 text-sm transition-colors ${
                    tab === t
                      ? 'border-gold text-gold'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div role="tabpanel" aria-label={tab}>
              {tab === 'Deposits' ? <DepositsTable rows={deposits} /> : null}
              {tab === 'Purchases' ? <PurchasesTable rows={purchases} /> : null}
              {tab === 'Redemptions' ? <RedemptionsTable rows={redemptions} /> : null}
              {tab === 'Balance Log' ? <BalanceLogTable rows={balanceLog} /> : null}
            </div>
          </Panel>
        </div>
      ) : null}
    </>
  )
}

function AdjustBalanceForm({ id, onApplied }: { id: string; onApplied: () => void }) {
  const [delta, setDelta] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const value = Number(delta)
    if (!Number.isFinite(value) || value === 0) {
      toast.error('Enter a non-zero amount')
      return
    }
    if (!reason.trim()) {
      toast.error('Enter a reason')
      return
    }
    setSubmitting(true)
    try {
      await apiRequest(`/admin/users/${id}/balance`, {
        method: 'POST',
        body: { delta: value, reason: reason.trim() },
      })
      toast.success(`Balance ${value > 0 ? 'credited' : 'debited'} by ${formatMoney(Math.abs(value))}`)
      setDelta('')
      setReason('')
      onApplied()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not adjust balance')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Panel>
      <h2 className="text-sm font-medium tracking-widest text-muted-foreground">ADJUST BALANCE</h2>
      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-muted-foreground">Amount (GH₵, use negative to debit)</span>
          <input
            name="delta"
            type="number"
            inputMode="decimal"
            step="0.01"
            required
            placeholder="e.g. 50 or -20"
            value={delta}
            onChange={(e) => setDelta(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-muted-foreground">Reason</span>
          <input
            name="reason"
            type="text"
            required
            maxLength={200}
            placeholder="e.g. Manual correction"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className={inputClass}
          />
        </label>
        <GoldButton type="submit" loading={submitting}>
          Apply
        </GoldButton>
      </form>
    </Panel>
  )
}

function DepositsTable({ rows }: { rows: AdminDeposit[] }) {
  return (
    <TableShell empty={rows.length === 0}>
      <thead>
        <tr>
          <th scope="col" className={thClass}>Date</th>
          <th scope="col" className={thClass}>Method</th>
          <th scope="col" className={thClass}>Reference</th>
          <th scope="col" className={thClass}>Status</th>
          <th scope="col" className={`${thClass} text-right`}>Amount</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-bronze">
        {rows.map((d) => (
          <tr key={d.id}>
            <td className={`${tdClass} whitespace-nowrap`}>{formatDate(d.created_at)}</td>
            <td className={`${tdClass} capitalize`}>{d.method || '—'}</td>
            <td className={`${tdClass} max-w-[10rem] truncate text-muted-foreground`}>{d.reference || '—'}</td>
            <td className={tdClass}><StatusBadge status={d.status} /></td>
            <td className={`${tdClass} whitespace-nowrap text-right font-semibold text-gold`}>{formatMoney(d.amount)}</td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  )
}

function PurchasesTable({ rows }: { rows: Purchase[] }) {
  return (
    <TableShell empty={rows.length === 0}>
      <thead>
        <tr>
          <th scope="col" className={thClass}>Date</th>
          <th scope="col" className={thClass}>Tier</th>
          <th scope="col" className={thClass}>Status</th>
          <th scope="col" className={`${thClass} text-right`}>Price</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-bronze">
        {rows.map((p) => (
          <tr key={p.id}>
            <td className={`${tdClass} whitespace-nowrap`}>{formatDate(p.created_at)}</td>
            <td className={`${tdClass} uppercase`}>{p.tier || '—'}</td>
            <td className={tdClass}><StatusBadge status={p.status} /></td>
            <td className={`${tdClass} whitespace-nowrap text-right font-semibold text-gold`}>{formatMoney(p.price)}</td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  )
}

function RedemptionsTable({ rows }: { rows: Redemption[] }) {
  return (
    <TableShell empty={rows.length === 0}>
      <thead>
        <tr>
          <th scope="col" className={thClass}>Date</th>
          <th scope="col" className={thClass}>Tier</th>
          <th scope="col" className={thClass}>Status</th>
          <th scope="col" className={`${thClass} text-right`}>Amount</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-bronze">
        {rows.map((r) => (
          <tr key={r.id}>
            <td className={`${tdClass} whitespace-nowrap`}>{formatDate(r.created_at)}</td>
            <td className={`${tdClass} uppercase`}>{r.tier || '—'}</td>
            <td className={tdClass}><StatusBadge status={r.status} /></td>
            <td className={`${tdClass} whitespace-nowrap text-right font-semibold text-gold`}>{formatMoney(r.amount)}</td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  )
}

function BalanceLogTable({ rows }: { rows: BalanceLogEntry[] }) {
  return (
    <TableShell empty={rows.length === 0}>
      <thead>
        <tr>
          <th scope="col" className={thClass}>Date</th>
          <th scope="col" className={thClass}>Reason</th>
          <th scope="col" className={`${thClass} text-right`}>Change</th>
          <th scope="col" className={`${thClass} text-right`}>Balance After</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-bronze">
        {rows.map((entry) => {
          const change = Number(entry.delta ?? entry.amount ?? 0)
          return (
            <tr key={entry.id}>
              <td className={`${tdClass} whitespace-nowrap`}>{formatDate(entry.created_at)}</td>
              <td className={`${tdClass} text-muted-foreground`}>{entry.reason || '—'}</td>
              <td
                className={`${tdClass} whitespace-nowrap text-right font-semibold ${
                  change < 0 ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {change < 0 ? '−' : '+'}
                {formatMoney(Math.abs(change))}
              </td>
              <td className={`${tdClass} whitespace-nowrap text-right text-gold`}>
                {entry.balance_after !== undefined ? formatMoney(entry.balance_after) : '—'}
              </td>
            </tr>
          )
        })}
      </tbody>
    </TableShell>
  )
}
