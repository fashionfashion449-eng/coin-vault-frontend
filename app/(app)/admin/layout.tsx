'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { AdminNav } from '@/components/admin/admin-ui'
import { LoadingState } from '@/components/ui-bits'
import { isAdmin, useMe } from '@/lib/admin'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, error, isLoading } = useMe()
  const allowed = isAdmin(user)

  useEffect(() => {
    if (isLoading) return
    if (error || !allowed) {
      toast.error('Access denied')
      router.replace('/dashboard')
    }
  }, [isLoading, error, allowed, router])

  if (!allowed) return <LoadingState label="Checking access…" />

  return (
    <>
      <AdminNav />
      {children}
    </>
  )
}
