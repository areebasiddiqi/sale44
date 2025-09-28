import { createClient } from '@/lib/supabase/server'
import { generateLeads } from '@/lib/leads/generator'
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
    const { audit_id, target_count, industry, location, company_size, job_titles } = await request.json()

    if (!audit_id) {
      return NextResponse.json({ error: 'Audit ID is required' }, { status: 400 })
    }

    if (!target_count || target_count < 1 || target_count > 1000) {
      return NextResponse.json({ error: 'Target count must be between 1 and 1000' }, { status: 400 })
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

    // Get audit
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .select('*')
      .eq('id', audit_id)
      .eq('user_id', user.id)
      .single()

    if (auditError || !audit) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 })
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

    if (currentUsage.leads_used + target_count > planLimits.leads) {
      const available = planLimits.leads - currentUsage.leads_used
      return NextResponse.json({ 
        error: `Monthly lead limit exceeded. You have ${available} leads remaining this month.` 
      }, { status: 429 })
    }

    // Generate leads
    const auditResult = {
      totalScore: audit.total_score,
      parameters: audit.parameter_scores,
      businessInfo: audit.report_data?.businessInfo || {
        name: audit.business_name,
        url: audit.business_url,
        industry: industry || 'Technology'
      }
    }

    const leads = await generateLeads(auditResult, {
      targetCount: target_count,
      industry,
      location,
      companySize: company_size,
      jobTitles: job_titles
    })

    // Save leads to database
    const leadsToInsert = leads.map(lead => ({
      audit_id: audit_id,
      user_id: user.id,
      company_name: lead.company_name,
      contact_name: lead.contact_name,
      email: lead.email,
      phone: lead.phone,
      verified_status: lead.verified_status
    }))

    const { data: savedLeads, error: saveError } = await supabase
      .from('leads')
      .insert(leadsToInsert)
      .select()

    if (saveError) {
      console.error('Error saving leads:', saveError)
      return NextResponse.json({ error: 'Failed to save leads' }, { status: 500 })
    }

    // Update usage
    const creditsUsed = target_count * 2 // 2 credits per lead
    if (usage) {
      await supabase
        .from('usage')
        .update({ 
          leads_used: currentUsage.leads_used + target_count,
          credits_used: currentUsage.credits_used + creditsUsed
        })
        .eq('id', usage.id)
    } else {
      await supabase
        .from('usage')
        .insert({
          user_id: user.id,
          month_year: currentMonth,
          audits_used: currentUsage.audits_used,
          leads_used: target_count,
          credits_used: currentUsage.credits_used + creditsUsed
        })
    }

    return NextResponse.json({ 
      leads: savedLeads,
      count: savedLeads?.length || 0,
      message: 'Leads generated successfully' 
    })

  } catch (error) {
    console.error('Error in leads API:', error)
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

    const { searchParams } = new URL(request.url)
    const auditId = searchParams.get('audit_id')

    // Get user's leads
    let query = supabase
      .from('leads')
      .select(`
        *,
        audits!inner(id, business_name, business_url, created_at)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (auditId) {
      query = query.eq('audit_id', auditId)
    }

    const { data: leads, error } = await query

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
    }

    return NextResponse.json({ leads })

  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
