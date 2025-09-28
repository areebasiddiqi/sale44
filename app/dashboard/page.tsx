import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BarChart3, Users, CreditCard, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import { PLANS } from '@/lib/stripe'
import { getCurrentMonthYear } from '@/lib/utils'

async function getUserData(userId: string) {
  const supabase = createClient()
  
  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  // Get current month usage
  const currentMonth = getCurrentMonthYear()
  const { data: usage } = await supabase
    .from('usage')
    .select('*')
    .eq('user_id', userId)
    .eq('month_year', currentMonth)
    .single()

  // Get recent audits
  const { data: recentAudits } = await supabase
    .from('audits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get total stats
  const { count: totalAudits } = await supabase
    .from('audits')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)

  const { count: totalLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)

  return {
    profile,
    usage: usage || { audits_used: 0, leads_used: 0, credits_used: 0 },
    recentAudits: recentAudits || [],
    totalAudits: totalAudits || 0,
    totalLeads: totalLeads || 0
  }
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { profile, usage, recentAudits, totalAudits, totalLeads } = await getUserData(user.id)
  
  if (!profile) return null

  const currentPlan = PLANS[profile.plan as keyof typeof PLANS]
  const usagePercentages = {
    audits: Math.round((usage.audits_used / currentPlan.audits) * 100),
    leads: Math.round((usage.leads_used / currentPlan.leads) * 100),
    credits: Math.round((usage.credits_used / currentPlan.credits) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your account overview.</p>
        </div>
        <Button asChild>
          <Link href="/audits/new">
            <BarChart3 className="w-4 h-4 mr-2" />
            New Audit
          </Link>
        </Button>
      </div>

      {/* Plan Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Current Plan: {currentPlan.name}
              </CardTitle>
              <CardDescription>
                {profile.plan === 'free' 
                  ? 'Upgrade to unlock more features and higher limits'
                  : `$${currentPlan.price}/month - Next billing cycle starts soon`
                }
              </CardDescription>
            </div>
            {profile.plan === 'free' && (
              <Button asChild>
                <Link href="/billing">Upgrade Plan</Link>
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Audits This Month</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usage.audits_used}</div>
            <p className="text-xs text-muted-foreground">
              of {currentPlan.audits} available ({usagePercentages.audits}%)
            </p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  usagePercentages.audits >= 90 ? 'bg-red-500' : 
                  usagePercentages.audits >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(usagePercentages.audits, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Generated</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usage.leads_used}</div>
            <p className="text-xs text-muted-foreground">
              of {currentPlan.leads} available ({usagePercentages.leads}%)
            </p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  usagePercentages.leads >= 90 ? 'bg-red-500' : 
                  usagePercentages.leads >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(usagePercentages.leads, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Credits Used</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usage.credits_used}</div>
            <p className="text-xs text-muted-foreground">
              of {currentPlan.credits} available ({usagePercentages.credits}%)
            </p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  usagePercentages.credits >= 90 ? 'bg-red-500' : 
                  usagePercentages.credits >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(usagePercentages.credits, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Audits Completed</span>
              <span className="font-semibold">{totalAudits}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Leads Generated</span>
              <span className="font-semibold">{totalLeads}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Account Status</span>
              <span className="flex items-center text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Member Since</span>
              <span className="font-semibold">
                {new Date(profile.created_at).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest business audits</CardDescription>
          </CardHeader>
          <CardContent>
            {recentAudits.length > 0 ? (
              <div className="space-y-3">
                {recentAudits.map((audit) => (
                  <div key={audit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{audit.business_name || audit.business_url}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(audit.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {audit.total_score && (
                        <span className={`text-sm font-semibold ${
                          audit.total_score >= 80 ? 'text-green-600' :
                          audit.total_score >= 60 ? 'text-blue-600' :
                          audit.total_score >= 40 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {audit.total_score}/100
                        </span>
                      )}
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/audits/${audit.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No audits yet</p>
                <Button asChild>
                  <Link href="/audits/new">Create Your First Audit</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts/Notifications */}
      {(usagePercentages.audits >= 80 || usagePercentages.leads >= 80 || usagePercentages.credits >= 80) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800">
              <AlertCircle className="w-5 h-5 mr-2" />
              Usage Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700 mb-4">
              You're approaching your monthly limits. Consider upgrading your plan to avoid service interruption.
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" asChild>
                <Link href="/billing">View Plans</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/billing/add-ons">Buy Add-ons</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
