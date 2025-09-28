import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Users, Plus, Download, Eye, Filter } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

async function getUserLeads(userId: string, auditId?: string) {
  const supabase = createClient()
  
  let query = supabase
    .from('leads')
    .select(`
      *,
      audits!inner(id, business_name, business_url, created_at)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (auditId) {
    query = query.eq('audit_id', auditId)
  }

  const { data: leads, error } = await query

  if (error) {
    console.error('Error fetching leads:', error)
    return []
  }

  return leads || []
}

async function getUserAudits(userId: string) {
  const supabase = createClient()
  
  const { data: audits, error } = await supabase
    .from('audits')
    .select('id, business_name, business_url, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching audits:', error)
    return []
  }

  return audits || []
}

export default async function LeadsPage({
  searchParams
}: {
  searchParams: { audit_id?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const leads = await getUserLeads(user.id, searchParams.audit_id)
  const audits = await getUserAudits(user.id)

  const getVerificationStatus = (lead: any) => {
    const status = lead.verified_status
    const verified = Object.values(status).filter(Boolean).length
    const total = Object.keys(status).length
    return { verified, total, percentage: Math.round((verified / total) * 100) }
  }

  const getVerificationColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-600 bg-green-50'
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Generated Leads</h1>
          <p className="text-gray-600">Verified contacts for your business outreach</p>
        </div>
        <div className="flex items-center space-x-3">
          {audits.length > 0 && (
            <Button variant="outline" asChild>
              <Link href="/leads/generate">
                <Plus className="w-4 h-4 mr-2" />
                Generate New Leads
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Filter by Audit */}
      {audits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filter by Audit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={!searchParams.audit_id ? "default" : "outline"} 
                size="sm" 
                asChild
              >
                <Link href="/leads">All Leads</Link>
              </Button>
              {audits.map((audit) => (
                <Button 
                  key={audit.id}
                  variant={searchParams.audit_id === audit.id ? "default" : "outline"} 
                  size="sm" 
                  asChild
                >
                  <Link href={`/leads?audit_id=${audit.id}`}>
                    {audit.business_name || audit.business_url}
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {leads.length > 0 ? (
        <div className="space-y-4">
          {/* Export Options */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
          </div>

          {/* Leads List */}
          <div className="grid gap-4">
            {leads.map((lead: any) => {
              const verification = getVerificationStatus(lead)
              return (
                <Card key={lead.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center">
                          <Users className="w-5 h-5 mr-2 text-blue-600" />
                          {lead.contact_name}
                        </CardTitle>
                        <CardDescription>
                          {lead.title && `${lead.title} at `}{lead.company_name}
                        </CardDescription>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getVerificationColor(verification.percentage)}`}>
                        {verification.percentage}% Verified
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Contact Information</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-mono">{lead.email}</span>
                          </div>
                          {lead.phone && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Phone:</span>
                              <span className="font-mono">{lead.phone}</span>
                            </div>
                          )}
                          {lead.location && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Location:</span>
                              <span>{lead.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm mb-2">Company Details</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Company:</span>
                            <span>{lead.company_name}</span>
                          </div>
                          {lead.industry && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Industry:</span>
                              <span>{lead.industry}</span>
                            </div>
                          )}
                          {lead.company_size && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Size:</span>
                              <span className="capitalize">{lead.company_size}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm mb-2">Verification Status</h4>
                        <div className="space-y-1 text-xs">
                          {Object.entries(lead.verified_status).map(([key, verified]: [string, any]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-600 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                              </span>
                              <span className={verified ? 'text-green-600' : 'text-red-600'}>
                                {verified ? '✓' : '✗'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Generated from: {lead.audits.business_name || lead.audits.business_url}
                        <br />
                        {formatDateTime(lead.created_at)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/audits/${lead.audit_id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            View Audit
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads generated yet</h3>
            <p className="text-gray-600 mb-6">
              {audits.length > 0 
                ? 'Generate leads from your business audits to start building your prospect list.'
                : 'Create a business audit first, then generate targeted leads from the insights.'
              }
            </p>
            <div className="flex justify-center space-x-3">
              {audits.length > 0 ? (
                <Button asChild>
                  <Link href="/leads/generate">
                    <Plus className="w-4 h-4 mr-2" />
                    Generate Your First Leads
                  </Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/audits/new">
                    Create Your First Audit
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
