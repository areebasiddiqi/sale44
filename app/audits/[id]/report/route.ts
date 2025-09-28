import { createClient } from '@/lib/supabase/server'
import { generateAuditReport } from '@/lib/pdf/report-generator'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get audit
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (auditError || !audit) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 })
    }

    if (!audit.total_score) {
      return NextResponse.json({ error: 'Audit not completed' }, { status: 400 })
    }

    // Reconstruct audit result with enhanced AI data
    const auditResult = {
      totalScore: audit.total_score,
      parameters: audit.parameter_scores,
      businessInfo: {
        name: audit.business_name || audit.business_url,
        url: audit.business_url,
        industry: audit.report_data?.businessInfo?.industry,
        description: audit.report_data?.businessInfo?.description
      },
      // Enhanced AI analysis data
      executiveSummary: audit.report_data?.executiveSummary,
      keyFindings: audit.report_data?.keyFindings,
      priorityRecommendations: audit.report_data?.priorityRecommendations,
      competitiveAnalysis: audit.report_data?.competitiveAnalysis,
      growthOpportunities: audit.report_data?.growthOpportunities,
      riskAssessment: audit.report_data?.riskAssessment,
      actionPlan: audit.report_data?.actionPlan,
      industryBenchmarks: audit.report_data?.industryBenchmarks,
      detailedAnalysis: audit.report_data?.detailedAnalysis
    }

    // Generate PDF
    const pdfBytes = await generateAuditReport(audit, auditResult, audit.watermarked)
    
    console.log('Generated PDF size:', pdfBytes.length, 'bytes')
    console.log('PDF first few bytes:', Array.from(pdfBytes.slice(0, 10)).map(b => b.toString(16)).join(' '))

    // Return PDF response
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="audit-report-${audit.business_name || 'business'}-${new Date().toISOString().split('T')[0]}.pdf"`,
        'Content-Length': pdfBytes.length.toString(),
        'Cache-Control': 'no-cache',
      },
    })

  } catch (error) {
    console.error('Error generating PDF report:', error)
    return NextResponse.json({ 
      error: 'Failed to generate report' 
    }, { status: 500 })
  }
}
