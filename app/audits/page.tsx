import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BarChart3, Plus, Eye, Calendar } from 'lucide-react'
import { formatDateTime, getScoreColor, getScoreLabel } from '@/lib/utils'
import { DownloadReportButton } from '@/components/audit/download-report-button'

async function getUserAudits(userId: string) {
  const supabase = createClient()
  
  const { data: audits, error } = await supabase
    .from('audits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching audits:', error)
    return []
  }

  return audits || []
}

export default async function AuditsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const audits = await getUserAudits(user.id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Audits</h1>
          <p className="text-gray-600">Analyze businesses and uncover opportunities</p>
        </div>
        <Button asChild>
          <Link href="/audits/new">
            <Plus className="w-4 h-4 mr-2" />
            New Audit
          </Link>
        </Button>
      </div>

      {audits.length > 0 ? (
        <div className="grid gap-6">
          {audits.map((audit) => (
            <Card key={audit.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                      {audit.business_name || audit.business_url}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDateTime(audit.created_at)}
                    </CardDescription>
                  </div>
                  {audit.total_score !== null && (
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(audit.total_score)}`}>
                        {audit.total_score}
                      </div>
                      <div className={`text-sm ${getScoreColor(audit.total_score)}`}>
                        {getScoreLabel(audit.total_score)}
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>URL:</strong> {audit.business_url}
                    </p>
                    {audit.total_score !== null && (
                      <div className="flex flex-wrap gap-2 text-xs">
                        {Object.entries(audit.parameter_scores as Record<string, any>).map(([key, value]) => (
                          <span
                            key={key}
                            className={`px-2 py-1 rounded-full ${
                              value.score >= 80 ? 'bg-green-100 text-green-800' :
                              value.score >= 60 ? 'bg-blue-100 text-blue-800' :
                              value.score >= 40 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}
                          >
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {value.score}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/audits/${audit.id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    <DownloadReportButton 
                      auditId={audit.id}
                      businessName={audit.business_name || audit.business_url}
                    />
                    <Button size="sm" asChild>
                      <Link href="/email-verification">
                        Verify Emails
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No audits yet</h3>
            <p className="text-gray-600 mb-6">
              Start by creating your first business audit to analyze opportunities and weaknesses.
            </p>
            <Button asChild>
              <Link href="/audits/new">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Audit
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
