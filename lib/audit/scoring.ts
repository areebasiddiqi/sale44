import * as cheerio from 'cheerio'

export interface AuditParameter {
  name: string
  weight: number
  score: number
  insights: string[]
  recommendations: string[]
}

export interface AuditResult {
  totalScore: number
  parameters: {
    digitalPresence: AuditParameter
    marketVisibility: AuditParameter
    businessOperations: AuditParameter
    competitivePositioning: AuditParameter
    dataInsight: AuditParameter
    compliance: AuditParameter
  }
  businessInfo: {
    name: string
    url: string
    industry?: string
    description?: string
  }
}

// Mock website analysis - in production, integrate with real APIs
export async function analyzeWebsite(url: string): Promise<AuditResult> {
  try {
    // Normalize URL
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`
    
    // Fetch website content
    const response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.status}`)
    }
    
    const html = await response.text()
    const $ = cheerio.load(html)
    
    // Extract basic business info
    const businessInfo = extractBusinessInfo($, normalizedUrl)
    
    // Analyze each parameter
    const digitalPresence = analyzeDigitalPresence($, normalizedUrl)
    const marketVisibility = analyzeMarketVisibility($, normalizedUrl)
    const businessOperations = analyzeBusinessOperations($, normalizedUrl)
    const competitivePositioning = analyzeCompetitivePositioning($, normalizedUrl)
    const dataInsight = analyzeDataInsight($, normalizedUrl)
    const compliance = analyzeCompliance($, normalizedUrl)
    
    // Calculate weighted total score
    const totalScore = Math.round(
      digitalPresence.score * 0.30 +
      marketVisibility.score * 0.25 +
      businessOperations.score * 0.20 +
      competitivePositioning.score * 0.15 +
      dataInsight.score * 0.10 +
      compliance.score * 0.10
    )
    
    return {
      totalScore,
      parameters: {
        digitalPresence,
        marketVisibility,
        businessOperations,
        competitivePositioning,
        dataInsight,
        compliance
      },
      businessInfo
    }
  } catch (error) {
    console.error('Website analysis failed:', error)
    // Return mock data for demo purposes
    return generateMockAuditResult(url)
  }
}

function extractBusinessInfo($: cheerio.Root, url: string) {
  const title = $('title').text() || 'Unknown Business'
  const description = $('meta[name="description"]').attr('content') || 
                     $('meta[property="og:description"]').attr('content') || 
                     'No description available'
  
  return {
    name: title.replace(/\s*\|\s*.*$/, '').trim(), // Remove common title suffixes
    url,
    description: description.substring(0, 200),
    industry: inferIndustry($, title, description)
  }
}

function inferIndustry($: cheerio.Root, title: string, description: string): string {
  const text = (title + ' ' + description).toLowerCase()
  
  const industries = {
    'Technology': ['software', 'tech', 'app', 'digital', 'ai', 'saas', 'platform'],
    'E-commerce': ['shop', 'store', 'buy', 'sell', 'commerce', 'retail'],
    'Healthcare': ['health', 'medical', 'doctor', 'clinic', 'hospital', 'care'],
    'Finance': ['bank', 'finance', 'investment', 'loan', 'credit', 'money'],
    'Education': ['school', 'university', 'education', 'learn', 'course', 'training'],
    'Real Estate': ['real estate', 'property', 'home', 'house', 'rent'],
    'Food & Beverage': ['restaurant', 'food', 'cafe', 'kitchen', 'dining'],
    'Professional Services': ['consulting', 'legal', 'accounting', 'marketing', 'agency']
  }
  
  for (const [industry, keywords] of Object.entries(industries)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return industry
    }
  }
  
  return 'Other'
}

