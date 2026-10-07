import { Suspense } from 'react'
import { LoadingState, PageHeader } from '@/components/ui-bits'
import { PaystackVerify } from '@/components/paystack-verify'

export default function DepositCallbackPage() {
  return (
    <>
      <PageHeader title="Deposit" subtitle="Confirming your Paystack payment" />
      <Suspense fallback={<LoadingState label="Verifying payment…" />}>
        <PaystackVerify />
      </Suspense>
    </>
  )
}
