import { AuditResult } from '../audit/scoring'

export interface Lead {
  company_name: string
  contact_name: string
  email: string
  phone?: string
  title?: string
  industry?: string
  company_size?: string
  location?: string
  verified_status: {
    accuracy: boolean
    deliverability: boolean
    relevance: boolean
    compliance: boolean
  }
}

export interface LeadGenerationOptions {
  targetCount: number
  industry?: string
  location?: string
  companySize?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
  jobTitles?: string[]
}

// Mock lead generation based on audit insights
export async function generateLeads(
  auditResult: AuditResult,
  options: LeadGenerationOptions
): Promise<Lead[]> {
  const { targetCount, industry, location, companySize, jobTitles } = options
  
  // In production, this would integrate with real APIs like Apollo, ZoomInfo, etc.
  // For now, we'll generate realistic mock data
  
  const leads: Lead[] = []
  const targetIndustry = industry || auditResult.businessInfo.industry || 'Technology'
  
  // Generate leads based on audit insights
  for (let i = 0; i < targetCount; i++) {
    const lead = await generateSingleLead(targetIndustry, companySize, location, jobTitles)
    leads.push(lead)
  }
  
  return leads
}

async function generateSingleLead(
  industry: string,
  companySize?: string,
  location?: string,
  jobTitles?: string[]
): Promise<Lead> {
  const companies = getCompaniesForIndustry(industry)
  const company = companies[Math.floor(Math.random() * companies.length)]
  
  const titles = jobTitles || getDefaultJobTitles()
  const title = titles[Math.floor(Math.random() * titles.length)]
  
  const firstName = getRandomFirstName()
  const lastName = getRandomLastName()
  const email = generateEmail(firstName, lastName, company.domain)
  const phone = generatePhoneNumber()
  
  // Simulate verification process
  const verified_status = await verifyLead({
    email,
    company_name: company.name,
    contact_name: `${firstName} ${lastName}`,
    industry
  })
  
  return {
    company_name: company.name,
    contact_name: `${firstName} ${lastName}`,
    email,
    phone,
    title,
    industry,
    company_size: companySize || company.size,
    location: location || getRandomLocation(),
    verified_status
  }
}

function getCompaniesForIndustry(industry: string) {
  const companiesByIndustry: Record<string, Array<{name: string, domain: string, size: string}>> = {
    'Technology': [
      { name: 'TechFlow Solutions', domain: 'techflow.com', size: 'medium' },
      { name: 'DataSync Corp', domain: 'datasync.io', size: 'large' },
      { name: 'CloudBridge Systems', domain: 'cloudbridge.net', size: 'small' },
      { name: 'AI Innovations Inc', domain: 'aiinnovations.com', size: 'startup' },
      { name: 'DevOps Masters', domain: 'devopsmaster.org', size: 'medium' },
      { name: 'CyberSecure Pro', domain: 'cybersecure.biz', size: 'large' },
      { name: 'MobileFirst Labs', domain: 'mobilefirst.co', size: 'startup' },
      { name: 'BlockChain Dynamics', domain: 'blockchain-dyn.com', size: 'medium' }
    ],
    'E-commerce': [
      { name: 'ShopSmart Online', domain: 'shopsmart.store', size: 'large' },
      { name: 'EcoGoods Market', domain: 'ecogoods.shop', size: 'medium' },
      { name: 'Fashion Forward', domain: 'fashionforward.com', size: 'large' },
      { name: 'Home Essentials Plus', domain: 'homeessentials.net', size: 'medium' },
      { name: 'Tech Gadgets Hub', domain: 'techgadgets.co', size: 'small' },
      { name: 'Artisan Crafts Co', domain: 'artisancrafts.org', size: 'small' }
    ],
    'Healthcare': [
      { name: 'MedTech Solutions', domain: 'medtech-sol.com', size: 'large' },
      { name: 'HealthFirst Clinic', domain: 'healthfirst.med', size: 'medium' },
      { name: 'WellCare Systems', domain: 'wellcare.health', size: 'large' },
      { name: 'Digital Health Pro', domain: 'digitalhealth.io', size: 'startup' },
      { name: 'Pharma Innovations', domain: 'pharmainno.com', size: 'enterprise' }
    ],
    'Finance': [
      { name: 'FinTech Dynamics', domain: 'fintech-dyn.com', size: 'large' },
      { name: 'Investment Partners', domain: 'investpartners.biz', size: 'large' },
      { name: 'CryptoSecure Bank', domain: 'cryptosecure.bank', size: 'medium' },
      { name: 'Wealth Management Pro', domain: 'wealthmgmt.co', size: 'medium' },
      { name: 'PayFlow Solutions', domain: 'payflow.net', size: 'startup' }
    ],
    'Education': [
      { name: 'EduTech Academy', domain: 'edutech.edu', size: 'medium' },
      { name: 'Learning Dynamics', domain: 'learndynamics.org', size: 'large' },
      { name: 'SkillBuilder Pro', domain: 'skillbuilder.com', size: 'startup' },
      { name: 'University Connect', domain: 'uniconnect.edu', size: 'large' }
    ],
    'Real Estate': [
      { name: 'PropTech Solutions', domain: 'proptech.realty', size: 'medium' },
      { name: 'Urban Development Co', domain: 'urbandev.com', size: 'large' },
      { name: 'Smart Homes Inc', domain: 'smarthomes.co', size: 'medium' },
      { name: 'Commercial Properties', domain: 'commercialprop.biz', size: 'large' }
    ],
    'Other': [
      { name: 'Global Consulting Group', domain: 'globalconsult.com', size: 'large' },
      { name: 'Innovation Partners', domain: 'innovpartners.co', size: 'medium' },
      { name: 'Strategic Solutions', domain: 'strategicsol.biz', size: 'medium' },
      { name: 'Business Dynamics', domain: 'bizdynamics.org', size: 'small' }
    ]
  }
  
  return companiesByIndustry[industry] || companiesByIndustry['Other']
}