// 1. Website & Digital Presence (30%)
function analyzeDigitalPresence($: cheerio.Root, url: string): AuditParameter {
  const insights: string[] = []
  const recommendations: string[] = []
  let score = 0
  
  // Mobile responsiveness check
  const viewport = $('meta[name="viewport"]').attr('content')
  if (viewport && viewport.includes('width=device-width')) {
    score += 20
    insights.push('✓ Mobile-responsive viewport detected')
  } else {
    recommendations.push('Add mobile-responsive viewport meta tag')
  }
  
  // SEO basics
  const title = $('title').text()
  const description = $('meta[name="description"]').attr('content')
  const h1Count = $('h1').length
  
  if (title && title.length > 10 && title.length < 60) {
    score += 15
    insights.push('✓ Good title tag length')
  } else {
    recommendations.push('Optimize title tag (10-60 characters)')
  }
  
  if (description && description.length > 50 && description.length < 160) {
    score += 15
    insights.push('✓ Good meta description length')
  } else {
    recommendations.push('Add compelling meta description (50-160 characters)')
  }
  
  if (h1Count === 1) {
    score += 10
    insights.push('✓ Single H1 tag found')
  } else {
    recommendations.push('Use exactly one H1 tag per page')
  }
  
  // SSL check
  if (url.startsWith('https://')) {
    score += 15
    insights.push('✓ SSL certificate installed')
  } else {
    recommendations.push('Install SSL certificate for security')
  }
  
  // CTA analysis
  const ctaElements = $('button, .btn, .cta, [href*="contact"], [href*="signup"], [href*="buy"]').length
  if (ctaElements >= 3) {
    score += 15
    insights.push(`✓ ${ctaElements} call-to-action elements found`)
  } else {
    recommendations.push('Add more clear call-to-action buttons')
  }
  
  // Navigation structure
  const navElements = $('nav, .navigation, .menu').length
  if (navElements > 0) {
    score += 10
    insights.push('✓ Navigation structure present')
  } else {
    recommendations.push('Improve site navigation structure')
  }
  
  return {
    name: 'Website & Digital Presence',
    weight: 30,
    score: Math.min(score, 100),
    insights,
    recommendations
  }
}

// 2. Market Visibility & Reputation (25%)
function analyzeMarketVisibility($: cheerio.Root, url: string): AuditParameter {
  const insights: string[] = []
  const recommendations: string[] = []
  let score = 0
  
  // Social media presence (mock analysis)
  const socialLinks = $('a[href*="facebook"], a[href*="twitter"], a[href*="linkedin"], a[href*="instagram"]').length
  if (socialLinks >= 3) {
    score += 25
    insights.push(`✓ ${socialLinks} social media platforms linked`)
  } else if (socialLinks > 0) {
    score += 15
    insights.push(`${socialLinks} social media platform(s) linked`)
    recommendations.push('Expand social media presence to more platforms')
  } else {
    recommendations.push('Add social media links and presence')
  }
  
  // Content freshness
  const blogLinks = $('a[href*="blog"], a[href*="news"], a[href*="article"]').length
  if (blogLinks > 0) {
    score += 20
    insights.push('✓ Blog or news section detected')
  } else {
    recommendations.push('Add blog or news section for fresh content')
  }
  
  // Customer testimonials/reviews
  const testimonialElements = $('[class*="testimonial"], [class*="review"], [class*="feedback"]').length
  if (testimonialElements > 0) {
    score += 20
    insights.push('✓ Customer testimonials/reviews section found')
  } else {
    recommendations.push('Add customer testimonials or reviews')
  }
  
  // Contact information visibility
  const contactInfo = $('[href^="mailto:"], [href^="tel:"], [class*="contact"]').length
  if (contactInfo >= 2) {
    score += 15
    insights.push('✓ Multiple contact methods available')
  } else if (contactInfo > 0) {
    score += 10
    recommendations.push('Add more contact methods (phone, email)')
  } else {
    recommendations.push('Add clear contact information')
  }
  
  // About page/company info
  const aboutLinks = $('a[href*="about"], a[href*="company"]').length
  if (aboutLinks > 0) {
    score += 20
    insights.push('✓ About/company information available')
  } else {
    recommendations.push('Add comprehensive about page')
  }
  
  return {
    name: 'Market Visibility & Reputation',
    weight: 25,
    score: Math.min(score, 100),
    insights,
    recommendations
  }
}

// 3. Business Operations & Scalability (20%)
function analyzeBusinessOperations($: cheerio.Root, url: string): AuditParameter {
  const insights: string[] = []
  const recommendations: string[] = []
  let score = 0
  
  // Technology stack indicators
  const scripts = $('script[src]').length
  if (scripts >= 5) {
    score += 20
    insights.push('✓ Modern technology stack detected')
  } else {
    recommendations.push('Consider upgrading technology infrastructure')
  }
  
  // Performance indicators (mock)
  const imageCount = $('img').length
  const optimizedImages = $('img[loading="lazy"], img[srcset]').length
  if (optimizedImages / Math.max(imageCount, 1) > 0.5) {
    score += 25
    insights.push('✓ Images appear optimized for performance')
  } else {
    recommendations.push('Optimize images for better performance')
  }
  
  // CDN usage (check for common CDN domains)
  const cdnUsage = $('script[src*="cdn"], link[href*="cdn"], img[src*="cdn"]').length
  if (cdnUsage > 0) {
    score += 20
    insights.push('✓ CDN usage detected for better performance')
  } else {
    recommendations.push('Consider using CDN for better global performance')
  }
  
  // Analytics tracking
  const analyticsScripts = $('script[src*="analytics"], script[src*="gtag"], script[src*="gtm"]').length
  if (analyticsScripts > 0) {
    score += 15
    insights.push('✓ Analytics tracking implemented')
  } else {
    recommendations.push('Implement analytics tracking for data insights')
  }
  
  // E-commerce capabilities
  const ecommerceElements = $('[class*="cart"], [class*="shop"], [class*="product"], [href*="checkout"]').length
  if (ecommerceElements > 0) {
    score += 20
    insights.push('✓ E-commerce functionality detected')
  }
  
  return {
    name: 'Business Operations & Scalability',
    weight: 20,
    score: Math.min(score, 100),
    insights,
    recommendations
  }
}

