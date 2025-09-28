'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Users, Loader2, Target, MapPin, Building, UserCheck } from 'lucide-react'

interface Audit {
  id: string
  business_name: string
  business_url: string
  total_score: number
  created_at: string
}

function GenerateLeadsContent() {
  const [audits, setAudits] = useState<Audit[]>([])
  const [selectedAuditId, setSelectedAuditId] = useState('')
  const [targetCount, setTargetCount] = useState(50)
  const [industry, setIndustry] = useState('')
  const [location, setLocation] = useState('')
  const [companySize, setCompanySize] = useState('')
  const [jobTitles, setJobTitles] = useState<string[]>([])
  const [customJobTitle, setCustomJobTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingAudits, setLoadingAudits] = useState(true)
  
  const router = useRouter()
  const searchParams = useSearchParams()

  const defaultJobTitles = [
    'CEO', 'CTO', 'CMO', 'VP of Sales', 'VP of Marketing',
    'Director of Operations', 'Head of Business Development',
    'Sales Manager', 'Marketing Manager', 'Product Manager'
  ]

  const industries = [
    'Technology', 'E-commerce', 'Healthcare', 'Finance', 'Education',
    'Real Estate', 'Food & Beverage', 'Professional Services', 'Manufacturing',
    'Retail', 'Media & Entertainment', 'Transportation', 'Energy', 'Other'
  ]

  const companySizes = [
    { value: 'startup', label: 'Startup (1-10 employees)' },
    { value: 'small', label: 'Small (11-50 employees)' },
    { value: 'medium', label: 'Medium (51-200 employees)' },
    { value: 'large', label: 'Large (201-1000 employees)' },
    { value: 'enterprise', label: 'Enterprise (1000+ employees)' }
  ]

  useEffect(() => {
    fetchAudits()
    
    // Pre-select audit if provided in URL
    const auditId = searchParams.get('audit_id')
    if (auditId) {
      setSelectedAuditId(auditId)
    }
  }, [searchParams])

  const fetchAudits = async () => {
    try {
      const response = await fetch('/api/audits')
      const data = await response.json()
      
      if (response.ok) {
        setAudits(data.audits || [])
      } else {
        toast.error('Failed to fetch audits')
      }
    } catch (error) {
      toast.error('Error fetching audits')
    } finally {
      setLoadingAudits(false)
    }
  }

  const handleJobTitleToggle = (title: string) => {
    setJobTitles(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title)
        : [...prev, title]
    )
  }

  const handleAddCustomJobTitle = () => {
    if (customJobTitle.trim() && !jobTitles.includes(customJobTitle.trim())) {
      setJobTitles(prev => [...prev, customJobTitle.trim()])
      setCustomJobTitle('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedAuditId) {
      toast.error('Please select an audit')
      return
    }

    if (targetCount < 1 || targetCount > 1000) {
      toast.error('Target count must be between 1 and 1000')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audit_id: selectedAuditId,
          target_count: targetCount,
          industry: industry || undefined,
          location: location || undefined,
          company_size: companySize || undefined,
          job_titles: jobTitles.length > 0 ? jobTitles : undefined
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate leads')
      }

      toast.success(`Successfully generated ${data.count} leads!`)
      router.push(`/leads?audit_id=${selectedAuditId}`)
    } catch (error) {
      console.error('Error generating leads:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate leads')
    } finally {
      setLoading(false)
    }
  }

  if (loadingAudits) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (audits.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">No Audits Available</h1>
        <p className="text-gray-600 mb-6">
          You need to create a business audit first before generating leads.
        </p>
        <Button asChild>
          <a href="/audits/new">Create Your First Audit</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Generate Leads</h1>
        <p className="text-gray-600 mt-2">
          Generate verified leads based on your business audit insights
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Select Audit */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Select Audit Source
            </CardTitle>
            <CardDescription>
              Choose which audit to base your lead generation on
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {audits.map((audit) => (
                <label
                  key={audit.id}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedAuditId === audit.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="audit"
                    value={audit.id}
                    checked={selectedAuditId === audit.id}
                    onChange={(e) => setSelectedAuditId(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium">
                      {audit.business_name || audit.business_url}
                    </div>
                    <div className="text-sm text-gray-500">
                      Score: {audit.total_score}/100 • {new Date(audit.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lead Count */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Target Lead Count
            </CardTitle>
            <CardDescription>
              How many leads would you like to generate?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="1000"
                value={targetCount}
                onChange={(e) => setTargetCount(parseInt(e.target.value))}
                className="flex-1"
              />
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={targetCount}
                  onChange={(e) => setTargetCount(parseInt(e.target.value) || 1)}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                />
                <span className="text-sm text-gray-500">leads</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Each lead uses 2 API credits for verification
            </p>
          </CardContent>
        </Card>

        {/* Targeting Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Industry */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Industry (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any Industry</option>
                {industries.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Location (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., New York, NY or United States"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </CardContent>
          </Card>
        </div>

        {/* Company Size */}
        <Card>
          <CardHeader>
            <CardTitle>Company Size (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {companySizes.map((size) => (
                <label
                  key={size.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    companySize === size.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="companySize"
                    value={size.value}
                    checked={companySize === size.value}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">{size.label}</span>
                </label>
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCompanySize('')}
              className="mt-2"
            >
              Clear Selection
            </Button>
          </CardContent>
        </Card>

        {/* Job Titles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="w-5 h-5 mr-2" />
              Target Job Titles (Optional)
            </CardTitle>
            <CardDescription>
              Select the job titles you want to target
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
              {defaultJobTitles.map((title) => (
                <label
                  key={title}
                  className={`flex items-center p-2 border rounded cursor-pointer transition-colors text-sm ${
                    jobTitles.includes(title)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={jobTitles.includes(title)}
                    onChange={() => handleJobTitleToggle(title)}
                    className="mr-2"
                  />
                  {title}
                </label>
              ))}
            </div>

            {/* Custom Job Title */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={customJobTitle}
                onChange={(e) => setCustomJobTitle(e.target.value)}
                placeholder="Add custom job title"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomJobTitle())}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddCustomJobTitle}
                disabled={!customJobTitle.trim()}
              >
                Add
              </Button>
            </div>

            {/* Selected Job Titles */}
            {jobTitles.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium mb-2">Selected titles:</p>
                <div className="flex flex-wrap gap-2">
                  {jobTitles.map((title) => (
                    <span
                      key={title}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {title}
                      <button
                        type="button"
                        onClick={() => setJobTitles(prev => prev.filter(t => t !== title))}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <Card>
          <CardContent className="pt-6">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !selectedAuditId}
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating {targetCount} Leads...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Generate {targetCount} Leads
                </>
              )}
            </Button>
            <p className="text-center text-xs text-gray-500 mt-2">
              This will use {targetCount * 2} API credits
            </p>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

export default function GenerateLeadsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <GenerateLeadsContent />
    </Suspense>
  )
}
