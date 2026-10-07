'use client'

import Link from 'next/link'
import useSWR from 'swr'
import { TableShell, tdClass, thClass } from '@/components/admin/admin-ui'
import { ErrorState, LoadingState, PageHeader, Panel } from '@/components/ui-bits'
import { asArray, type AdminUser } from '@/lib/admin'
import { fetcher, formatDate, formatMoney } from '@/lib/api'

export default function AdminUsersPage() {
  const { data, error, isLoading } = useSWR<unknown>('/admin/users', fetcher)
  const users = asArray<AdminUser>(data, 'users', 'data')

  return (
    <>
      <PageHeader title="Users" subtitle="All registered accounts" />
      <Panel className="p-0">
        {isLoading ? <div className="px-5"><LoadingState /></div> : null}
        {error ? <div className="p-5"><ErrorState message={error.message} /></div> : null}
        {data ? (
          <TableShell empty={users.length === 0}>
            <thead>
              <tr>
                <th scope="col" className={thClass}>Email</th>
                <th scope="col" className={thClass}>Full Name</th>
                <th scope="col" className={thClass}>Phone</th>
                <th scope="col" className={`${thClass} text-right`}>Balance</th>
                <th scope="col" className={`${thClass} text-right`}>Cards Owned</th>
                <th scope="col" className={thClass}>Joined</th>
                <th scope="col" className={thClass}><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bronze">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className={`${tdClass} max-w-[14rem] truncate`}>{u.email}</td>
                  <td className={tdClass}>{u.full_name || '—'}</td>
                  <td className={`${tdClass} whitespace-nowrap text-muted-foreground`}>{u.phone || '—'}</td>
                  <td className={`${tdClass} whitespace-nowrap text-right font-semibold text-gold`}>
                    {formatMoney(u.balance)}
                  </td>
                  <td className={`${tdClass} text-right`}>{Number(u.cards_owned ?? u.card_count ?? 0)}</td>
                  <td className={`${tdClass} whitespace-nowrap text-muted-foreground`}>{formatDate(u.created_at)}</td>
                  <td className={`${tdClass} text-right`}>
                    <Link
                      href={`/admin/users/${u.id}`}
                      className="rounded-md border border-bronze px-3 py-1.5 text-xs text-gold transition hover:border-gold"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        ) : null}
      </Panel>
    </>
  )
}
