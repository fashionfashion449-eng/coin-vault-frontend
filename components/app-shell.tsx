'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useSyncExternalStore } from 'react'
import { LogOut } from 'lucide-react'
import { BrandMark, NoticeBanner } from '@/components/brand'
import { isAdmin, useMe } from '@/lib/admin'
import { clearToken, getToken } from '@/lib/api'

const links = [
  { href: '/home', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/wallet', label: 'Wallet' },
  { href: '/deposit', label: 'Deposit' },
]

const subscribe = () => () => {}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const token = useSyncExternalStore(subscribe, getToken, () => undefined)
  const { user } = useMe()
  const navLinks = isAdmin(user) ? [...links, { href: '/admin', label: 'Admin' }] : links

  useEffect(() => {
    if (token === null) router.replace('/login')
  }, [token, router])

  function logout() {
    clearToken()
    router.replace('/login')
  }

  return (
    <div className="min-h-dvh">
      <NoticeBanner />
      <header className="sticky top-0 z-20 border-b border-bronze bg-black/90 backdrop-blur">
        <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/home" aria-label="Coin Vault home">
            <BrandMark />
          </Link>
          <div className="flex items-center gap-1 text-sm">
            {navLinks.map((l) => {
              const active =
                l.href === '/admin' ? pathname.startsWith('/admin') : pathname === l.href
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-md px-2 py-1.5 transition-colors sm:px-3 ${
                    active ? 'text-gold' : 'text-muted-foreground hover:text-foreground'
                  } ${l.href === '/home' ? '' : 'hidden sm:inline-block'}`}
                >
                  {l.label}
                </Link>
              )
            })}
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:text-gold sm:px-3"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Logout
            </button>
          </div>
        </nav>
        <div className="flex border-t border-bronze sm:hidden">
          {navLinks.slice(1).map((l) => {
            const active =
              l.href === '/admin' ? pathname.startsWith('/admin') : pathname === l.href
            return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? 'page' : undefined}
              className={`flex-1 py-2 text-center text-xs ${
                active ? 'text-gold' : 'text-muted-foreground'
              }`}
            >
              {l.label}
            </Link>
            )
          })}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{token ? children : null}</main>
    </div>
  )
}
