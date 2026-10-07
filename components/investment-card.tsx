'use client'

import { useState } from 'react'
import { Crown, Eye, EyeOff } from 'lucide-react'
import { GoldButton } from '@/components/ui-bits'
import { formatDate, formatMoney, type Card } from '@/lib/api'

function maskNumber(card: Card) {
  if (card.masked_number) return card.masked_number
  const raw = String(card.card_number || card.number || '')
  const last4 = raw.replace(/\D/g, '').slice(-4) || '0000'
  return `•••• •••• •••• ${last4}`
}

function formatExpiry(value?: string) {
  if (!value) return '—'
  if (/^\d{2}\/\d{2,4}$/.test(value)) return value
  return formatDate(value)
}

export function InvestmentCard({
  card,
  onPurchase,
  purchasing,
}: {
  card: Card
  onPurchase: (tier: string) => void
  purchasing: boolean
}) {
  const [showBalance, setShowBalance] = useState(false)

  return (
    <article className="overflow-hidden rounded-2xl border border-bronze bg-card">
      <div className="relative bg-gradient-to-br from-[#1a160c] via-[#0a0a0a] to-black p-5 sm:p-6">
        <div className="flex items-start justify-between">
          <h2 className="font-serif text-xl font-semibold text-gold">Coin Vault — {card.tier}</h2>
          <Crown className="size-6 text-gold/70" aria-hidden="true" />
        </div>
        <p className="mt-6 font-mono text-lg tracking-[0.2em] text-foreground sm:text-xl">
          {maskNumber(card)}
        </p>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-widest text-muted-foreground">BALANCE</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-lg font-semibold">
                {showBalance ? formatMoney(card.balance) : 'GH₵ ••••••'}
              </span>
              <button
                type="button"
                onClick={() => setShowBalance((v) => !v)}
                className="rounded p-1 text-muted-foreground hover:text-gold"
                aria-label={showBalance ? 'Hide balance' : 'Show balance'}
                aria-pressed={showBalance}
              >
                {showBalance ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs tracking-widest text-muted-foreground">EXPIRES</p>
            <p className="mt-1 font-mono">{formatExpiry(card.expiry || card.expires_at)}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 border-t border-bronze p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <dl className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <dt className="text-muted-foreground">Price</dt>
            <dd className="font-semibold">{formatMoney(card.price)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Potential earnings</dt>
            <dd className="font-semibold text-gold">{formatMoney(card.potential_earnings)}</dd>
          </div>
        </dl>
        <GoldButton
          type="button"
          loading={purchasing}
          onClick={() => onPurchase(card.tier)}
          className="w-full sm:w-auto"
        >
          Purchase — {formatMoney(card.price)}
        </GoldButton>
      </div>
    </article>
  )
}
