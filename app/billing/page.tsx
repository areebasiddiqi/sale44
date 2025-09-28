import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, CreditCard, ExternalLink } from 'lucide-react'
import { PLANS } from '@/lib/stripe'
import { formatCurrency } from '@/lib/utils'
import { UpgradeButton } from '@/components/billing/upgrade-button'
import { BillingPortalButton } from '@/components/billing/portal-button'

async function getUserBilling(userId: string) {
  const supabase = createClient()
  
  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  // Get subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  return { profile, subscription }
}

export default async function BillingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { profile, subscription } = await getUserBilling(user.id)
  
  if (!profile) return null

  const currentPlan = PLANS[profile.plan as keyof typeof PLANS]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="text-gray-600">Manage your subscription and billing information</p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Current Plan: {currentPlan.name}
            </span>
            {profile.plan !== 'free' && (
              <BillingPortalButton customerId={profile.stripe_customer_id} />
            )}
          </CardTitle>
          <CardDescription>
            {profile.plan === 'free' 
              ? 'You are currently on the free plan'
              : `${formatCurrency(currentPlan.price)}/month`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{currentPlan.audits}</div>
              <div className="text-sm text-gray-600">Audits/month</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{currentPlan.leads}</div>
              <div className="text-sm text-gray-600">Leads/month</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{currentPlan.credits}</div>
              <div className="text-sm text-gray-600">Credits/month</div>
            </div>
          </div>

          <div className="space-y-2">
            {currentPlan.features.map((feature, index) => (
              <div key={index} className="flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                {feature}
              </div>
            ))}
          </div>

          {subscription && (
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className={`ml-2 capitalize ${
                    subscription.status === 'active' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {subscription.status}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Next billing:</span>
                  <span className="ml-2">
                    {subscription.current_period_end 
                      ? new Date(subscription.current_period_end).toLocaleDateString()
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(PLANS).map(([key, plan]) => {
            const isCurrentPlan = profile.plan === key
            const isPaidPlan = key !== 'free'
            
            return (
              <Card key={key} className={`relative ${isCurrentPlan ? 'ring-2 ring-blue-500' : ''}`}>
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Current Plan
                    </span>
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">
                    {key === 'free' ? '$0' : formatCurrency(plan.price)}
                    {isPaidPlan && <span className="text-lg font-normal">/mo</span>}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span>Audits/month:</span>
                      <span className="font-medium">{plan.audits}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Leads/month:</span>
                      <span className="font-medium">{plan.leads}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Credits/month:</span>
                      <span className="font-medium">{plan.credits}</span>
                    </div>
                  </div>

                  <ul className="space-y-2 text-xs mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-3 h-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {!isCurrentPlan && isPaidPlan && (
                    <UpgradeButton 
                      planKey={key as keyof typeof PLANS}
                      customerId={profile.stripe_customer_id}
                      currentPlan={profile.plan}
                    />
                  )}
                  
                  {isCurrentPlan && (
                    <Button disabled className="w-full">
                      Current Plan
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Add-ons */}
      <Card>
        <CardHeader>
          <CardTitle>Add-ons</CardTitle>
          <CardDescription>
            Need more leads? Purchase additional lead packs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Extra Leads Pack</h3>
              <p className="text-sm text-gray-600">500 additional verified leads</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">$10</div>
              <Button size="sm" variant="outline">
                Purchase
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Free Plan Credit Card Requirement */}
      {profile.plan === 'free' && !profile.stripe_customer_id && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Credit Card Required</CardTitle>
            <CardDescription className="text-yellow-700">
              A credit card is required to activate your free account. You won't be charged unless you upgrade or exceed limits.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button>
              <CreditCard className="w-4 h-4 mr-2" />
              Add Payment Method
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
