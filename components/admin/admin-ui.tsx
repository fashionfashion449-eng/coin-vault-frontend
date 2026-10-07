'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const adminLinks = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/deposits', label: 'Deposits' },
]

export function AdminNav() {
  const pathname = usePathname()
  return (
    <nav aria-label="Admin" className="mb-8 flex gap-1 border-b border-bronze">
      {adminLinks.map((l) => {
        const active = l.href === '/admin' ? pathname === '/admin' : pathname.startsWith(l.href)
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? 'page' : undefined}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm transition-colors ${
              active
                ? 'border-gold text-gold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {l.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function StatusBadge({ status }: { status?: string }) {
  const s = (status || 'unknown').toLowerCase()
  const styles =
    s === 'approved' || s === 'success' || s === 'completed' || s === 'redeemed'
      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
      : s === 'rejected' || s === 'failed'
        ? 'border-red-500/40 bg-red-500/10 text-red-400'
        : s === 'pending'
          ? 'border-gold/40 bg-gold/10 text-gold'
          : 'border-bronze bg-black text-muted-foreground'
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs capitalize ${styles}`}>
      {s}
    </span>
  )
}

export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <section className="rounded-xl border border-bronze bg-card p-5">
      <p className="text-xs tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-3 font-serif text-3xl font-semibold text-gold">{value}</p>
    </section>
  )
}

export function TableShell({
  children,
  empty,
}: {
  children: React.ReactNode
  empty?: boolean
}) {
  if (empty) return <p className="p-5 text-muted-foreground">Nothing to show yet.</p>
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">{children}</table>
    </div>
  )
}

export const thClass = 'px-5 py-3 text-left text-xs font-medium text-muted-foreground'
export const tdClass = 'px-5 py-3'
