import { createAdminClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const supabase = createAdminClient()

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Get user by customer ID
        const { data: user } = await supabase
          .from('users')
          .select('id, plan')
          .eq('stripe_customer_id', subscription.customer as string)
          .single()

        if (!user) {
          console.error('User not found for customer:', subscription.customer)
          break
        }

        // Determine plan from subscription
        const priceId = subscription.items.data[0]?.price.id
        let newPlan = 'free'
        
        if (priceId === process.env.STRIPE_STARTER_PRICE_ID) newPlan = 'starter'
        else if (priceId === process.env.STRIPE_GROWTH_PRICE_ID) newPlan = 'growth'
        else if (priceId === process.env.STRIPE_PRO_PRICE_ID) newPlan = 'pro'

        // Update user plan
        await supabase
          .from('users')
          .update({ plan: newPlan })
          .eq('id', user.id)

        // Upsert subscription record
        await supabase
          .from('subscriptions')
          .upsert({
            user_id: user.id,
            stripe_subscription_id: subscription.id,
            status: subscription.status as any,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })

        console.log(`Subscription ${subscription.status} for user ${user.id}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Get user by customer ID
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', subscription.customer as string)
          .single()

        if (!user) {
          console.error('User not found for customer:', subscription.customer)
          break
        }

        // Downgrade to free plan
        await supabase
          .from('users')
          .update({ plan: 'free' })
          .eq('id', user.id)

        // Update subscription status
        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('user_id', user.id)
          .eq('stripe_subscription_id', subscription.id)

        console.log(`Subscription canceled for user ${user.id}`)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription) {
          // Get user by customer ID
          const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('stripe_customer_id', invoice.customer as string)
            .single()

          if (user) {
            console.log(`Payment succeeded for user ${user.id}`)
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription) {
          // Get user by customer ID
          const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('stripe_customer_id', invoice.customer as string)
            .single()

          if (user) {
            // Update subscription status to past_due
            await supabase
              .from('subscriptions')
              .update({ status: 'past_due' })
              .eq('user_id', user.id)
              .eq('stripe_subscription_id', invoice.subscription as string)

            console.log(`Payment failed for user ${user.id}`)
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ 
      error: 'Webhook handler failed' 
    }, { status: 500 })
  }
}
