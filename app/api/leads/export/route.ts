import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'

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
    const format = searchParams.get('format') || 'csv'

    // Get user's leads
    let query = supabase
      .from('leads')
      .select(`
        *,
        audits!inner(business_name, business_url)
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

    if (!leads || leads.length === 0) {
      return NextResponse.json({ error: 'No leads found' }, { status: 404 })
    }

    // Prepare data for export
    const exportData = leads.map((lead: any) => ({
      'Company Name': lead.company_name,
      'Contact Name': lead.contact_name,
      'Email': lead.email,
      'Phone': lead.phone || '',
      'Title': lead.title || '',
      'Industry': lead.industry || '',
      'Company Size': lead.company_size || '',
      'Location': lead.location || '',
      'Accuracy Verified': lead.verified_status.accuracy ? 'Yes' : 'No',
      'Deliverability Verified': lead.verified_status.deliverability ? 'Yes' : 'No',
      'Relevance Verified': lead.verified_status.relevance ? 'Yes' : 'No',
      'Compliance Verified': lead.verified_status.compliance ? 'Yes' : 'No',
      'Source Audit': lead.audits.business_name || lead.audits.business_url,
      'Generated Date': new Date(lead.created_at).toLocaleDateString()
    }))

    if (format === 'json') {
      return NextResponse.json(exportData, {
        headers: {
          'Content-Disposition': `attachment; filename="leads-export-${new Date().toISOString().split('T')[0]}.json"`,
        },
      })
    }

    // Default to CSV
    const csv = Papa.unparse(exportData)
    
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="leads-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })

  } catch (error) {
    console.error('Error exporting leads:', error)
    return NextResponse.json({ 
      error: 'Failed to export leads' 
    }, { status: 500 })
  }
}
