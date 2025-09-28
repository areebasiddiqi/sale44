import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { promises as dns } from 'dns'
import { Socket } from 'net'
import { getCurrentMonthYear } from '@/lib/utils'
import { PLANS } from '@/lib/stripe'

interface EmailVerificationResult {
  email: string
  isValid: boolean
  score?: number
  message: string
  details?: {
    syntax: boolean
    domain: boolean
    smtp: boolean
    disposable: boolean
    role: boolean
  }
}

// SMTP verification function
async function checkSMTP(email: string, mxRecord: string): Promise<{ valid: boolean; message: string }> {
  return new Promise((resolve) => {
    const socket = new Socket()
    const timeout = 10000 // 10 seconds timeout
    let response = ''
    let step = 0
    
    const cleanup = () => {
      socket.removeAllListeners()
      socket.destroy()
    }
    
    const timeoutId = setTimeout(() => {
      cleanup()
      resolve({ valid: false, message: 'SMTP timeout' })
    }, timeout)
    
    socket.on('data', (data) => {
      response += data.toString()
      
      try {
        if (step === 0 && response.includes('220')) {
          // Server ready, send HELO
          socket.write('HELO verify.local\r\n')
          step = 1
          response = ''
        } else if (step === 1 && response.includes('250')) {
          // HELO accepted, send MAIL FROM
          socket.write('MAIL FROM:<verify@verify.local>\r\n')
          step = 2
          response = ''
        } else if (step === 2 && response.includes('250')) {
          // MAIL FROM accepted, send RCPT TO
          socket.write(`RCPT TO:<${email}>\r\n`)
          step = 3
          response = ''
        } else if (step === 3) {
          // Check RCPT TO response
          clearTimeout(timeoutId)
          cleanup()
          
          if (response.includes('250')) {
            resolve({ valid: true, message: 'Email address exists' })
          } else if (response.includes('550') || response.includes('551') || response.includes('553')) {
            resolve({ valid: false, message: 'Email address does not exist' })
          } else if (response.includes('450') || response.includes('451') || response.includes('452')) {
            resolve({ valid: false, message: 'Temporary server error' })
          } else {
            resolve({ valid: false, message: 'Unknown SMTP response' })
          }
        }
      } catch (error) {
        clearTimeout(timeoutId)
        cleanup()
        resolve({ valid: false, message: 'SMTP protocol error' })
      }
    })
    
    socket.on('error', (error) => {
      clearTimeout(timeoutId)
      cleanup()
      resolve({ valid: false, message: `SMTP connection error: ${error.message}` })
    })
    
    socket.on('close', () => {
      clearTimeout(timeoutId)
      cleanup()
      if (step < 3) {
        resolve({ valid: false, message: 'SMTP connection closed unexpectedly' })
      }
    })
    
    // Connect to MX server on port 25
    socket.connect(25, mxRecord)
  })
}

// Get MX records for domain
async function getMXRecords(domain: string): Promise<string[]> {
  try {
    const records = await dns.resolveMx(domain)
    return records
      .sort((a, b) => a.priority - b.priority)
      .map(record => record.exchange)
  } catch (error) {
    return []
  }
}

// Enhanced email validation function with SMTP verification
async function verifyEmail(email: string): Promise<EmailVerificationResult> {
  console.log(`Starting verification for: ${email}`)
  
  // Basic syntax validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return {
      email,
      isValid: false,
      score: 0,
      message: 'Invalid email format',
      details: {
        syntax: false,
        domain: false,
        smtp: false,
        disposable: false,
        role: false
      }
    }
  }

  const [localPart, domain] = email.split('@')
  
  // Check for common disposable email domains
  const disposableDomains = [
    '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com',
    'yopmail.com', 'temp-mail.org', 'throwaway.email', 'maildrop.cc',
    'sharklasers.com', 'guerrillamailblock.com', 'pokemail.net', 'spam4.me'
  ]
  
  const isDisposable = disposableDomains.includes(domain.toLowerCase())
  
  // Check for role-based emails
  const roleBasedPrefixes = ['admin', 'support', 'info', 'contact', 'sales', 'marketing', 'noreply', 'no-reply']
  const isRole = roleBasedPrefixes.some(prefix => localPart.toLowerCase().startsWith(prefix))
  
  // Basic domain validation (check if it has a valid TLD)
  const validTlds = ['.com', '.org', '.net', '.edu', '.gov', '.mil', '.int', '.co', '.io', '.ai', '.app']
  const hasValidTld = validTlds.some(tld => domain.toLowerCase().endsWith(tld)) || 
                     /\.[a-z]{2,4}$/i.test(domain)
  
  // Get MX records for the domain
  console.log(`Getting MX records for domain: ${domain}`)
  const mxRecords = await getMXRecords(domain)
  const hasMXRecord = mxRecords.length > 0
  
  // SMTP verification
  let smtpValid = false
  let smtpMessage = 'SMTP check skipped'
  
  if (hasMXRecord && !isDisposable) {
    console.log(`Found MX records: ${mxRecords.join(', ')}`)
    console.log(`Attempting SMTP verification for: ${email}`)
    
    // Try the first MX record
    try {
      const smtpResult = await checkSMTP(email, mxRecords[0])
      smtpValid = smtpResult.valid
      smtpMessage = smtpResult.message
      console.log(`SMTP result: ${smtpValid ? 'Valid' : 'Invalid'} - ${smtpMessage}`)
    } catch (error) {
      console.log(`SMTP verification failed: ${error}`)
      smtpMessage = 'SMTP verification failed'
    }
  } else if (!hasMXRecord) {
    smtpMessage = 'No MX record found'
  } else if (isDisposable) {
    smtpMessage = 'Disposable domain - SMTP check skipped'
  }
  
  // Calculate score based on various factors
  let score = 0
  const details = {
    syntax: true, // Already validated above
    domain: hasValidTld && hasMXRecord,
    smtp: smtpValid,
    disposable: !isDisposable,
    role: !isRole
  }
  
  // Calculate score
  if (details.syntax) score += 20
  if (details.domain) score += 25
  if (details.smtp) score += 35
  if (details.disposable) score += 15
  if (details.role) score += 5
  
  const isValid = score >= 70 && !isDisposable && smtpValid
  
  let message = 'Valid email address'
  if (isDisposable) {
    message = 'Disposable email address detected'
  } else if (!hasMXRecord) {
    message = 'Domain has no mail server (MX record)'
  } else if (!smtpValid && smtpMessage !== 'SMTP check skipped') {
    message = `Email verification failed: ${smtpMessage}`
  } else if (isRole) {
    message = 'Role-based email address (may be valid but not personal)'
  } else if (!hasValidTld) {
    message = 'Invalid domain format'
  } else if (score < 70) {
    message = 'Email may not be deliverable'
  }
  
  console.log(`Final result for ${email}: ${isValid ? 'Valid' : 'Invalid'} (Score: ${score}) - ${message}`)
  
  return {
    email,
    isValid,
    score,
    message,
    details
  }
}

