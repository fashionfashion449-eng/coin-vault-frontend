import { Crown, MessageCircle } from 'lucide-react'

export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 text-gold ${className}`}>
      <Crown className="size-5" aria-hidden="true" />
      <span className="font-serif text-lg font-semibold tracking-wide">Coin Vault</span>
    </span>
  )
}

export function NoticeBanner() {
  return (
    <div className="flex items-center justify-center gap-2 border-b border-bronze bg-[#0a0a0a] px-4 py-2 text-xs text-gold sm:text-sm">
      <span>— Do NOT contact via email</span>
      <MessageCircle className="size-4 text-[#25D366]" aria-label="WhatsApp" />
    </div>
  )
}
