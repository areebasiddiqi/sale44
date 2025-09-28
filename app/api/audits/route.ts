import { createClient } from '@/lib/supabase/server'
import { analyzeWebsite } from '@/lib/audit/scoring'
import { generateEnhancedAuditAnalysis } from '@/lib/openai/audit-analyzer'
import { getCurrentMonthYear } from '@/lib/utils'
import { PLANS } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get request body
    const { business_url, business_name } = await request.json()

    if (!business_url) {
      return NextResponse.json({ error: 'Business URL is required' }, { status: 400 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Check usage limits
    const currentMonth = getCurrentMonthYear()
    const { data: usage } = await supabase
      .from('usage')
      .select('*')
      .eq('user_id', user.id)
      .eq('month_year', currentMonth)
      .single()

    const currentUsage = usage || { audits_used: 0, leads_used: 0, credits_used: 0 }
    const planLimits = PLANS[profile.plan as keyof typeof PLANS]

    if (currentUsage.audits_used >= planLimits.audits) {
      return NextResponse.json({ 
        error: `Monthly audit limit reached (${planLimits.audits}). Please upgrade your plan or wait for next month.` 
      }, { status: 429 })
    }

    // Perform website analysis
    console.log('Starting basic website analysis for:', business_url)
    const basicAuditResult = await analyzeWebsite(business_url)

    // Generate enhanced AI analysis
    console.log('Generating enhanced AI analysis...')
    let enhancedAuditResult: any = null
    
    try {
      if (process.env.OPENAI_API_KEY) {
        const businessData = {
          url: business_url,
          name: business_name || basicAuditResult.businessInfo?.name,
          industry: basicAuditResult.businessInfo?.industry,
          description: basicAuditResult.businessInfo?.description
        }
        
        enhancedAuditResult = await generateEnhancedAuditAnalysis(businessData, basicAuditResult)
        console.log('Enhanced AI analysis completed successfully')
      } else {
        console.log('OpenAI API key not found, using basic analysis')
      }
    } catch (aiError) {
      console.error('AI analysis failed, falling back to basic analysis:', aiError)
      enhancedAuditResult = null
    }

    // Prepare enhanced report data
    const reportData: any = {
      businessInfo: basicAuditResult.businessInfo,
      analysisDate: new Date().toISOString(),
      planType: profile.plan
    }

    // Add enhanced AI data if available
    if (enhancedAuditResult) {
      reportData.executiveSummary = enhancedAuditResult.executiveSummary
      reportData.keyFindings = enhancedAuditResult.keyFindings
      reportData.priorityRecommendations = enhancedAuditResult.priorityRecommendations
      reportData.competitiveAnalysis = enhancedAuditResult.competitiveAnalysis
      reportData.growthOpportunities = enhancedAuditResult.growthOpportunities
      reportData.riskAssessment = enhancedAuditResult.riskAssessment
      reportData.actionPlan = enhancedAuditResult.actionPlan
      reportData.industryBenchmarks = enhancedAuditResult.industryBenchmarks
      reportData.detailedAnalysis = enhancedAuditResult.detailedAnalysis
    }

    // Create audit record with enhanced data
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .insert({
        user_id: user.id,
        business_url: business_url,
        business_name: business_name || basicAuditResult.businessInfo?.name,
        total_score: enhancedAuditResult?.totalScore || basicAuditResult.totalScore,
        parameter_scores: enhancedAuditResult?.parameters || basicAuditResult.parameters,
        report_data: reportData,
        watermarked: profile.plan === 'free'
      })
      .select()
      .single()

    if (auditError) {
      console.error('Error creating audit:', auditError)
      return NextResponse.json({ error: 'Failed to save audit' }, { status: 500 })
    }

    // Update usage
    if (usage) {
      await supabase
        .from('usage')
        .update({ 
          audits_used: currentUsage.audits_used + 1,
          credits_used: currentUsage.credits_used + 10 // 10 credits per audit
        })
        .eq('id', usage.id)
    } else {
      await supabase
        .from('usage')
        .insert({
          user_id: user.id,
          month_year: currentMonth,
          audits_used: 1,
          leads_used: 0,
          credits_used: 10
        })
    }

    return NextResponse.json({ 
      audit,
      message: 'Audit completed successfully' 
    })

  } catch (error) {
    console.error('Error in audit API:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's audits
    const { data: audits, error } = await supabase
      .from('audits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch audits' }, { status: 500 })
    }

    return NextResponse.json({ audits })

  } catch (error) {
    console.error('Error fetching audits:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