// Generate lead from verified email
async function generateLeadFromEmail(email: string, userId: string, supabase: any): Promise<any> {
  const domain = email.split('@')[1]
  const name = email.split('@')[0]
  
  // First, try to find an existing audit for this user to associate the lead with
  // If no audit exists, we'll create a placeholder or skip audit_id
  let auditId = null
  try {
    const { data: existingAudit } = await supabase
      .from('audits')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (existingAudit) {
      auditId = existingAudit.id
    }
  } catch (auditError) {
    console.log('No existing audit found, will try without audit_id')
  }

  // Create basic lead data
  const leadData: any = {
    user_id: userId,
    email: email,
    name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
    created_at: new Date().toISOString()
  }

  // Add audit_id only if we found one or if it's required
  if (auditId) {
    leadData.audit_id = auditId
  }

  // Add the required company_name field based on the error message
  leadData.company_name = domain.replace(/\.(com|org|net|edu|gov)$/, '') // Remove common TLDs
  
  // Try to add additional fields if they exist in the table
  try {
    leadData.company = domain.replace(/\.(com|org|net|edu|gov)$/, '') // Remove common TLDs
    leadData.domain = domain
    leadData.status = 'verified'
    leadData.source = 'email_verification'
  } catch (schemaCheckError) {
    console.log('Additional columns not available, using basic lead data')
  }

  // Insert lead into database
  const { data: lead, error } = await supabase
    .from('leads')
    .insert(leadData)
    .select()
    .single()

  if (error) {
    console.error('Error creating lead:', error)
    console.log('Lead data attempted:', leadData)
    return null
  }

  return lead
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { emails } = await request.json()
    
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: 'No emails provided' }, { status: 400 })
    }

    if (emails.length > 100) {
      return NextResponse.json({ error: 'Maximum 100 emails allowed per request' }, { status: 400 })
    }

    // Get user profile and usage limits
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

    const currentUsage = usage || { leads_used: 0, credits_used: 0 }
    const planLimits = PLANS[profile.plan as keyof typeof PLANS]

    // Verify each email
    const results: EmailVerificationResult[] = []
    const generatedLeads: any[] = []
    let leadsGenerated = 0
    
    for (const email of emails) {
      if (typeof email !== 'string' || !email.trim()) {
        continue
      }
      
      const result = await verifyEmail(email.trim().toLowerCase())
      results.push(result)
      
      // Generate lead only for valid emails and if within limits
      if (result.isValid && (currentUsage.leads_used + leadsGenerated) < planLimits.leads) {
        const lead = await generateLeadFromEmail(result.email, user.id, supabase)
        if (lead) {
          generatedLeads.push(lead)
          leadsGenerated++
        }
      }
      
      // Store verification result in database
      try {
        await supabase
          .from('email_verifications')
          .insert({
            user_id: user.id,
            email: result.email,
            is_valid: result.isValid,
            deliverable_score: result.score,
            result_message: result.message,
            verification_details: result.details
          })
      } catch (dbError) {
        console.error('Error storing verification result:', dbError)
        // Continue with other emails even if one fails to store
      }
    }

    // Update usage if leads were generated
    if (leadsGenerated > 0) {
      if (usage) {
        await supabase
          .from('usage')
          .update({ 
            leads_used: currentUsage.leads_used + leadsGenerated,
            credits_used: currentUsage.credits_used + leadsGenerated // 1 credit per lead
          })
          .eq('id', usage.id)
      } else {
        await supabase
          .from('usage')
          .insert({
            user_id: user.id,
            month_year: currentMonth,
            audits_used: 0,
            leads_used: leadsGenerated,
            credits_used: leadsGenerated
          })
      }
    }

    return NextResponse.json({
      success: true,
      results,
      leads: generatedLeads,
      total: results.length,
      valid: results.filter(r => r.isValid).length,
      leadsGenerated: leadsGenerated,
      message: leadsGenerated > 0 ? `${leadsGenerated} leads generated from verified emails` : 'Email verification completed'
    })

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json({ 
      error: 'Failed to verify emails' 
    }, { status: 500 })
  }
}
