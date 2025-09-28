import { createClient } from '@/lib/supabase/server'
import { createBillingPortalSession } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { customerId } = await request.json()

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 })
    }

    // Verify customer belongs to user
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.stripe_customer_id !== customerId) {
      return NextResponse.json({ error: 'Invalid customer ID' }, { status: 403 })
    }

    // Create billing portal session
    const session = await createBillingPortalSession(
      customerId,
      `${process.env.NEXT_PUBLIC_APP_URL}/billing`
    )

    return NextResponse.json({ url: session.url })

  } catch (error) {
    console.error('Error creating portal session:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
