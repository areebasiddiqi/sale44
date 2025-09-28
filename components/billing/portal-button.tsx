'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, ExternalLink } from 'lucide-react'

interface BillingPortalButtonProps {
  customerId?: string | null
}

export function BillingPortalButton({ customerId }: BillingPortalButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleOpenPortal = async () => {
    if (!customerId) {
      toast.error('No customer ID found')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/billing/create-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create portal session')
      }

      // Open portal in new tab
      window.open(data.url, '_blank')
    } catch (error) {
      console.error('Error creating portal session:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to open billing portal')
    } finally {
      setLoading(false)
    }
  }

  if (!customerId) {
    return null
  }

  return (
    <Button 
      variant="outline" 
      onClick={handleOpenPortal}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          <ExternalLink className="w-4 h-4 mr-2" />
          Manage Billing
        </>
      )}
    </Button>
  )
}
