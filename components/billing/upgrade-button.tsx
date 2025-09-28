'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, CreditCard } from 'lucide-react'
import { PLANS } from '@/lib/stripe'

interface UpgradeButtonProps {
  planKey: keyof typeof PLANS
  customerId?: string | null
  currentPlan: string
}

export function UpgradeButton({ planKey, customerId, currentPlan }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false)
  const plan = PLANS[planKey]

  const handleUpgrade = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          planKey,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (error) {
      console.error('Error creating checkout session:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to start upgrade process')
    } finally {
      setLoading(false)
    }
  }

  const isUpgrade = currentPlan === 'free' || 
    (currentPlan === 'starter' && ['growth', 'pro'].includes(planKey)) ||
    (currentPlan === 'growth' && planKey === 'pro')

  return (
    <Button 
      onClick={handleUpgrade}
      disabled={loading}
      className="w-full"
      variant={isUpgrade ? "default" : "outline"}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="w-4 h-4 mr-2" />
          {isUpgrade ? 'Upgrade' : 'Switch'} to {plan.name}
        </>
      )}
    </Button>
  )
}
