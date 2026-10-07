import { Loader2 } from 'lucide-react'

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h1 className="font-serif text-3xl font-semibold text-gold text-balance">{title}</h1>
      {subtitle ? <p className="mt-1 text-muted-foreground">{subtitle}</p> : null}
    </div>
  )
}

export function Panel({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-xl border border-bronze bg-card p-5 ${className}`}>{children}</section>
  )
}

export function GoldButton({
  children,
  loading,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  )
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center gap-2 py-10 text-muted-foreground">
      <Loader2 className="size-4 animate-spin text-gold" aria-hidden="true" />
      {label}
    </div>
  )
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      {message}
    </div>
  )
}

export function Notice({ kind, message }: { kind: 'success' | 'error'; message: string }) {
  return kind === 'success' ? (
    <div role="status" className="rounded-lg border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-gold">
      {message}
    </div>
  ) : (
    <ErrorState message={message} />
  )
}

export const inputClass =
  'w-full rounded-lg border border-bronze bg-black px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold'