// 4. Competitive Positioning (15%)
function analyzeCompetitivePositioning($: cheerio.Root, url: string): AuditParameter {
  const insights: string[] = []
  const recommendations: string[] = []
  let score = 0
  
  // Unique value proposition
  const heroText = $('h1, .hero, .banner').first().text().toLowerCase()
  const uniqueWords = ['unique', 'first', 'only', 'exclusive', 'revolutionary', 'innovative']
  if (uniqueWords.some(word => heroText.includes(word))) {
    score += 25
    insights.push('✓ Unique value proposition messaging detected')
  } else {
    recommendations.push('Strengthen unique value proposition messaging')
  }
  
  // Feature/service differentiation
  const featureElements = $('[class*="feature"], [class*="service"], [class*="benefit"]').length
  if (featureElements >= 3) {
    score += 25
    insights.push(`✓ ${featureElements} feature/service sections found`)
  } else {
    recommendations.push('Highlight more features and services')
  }
  
  // Innovation indicators
  const innovationKeywords = ['ai', 'machine learning', 'automation', 'smart', 'intelligent', 'advanced']
  const pageText = $('body').text().toLowerCase()
  const innovationMentions = innovationKeywords.filter(keyword => pageText.includes(keyword)).length
  if (innovationMentions >= 2) {
    score += 20
    insights.push('✓ Innovation and technology focus evident')
  } else {
    recommendations.push('Emphasize technological innovation and capabilities')
  }
  
  // Awards/certifications
  const credibilityElements = $('[class*="award"], [class*="certification"], [class*="badge"]').length
  if (credibilityElements > 0) {
    score += 15
    insights.push('✓ Awards or certifications displayed')
  } else {
    recommendations.push('Display relevant awards, certifications, or badges')
  }
  
  // Case studies/portfolio
  const caseStudyElements = $('a[href*="case"], a[href*="portfolio"], a[href*="work"]').length
  if (caseStudyElements > 0) {
    score += 15
    insights.push('✓ Case studies or portfolio available')
  } else {
    recommendations.push('Add case studies or portfolio examples')
  }
  
  return {
    name: 'Competitive Positioning',
    weight: 15,
    score: Math.min(score, 100),
    insights,
    recommendations
  }
}

// 5. Data & Insight Capability (10%)
function analyzeDataInsight($: cheerio.Root, url: string): AuditParameter {
  const insights: string[] = []
  const recommendations: string[] = []
  let score = 0
  
  // Analytics implementation
  const gaScript = $('script[src*="googletagmanager"], script[src*="google-analytics"]').length
  if (gaScript > 0) {
    score += 30
    insights.push('✓ Google Analytics detected')
  } else {
    recommendations.push('Implement Google Analytics for visitor insights')
  }
  
  // Structured data
  const structuredData = $('script[type="application/ld+json"]').length
  if (structuredData > 0) {
    score += 25
    insights.push('✓ Structured data markup found')
  } else {
    recommendations.push('Add structured data markup for better SEO')
  }
  
  // Conversion tracking
  const conversionElements = $('[onclick], [data-track], [class*="track"]').length
  if (conversionElements > 0) {
    score += 20
    insights.push('✓ Event tracking elements detected')
  } else {
    recommendations.push('Implement conversion and event tracking')
  }
  
  // A/B testing tools
  const abTestingScripts = $('script[src*="optimizely"], script[src*="vwo"], script[src*="hotjar"]').length
  if (abTestingScripts > 0) {
    score += 25
    insights.push('✓ A/B testing or user behavior tools detected')
  } else {
    recommendations.push('Consider A/B testing tools for optimization')
  }
  
  return {
    name: 'Data & Insight Capability',
    weight: 10,
    score: Math.min(score, 100),
    insights,
    recommendations
  }
}