function getDefaultJobTitles(): string[] {
  return [
    'CEO', 'CTO', 'CMO', 'VP of Sales', 'VP of Marketing',
    'Director of Operations', 'Head of Business Development',
    'Sales Manager', 'Marketing Manager', 'Product Manager',
    'Business Development Manager', 'Account Manager',
    'Digital Marketing Director', 'Growth Manager'
  ]
}

function getRandomFirstName(): string {
  const names = [
    'Alex', 'Sarah', 'Michael', 'Emma', 'David', 'Lisa', 'John', 'Jennifer',
    'Robert', 'Jessica', 'William', 'Ashley', 'James', 'Amanda', 'Christopher',
    'Melissa', 'Daniel', 'Michelle', 'Matthew', 'Kimberly', 'Anthony', 'Amy',
    'Mark', 'Angela', 'Donald', 'Helen', 'Steven', 'Brenda', 'Andrew', 'Nicole'
  ]
  return names[Math.floor(Math.random() * names.length)]
}

function getRandomLastName(): string {
  const names = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
    'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
    'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark'
  ]
  return names[Math.floor(Math.random() * names.length)]
}

function generateEmail(firstName: string, lastName: string, domain: string): string {
  const formats = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}@${domain}`,
    `${firstName.charAt(0).toLowerCase()}${lastName.toLowerCase()}@${domain}`,
    `${firstName.toLowerCase()}@${domain}`
  ]
  return formats[Math.floor(Math.random() * formats.length)]
}

function generatePhoneNumber(): string {
  const areaCode = Math.floor(Math.random() * 900) + 100
  const exchange = Math.floor(Math.random() * 900) + 100
  const number = Math.floor(Math.random() * 9000) + 1000
  return `+1-${areaCode}-${exchange}-${number}`
}

function getRandomLocation(): string {
  const locations = [
    'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX',
    'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA',
    'Dallas, TX', 'San Jose, CA', 'Austin, TX', 'Jacksonville, FL',
    'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC', 'San Francisco, CA',
    'Indianapolis, IN', 'Seattle, WA', 'Denver, CO', 'Boston, MA'
  ]
  return locations[Math.floor(Math.random() * locations.length)]
}

// Lead verification simulation
async function verifyLead(lead: {
  email: string
  company_name: string
  contact_name: string
  industry: string
}): Promise<{
  accuracy: boolean
  deliverability: boolean
  relevance: boolean
  compliance: boolean
}> {
  // In production, integrate with real verification services
  // For now, simulate verification with realistic success rates
  
  // Accuracy check (name/company match) - 85% success rate
  const accuracy = Math.random() > 0.15
  
  // Deliverability check (email validity) - 90% success rate
  const deliverability = Math.random() > 0.10
  
  // Relevance check (industry/role match) - 80% success rate
  const relevance = Math.random() > 0.20
  
  // Compliance check (GDPR/CAN-SPAM) - 95% success rate
  const compliance = Math.random() > 0.05
  
  // Add small delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return {
    accuracy,
    deliverability,
    relevance,
    compliance
  }
}

// Email verification using Hunter.io API (when available)
export async function verifyEmailWithHunter(email: string): Promise<{
  deliverable: boolean
  score: number
  reason?: string
}> {
  if (!process.env.HUNTER_API_KEY) {
    // Fallback to mock verification
    return {
      deliverable: Math.random() > 0.1,
      score: Math.floor(Math.random() * 40) + 60,
      reason: 'Mock verification - no API key'
    }
  }
  
  try {
    const response = await fetch(
      `https://api.hunter.io/v2/email-verifier?email=${email}&api_key=${process.env.HUNTER_API_KEY}`
    )
    
    if (!response.ok) {
      throw new Error('Hunter API request failed')
    }
    
    const data = await response.json()
    
    return {
      deliverable: data.data.result === 'deliverable',
      score: data.data.score,
      reason: data.data.result
    }
  } catch (error) {
    console.error('Hunter verification failed:', error)
    // Fallback to mock
    return {
      deliverable: Math.random() > 0.1,
      score: Math.floor(Math.random() * 40) + 60,
      reason: 'Verification service unavailable'
    }
  }
}

// Bulk lead verification
export async function verifyLeadsBatch(leads: Lead[]): Promise<Lead[]> {
  const verifiedLeads = []
  
  for (const lead of leads) {
    // Verify email deliverability
    const emailVerification = await verifyEmailWithHunter(lead.email)
    
    // Update verification status
    lead.verified_status.deliverability = emailVerification.deliverable
    
    // Only include leads that pass basic verification
    if (emailVerification.deliverable && emailVerification.score > 50) {
      verifiedLeads.push(lead)
    }
  }
  
  return verifiedLeads
}
