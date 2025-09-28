import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { 
  BarChart3, 
  Mail, 
  Globe, 
  Calendar,
  TrendingUp,
  Shield,
  Eye,
  Zap,
  Target
} from 'lucide-react'
import { formatDateTime, getScoreColor, getScoreLabel } from '@/lib/utils'
import { AuditScoreChart } from '@/components/audit/score-chart'
import { DownloadReportButton } from '@/components/audit/download-report-button'

async function getAudit(auditId: string, userId: string) {
  const supabase = createClient()
  
  const { data: audit, error } = await supabase
    .from('audits')
    .select('*')
    .eq('id', auditId)
    .eq('user_id', userId)
    .single()

  if (error || !audit) {
    return null
  }

  return audit
}

const parameterIcons = {
  digitalPresence: Globe,
  marketVisibility: TrendingUp,
  businessOperations: Zap,
  competitivePositioning: Target,
  dataInsight: BarChart3,
  compliance: Shield
}

export default async function AuditDetailPage({
  params
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return notFound()
  }

  const audit = await getAudit(params.id, user.id)
  
  if (!audit) {
    return notFound()
  }

  const parameters = audit.parameter_scores as Record<string, any>
  const businessInfo = audit.report_data?.businessInfo || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {audit.business_name || businessInfo.name || 'Business Audit'}
          </h1>
          <p className="text-gray-600 flex items-center mt-1">
            <Calendar className="w-4 h-4 mr-1" />
            {formatDateTime(audit.created_at)}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <DownloadReportButton 
            auditId={audit.id}
            businessName={audit.business_name || businessInfo.name}
            variant="outline"
            size="default"
          >
            Download Report
          </DownloadReportButton>
          <Button asChild>
            <Link href="/email-verification">
              <Mail className="w-4 h-4 mr-2" />
              Verify Emails
            </Link>
          </Button>
        </div>
      </div>

      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Overall Audit Score
            </span>
            {audit.total_score !== null && (
              <div className="text-right">
                <div className={`text-4xl font-bold ${getScoreColor(audit.total_score)}`}>
                  {audit.total_score}
                </div>
                <div className={`text-lg ${getScoreColor(audit.total_score)}`}>
                  {getScoreLabel(audit.total_score)}
                </div>
              </div>
            )}
          </CardTitle>
          <CardDescription>
            Comprehensive analysis across 6 key business parameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Business Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Website:</span>
                  <a 
                    href={audit.business_url.startsWith('http') ? audit.business_url : `https://${audit.business_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {audit.business_url}
                  </a>
                </div>
                {businessInfo.industry && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Industry:</span>
                    <span>{businessInfo.industry}</span>
                  </div>
                )}
                {businessInfo.description && (
                  <div className="mt-3">
                    <span className="text-gray-600 block mb-1">Description:</span>
                    <p className="text-sm">{businessInfo.description}</p>
                  </div>
                )}
              </div>
            </div>
            
            {audit.total_score !== null && (
              <div>
                <AuditScoreChart 
                  totalScore={audit.total_score}
                  parameters={parameters}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Parameter Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(parameters).map(([key, param]: [string, any]) => {
          const Icon = parameterIcons[key as keyof typeof parameterIcons] || BarChart3
          
          return (
            <Card key={key}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Icon className="w-5 h-5 mr-2" />
                    {param.name}
                  </span>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(param.score)}`}>
                      {param.score}
                    </div>
                    <div className="text-sm text-gray-500">
                      Weight: {param.weight}%
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        param.score >= 80 ? 'bg-green-500' :
                        param.score >= 60 ? 'bg-blue-500' :
                        param.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${param.score}%` }}
                    />
                  </div>

                  {/* Insights */}
                  {param.insights && param.insights.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2 text-green-700">✓ Strengths</h4>
                      <ul className="text-sm space-y-1">
                        {param.insights.map((insight: string, index: number) => (
                          <li key={index} className="text-green-600">{insight}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {param.recommendations && param.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2 text-orange-700">⚠ Recommendations</h4>
                      <ul className="text-sm space-y-1">
                        {param.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="text-orange-600">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>
            Recommended actions based on your audit results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DownloadReportButton 
              auditId={audit.id}
              businessName={audit.business_name || businessInfo.name}
              variant="outline"
              size="default"
            >
              Download Full Report
            </DownloadReportButton>
            <Button variant="outline" asChild>
              <Link href="/email-verification">
                <Mail className="w-4 h-4 mr-2" />
                Verify Email Addresses
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/audits/new">
                <BarChart3 className="w-4 h-4 mr-2" />
                Audit Another Business
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Watermark for free users */}
      {audit.watermarked && (
        <div className="text-center py-4 text-sm text-gray-500">
          <p>This audit was generated with Sale44 Free plan</p>
          <Button variant="link" asChild>
            <Link href="/billing">Upgrade to remove watermarks</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
