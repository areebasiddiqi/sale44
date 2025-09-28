import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
})

// Plan configurations
export const PLANS = {
  free: {
    name: 'Start Free',
    price: 0,
    audits: 1,
    leads: 10,
    credits: 250,
    features: [
      'Credit card required to activate',
      'Unverified leads',
      'Watermarked reports',
      'Basic support'
    ]
  },
  starter: {
    name: 'Starter',
    price: 19,
    priceId: process.env.STRIPE_STARTER_PRICE_ID,
    audits: 5,
    leads: 100,
    credits: 2000,
    overageRate: 0.05,
    features: [
      'Soft-cap overage at $0.05/lead',
      'Verified leads',
      'Full reports',
      'Email support'
    ]
  },
  growth: {
    name: 'Growth',
    price: 59,
    priceId: process.env.STRIPE_GROWTH_PRICE_ID,
    audits: 25,
    leads: 1000,
    credits: 10000,
    overageRate: 0.04,
    features: [
      'Hard cap with extras at $0.04/lead',
      'Priority verification',
      'Advanced analytics',
      'Priority support'
    ]
  },
  pro: {
    name: 'Pro',
    price: 149,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    audits: 75,
    leads: 5000,
    credits: 50000,
    features: [
      'Volume discounts on verification',
      'White-label reports',
      'API access',
      'Dedicated support'
    ]
  }
} as const

export type PlanKey = keyof typeof PLANS

// Stripe product IDs
export const STRIPE_PRODUCTS = {
  EXTRA_LEADS: process.env.STRIPE_EXTRA_LEADS_PRODUCT_ID || 'prod_extra_leads',
} as const

export async function createStripeCustomer(email: string, name?: string) {
  return await stripe.customers.create({
    email,
    name,
    metadata: {
      created_by: 'sale44'
    }
  })
}

export async function createSetupIntent(customerId: string) {
  return await stripe.setupIntents.create({
    customer: customerId,
    usage: 'off_session',
    payment_method_types: ['card'],
  })
}

export async function createCheckoutSession({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
  mode = 'subscription'
}: {
  customerId: string
  priceId: string
  successUrl: string
  cancelUrl: string
  mode?: 'subscription' | 'payment'
}) {
  return await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    mode,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
  })
}

export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

export async function createInvoiceItem({
  customerId,
  amount,
  description,
  metadata = {}
}: {
  customerId: string
  amount: number
  description: string
  metadata?: Record<string, string>
}) {
  return await stripe.invoiceItems.create({
    customer: customerId,
    amount: Math.round(amount * 100), // Convert to cents
    currency: 'usd',
    description,
    metadata,
  })
}

export async function createAndPayInvoice(customerId: string) {
  const invoice = await stripe.invoices.create({
    customer: customerId,
    auto_advance: true,
  })
  
  return await stripe.invoices.pay(invoice.id)
}
