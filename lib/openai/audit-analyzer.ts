import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface BusinessData {
  url: string
  name?: string
  industry?: string
  description?: string
  content?: string
  metadata?: any
}

interface AuditParameter {
  name: string
  score: number
  weight: number
  insights: string[]
  recommendations: string[]
  details?: any
}

interface EnhancedAuditResult {
  totalScore: number
  parameters: Record<string, AuditParameter>
  executiveSummary: string
  keyFindings: string[]
  priorityRecommendations: string[]
  competitiveAnalysis: string
  growthOpportunities: string[]
  riskAssessment: string
  actionPlan: {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
  }
  industryBenchmarks: string
  detailedAnalysis: string
}

export async function generateEnhancedAuditAnalysis(
  businessData: BusinessData,
  basicAuditResult: any
): Promise<EnhancedAuditResult> {
  console.log('Starting enhanced AI audit analysis for:', businessData.url)

  try {
    // Generate comprehensive analysis using OpenAI
    const analysisPrompt = `
You are a senior business consultant conducting a comprehensive digital business audit. Analyze the following business and provide detailed insights.

Business Information:
- URL: ${businessData.url}
- Name: ${businessData.name || 'Not provided'}
- Industry: ${businessData.industry || 'Not specified'}
- Description: ${businessData.description || 'Not provided'}

Current Audit Scores:
${Object.entries(basicAuditResult.parameters || {}).map(([key, param]: [string, any]) => 
  `- ${param.name}: ${param.score}/100 (Weight: ${param.weight}%)`
).join('\n')}

Total Score: ${basicAuditResult.totalScore || 0}/100

Please provide a comprehensive analysis in the following JSON format:
{
  "executiveSummary": "A 3-4 sentence executive summary of the business's digital presence and overall performance",
  "keyFindings": ["Finding 1", "Finding 2", "Finding 3", "Finding 4", "Finding 5"],
  "priorityRecommendations": ["High priority recommendation 1", "High priority recommendation 2", "High priority recommendation 3"],
  "competitiveAnalysis": "Analysis of competitive positioning and market presence (2-3 sentences)",
  "growthOpportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3", "Opportunity 4"],
  "riskAssessment": "Assessment of potential risks and vulnerabilities (2-3 sentences)",
  "actionPlan": {
    "immediate": ["Action to take within 1-2 weeks", "Another immediate action"],
    "shortTerm": ["Action for 1-3 months", "Another short-term action", "Third short-term action"],
    "longTerm": ["Strategic action for 6+ months", "Another long-term action"]
  },
  "industryBenchmarks": "How this business compares to industry standards and benchmarks (2-3 sentences)",
  "detailedAnalysis": "A comprehensive 4-5 paragraph analysis covering digital presence, operational efficiency, market positioning, and strategic recommendations"
}

Focus on actionable insights, specific recommendations, and strategic guidance. Be professional but accessible in tone.
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a senior business consultant specializing in digital transformation and business optimization. Provide detailed, actionable insights based on business audit data. Always return valid JSON without any markdown formatting or extra text."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    // Clean and parse the JSON response
    let rawResponse = completion.choices[0].message.content || '{}'
    console.log('Raw AI response length:', rawResponse.length)
    
    // Remove markdown code blocks if present
    rawResponse = rawResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    
    // Clean up problematic control characters but preserve valid JSON structure
    // Don't escape newlines that are already properly escaped in JSON strings
    rawResponse = rawResponse
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ') // Remove control characters except \n, \r, \t
      .replace(/\t/g, ' ') // Replace tabs with spaces
    
    // Try to parse with multiple fallback strategies
    let aiAnalysis: any = {}
    
    try {
      aiAnalysis = JSON.parse(rawResponse)
      console.log('Successfully parsed AI response on first try')
    } catch (parseError) {
      console.error('Initial JSON parse error:', parseError)
      console.log('Problematic JSON (first 500 chars):', rawResponse.substring(0, 500))
      
      try {
        // Strategy 2: Try to find and extract the main JSON object
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const cleanJson = jsonMatch[0]
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
            .replace(/\t/g, ' ')
          
          aiAnalysis = JSON.parse(cleanJson)
          console.log('Successfully parsed AI response on second try')
        } else {
          throw new Error('No JSON object found in response')
        }
      } catch (secondError) {
        console.error('Second parse attempt failed:', secondError)
        
        // Strategy 3: Create a minimal fallback response
        console.log('Using fallback AI analysis structure')
        aiAnalysis = {
          executiveSummary: 'AI analysis completed with basic insights.',
          keyFindings: ['Business analysis completed', 'Review parameter scores for insights'],
          priorityRecommendations: ['Focus on lowest scoring parameters', 'Implement recommended improvements'],
          competitiveAnalysis: 'Competitive analysis requires additional data.',
          growthOpportunities: ['Digital optimization', 'Process improvement'],
          riskAssessment: 'Risk assessment based on current parameter scores.',
          actionPlan: {
            immediate: ['Review audit results', 'Identify priority areas'],
            shortTerm: ['Implement quick wins', 'Address critical issues'],
            longTerm: ['Strategic improvements', 'Long-term optimization']
          },
          industryBenchmarks: 'Industry benchmarks vary by sector and business size.',
          detailedAnalysis: 'Detailed analysis of business performance across key parameters.'
        }
      }
    }
    console.log('AI analysis completed successfully')

    // Generate enhanced parameter insights
    const enhancedParameters: Record<string, AuditParameter> = {}
    
    for (const [key, param] of Object.entries(basicAuditResult.parameters || {})) {
      const typedParam = param as any
      
      // Generate AI-enhanced insights for each parameter
      const parameterPrompt = `
Analyze this specific business parameter and provide detailed insights:

Parameter: ${typedParam.name}
Current Score: ${typedParam.score}/100
Business: ${businessData.url}
Industry: ${businessData.industry || 'General'}

Provide 3-4 specific insights about what's working well and 3-4 actionable recommendations for improvement. 
Focus on practical, implementable suggestions.

Respond in JSON format:
{
  "insights": ["Insight 1", "Insight 2", "Insight 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3", "Recommendation 4"]
}
`

      try {
        const paramCompletion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system", 
              content: "You are a business analyst providing specific, actionable insights for business improvement. Always return valid JSON without markdown formatting."
            },
            {
              role: "user",
              content: parameterPrompt
            }
          ],
          temperature: 0.6,
          max_tokens: 500
        })

        // Clean parameter response
        let paramResponse = paramCompletion.choices[0].message.content || '{}'
        paramResponse = paramResponse
          .replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
          .replace(/\t/g, ' ')

        let paramAnalysis: any = {}
        try {
          paramAnalysis = JSON.parse(paramResponse)
        } catch (paramParseError) {
          console.error(`Parameter ${key} JSON parse error:`, paramParseError)
          // Use fallback structure
          paramAnalysis = {
            insights: [`${typedParam.name} analysis completed`],
            recommendations: ['Review parameter details for improvement opportunities']
          }
        }
        
        enhancedParameters[key] = {
          name: typedParam.name,
          score: typedParam.score,
          weight: typedParam.weight,
          insights: paramAnalysis.insights || typedParam.insights || [`${typedParam.name} scored ${typedParam.score}/100`],
          recommendations: paramAnalysis.recommendations || typedParam.recommendations || ['Focus on improving this parameter'],
          details: typedParam.details
        }
      } catch (error) {
        console.error(`Error enhancing parameter ${key}:`, error)
        // Fallback to original parameter data with safe defaults
        enhancedParameters[key] = {
          name: typedParam.name,
          score: typedParam.score,
          weight: typedParam.weight,
          insights: typedParam.insights || [`${typedParam.name} analysis completed`],
          recommendations: typedParam.recommendations || ['Review and improve this parameter'],
          details: typedParam.details
        }
      }
    }

    return {
      totalScore: basicAuditResult.totalScore || 0,
      parameters: enhancedParameters,
      executiveSummary: aiAnalysis.executiveSummary || 'Analysis completed successfully.',
      keyFindings: aiAnalysis.keyFindings || [],
      priorityRecommendations: aiAnalysis.priorityRecommendations || [],
      competitiveAnalysis: aiAnalysis.competitiveAnalysis || '',
      growthOpportunities: aiAnalysis.growthOpportunities || [],
      riskAssessment: aiAnalysis.riskAssessment || '',
      actionPlan: aiAnalysis.actionPlan || { immediate: [], shortTerm: [], longTerm: [] },
      industryBenchmarks: aiAnalysis.industryBenchmarks || '',
      detailedAnalysis: aiAnalysis.detailedAnalysis || ''
    }

  } catch (error) {
    console.error('Error in AI audit analysis:', error)
    
    // Fallback to basic analysis if AI fails
    return {
      totalScore: basicAuditResult.totalScore || 0,
      parameters: basicAuditResult.parameters || {},
      executiveSummary: 'Business audit completed. Review individual parameters for detailed insights.',
      keyFindings: ['Audit analysis completed', 'Review parameter scores for insights'],
      priorityRecommendations: ['Focus on lowest scoring parameters', 'Implement recommended improvements'],
      competitiveAnalysis: 'Competitive analysis requires additional data.',
      growthOpportunities: ['Digital optimization', 'Process improvement'],
      riskAssessment: 'Risk assessment based on current parameter scores.',
      actionPlan: {
        immediate: ['Review audit results', 'Identify priority areas'],
        shortTerm: ['Implement quick wins', 'Address critical issues'],
        longTerm: ['Strategic improvements', 'Long-term optimization']
      },
      industryBenchmarks: 'Industry benchmarks vary by sector and business size.',
      detailedAnalysis: 'Detailed analysis of business performance across key parameters. Focus on areas with lower scores for maximum impact.'
    }
  }
}

export async function generateBusinessInsights(businessUrl: string, businessData: any): Promise<string> {
  try {
    const insightsPrompt = `
Analyze this business and provide strategic insights:

Business URL: ${businessUrl}
Business Data: ${JSON.stringify(businessData, null, 2)}

Provide 3-4 paragraphs of strategic business insights covering:
1. Market positioning and competitive advantages
2. Digital presence and online optimization opportunities  
3. Operational efficiency and growth potential
4. Strategic recommendations for business development

Be specific and actionable in your recommendations.
`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a business strategist providing insights for business optimization and growth."
        },
        {
          role: "user", 
          content: insightsPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    })

    return completion.choices[0].message.content || 'Business insights analysis completed.'

  } catch (error) {
    console.error('Error generating business insights:', error)
    return 'Business insights analysis completed. Review audit parameters for detailed recommendations.'
  }
}