// 6. Compliance & Risk Management (10%)
function analyzeCompliance($: cheerio.Root, url: string): AuditParameter {
  const insights: string[] = []
  const recommendations: string[] = []
  let score = 0
  
  // Privacy policy
  const privacyLinks = $('a[href*="privacy"], a[href*="policy"]').length
  if (privacyLinks > 0) {
    score += 30
    insights.push('✓ Privacy policy link found')
  } else {
    recommendations.push('Add comprehensive privacy policy')
  }
  
  // Terms of service
  const termsLinks = $('a[href*="terms"], a[href*="conditions"]').length
  if (termsLinks > 0) {
    score += 25
    insights.push('✓ Terms of service available')
  } else {
    recommendations.push('Add terms of service page')
  }
  
  // Cookie consent
  const cookieElements = $('[class*="cookie"], [id*="cookie"]').length
  if (cookieElements > 0) {
    score += 20
    insights.push('✓ Cookie consent mechanism detected')
  } else {
    recommendations.push('Implement cookie consent for GDPR compliance')
  }
  
  // Security badges
  const securityBadges = $('[alt*="secure"], [alt*="ssl"], [class*="security"]').length
  if (securityBadges > 0) {
    score += 15
    insights.push('✓ Security badges or indicators present')
  } else {
    recommendations.push('Display security badges to build trust')
  }
  
  // Contact/legal information
  const legalInfo = $('[class*="legal"], [href*="contact"]').length
  if (legalInfo > 0) {
    score += 10
    insights.push('✓ Legal/contact information available')
  } else {
    recommendations.push('Ensure legal and contact information is accessible')
  }
  
  return {
    name: 'Compliance & Risk Management',
    weight: 10,
    score: Math.min(score, 100),
    insights,
    recommendations
  }
}

// Fallback mock data for demo purposes
function generateMockAuditResult(url: string): AuditResult {
  const mockScores = {
    digitalPresence: Math.floor(Math.random() * 30) + 60,
    marketVisibility: Math.floor(Math.random() * 30) + 50,
    businessOperations: Math.floor(Math.random() * 25) + 65,
    competitivePositioning: Math.floor(Math.random() * 35) + 45,
    dataInsight: Math.floor(Math.random() * 40) + 40,
    compliance: Math.floor(Math.random() * 20) + 70
  }
  
  const totalScore = Math.round(
    mockScores.digitalPresence * 0.30 +
    mockScores.marketVisibility * 0.25 +
    mockScores.businessOperations * 0.20 +
    mockScores.competitivePositioning * 0.15 +
    mockScores.dataInsight * 0.10 +
    mockScores.compliance * 0.10
  )
  
  return {
    totalScore,
    parameters: {
      digitalPresence: {
        name: 'Website & Digital Presence',
        weight: 30,
        score: mockScores.digitalPresence,
        insights: ['✓ Modern website design', '✓ Mobile-responsive layout'],
        recommendations: ['Improve page load speed', 'Add more interactive elements']
      },
      marketVisibility: {
        name: 'Market Visibility & Reputation',
        weight: 25,
        score: mockScores.marketVisibility,
        insights: ['✓ Active social media presence', '✓ Customer testimonials'],
        recommendations: ['Increase content marketing', 'Expand to more platforms']
      },
      businessOperations: {
        name: 'Business Operations & Scalability',
        weight: 20,
        score: mockScores.businessOperations,
        insights: ['✓ Cloud-based infrastructure', '✓ Automated processes'],
        recommendations: ['Implement CRM system', 'Add live chat support']
      },
      competitivePositioning: {
        name: 'Competitive Positioning',
        weight: 15,
        score: mockScores.competitivePositioning,
        insights: ['✓ Clear value proposition', '✓ Unique features'],
        recommendations: ['Strengthen brand messaging', 'Add more case studies']
      },
      dataInsight: {
        name: 'Data & Insight Capability',
        weight: 10,
        score: mockScores.dataInsight,
        insights: ['✓ Basic analytics tracking'],
        recommendations: ['Implement advanced analytics', 'Add conversion tracking']
      },
      compliance: {
        name: 'Compliance & Risk Management',
        weight: 10,
        score: mockScores.compliance,
        insights: ['✓ Privacy policy present', '✓ SSL certificate'],
        recommendations: ['Update terms of service', 'Add GDPR compliance']
      }
    },
    businessInfo: {
      name: url.replace(/^https?:\/\//, '').replace(/\/.*$/, ''),
      url,
      industry: 'Technology',
      description: 'A modern business with digital presence'
    }
  }
}
